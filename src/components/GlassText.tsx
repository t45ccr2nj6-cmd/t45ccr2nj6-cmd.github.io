import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { getTextGlassMaps } from '../utils/liquidGlass'
import { coverFit } from '../utils/wallpaper'
import { supportsSvgGlass } from '../utils/renderSupport'

interface GlassTextProps {
  text: string
  fontFamily?: string
  fontWeight?: number
  fontSize?: number
  textLeft?: number
  textTop?: number
  viewportWidth?: number
  viewportHeight?: number
  strength?: number
  chromaticAberration?: number
  /** 毛玻璃模糊强度 */
  blur?: number
  /** 白色填充层透明度（磨砂感） */
  fillOpacity?: number
  /** 边缘高光描边宽度 */
  strokeWidth?: number
  /** 边缘高光描边透明度 */
  strokeOpacity?: number
  /** 使用 text-anchor="middle" 水平居中（忽略 textLeft） */
  useAnchor?: boolean
}

/**
 * GlassText —— 液态玻璃数字（SVG 实现）
 *
 * 渲染层次（从底到顶）：
 *  1. 深色投影（右下偏移）→ 玻璃"浮起来"的投影
 *  2. 被折射的壁纸副本（clipPath 限制在字形内）→ 核心玻璃折射
 *  3. 玻璃白色基底 → 整体白色磨砂感
 *  4. 方向性高光渐变（左上亮右下暗，clipPath 限制）→ 玻璃表面光反射
 *  5. 边缘高光环（feMorphology 膨胀 - 原字形 = 边缘窄带）→ 玻璃边缘厚度
 */
export function GlassText({
  text,
  fontFamily = "'New York Small', serif",
  fontWeight = 300,
  fontSize = 92,
  textLeft = 0,
  textTop = 0,
  viewportWidth = 428,
  viewportHeight = 926,
  strength = 20,
  chromaticAberration = 8,
  blur = 2.5,
  fillOpacity = 0.45,
  strokeWidth = 0.8,
  strokeOpacity = 0.35,
  useAnchor = false,
}: GlassTextProps) {
  const filterId = useMemo(() => `glass-filter-${text.replace(/[^a-zA-Z0-9]/g, '')}`, [text])
  const clipId = useMemo(() => `glass-clip-${text.replace(/[^a-zA-Z0-9]/g, '')}`, [text])
  const edgeMaskId = useMemo(() => `glass-edge-${text.replace(/[^a-zA-Z0-9]/g, '')}`, [text])
  const highlightGradId = useMemo(() => `glass-hl-${text.replace(/[^a-zA-Z0-9]/g, '')}`, [text])

  const actualX = useAnchor ? viewportWidth / 2 : textLeft

  // 路线 B：按字形轮廓生成位移图 + 斜面光影贴图
  // depth = 斜面宽度 ≈ fontSize * 0.07
  const edgeDepth = Math.max(3, Math.round(fontSize * 0.07))
  const fontStr = `${fontWeight} ${fontSize}px ${fontFamily}`

  const [maps, setMaps] = useState({ disp: '', bevel: '' })

  useEffect(() => {
    if (!supportsSvgGlass) return
    const gen = () =>
      setMaps(
        getTextGlassMaps({
          text,
          font: fontStr,
          width: viewportWidth,
          height: viewportHeight,
          x: actualX,
          y: textTop,
          depth: edgeDepth,
        }),
      )
    gen()
    // 等 Web 字体加载完成后重新生成，确保字形与渲染一致
    document.fonts?.ready.then(gen)
  }, [text, fontStr, viewportWidth, viewportHeight, actualX, textTop, edgeDepth])

  const style: CSSProperties = {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    overflow: 'visible',
    background: 'transparent',
    zIndex: 2,
  }

  // 边缘环宽度（SVG 单位）—— 模拟玻璃边缘的厚度
  const edgeThickness = Math.max(0.8, fontSize * 0.012)

  // 与 CSS 壁纸背景同一套 cover 几何，保证折射副本对位
  const wall = coverFit(viewportWidth, viewportHeight)

  // 非 Chromium（Safari / Firefox 等）降级：普通半透明白字 + 柔和阴影
  if (!supportsSvgGlass) {
    return (
      <div style={style}>
        <span
          style={{
            position: 'absolute',
            top: textTop,
            left: useAnchor ? actualX : textLeft,
            transform: useAnchor ? 'translate(-50%, -50%)' : 'translateY(-50%)',
            fontFamily,
            fontWeight,
            fontSize,
            lineHeight: 1,
            whiteSpace: 'nowrap',
            letterSpacing: '-0.02em',
            color: `rgba(255, 255, 255, ${Math.min(0.94, fillOpacity)})`,
            textShadow: '0 2px 14px rgba(0, 0, 0, 0.28), 0 0 1px rgba(255, 255, 255, 0.35)',
          }}
        >
          {text}
        </span>
      </div>
    )
  }

  return (
    <div style={style}>
      <svg
        viewBox={`0 0 ${viewportWidth} ${viewportHeight}`}
        style={{ width: '100%', height: '100%' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* ===== 玻璃折射滤镜 ===== */}
          <filter id={filterId} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
            <feImage href={maps.disp || undefined} x="0" y="0" width={viewportWidth} height={viewportHeight} result="displacementMap" />
            <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="blurRaw" />
            <feColorMatrix in="blurRaw" type="saturate" values="1.15" result="blurred" />

            {/* R 通道 */}
            <feDisplacementMap in="blurred" in2="displacementMap" scale={strength + chromaticAberration * 2} xChannelSelector="R" yChannelSelector="G" result="dispR" />
            <feColorMatrix in="dispR" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="chR" />

            {/* G 通道 */}
            <feDisplacementMap in="blurred" in2="displacementMap" scale={strength + chromaticAberration} xChannelSelector="R" yChannelSelector="G" result="dispG" />
            <feColorMatrix in="dispG" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="chG" />

            {/* B 通道 */}
            <feDisplacementMap in="blurred" in2="displacementMap" scale={strength} xChannelSelector="R" yChannelSelector="G" result="dispB" />
            <feColorMatrix in="dispB" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="chB" />

            {/* 三色 screen 叠加 */}
            <feBlend in="chR" in2="chG" mode="screen" result="rg" />
            <feBlend in="rg" in2="chB" mode="screen" />
          </filter>

          {/* ===== 字形 clipPath —— 限制折射壁纸在笔画内 ===== */}
          <clipPath id={clipId}>
            <text
              x={actualX}
              y={textTop}
              textAnchor={useAnchor ? 'middle' : 'start'}
              dominantBaseline="central"
              fontFamily={fontFamily}
              fontWeight={fontWeight}
              fontSize={fontSize}
              fill="white"
            >
              {text}
            </text>
          </clipPath>

          {/* ===== 边缘环 mask —— feMorphology 膨胀原字形 ===== */}
          {/* mask 里：白色=显示，黑色=隐藏 */}
          <mask id={edgeMaskId}>
            {/* 背景全黑（默认隐藏） */}
            <rect x="0" y="0" width={viewportWidth} height={viewportHeight} fill="black" />
            {/* 原字形（白色，显示内部） */}
            <text
              x={actualX}
              y={textTop}
              textAnchor={useAnchor ? 'middle' : 'start'}
              dominantBaseline="central"
              fontFamily={fontFamily}
              fontWeight={fontWeight}
              fontSize={fontSize}
              fill="white"
            >
              {text}
            </text>
            {/* 膨胀的字形（更白的边缘区域），用 filter 做膨胀 */}
            <g filter={`url(#${filterId}-edge-dilate)`}>
              <text
                x={actualX}
                y={textTop}
                textAnchor={useAnchor ? 'middle' : 'start'}
                dominantBaseline="central"
                fontFamily={fontFamily}
                fontWeight={fontWeight}
                fontSize={fontSize}
                fill="rgba(255,255,255,0)"
                stroke="white"
                strokeWidth={edgeThickness * 2}
                strokeLinejoin="round"
                strokeLinecap="round"
              >
                {text}
              </text>
            </g>
          </mask>

          {/* 膨胀滤镜（feMorphology dilate） */}
          <filter id={`${filterId}-edge-dilate`}>
            <feMorphology in="SourceGraphic" operator="dilate" radius={edgeThickness} />
          </filter>

          {/* ===== 玻璃体透光渐变（135°：亮 → 透 → 微亮，参考 frosted-glass-text） ===== */}
          <linearGradient id={highlightGradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.42)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.56)" />
          </linearGradient>

          {/* ===== 切边亮线/暗线 mask：只留笔画内缘窄条，不洗白字身 ===== */}
          {/* 左上亮线 = 原字形 − 右下偏移字形（字形向左上错开后露出的内缘） */}
          <mask id={`${filterId}-hlmask`} maskUnits="userSpaceOnUse" x="0" y="0" width={viewportWidth} height={viewportHeight}>
            <text x={actualX} y={textTop} textAnchor={useAnchor ? 'middle' : 'start'} dominantBaseline="central" fontFamily={fontFamily} fontWeight={fontWeight} fontSize={fontSize} fill="white">{text}</text>
            <text x={actualX + 1.2} y={textTop + 1.2} textAnchor={useAnchor ? 'middle' : 'start'} dominantBaseline="central" fontFamily={fontFamily} fontWeight={fontWeight} fontSize={fontSize} fill="black">{text}</text>
          </mask>
          {/* 右下暗线 = 原字形 − 左上偏移字形 */}
          <mask id={`${filterId}-dkmask`} maskUnits="userSpaceOnUse" x="0" y="0" width={viewportWidth} height={viewportHeight}>
            <text x={actualX} y={textTop} textAnchor={useAnchor ? 'middle' : 'start'} dominantBaseline="central" fontFamily={fontFamily} fontWeight={fontWeight} fontSize={fontSize} fill="white">{text}</text>
            <text x={actualX - 1.5} y={textTop - 1.5} textAnchor={useAnchor ? 'middle' : 'start'} dominantBaseline="central" fontFamily={fontFamily} fontWeight={fontWeight} fontSize={fontSize} fill="black">{text}</text>
          </mask>
          {/* 外围柔光 mask：字形外全部区域 */}
          <mask id={`${filterId}-outmask`} maskUnits="userSpaceOnUse" x="0" y="0" width={viewportWidth} height={viewportHeight}>
            <rect x="0" y="0" width={viewportWidth} height={viewportHeight} fill="white" />
            <text x={actualX} y={textTop} textAnchor={useAnchor ? 'middle' : 'start'} dominantBaseline="central" fontFamily={fontFamily} fontWeight={fontWeight} fontSize={fontSize} fill="black">{text}</text>
          </mask>
          <filter id={`${filterId}-hl`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" />
          </filter>
          <filter id={`${filterId}-dk`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.6" />
          </filter>
          <filter id={`${filterId}-glow`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" />
          </filter>
        </defs>

        {/* ============ 渲染层 ============ */}

        {/* ① 大投影（玻璃"浮起来"投在壁纸上的柔和阴影，参考 drop-shadow(0 4px 12px)） */}
        <filter id={`${filterId}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" />
        </filter>
        <text
          x={actualX}
          y={textTop + 4}
          textAnchor={useAnchor ? 'middle' : 'start'}
          dominantBaseline="central"
          fontFamily={fontFamily}
          fontWeight={fontWeight}
          fontSize={fontSize}
          fill="rgba(0, 0, 0, 0.25)"
          filter={`url(#${filterId}-shadow)`}
        >
          {text}
        </text>

        {/* ② 外围柔光（字形外一圈微微透光发光，mask 限制在字形外） */}
        <g mask={`url(#${filterId}-outmask)`}>
          <text
            x={actualX}
            y={textTop}
            textAnchor={useAnchor ? 'middle' : 'start'}
            dominantBaseline="central"
            fontFamily={fontFamily}
            fontWeight={fontWeight}
            fontSize={fontSize}
            fill="rgba(255, 255, 255, 0.2)"
            filter={`url(#${filterId}-glow)`}
          >
            {text}
          </text>
        </g>

        {/* ③ 被折射的壁纸副本 */}
        <image
          href="/wallpapers/lock.webp"
          width={wall.w}
          height={wall.h}
          preserveAspectRatio="none"
          filter={`url(#${filterId})`}
          clipPath={`url(#${clipId})`}
          x={wall.x}
          y={wall.y}
        />

        {/* ④ 玻璃体透光渐变（135° 亮→透→微亮，opacity 由 fillOpacity 控制） */}
        <text
          x={actualX}
          y={textTop}
          textAnchor={useAnchor ? 'middle' : 'start'}
          dominantBaseline="central"
          fontFamily={fontFamily}
          fontWeight={fontWeight}
          fontSize={fontSize}
          fill={`url(#${highlightGradId})`}
          opacity={fillOpacity}
        >
          {text}
        </text>

        {/* ⑤ 右下内缘暗线（笔画切边背光面 → 厚度感） */}
        <g mask={`url(#${filterId}-dkmask)`}>
          <text
            x={actualX}
            y={textTop}
            textAnchor={useAnchor ? 'middle' : 'start'}
            dominantBaseline="central"
            fontFamily={fontFamily}
            fontWeight={fontWeight}
            fontSize={fontSize}
            fill="rgba(0, 0, 0, 0.45)"
            filter={`url(#${filterId}-dk)`}
          >
            {text}
          </text>
        </g>

        {/* ⑥ 左上内缘亮线（笔画切边受光面 → 高光棱线） */}
        <g mask={`url(#${filterId}-hlmask)`}>
          <text
            x={actualX}
            y={textTop}
            textAnchor={useAnchor ? 'middle' : 'start'}
            dominantBaseline="central"
            fontFamily={fontFamily}
            fontWeight={fontWeight}
            fontSize={fontSize}
            fill="rgba(255, 255, 255, 0.85)"
            filter={`url(#${filterId}-hl)`}
          >
            {text}
          </text>
        </g>

        {/* ⑤ 边缘高光描边（由 props 控制，0 = 不渲染） */}
        {strokeWidth > 0 && strokeOpacity > 0 && (
          <text
            x={actualX}
            y={textTop}
            textAnchor={useAnchor ? 'middle' : 'start'}
            dominantBaseline="central"
            fontFamily={fontFamily}
            fontWeight={fontWeight}
            fontSize={fontSize}
            fill="none"
            stroke={`rgba(255, 255, 255, ${strokeOpacity})`}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            strokeLinecap="round"
          >
            {text}
          </text>
        )}
      </svg>
    </div>
  )
}
