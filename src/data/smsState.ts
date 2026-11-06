import { useSyncExternalStore } from 'react'
import { CONVERSATIONS } from './messages'

/**
 * 短信已读状态：只存内存，网页刷新 / 关闭页面才重置。
 * 退出信息 App 再进入不会重新变成未读。
 */
let readIds: string[] = []
const listeners = new Set<() => void>()

const subscribe = (fn: () => void) => {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

const getSnapshot = () => readIds

export function useSmsReadIds(): string[] {
  return useSyncExternalStore(subscribe, getSnapshot)
}

/** 打开某个会话后标记该会话为已读 */
export function markSmsRead(senderId: string) {
  if (readIds.includes(senderId)) return
  readIds = [...readIds, senderId]
  listeners.forEach((fn) => fn())
}

/** 短信未读总数：会话列表红点与桌面 Messages 角标共用 */
export function useSmsUnreadCount(): number {
  const read = useSmsReadIds()
  return CONVERSATIONS.reduce((sum, c) => sum + (read.includes(c.senderId) ? 0 : c.unread), 0)
}
