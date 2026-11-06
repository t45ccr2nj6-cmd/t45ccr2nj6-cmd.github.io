import { useEffect, useMemo, useRef, useState } from 'react'
import { getDisplacementMap } from '../utils/liquidGlass'
import { coverFit } from '../utils/wallpaper'
import { supportsSvgGlass } from '../utils/renderSupport'

interface GlassPaneProps {
  /** 圆角半径（px） */
  radius: number
  /** 磨砂模糊强度（壁纸源模糊） */
  blur?: number
  /** 侧壁折射强度 */
  strength?: number
  chromaticAberration?: number
  /** 侧壁宽度 px */
  edgeDepth?: number
  /** 渐变三档透明度（135°：左上 / 中间 / 右下） */
  tintStops?: [number, number, number]
  /** 奶白玻璃 or 深色玻璃 */
  tintColor?: 'white' | 'black'
  /** 外围柔光 */
  glow?: boolean
  /** 底部投影 */
  shadow?: boolean
  /** 壁纸路径（与页面 CSS 背景同一张图） */
  wallpaper?: string
  /** 位置追踪依赖（如横向拖动偏移），变化时重新对齐壁纸 */
  trackDeps?: unknown[]
}

let uidSeq = 0

/**
 * GlassPane —— 液态玻璃面板（原版 liquid-glass 算法）
 *
 * 只做三件事：
 *  ① feGaussianBlur（壁纸磨砂）
 *  ② feDisplacementMap + 红绿渐变 SVG 位移图（侧壁折射 + 色差）
 *  ③ 奶白/深色 tint 渐变
 *
 * 没有独立 bevel 层——原版的位移图本身在边缘产生自然高光，
 * 完美连续、无折角、浏览器原生渲染。
 */
export function GlassPane({
  radius,
  blur = 10,
  strength = 40,
  chromaticAberration = 1.5,
  edgeDepth = 6,
  tintStops,
  tintColor = 'white',
  glow = false,
  shadow = false,
  wallpaper = '/wallpapers/lock.webp',
  trackDeps = [],
}: GlassPaneProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState<{ x: number; y: number; w: number; h: number; sw: number; sh: number } | null>(null)
  const ids = useMemo(() => {
    uidSeq += 1
    return { f: `gp-f-${uidSeq}`, c: `gp-c-${uidSeq}`, m: `gp-m-${uidSeq}`, s: `gp-s-${uidSeq}` }
  }, [])

  // 测量面板在屏幕（.ls / .hs 根元素）坐标系中的位置
  useEffect(() => {
    if (!supportsSvgGlass) return
    const el = hostRef.current
    const screen = el?.closest('.ls, .hs') as HTMLElement | null
    // .pf 在电脑端用 transform 缩放；手机端是百分比铺满、并未缩放。
    // 用「实际渲染宽度 / 布局宽度」得到真实缩放比例，避免手机端把玻璃 SVG 放大到 428×926。
    const pf = el?.closest('.pf') as HTMLElement | null
    if (!el || !screen) return
    const measure = () => {
      // 以 .pf 作为屏幕基准：.ls / .hs 与 .pf 同为 inset:0，
      // 但 .hs 有入场 scale(1.04) 动画，直接用它的 rect 会把玻璃同步放大 4%。
      const basis = pf ?? screen
      const sr = basis.getBoundingClientRect()
      const r = el.getBoundingClientRect()
      const scale = pf && pf.offsetWidth ? sr.width / pf.offsetWidth || 1 : 1
      setBox({
        x: (r.left - sr.left) / scale,
        y: (r.top - sr.top) / scale,
        w: r.width / scale,
        h: r.height / scale,
        sw: sr.width / scale,
        sh: sr.height / scale,
      })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    ro.observe(screen)
    // 入场动画（transform）不触发 ResizeObserver，动画结束后需重测一次
    const onAnimationEnd = () => measure()
    screen.addEventListener('animationend', onAnimationEnd)
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      ro.disconnect()
      screen.removeEventListener('animationend', onAnimationEnd)
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, trackDeps)

  const stops = tintStops ?? (tintColor === 'white' ? [0.6, 0.35, 0.45] : [0.58, 0.4, 0.48])
  const tint = tintColor === 'white' ? '255, 255, 255' : '10, 10, 16'

  // 原版 SVG 位移图（红绿渐变 + 内层 blur 圆角矩形）
  const dispMap = useMemo(() => {
    if (!box) return null
    const w = Math.max(2, Math.round(box.w))
    const h = Math.max(2, Math.round(box.h))
    return getDisplacementMap({
      height: h,
      width: w,
      radius,
      depth: edgeDepth,
    })
  }, [box?.w, box?.h, radius, edgeDepth]) // eslint-disable-line react-hooks/exhaustive-deps

  // 与 CSS `background: url(...) 20% center/cover` 完全一致的铺图几何
  const wall = box ? coverFit(box.sw, box.sh) : null

  // 非 Chromium（Safari / Firefox 等）降级：用 CSS 毛玻璃 + 高光，避免 SVG 滤镜糊掉
  if (!supportsSvgGlass) {
    return (
      <div
        className="glass-pane glass-pane-fallback"
        aria-hidden
        style={{
          borderRadius: radius,
          background: `linear-gradient(135deg, rgba(${tint}, ${stops[0]}), rgba(${tint}, ${stops[1]}) 45%, rgba(${tint}, ${stops[2]}))`,
          WebkitBackdropFilter: `blur(${blur}px) saturate(1.6)`,
          backdropFilter: `blur(${blur}px) saturate(1.6)`,
          boxShadow: `inset 0 1px 1px rgba(255, 255, 255, 0.38), inset 0 0 0 1px rgba(255, 255, 255, 0.22), 0 6px 18px rgba(0, 0, 0, 0.12)`,
        }}
      />
    )
  }

  return (
    <div ref={hostRef} className="glass-pane" aria-hidden>
      {box && dispMap && (
        <svg
          width={box.sw}
          height={box.sh}
          style={{ position: 'absolute', left: -box.x, top: -box.y, overflow: 'visible', pointerEvents: 'none' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* 原版玻璃滤镜：feGaussianBlur → feDisplacementMap（RGB 三通道分离做色差） */}
            <filter id={ids.f} x="0" y="0" width={box.sw} height={box.sh} filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feImage href={dispMap} x={box.x} y={box.y} width={box.w} height={box.h} result="displacementMap" preserveAspectRatio="none" />
              <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="blurred" />

              {/* R 通道：位移最大 */}
              <feDisplacementMap in="blurred" in2="displacementMap" scale={strength + chromaticAberration * 2} xChannelSelector="R" yChannelSelector="G" />
              <feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="chR" />

              {/* G 通道：位移中等 */}
              <feDisplacementMap in="blurred" in2="displacementMap" scale={strength + chromaticAberration} xChannelSelector="R" yChannelSelector="G" />
              <feColorMatrix type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="chG" />

              {/* B 通道：位移最小 */}
              <feDisplacementMap in="blurred" in2="displacementMap" scale={strength} xChannelSelector="R" yChannelSelector="G" />
              <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="chB" />

              {/* 三个通道 screen 混合 → 色差折射 */}
              <feBlend in="chR" in2="chG" mode="screen" result="rg" />
              <feBlend in="rg" in2="chB" mode="screen" />
            </filter>

            {/* 面板轮廓裁切 */}
            <clipPath id={ids.c}>
              <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={radius} ry={radius} />
            </clipPath>

            {/* 135° 透光渐变 */}
            <linearGradient id={ids.m} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={`rgba(${tint}, ${stops[0]})`} />
              <stop offset="45%" stopColor={`rgba(${tint}, ${stops[1]})`} />
              <stop offset="100%" stopColor={`rgba(${tint}, ${stops[2]})`} />
            </linearGradient>

            <filter id={ids.s} x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="4" />
            </filter>
          </defs>

          {/* ① 投影 */}
          {shadow && (
            <rect x={box.x} y={box.y + 3} width={box.w} height={box.h} rx={radius} ry={radius} fill="rgba(0, 0, 0, 0.22)" filter={`url(#${ids.s})`} />
          )}

          {/* ② 外围柔光 */}
          {glow && (
            <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={radius + 2} ry={radius + 2} fill="none" stroke="rgba(255, 255, 255, 0.18)" strokeWidth="5" filter={`url(#${ids.s})`} />
          )}

          {/* ③ 折射磨砂壁纸（原版核心玻璃） */}
          {wall && (
            <image
              href={wallpaper}
              x={wall.x}
              y={wall.y}
              width={wall.w}
              height={wall.h}
              preserveAspectRatio="none"
              filter={`url(#${ids.f})`}
              clipPath={`url(#${ids.c})`}
            />
          )}

          {/* ④ 透光渐变（奶白磨砂 or 深色玻璃） */}
          <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={radius} ry={radius} fill={`url(#${ids.m})`} clipPath={`url(#${ids.c})`} />
        </svg>
      )}
    </div>
  )
}
