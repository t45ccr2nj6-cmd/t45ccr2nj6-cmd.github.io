/**
 * 应用唯一标识。所有能在桌面出现的 app 都必须在这里声明。
 * 使用稳定的字符串 ID，便于未来替换数据和实现事件系统。
 */
export type AppId =
  // —— 核心系统应用 ——
  | 'phone'
  | 'messages'
  | 'safari'
  | 'settings'
  | 'camera'
  | 'photos'
  | 'clock'
  | 'calendar'
  | 'app-store'
  // —— 常用应用（第一页） ——
  | 'facetime'
  | 'mail'
  | 'notes'
  | 'reminders'
  | 'music'
  | 'tv'
  | 'games'
  | 'maps'
  | 'health'
  | 'wallet'
  // —— 第二页更多系统应用 ——
  | 'weather'
  | 'stocks'
  | 'find'
  | 'home'
  | 'podcasts'
  | 'books'
  | 'fitness'
  | 'watch'
  | 'contacts'
  | 'files'
  | 'preview'
  | 'utilities'
  | 'itunes'
  | 'translate'
  | 'shortcuts'
  | 'music-memo'
  | 'tips'
  | 'apple-store'
  | 'whatsapp'
  | 'instagram'
  | 'wechat'
  // —— 第二批新增应用 ——
  | 'calculator'
  | 'airdrop'
  | 'spotify'
  | 'x'
  | 'youtube'
  | 'weibo'
  | 'xiaohongshu'

/**
 * 单个应用的描述信息，由数据层统一管理。
 */
export interface AppDescriptor {
  id: AppId
  name: string
  /** 图标颜色（用作占位图标背景，正式素材可替换） */
  iconColor: string
  /** 图标 glyph，暂时用 emoji 做占位 */
  iconGlyph: string
  /** 是否放在 Dock 栏 */
  docked?: boolean
  /** 是否为系统应用，影响打开/关闭过渡 */
  system?: boolean
  /** 是否为不可点击的占位图标（点击无反应） */
  disabled?: boolean
}

/**
 * 游戏运行时状态（锁屏 / 桌面 / 应用内）。
 */
export type PhoneState = 'locked' | 'home' | 'app'

/**
 * 通知的数据结构。未来事件系统会生成这些对象。
 */
export interface PhoneNotification {
  id: string
  from: AppId
  title: string
  body: string
  /** 触发后跳转的目标页面，可选 */
  targetApp?: AppId
  /** 相对目标 app 的子页面路径（例如聊天对象 id） */
  targetRoute?: string
  createdAt: number
  /** 是否已被用户在通知中心里看过 */
  read?: boolean
}
