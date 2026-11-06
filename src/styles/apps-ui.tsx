import type { ReactNode } from 'react'

/** iOS 列表行右侧的灰色箭头 */
export function Chevron({ size = 14, color = 'rgba(60,60,67,0.32)' }: { size?: number; color?: string }) {
  return (
    <svg
      className="ios-chev"
      width={Math.round(size * 0.62)}
      height={size}
      viewBox="0 0 8 14"
      fill="none"
      aria-hidden="true"
    >
      <path d="M1 1l6 6-6 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** iOS 风格的拨动开关 */
export function Switch({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      className={`ios-switch${on ? ' is-on' : ''}`}
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
    >
      <span className="ios-switch-knob" />
    </button>
  )
}

/** 设置类 app 左侧的彩色小图标块 */
export function IconTile({ color, children }: { color: string; children: ReactNode }) {
  return (
    <span className="ios-icon" style={{ background: color }}>
      {children}
    </span>
  )
}
