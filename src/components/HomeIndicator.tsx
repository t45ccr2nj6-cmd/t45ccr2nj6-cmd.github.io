import './HomeIndicator.css'

interface HomeIndicatorProps {
  onPress?: () => void
  /** 浅色壁纸上用深色横条 */
  dark?: boolean
}

/**
 * iOS 底部 Home Indicator。
 * 点击触发返回桌面；长时间上滑留给未来的多任务界面。
 */
export function HomeIndicator({ onPress, dark = false }: HomeIndicatorProps) {
  return (
    <button className="hi" onClick={onPress} aria-label="Home indicator">
      <span className={`hi-bar ${dark ? 'hi-bar-dark' : ''}`} />
    </button>
  )
}
