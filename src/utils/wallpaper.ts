/** 壁纸原图尺寸（public/wallpapers/lock.jpg） */
export const WALLPAPER_W = 450
export const WALLPAPER_H = 800

/**
 * 壁纸在手机屏幕上的水平定位（0 = 贴左，1 = 贴右）。
 * CSS 里的水平百分比必须与这里保持一致，
 * 否则玻璃面板里折射的壁纸副本会和背景错位。
 */
export const WALLPAPER_POS_X = 0

/** 壁纸缩放（以屏幕高度为基准，1 = 刚好铺满，1.02 = 放大 2%） */
export const WALLPAPER_ZOOM = 1.0

/**
 * 计算壁纸铺满屏幕后的几何（x/y 为负数，表示被裁掉的部分）。
 * 必须与 CSS `background: <image> <posX>% center / auto <zoom*100>%` 完全一致。
 */
export function coverFit(sw: number, sh: number, posX = WALLPAPER_POS_X, zoom = WALLPAPER_ZOOM) {
  const scale = (sh * zoom) / WALLPAPER_H
  const w = WALLPAPER_W * scale
  const h = WALLPAPER_H * scale
  return { x: -(w - sw) * posX, y: -(h - sh) / 2, w, h }
}
