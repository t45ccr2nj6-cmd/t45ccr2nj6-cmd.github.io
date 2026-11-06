/**
 * 液态玻璃是否可用 SVG 滤镜（feImage + feDisplacementMap）完整渲染。
 *
 * 目前只有 Chromium 内核（Chrome / Edge / Brave 等）能稳定渲染这套滤镜；
 * Safari、Firefox 对 feImage 引用 data URI 的支持不完整，会糊成一片或者整块透明。
 * 这些浏览器统一走 CSS 降级版（backdrop-filter + 高光渐变），观感接近但更省性能。
 */
export const supportsSvgGlass =
  typeof window !== 'undefined' && !!(window as unknown as { chrome?: unknown }).chrome
