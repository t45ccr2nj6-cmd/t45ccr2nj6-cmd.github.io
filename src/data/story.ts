import { useSyncExternalStore } from 'react'
import { SINGLEE_SCRIPT } from './singleeScript'
import { KINGSTON_SCRIPT, type StoryStep } from './kingstonScript'
import { CHAT2_SCRIPT } from './chat2Script'

/**
 * 剧情进度：只存内存，网页刷新 / 关闭页面即重置
 * - 是否拨打过 Kingston（拨过才解锁微信里的对话脚本）
 * - 各会话脚本进度（全部由全局引擎推进，离开聊天也会继续）
 * - 通知横幅队列、未读数
 */
export type ChatId = 'jy' | 'singlee'

export interface ChatMsg {
  kind: 'time' | 'them' | 'me'
  text: string
  simp?: string
  /** 对方发出后撤回：渲染成灰色系统提示 */
  recalled?: boolean
}

export interface Banner {
  chatId: ChatId
  name: string
  text: string
}

export interface StoryState {
  calledKingston: boolean
  /** 打过几次 Kingston 的电话（第一通铃响 1 分钟，之后秒挂断） */
  kingstonCallCount: number
  /** 微信脚本结束后那通被接听的电话是否已经打完 */
  connectedCallDone: boolean
  chatStarted: boolean
  chatStep: number
  /** 通话结束后 1 分钟自动推送「Leo」开始的第二段对话 */
  chat2Started: boolean
  chat2Step: number
  /** 靓仔聊天的全部消息（两段共用一条时间线） */
  jyMsgs: ChatMsg[]
  /** 靓仔正在输入（聊天页顶部显示 Typing…） */
  jyTyping: boolean
  /** singlee 主动来信的脚本 */
  singStarted: boolean
  singStep: number
  /** singlee 正在输入（聊天页顶部显示 Typing…） */
  singTyping: boolean
  singMsgs: ChatMsg[]
  /** 各会话未读数 */
  unread: { singlee: number; jy: number }
  /** 用户当前正在查看的聊天（在聊天页里收到消息不计未读、不弹横幅） */
  viewingChat: string | null
  /** 顶部通知横幅（一次只显示一条） */
  banner: Banner | null
  /** 最近一条触发通知的消息（锁屏通知卡展示用） */
  lastNotify: Banner | null
  /** 横幅点击后请求微信直接打开的会话 */
  openChatRequest: string | null
}

const INITIAL: StoryState = {
  calledKingston: false,
  kingstonCallCount: 0,
  connectedCallDone: false,
  chatStarted: false,
  chatStep: 0,
  chat2Started: false,
  chat2Step: 0,
  jyMsgs: [],
  jyTyping: false,
  singStarted: false,
  singStep: 0,
  singTyping: false,
  singMsgs: [],
  unread: { singlee: 0, jy: 0 },
  viewingChat: null,
  banner: null,
  lastNotify: null,
  openChatRequest: null,
}

let state: StoryState = INITIAL
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((fn) => fn())
}

const subscribe = (fn: () => void) => {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

const getSnapshot = () => state

export function useStoryState(): StoryState {
  return useSyncExternalStore(subscribe, getSnapshot)
}

/* ============================================================
   基础更新
   ============================================================ */
/** 与 Kingston 的通话结束（无论主动挂断还是被对方挂断） */
export function recordKingstonCall() {
  state = { ...state, calledKingston: true, kingstonCallCount: state.kingstonCallCount + 1 }
  emit()
}

/** 微信脚本结束后那通被接听、并在字幕演完后挂断的电话 */
export function markConnectedCall() {
  state = { ...state, connectedCallDone: true, kingstonCallCount: state.kingstonCallCount + 1 }
  emit()
}

/** Phone 里原有的未接来电（10086 / No Caller ID / 95533） */
export const BASE_MISSED_CALLS = 3

/** Kingston 两通未接通电话的记录时间（第一通 / 第二通） */
export const KINGSTON_MISSED_TIMES = ['10:04 AM', '10:16 AM']

/** 未接来电总数：Phone 里的 Calls 角标和桌面 Phone 图标角标共用 */
export function useMissedCallCount(): number {
  const story = useStoryState()
  return BASE_MISSED_CALLS + Math.min(story.kingstonCallCount, KINGSTON_MISSED_TIMES.length)
}

const JY_NAME = '史上最勁抽無敵霹靂靚仔'

function messagesOf(chatId: ChatId) {
  return chatId === 'jy' ? state.jyMsgs : state.singMsgs
}

function applyMessages(chatId: ChatId, msgs: ChatMsg[], extra: Partial<StoryState> = {}) {
  const key = chatId === 'jy' ? 'jyMsgs' : 'singMsgs'
  state = { ...state, [key]: msgs, ...extra } as StoryState
  emit()
}

/** 每个会话「Typing… 变回 ID」的延时器，避免和下一次输入冲突 */
const typingOffTimers: Record<ChatId, number> = { jy: 0, singlee: 0 }

function setTyping(chatId: ChatId, value: boolean) {
  if (value && typingOffTimers[chatId]) {
    window.clearTimeout(typingOffTimers[chatId])
    typingOffTimers[chatId] = 0
  }
  state = chatId === 'jy' ? { ...state, jyTyping: value } : { ...state, singTyping: value }
  emit()
}

/** 对方最后一条消息发出后，延迟一小会儿再把 Typing… 变回 ID */
function scheduleTypingOff(chatId: ChatId, delay: number) {
  if (typingOffTimers[chatId]) window.clearTimeout(typingOffTimers[chatId])
  typingOffTimers[chatId] = window.setTimeout(() => {
    typingOffTimers[chatId] = 0
    setTyping(chatId, false)
  }, delay)
}

function advance(chatId: ChatId, part2: boolean, next: number) {
  if (chatId === 'jy') {
    state = part2 ? { ...state, chat2Step: next } : { ...state, chatStep: next }
  } else {
    state = { ...state, singStep: next }
  }
  emit()
}

/* ============================================================
   通知横幅队列：一次只弹一条，收起后再弹下一条
   ============================================================ */
let bannerQueue: Banner[] = []
let bannerTimer: number | undefined

function showQueuedBanner(delay = 0) {
  window.clearTimeout(bannerTimer)
  bannerTimer = window.setTimeout(() => {
    bannerTimer = undefined
    if (state.banner || bannerQueue.length === 0) return
    const [next, ...rest] = bannerQueue
    bannerQueue = rest
    state = { ...state, banner: next }
    emit()
  }, delay)
}

function enqueueBanner(b: Banner) {
  bannerQueue.push(b)
  showQueuedBanner()
}

export function clearBanner() {
  if (!state.banner) return
  state = { ...state, banner: null }
  emit()
  // 收起动画结束后再弹下一条
  showQueuedBanner(380)
}

/** 锁屏时收起所有横幅（锁屏由通知卡展示，不再逐条弹） */
export function dismissBanners() {
  bannerQueue = []
  window.clearTimeout(bannerTimer)
  bannerTimer = undefined
  if (state.banner) {
    state = { ...state, banner: null }
    emit()
  }
}

/* ============================================================
   全局脚本引擎：them / time 自动推进，me 停下等用户
   ============================================================ */
const SPEED = {
  // 靓仔与 singlee 用同一套节奏；slow 步骤单独放慢
  jy: { typingDelay: 1100, baseDelay: 1700, perChar: 280, chainDelay: 2000, slowDelay: 5000, tailTyping: 1500 },
  singlee: { typingDelay: 1100, baseDelay: 1700, perChar: 280, chainDelay: 2000, slowDelay: 5000, tailTyping: 1500 },
}

interface ChatCtx {
  chatId: ChatId
  script: StoryStep[]
  step: number
  name: string
  part2: boolean
}

function ctxOf(chatId: ChatId): ChatCtx {
  if (chatId === 'jy') {
    const part2 = state.chat2Started
    return {
      chatId,
      script: part2 ? CHAT2_SCRIPT : KINGSTON_SCRIPT,
      step: part2 ? state.chat2Step : state.chatStep,
      name: JY_NAME,
      part2,
    }
  }
  return { chatId, script: SINGLEE_SCRIPT, step: state.singStep, name: 'singlee', part2: false }
}

function runChat(chatId: ChatId) {
  const ctx = ctxOf(chatId)
  const s = ctx.script[ctx.step]
  if (!s || s.kind === 'me') {
    // 如果刚刚发出对方最后一条消息，保留 Typing… 到定时结束再变回 ID
    if (!typingOffTimers[chatId]) setTyping(chatId, false)
    return
  }

  if (s.kind === 'time') {
    window.setTimeout(() => {
      applyMessages(chatId, [...messagesOf(chatId), { kind: 'time', text: s.text }])
      advance(chatId, ctx.part2, ctx.step + 1)
      runChat(chatId)
    }, 800)
    return
  }

  const prev = ctx.script[ctx.step - 1]
  const continues = !!prev && prev.kind === 'them'
  const speed = SPEED[chatId]

  const send = () => {
    const viewing = state.viewingChat === chatId
    const msgs = [...messagesOf(chatId), { kind: 'them' as const, text: s.text, simp: s.simp }]
    const idx = msgs.length - 1
    applyMessages(chatId, msgs, {
      unread: viewing ? state.unread : { ...state.unread, [chatId]: state.unread[chatId] + 1 },
      lastNotify: viewing ? state.lastNotify : { chatId, name: ctx.name, text: s.text },
    })
    if (!viewing) enqueueBanner({ chatId, name: ctx.name, text: s.text })

    if (s.recall) {
      window.setTimeout(() => {
        const recalled = messagesOf(chatId).map((m, i) =>
          i === idx ? { ...m, recalled: true, text: `${ctx.name} recalled a message`, simp: undefined } : m,
        )
        applyMessages(chatId, recalled)
      }, 900)
    }

    const next = ctx.script[ctx.step + 1]
    if (!(next && next.kind === 'them')) {
      scheduleTypingOff(chatId, speed.tailTyping)
    }

    advance(chatId, ctx.part2, ctx.step + 1)
    runChat(chatId)
  }

  if (continues) {
    // 连续几条对方消息：中间留出更长的间隔
    window.setTimeout(send, speed.chainDelay)
  } else {
    // 我方消息发完后：先空一下，再显示 Typing…，按字数模拟输入
    window.setTimeout(() => {
      setTyping(chatId, true)
      const delay = s.slow ? speed.slowDelay : speed.baseDelay + s.text.length * speed.perChar
      window.setTimeout(send, delay)
    }, speed.typingDelay)
  }
}

/** 第一次点击微信输入框：开始靓仔的第一段对话 */
export function startChatScript() {
  if (state.chatStarted) return
  state = { ...state, chatStarted: true }
  emit()
  runChat('jy')
}

/** 用户在聊天里打完一条「我」的消息：落库并推进脚本 */
export function sendMeMessage(chatId: ChatId) {
  const ctx = ctxOf(chatId)
  const s = ctx.script[ctx.step]
  if (!s || s.kind !== 'me') return
  applyMessages(chatId, [...messagesOf(chatId), { kind: 'me', text: s.text, simp: s.simp }])
  advance(chatId, ctx.part2, ctx.step + 1)
  // 「因为我担心你吖嘛～」发出后，singlee 主动来信
  if (chatId === 'jy' && !ctx.part2 && ctx.step === 14) triggerSinglee()
  runChat(chatId)
}

/** 「我」发出「因为我担心你吖嘛～」后触发 singlee 主动来信 */
export function triggerSinglee() {
  if (state.singStarted) return
  state = { ...state, singStarted: true }
  emit()
  runChat('singlee')
}

/* ============================================================
   挂断字幕电话 1 分钟后：靓仔自动推来「Leo」
   ============================================================ */
let leoTimer: number | undefined

/** 开始第二段对话：先落时间气泡，再让靓仔推来「Leo」 */
export function startChat2() {
  if (state.chat2Started) return
  state = { ...state, chat2Started: true, chat2Step: 0, jyTyping: false }
  emit()
  runChat('jy')
}

export function scheduleLeoPush() {
  window.clearTimeout(leoTimer)
  leoTimer = window.setTimeout(() => {
    if (!state.connectedCallDone) return
    startChat2()
  }, 60000)
}

/* ============================================================
   未读 / 横幅 / 跳转
   ============================================================ */
export function setViewingChat(id: string | null) {
  if (state.viewingChat === id) return
  bannerQueue = bannerQueue.filter((b) => b.chatId !== id)
  const banner = state.banner && state.banner.chatId === id ? null : state.banner
  state = { ...state, viewingChat: id, banner }
  emit()
  if (!banner) showQueuedBanner(380)
}

export function clearUnread(chat: ChatId) {
  if (state.unread[chat] === 0) return
  state = { ...state, unread: { ...state.unread, [chat]: 0 } }
  emit()
}

export function requestOpenChat(id: string) {
  state = { ...state, openChatRequest: id }
  emit()
}

export function clearOpenChatRequest() {
  state = { ...state, openChatRequest: null }
  emit()
}


