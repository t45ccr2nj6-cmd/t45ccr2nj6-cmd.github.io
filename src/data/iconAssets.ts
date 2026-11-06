import type { AppId } from '@/types'

/**
 * 应用图标真实素材映射表（iOS 26 版本）。
 *
 * - 素材位于 public/icons/ 下，全部为独立透明背景 PNG（240×240）。
 * - Apple 系统图标来自 iOS 26 图标素材页 / 主屏幕截图切割。
 * - 第三方图标（WhatsApp / Instagram）来自官方素材。
 * - 未列出的应用会回退到 AppIcon.tsx 中的 SVG 绘制版本。
 *
 * 未来替换图标时只需替换 public/icons/ 下的文件或修改此表，
 * 不需要改动任何组件代码。
 */
export const ICON_ASSETS: Partial<Record<AppId, string>> = {
  // —— Dock ——
  phone: '/icons/apple/phone.webp',
  safari: '/icons/apple/safari.webp',
  messages: '/icons/apple/messages.webp',
  music: '/icons/apple/music.webp',
  // —— 第一页 ——
  facetime: '/icons/apple/facetime.webp',
  calendar: '/icons/apple/calendar.webp',
  photos: '/icons/apple/photos.webp',
  camera: '/icons/apple/camera.webp',
  mail: '/icons/apple/mail.webp',
  notes: '/icons/apple/notes.webp',
  reminders: '/icons/apple/reminders.webp',
  clock: '/icons/apple/clock.webp',
  tv: '/icons/apple/tv.webp',
  games: '/icons/apple/games.webp',
  'app-store': '/icons/apple/app-store.webp',
  maps: '/icons/apple/maps.webp',
  health: '/icons/apple/health.webp',
  wallet: '/icons/apple/wallet.webp',
  settings: '/icons/apple/settings.webp',
  // —— 第二页 ——
  weather: '/icons/apple/weather.webp',
  stocks: '/icons/apple/stocks.webp',
  find: '/icons/apple/find.webp',
  home: '/icons/apple/home.webp',
  podcasts: '/icons/apple/podcasts.webp',
  books: '/icons/apple/books.webp',
  fitness: '/icons/apple/fitness.webp',
  watch: '/icons/apple/watch.webp',
  contacts: '/icons/apple/contacts.webp',
  files: '/icons/apple/files.webp',
  // preview / music-memo: 暂无可靠素材，回退 SVG
  itunes: '/icons/apple/itunes.webp',
  translate: '/icons/apple/translate.webp',
  shortcuts: '/icons/apple/shortcuts.webp', // 无边记
  tips: '/icons/apple/tips.webp',
  'apple-store': '/icons/apple/apple-store.webp',
  whatsapp: '/icons/third-party/whatsapp.webp',
  instagram: '/icons/third-party/instagram.webp',
  wechat: '/icons/third-party/wechat.webp',
  // —— 第二批新增 ——
  calculator: '/icons/apple/calculator.webp',
  airdrop: '/icons/apple/airdrop.webp',
  spotify: '/icons/third-party/spotify.webp',
  x: '/icons/third-party/x.webp',
  youtube: '/icons/third-party/youtube.webp',
  weibo: '/icons/third-party/weibo.webp',
  xiaohongshu: '/icons/third-party/xiaohongshu.webp',
}
