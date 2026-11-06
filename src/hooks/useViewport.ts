import { useEffect, useState } from 'react'

/** 统一视口快照：同一时刻所有组件读取同一份数据 */
export interface ViewportSnapshot {
  /** 布局视口宽度（部分 WebView 缩放时取可视视口的较小值，避免右侧被裁切） */
  width: number
  /** 键盘安全高度：软键盘弹起期间保持基线高度，不随可视视口收缩 */
  height: number
}

type Listener = (next: ViewportSnapshot) => void

const listeners = new Set<Listener>()
let listening = false
let current: ViewportSnapshot | null = null
let lastLayoutWidth = 0
let stableHeight = 0

/** 当前是否有文本输入控件聚焦（软键盘是否可能已弹出） */
function isTextEntryFocused(): boolean {
  const el = document.activeElement as HTMLElement | null
  if (!el) return false
  if (el.isContentEditable) return true
  const tag = el.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
}

/**
 * 计算视口尺寸。
 *
 * 高度只取布局视口（window.innerHeight），不使用 visualViewport.height：
 * 软键盘弹出时可视视口会收缩，直接采用会把整个模拟器压小（G4）。
 * 部分 Android WebView / 微信内核会连带压缩布局视口，因此键盘期间锁定基线高度；
 * 旋转或宽度变化时解除锁定。
 */
function compute(): ViewportSnapshot {
  const layoutW = window.innerWidth || document.documentElement.clientWidth
  const layoutH = window.innerHeight || document.documentElement.clientHeight
  const widthChanged = Math.abs(layoutW - lastLayoutWidth) > 1
  const keyboardOpen = isTextEntryFocused() && !widthChanged && layoutH < stableHeight
  if (!keyboardOpen) {
    lastLayoutWidth = layoutW
    stableHeight = layoutH
  }
  return {
    width: Math.min(layoutW, window.visualViewport?.width ?? layoutW),
    height: stableHeight || layoutH,
  }
}

function emit() {
  const next = compute()
  if (current && current.width === next.width && current.height === next.height) return
  current = next
  listeners.forEach((fn) => fn(next))
}

/** 全局只注册一套视口监听，多个组件共享 */
function ensureListening() {
  if (listening || typeof window === 'undefined') return
  listening = true
  window.addEventListener('resize', emit)
  window.addEventListener('orientationchange', emit)
  window.visualViewport?.addEventListener('resize', emit)
}

function read(): ViewportSnapshot {
  if (!current) current = compute()
  return current
}

/** 订阅统一视口变化，返回取消订阅函数 */
export function subscribeViewport(fn: Listener): () => void {
  ensureListening()
  listeners.add(fn)
  return () => listeners.delete(fn)
}

/** 组件内读取统一视口尺寸 */
export function useViewport(): ViewportSnapshot {
  const [snapshot, setSnapshot] = useState<ViewportSnapshot>(read)
  useEffect(() => subscribeViewport(setSnapshot), [])
  return snapshot
}
