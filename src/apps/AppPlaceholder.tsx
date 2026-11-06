import { ALL_APPS } from '@/data/config'
import { AppIcon } from '@/components/AppIcon'
import './AppPlaceholder.css'

interface AppPlaceholderProps {
  appId: string
  onClose: () => void
}

/**
 * 应用占位界面：点击图标先进入这里，后续各 app 的真实内容会替换它。
 * 统一使用 AppIcon 组件保证风格一致。
 */
export function AppPlaceholder({ appId, onClose }: AppPlaceholderProps) {
  const app = ALL_APPS.find((a) => a.id === appId)
  return (
    <div className="ap">
      <div className="ap-header">
        <div className="ap-title">
          <AppIcon name={appId as any} size="grid" />
          <div>
            <div className="ap-name">{app?.name || 'Unknown App'}</div>
            <div className="ap-sub">Coming Soon</div>
          </div>
        </div>
        <button className="ap-close" onClick={onClose}>
          Close
        </button>
      </div>

      <div className="ap-body">
        <div className="ap-card">
          <div className="ap-card-emoji">🚧</div>
          <div className="ap-card-title">This app is under development</div>
          <div className="ap-card-desc">
            The real page for <b>{app?.name}</b> will live here.
            Photos, Messages, Instagram and more will be implemented in the next phase.
          </div>
        </div>
      </div>
    </div>
  )
}
