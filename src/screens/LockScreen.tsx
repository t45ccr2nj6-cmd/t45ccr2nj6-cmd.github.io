import { useEffect, useRef, useState } from 'react'
import { LOCK_SCREEN_CONFIG, PASSCODE } from '@/data/config'
import { useStoryState } from '@/data/story'
import { AppIcon } from '../components/AppIcon'
import { GlassText } from '../components/GlassText'
import { GlassPane } from '../components/GlassPane'
import './LockScreen.css'

interface LockScreenProps {
  onUnlock: () => void
  notificationCount?: number
  /** 外部（悬浮球轻点）递增强度信号：大于 0 时唤起密码面板 */
  openPasscodeSignal?: number
}

type LockMode = 'idle' | 'passcode'

/**
 * 锁屏：参考真实 iPhone —— 点击任意位置 / 上滑唤起密码键盘。
 * 时间、日期直接压在壁纸上，颜色由 config 配置（换壁纸时一起换）。
 */
export function LockScreen({ onUnlock, notificationCount = 0, openPasscodeSignal = 0 }: LockScreenProps) {
  const [mode, setMode] = useState<LockMode>('idle')
  const [input, setInput] = useState('')
  const [shake, setShake] = useState(false)
  const [flashlightOn, setFlashlightOn] = useState(false)
  const [now, setNow] = useState(new Date())

  // 微信未读通知：锁屏以通知卡（不是顶部横幅）展示最新一条消息
  const story = useStoryState()
  const wechatUnread = story.unread.singlee + story.unread.jy
  const notify = story.lastNotify

  // 上滑手势检测
  const touchStartY = useRef<number | null>(null)

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // 悬浮球轻点 → 唤起密码面板
  useEffect(() => {
    if (openPasscodeSignal > 0) setMode('passcode')
  }, [openPasscodeSignal])

  const hh = (() => {
    const h = now.getHours()
    return (h % 12 === 0 ? 12 : h % 12).toString().padStart(2, '0')
  })()
  const mm = now.getMinutes().toString().padStart(2, '0')
  const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][now.getDay()]
  const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][now.getMonth()]
  const day = now.getDate()

  const openPasscode = () => setMode('passcode')

  // 点击锁屏主体任意位置唤起密码（按钮区域 stopPropagation）
  const handleScreenTap = () => {
    if (mode === 'idle') openPasscode()
  }

  // 上滑唤起（真实 iPhone 手势）
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return
    const dy = touchStartY.current - e.changedTouches[0].clientY
    if (dy > 40 && mode === 'idle') openPasscode()
    touchStartY.current = null
  }

  const pressKey = (k: string) => {
    if (input.length >= 6) return
    const next = input + k
    setInput(next)
    if (next.length === 6) {
      if (next === PASSCODE) {
        setTimeout(onUnlock, 180)
      } else {
        setShake(true)
        setTimeout(() => {
          setInput('')
          setShake(false)
        }, 450)
      }
    }
  }

  const deleteKey = () => setInput((v) => v.slice(0, -1))

  const cfg = LOCK_SCREEN_CONFIG

  return (
    <div
      className="ls"
      style={{ background: cfg.wallpaper }}
      onClick={handleScreenTap}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 时钟区域 —— 日期保留普通 CSS，时间用 GlassText */}
      <div className="ls-clock">
        <div className={`ls-date${mode === 'passcode' ? ' is-out' : ''}`}>
          {weekday} {day} {monthName}
        </div>
        {/* 原始时间占位 —— 被 GlassText 覆盖 */}
        <div className="ls-time" style={{ opacity: 0 }}>
          {hh}:{mm}
        </div>
      </div>

      {/* 液态玻璃时间文字 —— 覆盖全屏，文字居中（密码模式下淡出） */}
      <div className={`ls-glass-wrap${mode === 'passcode' ? ' is-out' : ''}`}>
        <GlassText
          text={`${hh}:${mm}`}
          fontSize={115}
          fontWeight={800}
          textLeft={0}
          textTop={140}
          useAnchor
          strength={40}
          chromaticAberration={1.5}
          blur={6}
          fillOpacity={1}
          strokeWidth={0}
          strokeOpacity={0}
        />
      </div>

      {/* 通知区域：底部叠层通知卡（微信最新一条消息） */}
      <div className={`ls-notifications${mode === 'passcode' ? ' is-out' : ''}`}>
        {notificationCount > 0 && (
          <div className="ls-notif-pill">
            <GlassPane radius={14} strength={35} blur={8} edgeDepth={6} glow />
            <span className="ls-notif-dot" />
            <span className="ls-notif-text">{notificationCount} New Notifications</span>
          </div>
        )}

        {wechatUnread > 0 && notify && (
          <button
            className="ls-wx-notif"
            onClick={(e) => {
              e.stopPropagation()
              // 点通知不直接进主页，只唤起密码输入
              openPasscode()
            }}
          >
            <span className="ls-wx-layer is-2" />
            <span className="ls-wx-layer is-1" />
            <span className="ls-wx-card">
              <span className="ls-wx-icon">
                <AppIcon name="wechat" size="grid" />
                <span className="ls-wx-badge">{wechatUnread}</span>
              </span>
              <span className="ls-wx-body">
                <span className="ls-wx-head">
                  <span className="ls-wx-name">WeChat</span>
                  <span className="ls-wx-time">now</span>
                </span>
                <span className="ls-wx-msg">{notify.text}</span>
              </span>
            </span>
          </button>
        )}
      </div>

      <div className={`ls-bottom${mode === 'passcode' ? ' is-out' : ''}`} onClick={(e) => e.stopPropagation()}>
          <button
            className={`ls-bubble-btn ${flashlightOn ? 'ls-bubble-on' : ''}`}
            style={{ marginLeft: '2px' }}
            onClick={() => setFlashlightOn((v) => !v)}
            title="Flashlight"
          >
            {!flashlightOn && <GlassPane radius={32} tintColor="white" tintStops={[0.35, 0.22, 0.3]} blur={5} strength={28} edgeDepth={6} />}
            <img
              src="/icons/flashlight.svg"
              alt="Flashlight"
              width={55}
              height={55}
              style={{ filter: flashlightOn ? 'brightness(0)' : 'brightness(0) invert(1)' }}
            />
          </button>
          <button className="ls-bubble-btn" onClick={openPasscode} title="Camera">
            <GlassPane radius={32} tintColor="white" tintStops={[0.35, 0.22, 0.3]} blur={5} strength={28} edgeDepth={6} />
            <img src="/icons/camera.svg" alt="Camera" width={55} height={55} style={{ filter: 'brightness(0) invert(1)' }} />
          </button>
        </div>

      {mode === 'passcode' && (
        /* —— 密码解锁：壁纸直接显示，键帽液态玻璃 —— */
        <div className="ls-passcode" onClick={(e) => e.stopPropagation()}>
          <div className="ls-passcode-title">Enter Passcode</div>

          <div className={`ls-dots ${shake ? 'ls-shake' : ''}`}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <span key={i} className={`ls-dot ${input.length > i ? 'ls-dot-filled' : ''}`} />
            ))}
          </div>
          <div className="ls-keypad">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((k) => (
              <button key={k} className="ls-key" onClick={() => pressKey(k)}>
                <GlassPane radius={40} tintColor="white" tintStops={[0.35, 0.22, 0.3]} blur={5} strength={28} edgeDepth={5} />
                <span>{k}</span>
              </button>
            ))}
            <div className="ls-key ls-key-placeholder" />
            <button className="ls-key" onClick={() => pressKey('0')}>
              <GlassPane radius={40} tintColor="white" tintStops={[0.35, 0.22, 0.3]} blur={5} strength={28} edgeDepth={5} />
              <span>0</span>
            </button>
            <button className="ls-key ls-key-del" onClick={deleteKey} aria-label="Delete">
              <span className="ls-key-del-inner">⌫</span>
            </button>
          </div>
          <button
            className="ls-passcode-cancel"
            onClick={() => {
              setMode('idle')
              setInput('')
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* 手电筒开启时的全屏白光 */}
      {flashlightOn && <div className="ls-flashlight" />}
    </div>
  )
}
