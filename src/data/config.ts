import type { AppDescriptor } from '@/types'
import { WALLPAPER_POS_X, WALLPAPER_ZOOM } from '@/utils/wallpaper'

/** 壁纸 CSS（锁屏 / 桌面共用，与玻璃折射副本共用同一水平定位） */
const WALLPAPER_CSS = `url(/wallpapers/lock.webp) ${Math.round(WALLPAPER_POS_X * 100)}% center / auto ${Math.round(WALLPAPER_ZOOM * 100)}%`

/**
 * 所有可在桌面出现的应用。按参考图 p2/p3 分为两页。
 * 未来替换人物/剧情时，只改这里即可改变桌面布局。
 *
 * iconColor / iconGlyph 字段保留用于 AppPlaceholder 等回退场景，
 * 但实际图标渲染使用 components/AppIcon.tsx 中按 id 匹配的 SVG 图形。
 */

// Dock 栏应用（4 个，固定在底部）
export const DOCK_APPS: AppDescriptor[] = [
  { id: 'phone', name: 'Phone', iconColor: '#34C759', iconGlyph: '📞', docked: true, system: true },
  { id: 'safari', name: 'Safari', iconColor: '#007AFF', iconGlyph: '🧭', docked: true, system: true },
  { id: 'messages', name: 'Messages', iconColor: '#34C759', iconGlyph: '💬', docked: true },
  { id: 'wechat', name: 'WeChat', iconColor: '#07C160', iconGlyph: '💬', docked: true },
]

// 第一页 —— Widget + 常用应用（当前只保留一页）
export const HOME_PAGE_1: AppDescriptor[] = [
  { id: 'reminders', name: 'Reminders', iconColor: '#fff', iconGlyph: '✅' },
  { id: 'notes', name: 'Notes', iconColor: '#FFCC00', iconGlyph: '📝' },
  { id: 'photos', name: 'Gallery', iconColor: '#fff', iconGlyph: '🌸' },
  { id: 'camera', name: 'Camera', iconColor: '#1C1C1E', iconGlyph: '📷', disabled: true },
  { id: 'clock', name: 'Clock', iconColor: '#fff', iconGlyph: '⏰', disabled: true },
  { id: 'settings', name: 'Settings', iconColor: '#8E8E93', iconGlyph: '⚙️', system: true },
  { id: 'weibo', name: 'Weibo', iconColor: '#E6162D', iconGlyph: '🌐', disabled: true },
  { id: 'xiaohongshu', name: 'rednote', iconColor: '#FF2442', iconGlyph: '📕' },
  { id: 'music', name: 'Music', iconColor: '#FA243C', iconGlyph: '🎵' },
]

// 第二页（预留，当前为空 —— 只展示一页）
export const HOME_PAGE_2: AppDescriptor[] = []

/** 所有应用的扁平化列表（用于 AppId -> AppDescriptor 查询） */
export const ALL_APPS: AppDescriptor[] = [
  ...DOCK_APPS,
  ...HOME_PAGE_1,
  ...HOME_PAGE_2,
]

/** Widget 配置 —— 第一页顶部的大卡片。未来可扩展多种 Widget 类型。 */
export const WIDGETS = [
  {
    id: 'weather-card',
    type: 'weather',
    title: 'Chaoyang',
    temp: 8,
    condition: 'Mostly Cloudy',
    high: 16,
    low: 3,
  },
  {
    id: 'calendar-card',
    type: 'calendar',
    note: 'No Events Today',
  },
]

/**
 * 锁屏和桌面使用的 6 位数字密码。
 * 第一阶段写死在这里；未来可以让设置页修改并持久化到存档。
 */
export const PASSCODE = '815306'

/**
 * 锁屏壁纸，暂时使用纯色渐变占位。
 * 替换为图片时把 wallpaper 字段改成 url 即可。
 */
export const LOCK_SCREEN_CONFIG = {
  /**
   * 锁屏壁纸 —— 参考 p1 的浅色抽象色块风格（橙 / 深蓝 / 红 / 灰白底）。
   * 未来替换为真实图片时，把 wallpaper 改成 `url(/wallpapers/xxx.jpg) center/cover` 即可，
   * 同时把 dateColor / timeColor 调整为适合该壁纸的颜色。
   */
  wallpaper: WALLPAPER_CSS,
  /** 锁屏日期文字颜色（半透明白色，玻璃质感） */
  dateColor: 'rgba(255,255,255,0.88)',
  /** 锁屏时间文字颜色（半透明白色，玻璃质感） */
  timeColor: 'rgba(255,255,255,0.92)',
  /** 桌面壁纸 —— 同锁屏图片 */
  homeWallpaper: WALLPAPER_CSS,
  /** 锁屏上展示的 app 通知数量（只是数字，不是完整通知内容） */
  showNotificationCount: true,
}

/**
 * 存档 localStorage key。
 */
export const STORAGE_KEY = 'iphone-simulator-save-v1'
