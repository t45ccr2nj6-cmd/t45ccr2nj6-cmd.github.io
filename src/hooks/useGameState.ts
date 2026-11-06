import { useCallback, useState } from 'react'
import type { AppId, PhoneNotification, PhoneState } from '@/types'
import { STORAGE_KEY } from '@/data/config'

/**
 * 游戏状态 hook：统一管理锁屏/桌面/应用、当前 app 以及通知列表。
 * 未来剧情系统产生的状态变更也会走这里。
 */
export interface GameState {
  state: PhoneState
  currentApp: AppId | null
  notifications: PhoneNotification[]
  unlocked: boolean
}

const INITIAL: GameState = {
  state: 'locked',
  currentApp: null,
  notifications: [],
  unlocked: false,
}

export function useGameState() {
  // 每次进入网页（刷新 / 重新打开）都从锁屏开始，不恢复上次所在的 App
  const [state, setState] = useState<GameState>(INITIAL)

  const unlock = useCallback(() => {
    setState((s) => ({ ...s, state: 'home', unlocked: true }))
  }, [])

  const lock = useCallback(() => {
    setState((s) => ({ ...s, state: 'locked', unlocked: false, currentApp: null }))
  }, [])

  const openApp = useCallback((appId: AppId) => {
    setState((s) => ({ ...s, state: 'app', currentApp: appId }))
  }, [])

  const goHome = useCallback(() => {
    setState((s) => ({ ...s, state: 'home', currentApp: null }))
  }, [])

  const addNotification = useCallback((n: PhoneNotification) => {
    setState((s) => ({ ...s, notifications: [n, ...s.notifications] }))
  }, [])

  const markNotificationRead = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }))
  }, [])

  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setState(INITIAL)
  }, [])

  return {
    ...state,
    unlock,
    lock,
    openApp,
    goHome,
    addNotification,
    markNotificationRead,
    reset,
  }
}
