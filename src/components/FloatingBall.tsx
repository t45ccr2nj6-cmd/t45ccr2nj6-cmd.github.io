import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import './FloatingBall.css'

/** 悬浮球直径（逻辑坐标 px） */
const SIZE = 56
/** 距屏幕边缘的最小间距 */
const MARGIN = 10
/** 静止多久后自动变半透明 */
const IDLE_FADE_MS = 3000
/** 长按多久触发锁屏 */
const LONG_PRESS_MS = 600
/** 松手时距边缘多近才吸附（越大吸力越强） */
const EDGE_SNAP_DIST = 40

interface FloatingBallProps {
  /** 长按回调（锁屏） */
  onLongPress: () => void
  /** 轻点回调（未拖动、未长按时触发） */
  onTap?: () => void
}

/**
 * 悬浮球（AssistiveTouch）：
 *  - 深色圆角方形按钮 + 灰色圆环 + 白色圆心，还原 iOS 外观
 *  - 可拖动，松手后吸附到最近的左右边缘
 *  - 静止 3 秒自动降为半透明，一碰恢复
 *  - 长按 0.6 秒锁屏
 */
export function FloatingBall({ onLongPress, onTap }: FloatingBallProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const [dragging, setDragging] = useState(false)
  const [faded, setFaded] = useState(false)
  const [idleKey, setIdleKey] = useState(0)

  const dragRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
    moved: false,
    longFired: false,
    timer: 0,
  })

  // 初始位置：右侧中部；并跟随屏幕尺寸变化重新夹取，避免手机全屏/缩放后球跑到屏幕外
  useLayoutEffect(() => {
    const screen = hostRef.current?.parentElement
    if (!screen) return
    const place = () => {
      const w = screen.clientWidth || 428
      const h = screen.clientHeight || 926
      setPos((prev) => {
        if (!prev) return { x: Math.max(MARGIN, w - SIZE - MARGIN), y: Math.round(h * 0.45) }
        return {
          x: Math.min(Math.max(prev.x, MARGIN), Math.max(MARGIN, w - SIZE - MARGIN)),
          y: Math.min(Math.max(prev.y, MARGIN), Math.max(MARGIN, h - SIZE - MARGIN)),
        }
      })
    }
    place()
    // 屏幕（.pf）尺寸变化时重新定位：手机全屏切换、窗口缩放、旋转
    const ro = new ResizeObserver(place)
    ro.observe(screen)
    window.addEventListener('resize', place)
    window.addEventListener('orientationchange', place)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', place)
      window.removeEventListener('orientationchange', place)
    }
  }, [])

  // 静止一段时间后自动变淡
  useEffect(() => {
    setFaded(false)
    const t = setTimeout(() => setFaded(true), IDLE_FADE_MS)
    return () => clearTimeout(t)
  }, [idleKey])

  const bump = () => setIdleKey((k) => k + 1)

  /** 把 client 坐标位移换算成逻辑坐标（手机外壳可能有缩放） */
  const scaleOf = () => {
    const pf = hostRef.current?.closest('.pf') as HTMLElement | null
    if (!pf) return 1
    return pf.getBoundingClientRect().width / 428 || 1
  }

  const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max)

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pos) return
    e.stopPropagation()
    hostRef.current?.setPointerCapture(e.pointerId)
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      origX: pos.x,
      origY: pos.y,
      moved: false,
      longFired: false,
      timer: window.setTimeout(() => {
        dragRef.current.longFired = true
        onLongPress()
      }, LONG_PRESS_MS),
    }
    setDragging(true)
    setFaded(false)
    bump()
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current
    if (!d.active) return
    const dx = (e.clientX - d.startX) / scaleOf()
    const dy = (e.clientY - d.startY) / scaleOf()
    if (!d.moved && Math.hypot(dx, dy) > 5) {
      d.moved = true
      clearTimeout(d.timer)
    }
    if (!d.moved) return
    const screen = hostRef.current?.parentElement
    const w = screen?.offsetWidth || 428
    const h = screen?.offsetHeight || 926
    setPos({
      x: clamp(d.origX + dx, MARGIN, w - SIZE - MARGIN),
      y: clamp(d.origY + dy, MARGIN, h - SIZE - MARGIN),
    })
  }

  const finish = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current
    clearTimeout(d.timer)
    if (!d.active) return
    d.active = false
    setDragging(false)
    if (hostRef.current?.hasPointerCapture(e.pointerId)) {
      hostRef.current.releasePointerCapture(e.pointerId)
    }
    // 拖动过才吸附边缘；长按已触发则保持原地
    if (d.moved && !d.longFired) {
      const screen = hostRef.current?.parentElement
      const w = screen?.offsetWidth || 428
      const h = screen?.offsetHeight || 926
      setPos((p) => {
        if (!p) return p
        // 只有松手时已经贴近左右边缘才吸附，中间区域保持原位置
        const leftGap = p.x - MARGIN
        const rightGap = w - SIZE - MARGIN - p.x
        let x = p.x
        if (leftGap <= EDGE_SNAP_DIST && leftGap <= rightGap) x = MARGIN
        else if (rightGap <= EDGE_SNAP_DIST) x = w - SIZE - MARGIN
        return { x, y: clamp(p.y, MARGIN, h - SIZE - MARGIN) }
      })
    }
    // 没拖动也没长按 —— 视为轻点
    if (!d.moved && !d.longFired) onTap?.()
    bump()
  }

  return (
    <div
      ref={hostRef}
      className={`fball${dragging ? ' is-dragging' : ''}${faded ? ' is-faded' : ''}`}
      style={pos ? { left: pos.x, top: pos.y } : { visibility: 'hidden' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={finish}
      onPointerCancel={finish}
      onClick={(e) => e.stopPropagation()}
      role="button"
      aria-label="AssistiveTouch"
    >
      <span className="fball-circle fball-c3" />
      <span className="fball-circle fball-c2" />
      <span className="fball-circle fball-c1" />
    </div>
  )
}
