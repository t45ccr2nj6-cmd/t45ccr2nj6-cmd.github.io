import { useEffect, useRef, useState, useCallback } from 'react'
import { ALL_APPS, DOCK_APPS, HOME_PAGE_1, HOME_PAGE_2, LOCK_SCREEN_CONFIG, WIDGETS } from '@/data/config'
import { useViewport } from '@/hooks/useViewport'
import { AppIcon } from '@/components/AppIcon'
import { GlassPane } from '@/components/GlassPane'
import { useMissedCallCount, useStoryState } from '@/data/story'
import { useSmsUnreadCount } from '@/data/smsState'
import type { AppDescriptor } from '@/types'
import './HomeScreen.css'

interface HomeScreenProps {
  onOpenApp: (appId: AppDescriptor['id']) => void
}

/**
 * 桌面：Widget 卡片 + 多页应用网格（左右滑动） + 搜索栏 + Dock 栏。
 * 所有布局数据来源于 data/config.ts。
 */
export function HomeScreen({ onOpenApp }: HomeScreenProps) {
  // 只展示有内容的页面（空页自动隐藏，实现单页模式）
  const pages = [HOME_PAGE_1, HOME_PAGE_2].filter(p => p.length > 0)
  const [currentPage, setCurrentPage] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const pageContainerRef = useRef<HTMLDivElement>(null)
  const containerWidthRef = useRef(0)
  // 共享视口宽度：尺寸变化后重新校正翻页位移，不再单独监听 resize
  const { width: viewportWidth } = useViewport()
  const startXRef = useRef(0)
  const lastTranslateRef = useRef(0)
  const rafRef = useRef(0)
  /** 拖动距离超过阈值后为 true，用于抑制松手后的误触 click */
  const movedRef = useRef(false)

  // 测量容器宽度
  useEffect(() => {
    const el = pageContainerRef.current
    if (!el) return
    const update = () => { containerWidthRef.current = el.offsetWidth }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  /**
   * 用 requestAnimationFrame 在主线程驱动吸附动画。
   * 不用 CSS transition：合成器过渡在帧调度受限的环境下可能画面不更新。
   */
  const animateTo = useCallback((target: number) => {
    cancelAnimationFrame(rafRef.current)
    const from = dragOffsetRef.current
    if (from === target) return
    const start = performance.now()
    const dur = 320
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur)
      const e = 1 - Math.pow(1 - t, 3) // easeOutCubic
      const v = from + (target - from) * e
      dragOffsetRef.current = v
      setDragOffset(v)
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  // 用 ref 同步最新位移，供动画起始值使用
  const dragOffsetRef = useRef(0)
  useEffect(() => { dragOffsetRef.current = dragOffset }, [dragOffset])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    cancelAnimationFrame(rafRef.current)
    movedRef.current = false
    setIsDragging(true)
    startXRef.current = e.clientX
    lastTranslateRef.current = -currentPage * containerWidthRef.current
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
  }, [currentPage])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return
    const deltaX = e.clientX - startXRef.current
    if (Math.abs(deltaX) > 8) movedRef.current = true
    setDragOffset(lastTranslateRef.current + deltaX)
  }, [isDragging])

  /** 拖动后松手会触发 click —— 在捕获阶段拦截，防止误打开应用 */
  const onClickCapture = useCallback((e: React.SyntheticEvent) => {
    if (movedRef.current) {
      movedRef.current = false
      e.stopPropagation()
      e.preventDefault()
    }
  }, [])

  const onPointerUp = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)

    const w = containerWidthRef.current
    if (!w) return

    const threshold = w * 0.25
    let targetPage = currentPage

    if (dragOffset > lastTranslateRef.current + threshold) {
      targetPage = Math.max(0, currentPage - 1)
    } else if (dragOffset < lastTranslateRef.current - threshold) {
      targetPage = Math.min(pages.length - 1, currentPage + 1)
    }

    setCurrentPage(targetPage)
    animateTo(-targetPage * w)
  }, [isDragging, dragOffset, currentPage, pages.length, animateTo])

  // 视口宽度变化时保持在正确页面（数据来自全局共享视口，避免组件各自监听）
  useEffect(() => {
    const w = pageContainerRef.current?.offsetWidth ?? containerWidthRef.current
    if (w > 0) setDragOffset(-currentPage * w)
  }, [viewportWidth, currentPage])

  const pageTranslate = dragOffset

  /** 跳到指定页（边缘点击翻页 / 页面指示点共用） */
  const goToPage = (i: number) => {
    const clamped = Math.max(0, Math.min(pages.length - 1, i))
    setCurrentPage(clamped)
    const w = containerWidthRef.current
    if (w > 0) animateTo(-clamped * w)
  }

  return (
    <div
      className="hs"
      style={{ background: LOCK_SCREEN_CONFIG.homeWallpaper || LOCK_SCREEN_CONFIG.wallpaper }}
    >
      {/* 页面容器（可左右滑动）：外层负责裁剪，内层轨道负责位移 */}
      <div
        ref={pageContainerRef}
        className="hs-pages"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={onClickCapture}
      >
        <div
          className="hs-pages-track"
          style={{ transform: `translateX(${pageTranslate}px)` }}
        >
          {/* 第 1 页：Widget + 应用网格；后续页：纯应用网格 */}
          {pages.map((apps, i) => (
            <div className="hs-page" key={i}>
              {i === 0 && (
                <div className="hs-widgets">
                  {WIDGETS.map((w) => (
                    <WidgetCard key={w.id} widget={w} trackDeps={[pageTranslate]} />
                  ))}
                </div>
              )}
              <AppGrid apps={apps} onOpen={onOpenApp} />
            </div>
          ))}
        </div>
      </div>

      {/* 屏幕边缘翻页热区（电脑端点击翻页，移动端用滑动手势） */}
      {currentPage > 0 && (
        <button
          className="hs-edge hs-edge-left"
          onClick={() => goToPage(currentPage - 1)}
          aria-label="Previous page"
        >
          ‹
        </button>
      )}
      {currentPage < pages.length - 1 && (
        <button
          className="hs-edge hs-edge-right"
          onClick={() => goToPage(currentPage + 1)}
          aria-label="Next page"
        >
          ›
        </button>
      )}

      {/* 底部：搜索胶囊 + 页面指示点（参考 p2/p3 的 iOS 26 布局） */}
      <div className="hs-bottom-bar">
        <button className="hs-search-bar" onClick={() => onOpenApp('settings')} title="Search">
          <GlassPane radius={16} strength={35} blur={8} edgeDepth={6} />
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <span>Search</span>
        </button>
      </div>

      {/* Dock 栏 */}
      <div className="hs-dock">
        <GlassPane radius={34} strength={35} blur={8} edgeDepth={7} shadow />
        {DOCK_APPS.map((app) => (
          <DockIcon key={app.id} app={app} onOpen={() => onOpenApp(app.id)} />
        ))}
      </div>
    </div>
  )
}

// ========== 组件子模块 ==========

/** 微信未读总数（剧情推送产生的未读） */
function useWechatUnread() {
  const story = useStoryState()
  return story.unread.singlee + story.unread.jy
}

/** 图标 + 右上角未读红点 */
function IconWithBadge({ appId, size }: { appId: AppDescriptor['id']; size: 'grid' | 'dock' }) {
  const unread = useWechatUnread()
  const missedCalls = useMissedCallCount()
  const smsUnread = useSmsUnreadCount()
  // 小红书固定 99+（超过 99 条按 iOS 规则显示 99+）；短信跟随真实未读
  const count =
    appId === 'wechat'
      ? unread
      : appId === 'phone'
        ? missedCalls
        : appId === 'xiaohongshu'
          ? 100
          : appId === 'messages'
            ? smsUnread
            : 0
  return (
    <span className="ai-wrap">
      <AppIcon name={appId as any} size={size} />
      {count > 0 && <span className="ai-badge">{count > 99 ? '99+' : count}</span>}
    </span>
  )
}

/** 单个应用图标（桌面网格）；disabled 的占位图标点击无反应 */
function GridIcon({ app, onOpen }: { app: AppDescriptor; onOpen: () => void }) {
  return (
    <button
      className={`ai${app.disabled ? ' is-disabled' : ''}`}
      onClick={app.disabled ? undefined : onOpen}
    >
      <IconWithBadge appId={app.id} size="grid" />
      <span className="ai-label">{app.name}</span>
    </button>
  )
}

/** 应用网格 —— 4 列自适应 */
function AppGrid({ apps, onOpen }: { apps: AppDescriptor[]; onOpen: (id: AppDescriptor['id']) => void }) {
  return (
    <div className="hs-grid">
      {apps.map((app) => (
        <GridIcon key={app.id} app={app} onOpen={() => onOpen(app.id)} />
      ))}
    </div>
  )
}

/** Dock 栏图标 */
function DockIcon({ app, onOpen }: { app: AppDescriptor; onOpen: () => void }) {
  return (
    <button className="di" onClick={onOpen}>
      <IconWithBadge appId={app.id} size="dock" />
    </button>
  )
}

/** Widget 卡片（含下方名称标签，与图标标签样式一致） */
function WidgetCard({ widget, trackDeps }: { widget: (typeof WIDGETS)[number]; trackDeps?: unknown[] }) {
  // 日历卡片跟随真实日期变化（与锁屏时间同源）
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const label = widget.type === 'weather' ? 'Weather' : 'Calendar'
  const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][now.getDay()]

  return (
    <div className={`w-item w-item-${widget.type}`}>
      {widget.type === 'weather' ? (
        <div className="w-card w-weather">
          <div className="w-weather-head">
            <div className="w-weather-title">{widget.title}</div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
          <div className="w-weather-temp">{widget.temp}°</div>
          <div className="w-weather-desc">
            <span>{widget.condition}</span>
            <span className="w-weather-range">H:{widget.high}°  L:{widget.low}°</span>
          </div>
        </div>
      ) : widget.type === 'calendar' ? (
        <div className="w-card w-calendar">
          <GlassPane radius={20} strength={35} blur={8} edgeDepth={6} trackDeps={trackDeps} />
          <div className="w-calendar-head">
            <div className="w-calendar-week">{weekday}</div>
          </div>
          <div className="w-calendar-day">{now.getDate()}</div>
          <div className="w-calendar-note">{widget.note}</div>
        </div>
      ) : null}
      <span className="w-item-label">{label}</span>
    </div>
  )
}

// 保留 ALL_APPS 供调试/类型推断使用
export const __ALL = ALL_APPS
