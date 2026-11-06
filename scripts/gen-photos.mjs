#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = '/Users/yanxi/Desktop/港澳之恋/I/public/photos'
const EXTS = new Set(['.jpg', '.jpeg', '.png', '.heic', '.mp4', '.mov'])
const items = []
let id = 0

// 匹配 "26-M-D" 或 "26-M-D（N）"，可选跟 " 地点"
function parseName(name) {
  const m = name.match(/^(\d{2})-(\d{1,2})-(\d{1,2})(?:（\d+）)?(?:\s+(.*))?$/)
  if (!m) return null
  const [, yy, mm, dd, rest = ''] = m
  return {
    year: 2000 + parseInt(yy, 10),
    month: parseInt(mm, 10),
    day: parseInt(dd, 10),
    rest: rest.trim(),
  }
}

function stripSuffix(rest) {
  return rest.replace(/（\d+）$/, '').trim()
}

function walkGroup(topDir, group) {
  const absTop = path.join(ROOT, topDir)
  const entries = fs.readdirSync(absTop, { withFileTypes: true })
  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === '__MACOSX') continue
    const abs = path.join(absTop, entry.name)
    if (entry.isDirectory()) {
      const parsed = parseName(entry.name)
      if (!parsed) { console.warn('无法解析子文件夹名:', entry.name); continue }
      const subFiles = fs.readdirSync(abs, { withFileTypes: true })
      for (const f of subFiles) {
        if (!f.isFile() || f.name.startsWith('.')) continue
        const ext = path.extname(f.name).toLowerCase()
        if (!EXTS.has(ext)) continue
        pushItem(parsed, parsed.rest, group, path.join(topDir, entry.name, f.name))
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase()
      if (!EXTS.has(ext)) continue
      const base = path.basename(entry.name, ext)
      const parsed = parseName(base)
      if (!parsed) { console.warn('无法解析文件名:', entry.name); continue }
      pushItem(parsed, stripSuffix(parsed.rest), group, path.join(topDir, entry.name))
    }
  }
}

function pushItem(parsed, placeRaw, group, rel) {
  const date = `${parsed.year}-${String(parsed.month).padStart(2, '0')}-${String(parsed.day).padStart(2, '0')}`
  let place = ''
  if (group === 'saved') place = 'Saved'
  else if (group === 'fuzzy') place = `${placeRaw}（地点未记录）`
  else place = placeRaw
  // 显示时把下划线还原为冒号（文件名里不能用冒号，避免 Vite SPA fallback）
  place = place.replace(/_/g, ':')
  // 文件名里的 "1:4"（已转成 1_4）实际想表达 "1/4" 分数
  place = place.replace(/\b1:4\b/g, '1/4')
  id += 1
  items.push({
    id: `p${String(id).padStart(3, '0')}`,
    date, place, group,
    src: '/photos/' + rel.split(path.sep).map(encodeURIComponent).join('/'),
    isVideo: /\.(mp4|mov)$/i.test(rel),
  })
}

walkGroup('无地点，存图_截图_拼图', 'saved')
walkGroup('有日期，地点模糊图', 'fuzzy')
walkGroup('有日期地点图', 'full')

items.sort((a, b) => {
  if (a.date !== b.date) return b.date.localeCompare(a.date)
  return a.id.localeCompare(b.id)
})

const lines = []
lines.push('/**')
lines.push(' * 相册真实素材数据。')
lines.push(' *')
lines.push(' * 由 scripts/gen-photos.mjs 扫描 public/photos/ 自动生成。')
lines.push(' * 替换素材：把新文件放到对应日期/地点文件夹，重跑脚本即可。')
lines.push(' */')
lines.push('')
lines.push('export type PhotoGroup = \'saved\' | \'fuzzy\' | \'full\'')
lines.push('')
lines.push('export interface PhotoItem {')
lines.push('  id: string')
lines.push('  /** 拍摄日期 YYYY-MM-DD */')
lines.push('  date: string')
lines.push('  /** 显示在查看器信息栏的地点 */')
lines.push('  place: string')
lines.push('  /** 来源分组：saved 无地点 / fuzzy 仅城市 / full 完整地点 */')
lines.push('  group: PhotoGroup')
lines.push('  /** 静态资源路径（public/photos/...） */')
lines.push('  src: string')
lines.push('  /** 是否为视频 */')
lines.push('  isVideo: boolean')
lines.push('}')
lines.push('')
lines.push('export const PHOTOS: PhotoItem[] = [')
for (const it of items) {
  lines.push(`  { id: '${it.id}', date: '${it.date}', place: ${JSON.stringify(it.place)}, group: '${it.group}', src: '${it.src}', isVideo: ${it.isVideo} },`)
}
lines.push(']')
lines.push('')
lines.push('/** 照片拍摄时间 */')
lines.push('export function photoDate(p: PhotoItem): Date {')
lines.push('  return new Date(p.date + \'T12:00:00\')')
lines.push('}')
lines.push('')
lines.push('/** 按时间倒序（最新在前） */')
lines.push('export const SORTED_PHOTOS = [...PHOTOS].sort((a, b) => b.date.localeCompare(a.date))')
lines.push('')

fs.writeFileSync('/Users/yanxi/Desktop/港澳之恋/I/src/data/photos.ts', lines.join('\n'))
console.log(`生成完毕：共 ${items.length} 条（视频 ${items.filter(i => i.isVideo).length} 条）`)
console.log('日期范围：', items[items.length - 1]?.date, '→', items[0]?.date)
