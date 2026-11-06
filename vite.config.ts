import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import { rmSync, statSync, readdirSync } from 'node:fs'

/** 递归遍历目录下所有文件 */
function* walkDir(dir: string): Generator<string> {
  const entries = readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) yield* walkDir(p)
    else yield p
  }
}

/**
 * 构建后自动删除 dist 中不再被引用的原始 JPG/JPEG，以及已迁移为 webp 的图标 PNG。
 * public/ 保留原始文件供源文件留存，但不应打包进 dist 增加部署体积。
 */
function pruneUnusedImages(): Plugin {
  return {
    name: 'prune-unused-images',
    apply: 'build',
    closeBundle() {
      const dist = path.resolve(__dirname, 'dist')
      const iconsDir = path.join(dist, 'icons')
      let removed = 0
      let bytes = 0
      for (const filePath of walkDir(dist)) {
        const lower = filePath.toLowerCase()
        const isJpg = lower.endsWith('.jpg') || lower.endsWith('.jpeg')
        // 图标已全部迁移到 webp，dist/icons 下的 png 不再被引用
        const isUnusedIconPng = lower.endsWith('.png') && filePath.startsWith(iconsDir)
        if (isJpg || isUnusedIconPng) {
          removed++
          bytes += statSync(filePath).size
          rmSync(filePath)
        }
      }
      if (removed > 0) {
        console.log(`  ✓ Removed ${removed} unused images from dist (${(bytes / 1024 / 1024).toFixed(1)} MB)`)
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), pruneUnusedImages()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
