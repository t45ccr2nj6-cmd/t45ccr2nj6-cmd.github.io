import { useEffect, useMemo, useRef, useState } from 'react'
import {
  SENDER_MAP,
  getSortedConversations,
  type Conversation,
  type Message,
} from '@/data/messages'
import { markSmsRead, useSmsReadIds } from '@/data/smsState'
import './Messages.css'

/** 把 ISO 时间格式化成会话列表的时间标签：今天 HH:MM / 昨天 / 星期几 / 月日 */
function formatConvTime(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfMsg = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const dayDiff = Math.round((startOfToday.getTime() - startOfMsg.getTime()) / 86400000)

  if (dayDiff === 0) {
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  }
  if (dayDiff === 1) return 'Yesterday'
  if (dayDiff < 7) {
    return d.toLocaleDateString('en-US', { weekday: 'short' })
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** 聊天页日期分隔：Today / Yesterday / 月日 年 */
function formatDayLabel(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfMsg = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const dayDiff = Math.round((startOfToday.getTime() - startOfMsg.getTime()) / 86400000)
  if (dayDiff === 0) return 'Today'
  if (dayDiff === 1) return 'Yesterday'
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

/** 聊天页顶部联系人区日期：2026年11月4日 21:30 */
function formatHeroDate(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** 简化的日期分组：同一条消息是否和上一条是同一天 */
function sameDay(a: string, b: string): boolean {
  const da = new Date(a)
  const db = new Date(b)
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate()
}

// —— 头像组件：渐变圆 + 首字 ——
function Avatar({ senderId, size = 50 }: { senderId: string; size?: number }) {
  const s = SENDER_MAP[senderId]
  const gradient = `linear-gradient(135deg, ${s.colors[0]}, ${s.colors[1]})`
  return (
    <div
      className="msg-avatar"
      style={{ width: size, height: size, background: gradient, fontSize: size * 0.42 }}
    >
      {s.avatarText}
    </div>
  )
}

// —— 会话列表页 ——
function ConversationList({ onOpen, readSet }: { onOpen: (senderId: string) => void; readSet: Set<string> }) {
  const sorted = useMemo(() => getSortedConversations(), [])
  const pinned = sorted.filter((c) => SENDER_MAP[c.senderId].pinned)
  const [query, setQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => {
    if (!query.trim()) return sorted
    const q = query.toLowerCase()
    return sorted.filter((c) => {
      const s = SENDER_MAP[c.senderId]
      const last = c.messages[c.messages.length - 1]
      return s.name.toLowerCase().includes(q) || last.text.toLowerCase().includes(q)
    })
  }, [sorted, query])

  return (
    <div className="msg">
      {/* 顶部大标题 + Edit */}
      <header className={`msg-header${scrolled ? ' is-scrolled' : ''}`}>
        <h1 className="msg-title">Messages</h1>
        <button className="msg-edit">Edit</button>
      </header>

      <div className="msg-scroll" ref={scrollRef} onScroll={(e) => setScrolled((e.target as HTMLDivElement).scrollTop > 8)}>
        {/* 置顶会话横排 */}
        {pinned.length > 0 && !query && (
          <div className="msg-pinned">
            {pinned.map((c) => {
              const s = SENDER_MAP[c.senderId]
              return (
                <button
                  key={c.senderId}
                  className="msg-pin-item"
                  onClick={() => onOpen(c.senderId)}
                >
                  <div className="msg-pin-avatar">
                    <Avatar senderId={c.senderId} size={62} />
                    {c.unread > 0 && !readSet.has(c.senderId) && <span className="msg-pin-badge">{c.unread}</span>}
                  </div>
                  <span className="msg-pin-name">{s.name}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* 搜索框 */}
        <div className="msg-search-wrap">
          <div className="msg-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
            <input
              className="msg-search-input"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* 会话列表 */}
        <div className="msg-list">
          {filtered.map((c) => {
            const s = SENDER_MAP[c.senderId]
            const last = c.messages[c.messages.length - 1]
            const preview = last.text.length > 40 ? last.text.slice(0, 40) + '…' : last.text
            return (
              <button key={c.senderId} className="msg-row" onClick={() => onOpen(c.senderId)}>
                <div className="msg-row-left">
                  {c.unread > 0 && !readSet.has(c.senderId) && <span className="msg-row-dot" />}
                  <Avatar senderId={c.senderId} />
                </div>
                <div className="msg-row-main">
                  <div className="msg-row-top">
                    <span className="msg-row-name">{s.name}</span>
                    <span className="msg-row-time">{formatConvTime(last.time)}</span>
                  </div>
                  <div className="msg-row-preview">{preview}</div>
                </div>
                {c.unread > 0 && !readSet.has(c.senderId) && <span className="msg-row-badge">{c.unread}</span>}
              </button>
            )
          })}
          {filtered.length === 0 && (
            <div className="msg-empty">No conversations found</div>
          )}
        </div>

        <div className="msg-spacer" />
      </div>

      {/* 底部 Filters */}
      <div className="msg-bottom">
        <button className="msg-filters">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
          </svg>
          <span>Filters</span>
        </button>
      </div>
    </div>
  )
}

// —— 单条消息气泡 ——
function MessageBubble({
  msg,
  showTail,
  mandarinOn,
  onToggle,
}: {
  msg: Message
  showTail: boolean
  mandarinOn: boolean
  onToggle: () => void
}) {
  const isBlue = msg.isImessage && msg.outgoing
  const isGreen = !msg.isImessage && msg.outgoing
  // 收到的消息统一为灰色（iMessage / SMS 都是）
  const isGray = !msg.outgoing

  const cls = [
    'msg-bubble',
    msg.outgoing ? 'msg-bubble--out' : 'msg-bubble--in',
    isBlue ? 'msg-bubble--blue' : '',
    isGreen ? 'msg-bubble--green' : '',
    isGray ? 'msg-bubble--gray' : '',
    showTail ? 'has-tail' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={`msg-bubble-row${msg.outgoing ? ' is-out' : ''}`}>
      <div className={`${cls}${msg.alt ? ' can-toggle' : ''}`} onClick={msg.alt ? onToggle : undefined}>
        <span className="msg-bubble-text">{mandarinOn ? msg.text : msg.alt ?? msg.text}</span>
      </div>
      {msg.outgoing && msg.receipt && (
        <span className="msg-receipt">{msg.receipt === 'read' ? 'Read' : 'Delivered'}</span>
      )}
    </div>
  )
}

// —— 聊天页 ——
function ChatView({ senderId, onBack }: { senderId: string; onBack: () => void }) {
  const sender = SENDER_MAP[senderId]
  const conv = useMemo<Conversation | undefined>(
    () => getSortedConversations().find((c) => c.senderId === senderId),
    [senderId],
  )
  const [msgs, setMsgs] = useState<Message[]>(() => (conv ? [...conv.messages] : []))
  const [text, setText] = useState('')
  // 已切换成普通话的气泡（默认显示粤语）
  const [mandarinOn, setMandarinOn] = useState<Set<string>>(new Set())
  const scrollRef = useRef<HTMLDivElement>(null)

  const toggleLang = (id: string) => {
    setMandarinOn((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // 切换会话时重置消息
  useEffect(() => {
    setMsgs(conv ? [...conv.messages] : [])
  }, [conv])

  // 进入/消息变化时滚到底
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [msgs])

  if (!conv) return null

  const send = () => {
    const t = text.trim()
    if (!t) return
    setMsgs((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        outgoing: true,
        text: t,
        time: new Date().toISOString(),
        isImessage: true,
        receipt: 'delivered',
      },
    ])
    setText('')
  }

  return (
    <div className="msg msg-chat">
      {/* 悬浮返回按钮 */}
      <button className="msg-back" onClick={onBack} aria-label="Back">
        <svg width="15" height="15" viewBox="0 0 12 20" fill="none" stroke="#000" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 2L2 10l8 8" />
        </svg>
      </button>

      {/* 消息区 */}
      <div className="msg-chat-scroll" ref={scrollRef}>
        {/* 顶部联系人区：大头像 + 名称胶囊 + 信息类型与时间 */}
        <div className="msg-chat-hero">
          <Avatar senderId={senderId} size={86} />
          <div className="msg-chat-pill">
            <span className="msg-chat-name">{sender.name}</span>
            <svg width="8" height="13" viewBox="0 0 8 13" fill="none" stroke="#8e8e93" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 1l5.5 5.5L1 12" />
            </svg>
          </div>
          <div className="msg-chat-sub">信息 · 短信</div>
          {msgs[0] && <div className="msg-chat-sub">{formatHeroDate(msgs[0].time)}</div>}
        </div>

        {msgs.map((m, i) => {
          const prev = msgs[i - 1]
          const next = msgs[i + 1]
          const showDayLabel = i > 0 && (!prev || !sameDay(prev.time, m.time))
          // 同方向且时间接近（5分钟内）连续显示，不画尾巴和时间
          const sameSenderPrev = prev && prev.outgoing === m.outgoing && (new Date(m.time).getTime() - new Date(prev.time).getTime() < 5 * 60000)
          const showTail = !next || next.outgoing !== m.outgoing || (new Date(next.time).getTime() - new Date(m.time).getTime() >= 5 * 60000)
          // 不同人之间的消息，间距更大
          const isTurnGap = !!prev && prev.outgoing !== m.outgoing

          return (
            <div key={m.id} className={isTurnGap ? 'msg-turn-gap' : ''}>
              {showDayLabel && <div className="msg-day-label">{formatDayLabel(m.time)}</div>}
              <MessageBubble
                msg={m}
                showTail={showTail}
                mandarinOn={mandarinOn.has(m.id)}
                onToggle={() => toggleLang(m.id)}
              />
              {sameSenderPrev && <div className="msg-bubble-gap" />}
            </div>
          )
        })}
        <div className="msg-chat-bottom-space" />
      </div>

      {/* 输入栏 */}
      <div className="msg-input-bar">
        <button className="msg-plus" title="Add">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
        <div className="msg-input-wrap">
          <input
            className="msg-input"
            placeholder="iMessage"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') send()
            }}
          />
        </div>
        {text.trim() ? (
          <button className="msg-send" onClick={send}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        ) : (
          <button className="msg-mic" title="Voice">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

// —— 信息 App 主入口 ——
export function Messages() {
  const [activeSender, setActiveSender] = useState<string | null>(null)
  // 已读集合存内存：进入会话后记为已读，退出 App 再进入不会重新变成未读
  const readIds = useSmsReadIds()
  const readSet = useMemo(() => new Set(readIds), [readIds])

  const openChat = (senderId: string) => {
    markSmsRead(senderId)
    setActiveSender(senderId)
  }

  if (activeSender) {
    return <ChatView senderId={activeSender} onBack={() => setActiveSender(null)} />
  }
  return <ConversationList onOpen={openChat} readSet={readSet} />
}
