import { useEffect, useState } from 'react'
import { PhoneFrame } from '@/components/PhoneFrame'
import { FloatingBall } from '@/components/FloatingBall'
import { AppIcon } from '@/components/AppIcon'
import { LockScreen } from '@/screens/LockScreen'
import { HomeScreen } from '@/screens/HomeScreen'
import { AppPlaceholder } from '@/apps/AppPlaceholder'
import { Photos } from '@/apps/Photos'
import { Messages } from '@/apps/Messages'
import { Settings } from '@/apps/Settings'
import { Phone } from '@/apps/Phone'
import { Safari } from '@/apps/Safari'
import { WeChat } from '@/apps/WeChat'
import { Notes } from '@/apps/Notes'
import { Reminders } from '@/apps/Reminders'
import { Red } from '@/apps/Red'
import { Music } from '@/apps/Music'
import { useGameState } from '@/hooks/useGameState'
import { useStoryState, clearBanner, dismissBanners, requestOpenChat } from '@/data/story'
import type { AppId } from '@/types'

/** 已实现的 app —— 其余 id 仍走占位页 */
const READY_APPS: AppId[] = [
  'photos',
  'messages',
  'settings',
  'phone',
  'safari',
  'wechat',
  'notes',
  'reminders',
  'xiaohongshu',
  'music',
]

/** 白底 app：状态栏 / Home Indicator 使用深色 */
const LIGHT_APPS: AppId[] = [
  'photos',
  'messages',
  'settings',
  'phone',
  'safari',
  'wechat',
  'notes',
  'reminders',
  'xiaohongshu',
  'music',
]

/**
 * 整个模拟器的最顶层组件。
 * 根据游戏状态渲染不同场景：锁屏 / 桌面 / 当前 app。
 */
export default function App() {
  const {
    state,
    currentApp,
    notifications,
    unlock,
    lock,
    openApp,
    goHome,
  } = useGameState()

  const scene = state === 'app' ? 'app' : state === 'locked' ? 'lock' : 'home'

  // 悬浮球轻点：锁屏唤起密码面板（自增计数触发），app 内回到桌面
  const [passcodeSignal, setPasscodeSignal] = useState(0)

  const isLightApp = state === 'app' && currentApp != null && LIGHT_APPS.includes(currentApp)

  // rednote「我」页是深色底：由 App 持有状态，避免使用 :has() 选择器
  const [redDarkStatus, setRedDarkStatus] = useState(false)
  useEffect(() => {
    if (currentApp !== 'xiaohongshu') setRedDarkStatus(false)
  }, [currentApp])

  // Music 一旦打开过就保持挂载（display:none 隐藏），音频组件不销毁，
  // 退出 App / 回桌面 / 回锁屏都不打断播放；只有刷新网页或拨打电话才停
  const [musicLaunched, setMusicLaunched] = useState(false)
  useEffect(() => {
    if (currentApp === 'music') setMusicLaunched(true)
  }, [currentApp])
  const musicActive = state === 'app' && currentApp === 'music'

  // —— 微信消息横幅：自动收起，保留未读；点击直接进入对应会话 ——
  // 锁屏时不弹横幅（锁屏由通知卡展示），进入锁屏时清空队列
  const storyState = useStoryState()
  const banner = state === 'locked' ? null : storyState.banner

  useEffect(() => {
    if (state === 'locked') dismissBanners()
  }, [state])

  useEffect(() => {
    if (!banner) return
    const t = window.setTimeout(() => clearBanner(), 3200)
    return () => window.clearTimeout(t)
  }, [banner])

  const openBanner = () => {
    if (!banner) return
    requestOpenChat(banner.chatId)
    clearBanner()
    openApp('wechat')
  }

  return (
    <div className="desktop-wrapper">
      <PhoneFrame
        scene={scene}
        onHomePress={state === 'app' ? goHome : undefined}
        appLightTheme={isLightApp}
        darkStatus={state === 'app' && currentApp === 'xiaohongshu' && redDarkStatus}
        overlay={
          <>
            {banner && (
              <button key={banner.chatId + banner.text} className="wx-notify" onClick={openBanner}>
                <span className="wx-notify-icon">
                  <AppIcon name="wechat" size="grid" />
                </span>
                <span className="wx-notify-main">
                  <span className="wx-notify-top">
                    <span>WeChat</span>
                    <span>now</span>
                  </span>
                  <span className="wx-notify-name">{banner.name}</span>
                  <span className="wx-notify-text">{banner.text}</span>
                </span>
              </button>
            )}
            <FloatingBall
              onLongPress={lock}
              onTap={() => {
                if (state === 'locked') setPasscodeSignal((n) => n + 1)
                else if (state === 'app') goHome()
              }}
            />
          </>
        }
      >
        {state === 'locked' && (
          <LockScreen
            onUnlock={unlock}
            notificationCount={notifications.filter((n) => !n.read).length}
            openPasscodeSignal={passcodeSignal}
          />
        )}

        {state === 'home' && (
          <HomeScreen onOpenApp={openApp} />
        )}

        {state === 'app' && currentApp === 'photos' && <Photos />}
        {state === 'app' && currentApp === 'messages' && <Messages />}
        {state === 'app' && currentApp === 'settings' && <Settings />}
        {state === 'app' && currentApp === 'phone' && <Phone />}
        {state === 'app' && currentApp === 'safari' && <Safari />}
        {state === 'app' && currentApp === 'wechat' && <WeChat />}
        {state === 'app' && currentApp === 'notes' && <Notes />}
        {state === 'app' && currentApp === 'reminders' && <Reminders />}
        {state === 'app' && currentApp === 'xiaohongshu' && <Red onDarkStatusChange={setRedDarkStatus} />}
        {musicLaunched && (
          <div style={musicActive ? undefined : { display: 'none' }}>
            <Music />
          </div>
        )}

        {state === 'app' && currentApp && !READY_APPS.includes(currentApp) && (
          <AppPlaceholder appId={currentApp} onClose={goHome} />
        )}
      </PhoneFrame>
    </div>
  )
}
