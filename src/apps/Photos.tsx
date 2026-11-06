import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SORTED_PHOTOS, photoDate, type PhotoItem } from '@/data/photos'
import './Photos.css'

/** 查看器可滑动的照片序列：锁住的图不进查看器，左右滑自动跳过 */
const VIEWABLE_PHOTOS = SORTED_PHOTOS.filter((p) => !p.locked)

type Tab = 'years' | 'months' | 'all'

const TABS: Array<{ key: Tab; label: string }> = [
  { key: 'years', label: 'Years' },
  { key: 'months', label: 'Months' },
  { key: 'all', label: 'All' },
]

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function formatDay(d: Date) {
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
}

interface PhotoGroup {
  key: string
  title: string
  count: number
  photos: PhotoItem[]
}

/**
 * 相册（iOS 26 风格）：
 *  - 全屏 3 列网格 + Years / Months / All 分段
 *  - 底部悬浮液态玻璃分段胶囊 + 圆形搜索按钮，向下滚动收缩成小胶囊
 *  - 点击照片进入全屏查看器（横滑切换、下拉关闭、点按隐藏界面、收藏）
 */
export function Photos() {
  const [tab, setTab] = useState<Tab>('all')
  const [compact, setCompact] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set())

  const scrollRef = useRef<HTMLDivElement>(null)
  const lastTopRef = useRef(0)

  const groups = useMemo<PhotoGroup[]>(() => {
    if (tab === 'years') {
      const map = new Map<number, PhotoGroup>()
      SORTED_PHOTOS.forEach((p) => {
        const year = photoDate(p).getFullYear()
        if (!map.has(year)) map.set(year, { key: `${year}`, title: `${year}`, count: 0, photos: [] })
        const g = map.get(year)!
        g.photos.push(p)
        g.count = g.photos.length
      })
      return [...map.values()]
    }

    const map = new Map<string, PhotoGroup>()
    SORTED_PHOTOS.forEach((p) => {
      const d = photoDate(p)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      if (!map.has(key)) {
        const title = tab === 'months'
          ? MONTH_NAMES[d.getMonth()]
          : `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
        map.set(key, { key, title, count: 0, photos: [] })
      }
      const g = map.get(key)!
      g.photos.push(p)
      g.count = g.photos.length
    })
    return [...map.values()]
  }, [tab])

  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const top = e.currentTarget.scrollTop
    setScrolled(top > 8)

    if (top > lastTopRef.current + 3 && top > 60) setCompact(true)
    else if (top < lastTopRef.current - 3 || top < 8) setCompact(false)

    lastTopRef.current = top
  }, [])

  const selectTab = (next: Tab) => {
    setTab(next)
    setCompact(false)
    setScrolled(false)
    lastTopRef.current = 0
    scrollRef.current?.scrollTo({ top: 0 })
  }

  const openViewer = (photo: PhotoItem) => {
    setViewerIndex(VIEWABLE_PHOTOS.findIndex((p) => p.id === photo.id))
  }

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  return (
    <div className="ph">
      <header className={`ph-header${scrolled ? ' is-scrolled' : ''}`}>
        <h1 className="ph-title">Photos</h1>
        <div className="ph-nav">
          <button className="ph-glass-btn ph-select" type="button">Select</button>
          <button className="ph-glass-btn ph-more" type="button" aria-label="More options">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <circle cx="5" cy="12" r="1.9" />
              <circle cx="12" cy="12" r="1.9" />
              <circle cx="19" cy="12" r="1.9" />
            </svg>
          </button>
        </div>
      </header>

      <div className="ph-scroll" ref={scrollRef} onScroll={onScroll}>
        {groups.map((group) => (
          <section className={`ph-section ph-section--${tab}`} key={group.key}>
            <div className="ph-section-head">
              <span className="ph-section-title">{group.title}</span>
              {tab === 'years' && <span className="ph-section-count">{group.count} Photos</span>}
            </div>
            <div className="ph-grid">
              {group.photos.map((photo) => (
                photo.locked ? (
                  <div
                    className="ph-cell is-locked"
                    key={photo.id}
                    aria-label={`${photo.place} — ${formatDay(photoDate(photo))}`}
                  >
                    <PhotoFill photo={photo} />
                  </div>
                ) : (
                  <button
                    className="ph-cell"
                    key={photo.id}
                    type="button"
                    aria-label={`${photo.place} — ${formatDay(photoDate(photo))}`}
                    onClick={() => openViewer(photo)}
                  >
                    <PhotoFill photo={photo} />
                  </button>
                )
              ))}
            </div>
          </section>
        ))}
        <div className="ph-end-space" />
      </div>

      <div className={`ph-bottom${compact ? ' is-compact' : ''}`}>
        {compact ? (
          <button className="ph-mini-tab" type="button" onClick={() => setCompact(false)}>
            <span>{TABS.find((t) => t.key === tab)?.label}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M6 15l6-6 6 6" />
            </svg>
          </button>
        ) : (
          <div className="ph-tabs" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={tab === t.key}
                className={`ph-tab${tab === t.key ? ' is-active' : ''}`}
                onClick={() => selectTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {!compact && (
          <button className="ph-search" type="button" aria-label="Search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
              <circle cx="11" cy="11" r="7.5" />
              <path d="M20.5 20.5L16 16" />
            </svg>
          </button>
        )}
      </div>

      {viewerIndex !== null && (
        <PhotoViewer
          index={viewerIndex}
          onChange={setViewerIndex}
          onClose={() => setViewerIndex(null)}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
        />
      )}
    </div>
  )
}

// ========== 子组件 ==========

/** 网格单元格：图片 / 视频（视频用封面图 thumbSrc 做缩略图，避免手机端加载视频元数据慢/不显示首帧） */
function PhotoFill({ photo }: { photo: PhotoItem }) {
  if (photo.isVideo) {
    return (
      <span className="ph-cell-media">
        <img className="ph-img" src={photo.thumbSrc} alt={photo.place} loading="lazy" decoding="async" />
        <span className="ph-badge-video" aria-label="Video">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M8 5.5v13l11-6.5z" />
          </svg>
        </span>
      </span>
    )
  }
  return <img className="ph-img" src={photo.thumbSrc} alt={photo.place} loading="lazy" decoding="async" />
}

/**
 * 查看器内的单张幻灯片。
 * 照片：先显示网格已缓存的缩略图（秒开），全尺寸图挂载后淡入；
 * 用 IntersectionObserver 懒加载：只有当前 ±2 的 slide 才真正挂载 <img fullSrc>。
 * 视频：poster 用封面图，未播放时就有画面而不是空白。
 */
function ViewerSlide({ photo, active, shouldLoad }: { photo: PhotoItem; active: boolean; shouldLoad: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [fullReady, setFullReady] = useState(false)

  useEffect(() => {
    if (!active && videoRef.current) {
      if (!videoRef.current.paused) videoRef.current.pause()
      videoRef.current.muted = true
    }
  }, [active])

  if (photo.isVideo) {
    return (
      <div className="pv-video-wrap" data-video-wrap>
        <video
          ref={videoRef}
          className="pv-photo"
          src={photo.fullSrc}
          poster={photo.thumbSrc}
          playsInline
          muted
          loop
          preload={active ? 'auto' : 'metadata'}
          onEnded={() => setPlaying(false)}
          onPause={() => setPlaying(false)}
          onPlay={() => setPlaying(true)}
        />
        {!playing && (
          <span className="pv-play-btn" aria-hidden>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5.5v13l11-6.5z" />
            </svg>
          </span>
        )}
      </div>
    )
  }

  // 照片：缩略图常驻（网格已缓存，立即有画面），全尺寸图加载完成后淡入覆盖
  return (
    <div className="pv-photo-wrap">
      <img className="pv-photo pv-thumb" src={photo.thumbSrc} alt="" aria-hidden draggable={false} />
      {shouldLoad && (
        <img
          className={`pv-photo pv-full${fullReady ? ' is-loaded' : ''}`}
          src={photo.fullSrc}
          alt={photo.place}
          draggable={false}
          decoding="async"
          onLoad={() => setFullReady(true)}
        />
      )}
    </div>
  )
}

/**
 * 决定每个 slide 是否应该挂载图片的 Hook。
 * 策略：当前 index ±2 范围内立即加载；其余在进入视口时加载（IO）。
 * 一旦加载过就保持 true（不卸载，避免横滑回来重复请求）。
 */
function useViewerShouldLoad(
  total: number,
  currentIndex: number,
  slideRefs: React.RefObject<(HTMLDivElement | null)[]>
): boolean[] {
  const [loaded, setLoaded] = useState<boolean[]>(() => {
    const arr = new Array(total).fill(false)
    return arr
  })

  // 当 currentIndex 变化时，预加载 current ± 2
  useEffect(() => {
    const set = new Set<number>()
    for (let d = -2; d <= 2; d++) {
      const i = currentIndex + d
      if (i >= 0 && i < total) set.add(i)
    }

    setLoaded((prev) => {
      let changed = false
      const next = prev.slice()
      set.forEach((i) => {
        if (!next[i]) { next[i] = true; changed = true }
      })
      return changed ? next : prev
    })
  }, [currentIndex, total])

  // IntersectionObserver：进入视口就加载
  useEffect(() => {
    const root = document.querySelector('.pv-track') as HTMLElement | null
    if (!root) return

    const io = new IntersectionObserver(
      (entries) => {
        setLoaded((prev) => {
          let changed = false
          const next = prev.slice()
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const el = entry.target as HTMLElement
              const idx = Number(el.dataset.index)
              if (!next[idx]) { next[idx] = true; changed = true }
            }
          })
          return changed ? next : prev
        })
      },
      { root, threshold: 0.01 }
    )

    // 观察所有当前未加载的 slide
    const nodes = slideRefs.current
    if (nodes) {
      nodes.forEach((el, i) => {
        if (el && !loaded[i]) {
          el.dataset.index = String(i)
          io.observe(el)
        }
      })
    }

    return () => io.disconnect()
  }, [loaded, slideRefs])

  return loaded
}

interface ViewerProps {
  index: number
  onChange: (index: number) => void
  onClose: () => void
  favorites: Set<string>
  onToggleFavorite: (id: string) => void
}

/** 缩放/平移状态：s=缩放倍数，x/y=平移像素 */
interface ZoomState { s: number; x: number; y: number }
const ZOOM_MIN = 1
const ZOOM_MAX = 4
const ZOOM_DBL = 2.5

/** 平移边界：放大后图片不能拖出屏幕太多 */
function clampPan(z: ZoomState, rect: { width: number; height: number }): ZoomState {
  const maxX = ((z.s - 1) * rect.width) / 2
  const maxY = ((z.s - 1) * rect.height) / 2
  return {
    s: z.s,
    x: Math.max(-maxX, Math.min(maxX, z.x)),
    y: Math.max(-maxY, Math.min(maxY, z.y)),
  }
}

function PhotoViewer({ index, onChange, onClose, favorites, onToggleFavorite }: ViewerProps) {
  const [drag, setDrag] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [chrome, setChrome] = useState(true)
  const [showInfo, setShowInfo] = useState(false)
  /** 双指捏合 / 双击缩放，只作用于当前 slide */
  const [zoom, setZoom] = useState<ZoomState>({ s: 1, x: 0, y: 0 })

  const startRef = useRef({ x: 0, y: 0 })
  const movedRef = useRef(false)
  /** 当前按下的所有指针（用于识别双指捏合） */
  const pointersRef = useRef(new Map<number, { x: number; y: number }>())
  /** 捏合起点快照：初始距离、起始缩放、起始平移、双指中心（相对 slide 中心） */
  const pinchRef = useRef<{ d0: number; s0: number; x0: number; y0: number; ax: number; ay: number } | null>(null)
  /** 放大状态下单指平移的起点 */
  const panStartRef = useRef({ x: 0, y: 0 })
  /** 单击判定计时器：延迟执行以区分双击 */
  const tapTimerRef = useRef<number | null>(null)
  /** 上一次点按时间：用于 300ms 内双击判定 */
  const lastTapRef = useRef(0)
  const zoomedRef = useRef(false)
  zoomedRef.current = zoom.s > 1.02

  // slide refs 和懒加载决策
  const slideRefs = useRef<(HTMLDivElement | null)[]>([])
  const shouldLoad = useViewerShouldLoad(VIEWABLE_PHOTOS.length, index, slideRefs)

  const photo = VIEWABLE_PHOTOS[index]
  const isFavorite = favorites.has(photo.id)

  const goPrev = useCallback(() => onChange(Math.max(0, index - 1)), [index, onChange])
  const goNext = useCallback(() => onChange(Math.min(VIEWABLE_PHOTOS.length - 1, index + 1)), [index, onChange])

  // 切图时重置缩放
  useEffect(() => {
    setZoom({ s: 1, x: 0, y: 0 })
    pointersRef.current.clear()
    pinchRef.current = null
  }, [index])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') goNext()
      else if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goNext, goPrev, onClose])

  useEffect(() => () => {
    if (tapTimerRef.current) window.clearTimeout(tapTimerRef.current)
  }, [])

  // pointerdown 起点：用于区分点击和拖拽
  const downTargetRef = useRef<HTMLElement | null>(null)

  const trackRect = (el: HTMLElement) => el.getBoundingClientRect()

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return
    movedRef.current = false
    downTargetRef.current = e.target as HTMLElement
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId)
    } catch {}

    // 第二根手指落下：进入捏合缩放，取消横滑
    if (pointersRef.current.size === 2) {
      const [p1, p2] = [...pointersRef.current.values()]
      const rect = trackRect(e.currentTarget as HTMLElement)
      pinchRef.current = {
        d0: Math.max(1, Math.hypot(p1.x - p2.x, p1.y - p2.y)),
        s0: zoom.s,
        x0: zoom.x,
        y0: zoom.y,
        ax: (p1.x + p2.x) / 2 - (rect.left + rect.width / 2),
        ay: (p1.y + p2.y) / 2 - (rect.top + rect.height / 2),
      }
      setDragging(false)
      setDrag({ x: 0, y: 0 })
      movedRef.current = true
      return
    }

    setDragging(true)
    startRef.current = { x: e.clientX, y: e.clientY }
    panStartRef.current = { x: zoom.x, y: zoom.y }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointersRef.current.has(e.pointerId)) return
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    // 双指捏合：按距离比例缩放，双指中心保持不动，整体跟随移动
    if (pinchRef.current && pointersRef.current.size >= 2) {
      const [p1, p2] = [...pointersRef.current.values()]
      const rect = trackRect(e.currentTarget as HTMLElement)
      const d = Math.hypot(p1.x - p2.x, p1.y - p2.y)
      const ax = (p1.x + p2.x) / 2 - (rect.left + rect.width / 2)
      const ay = (p1.y + p2.y) / 2 - (rect.top + rect.height / 2)
      const pinch = pinchRef.current
      const s = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, (pinch.s0 * d) / pinch.d0))
      const x = ax - ((pinch.ax - pinch.x0) / pinch.s0) * s
      const y = ay - ((pinch.ay - pinch.y0) / pinch.s0) * s
      setZoom(clampPan({ s, x, y }, rect))
      return
    }

    if (!dragging) return
    const dx = e.clientX - startRef.current.x
    const dy = e.clientY - startRef.current.y
    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) movedRef.current = true

    // 放大状态：单指拖动 = 平移，不切图、不关闭
    if (zoomedRef.current) {
      const rect = trackRect(e.currentTarget as HTMLElement)
      setZoom((z) => clampPan({ s: z.s, x: panStartRef.current.x + dx, y: panStartRef.current.y + dy }, rect))
      return
    }

    // 锁定主轴：横向切图 / 纵向下拉关闭
    if (Math.abs(dy) > Math.abs(dx)) setDrag({ x: dx * 0.3, y: dy })
    else setDrag({ x: dx, y: dy * 0.25 })
  }

  /** 双击：在 适应屏幕 / 2.5x 之间切换，以点击点为中心 */
  const handleDoubleTap = (e: React.PointerEvent) => {
    if (tapTimerRef.current) {
      window.clearTimeout(tapTimerRef.current)
      tapTimerRef.current = null
    }
    const rect = trackRect(e.currentTarget as HTMLElement)
    setZoom((z) => {
      if (z.s > 1.02) return { s: 1, x: 0, y: 0 }
      const ax = e.clientX - (rect.left + rect.width / 2)
      const ay = e.clientY - (rect.top + rect.height / 2)
      return clampPan({ s: ZOOM_DBL, x: -ax * (ZOOM_DBL - 1), y: -ay * (ZOOM_DBL - 1) }, rect)
    })
  }

  /** 单击（延迟 280ms 确认不是双击）：视频播放/暂停，图片切换界面显隐 */
  const handleSingleTap = () => {
    const target = downTargetRef.current
    if (!target) return
    const wrap = target.closest('[data-video-wrap]')
    if (wrap) {
      const v = wrap.querySelector('video') as HTMLVideoElement | null
      if (v) {
        if (v.paused) {
          // 用户主动点播放：解除静音、有声播放
          v.muted = false
          v.play().catch(() => {})
        } else {
          v.pause()
          // 暂停后恢复静音，下次预览仍是无声
          v.muted = true
        }
      }
      return
    }
    // 延迟执行：若 280ms 内来了第二击则取消，转为双击缩放
    tapTimerRef.current = window.setTimeout(() => {
      setChrome((c) => !c)
      setShowInfo(false)
      tapTimerRef.current = null
    }, 280)
  }

  const endDrag = (e?: React.PointerEvent) => {
    if (e) pointersRef.current.delete(e.pointerId)

    // 捏合收尾：剩余一根手指时结束捏合，缩太小则回弹
    if (pinchRef.current) {
      if (pointersRef.current.size < 2) {
        pinchRef.current = null
        if (e) {
          const rect = trackRect(e.currentTarget as HTMLElement)
          setZoom((z) => (z.s < 1.05 ? { s: 1, x: 0, y: 0 } : clampPan(z, rect)))
        }
      }
      setDragging(false)
      movedRef.current = true
      downTargetRef.current = null
      return
    }

    if (!dragging) return
    setDragging(false)

    // 释放 pointer capture，让后续 click 能正常派发
    if (e?.currentTarget && e.pointerId !== undefined) {
      try {
        ;(e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId)
      } catch {}
    }

    // 放大状态：不做切图/下拉关闭；未放大时处理关闭/切图
    if (!zoomedRef.current) {
      const { x, y } = drag
      if (y > 110 && Math.abs(y) > Math.abs(x)) {
        setDrag({ x: 0, y: 0 })
        onClose()
        downTargetRef.current = null
        return
      }
      if (x < -60) goNext()
      else if (x > 60) goPrev()
      setDrag({ x: 0, y: 0 })
    }

    // 没拖动 = 点按（放大/未放大通用）。300ms 内第二次点按 = 双击缩放（取消待执行的单击）
    if (!movedRef.current && downTargetRef.current && e) {
      const now = performance.now()
      if (now - lastTapRef.current < 300) {
        if (tapTimerRef.current) {
          window.clearTimeout(tapTimerRef.current)
          tapTimerRef.current = null
        }
        lastTapRef.current = 0
        handleDoubleTap(e)
      } else {
        lastTapRef.current = now
        handleSingleTap()
      }
    }
    downTargetRef.current = null
  }

  const dismiss = Math.max(0, drag.y) / 520
  const backdropOpacity = 1 - Math.min(0.9, dismiss)

  return (
    <div className={`pv${dragging ? ' is-dragging' : ''}${chrome ? '' : ' is-chrome-hidden'}${zoom.s > 1.02 ? ' is-zoomed' : ''}`}>
      <div className="pv-backdrop" style={{ opacity: backdropOpacity }} />

      <div
        className="pv-track"
        style={{
          transform: `translate3d(calc(${-index * 100}% + ${drag.x}px), ${drag.y}px, 0) scale(${1 - Math.min(0.18, dismiss * 0.18)})`,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {VIEWABLE_PHOTOS.map((p, i) => (
          <div
            className="pv-slide"
            key={p.id}
            ref={(el) => { slideRefs.current[i] = el }}
            style={
              i === index && zoom.s > 1
                ? {
                    transform: `translate(${zoom.x}px, ${zoom.y}px) scale(${zoom.s})`,
                    transition: dragging || pinchRef.current ? 'none' : 'transform 0.18s ease-out',
                    zIndex: 2,
                  }
                : undefined
            }
          >
            <ViewerSlide photo={p} active={i === index} shouldLoad={!!shouldLoad[i]} />
          </div>
        ))}
      </div>

      <div className="pv-chrome pv-top">
        <button className="pv-circle" type="button" onClick={onClose} aria-label="Back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>

        <div className="pv-info">
          <div className="pv-date">{formatDay(photoDate(photo))}</div>
          <div className="pv-place">
            {(() => {
              // 把 "店名（分店信息）" 拆成两行显示，避免一行过长
              const m = photo.place.match(/^(.+?)(（.+）)$/)
              if (m) {
                return (
                  <>
                    <div>{m[1]}</div>
                    <div>{m[2]}</div>
                  </>
                )
              }
              return photo.place
            })()}
          </div>
        </div>

        <button className="pv-circle" type="button" aria-label="More options">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <circle cx="5" cy="12" r="1.9" />
            <circle cx="12" cy="12" r="1.9" />
            <circle cx="19" cy="12" r="1.9" />
          </svg>
        </button>
      </div>

      <div className="pv-chrome pv-bottom">
        {showInfo && (
          <div className="pv-meta">
            <div className="pv-meta-row">
              <span>Taken</span>
              <span>{formatDay(photoDate(photo))}</span>
            </div>
            <div className="pv-meta-row">
              <span>Place</span>
              <span>{photo.place}</span>
            </div>
            <div className="pv-meta-row">
              <span>Camera</span>
              <span>{photo.group === 'saved' ? 'None' : 'iPhone'}</span>
            </div>
          </div>
        )}

        <div className="pv-tools">
          <button className="pv-tool" type="button" aria-label="Share">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 15V3" />
              <path d="M8 7l4-4 4 4" />
              <path d="M5 12v7.5A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V12" />
            </svg>
          </button>

          <button
            className={`pv-tool${isFavorite ? ' is-on' : ''}`}
            type="button"
            aria-label={isFavorite ? 'Remove favorite' : 'Favorite'}
            aria-pressed={isFavorite}
            onClick={() => onToggleFavorite(photo.id)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 20.3l-1.5-1.4C5.4 14.4 2.5 11.8 2.5 8.6 2.5 6 4.5 4 7 4c1.6 0 3.1.9 4 2.2C11.9 4.9 13.4 4 15 4c2.5 0 4.5 2 4.5 4.6 0 3.2-2.9 5.8-8 10.3L12 20.3z" />
            </svg>
          </button>

          <button
            className={`pv-tool${showInfo ? ' is-on' : ''}`}
            type="button"
            aria-label="Info"
            onClick={() => setShowInfo((v) => !v)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 11v6" />
              <circle cx="12" cy="7.6" r="0.9" fill="currentColor" stroke="none" />
            </svg>
          </button>

          <button className="pv-tool pv-tool--danger" type="button" aria-label="Delete">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M4 7h16" />
              <path d="M9 7V4.5h6V7" />
              <path d="M6.5 7l.8 12.5A1.5 1.5 0 0 0 8.8 21h6.4a1.5 1.5 0 0 0 1.5-1.5L17.5 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
