import type { CSSProperties, ReactNode } from 'react'
import { ICON_ASSETS } from '@/data/iconAssets'
import type { AppId } from '@/types'

/**
 * AppIcon 组件：用纯 CSS + SVG 绘制 iOS 风格的应用图标。
 * 每个 app 有自己的渐变背景和前景图形。
 *
 * 使用方式：
 *   <AppIcon name="photos" />
 */
export interface IconArt {
  /** 图标背景（linear-gradient 或 纯色） */
  bg: string
  /** 前景 SVG 内容（60x60 视口） */
  glyph: ReactNode
}

// —— 统一的图标绘制尺寸和圆角 ——
const ICON_RADIUS = 14

/** 所有 app 图标定义。未来替换时改这里即可。 */
export const ICONS: Record<string, IconArt> = {
  // 电话 —— iOS 绿渐变 + 白色经典听筒
  phone: {
    bg: 'linear-gradient(180deg, #6ae46e 0%, #2cbd48 100%)',
    glyph: (
      <svg viewBox="0 0 60 60" width="100%" height="100%">
        <path
          d="M20 22.6c-3.3-1.7-6-4.4-7.7-7.7l2.5-2.5c.3-.3.4-.8.2-1.2-.5-1.5-.8-3.2-.8-5 0-.6-.4-1-1-1H8.5c-.6 0-1 .4-1 1 0 9.7 7.8 17.5 17.5 17.5.6 0 1-.4 1-1v-4.7c0-.6-.4-1-1-1-1.8 0-3.5-.3-5-.8-.4-.1-.9 0-1.2.2l-2.8 2.5z"
          fill="#fff"
          transform="translate(9,10) scale(1.72)"
        />
      </svg>
    ),
  },

  // 信息 —— 绿渐变 + 白色椭圆气泡（尾巴朝左下）
  messages: {
    bg: 'linear-gradient(180deg, #6ae46e 0%, #2cbd48 100%)',
    glyph: (
      <svg viewBox="0 0 60 60" width="100%" height="100%">
        <ellipse cx="30" cy="26" rx="17" ry="12.5" fill="#fff" />
        <polygon points="17,34 13.5,45 27,35.5" fill="#fff" />
      </svg>
    ),
  },

  // Safari —— 蓝渐变 + 白圆盘 + 红/白指南针针
  safari: {
    bg: 'linear-gradient(180deg, #2bb8f7 0%, #0a63f6 100%)',
    glyph: (
      <svg viewBox="0 0 60 60" width="100%" height="100%">
        <circle cx="30" cy="30" r="20" fill="#fff" />
        {/* 外圈刻度环 */}
        {Array.from({ length: 24 }).map((_, i) => (
          <line
            key={i}
            x1="30"
            y1="12.5"
            x2="30"
            y2={i % 6 === 0 ? '16' : '14.5'}
            stroke="#c7c7cc"
            strokeWidth={i % 6 === 0 ? 1.2 : 0.7}
            transform={`rotate(${i * 15} 30 30)`}
          />
        ))}
        {/* 指针：红半 + 白半 */}
        <polygon points="30,30 38.5,21.5 32.5,32.5" fill="#ff3b30" />
        <polygon points="30,30 21.5,38.5 27.5,27.5" fill="#e5e5ea" />
        <circle cx="30" cy="30" r="1.6" fill="#8e8e93" />
      </svg>
    ),
  },

  // 设置 —— 浅灰底 + 深灰双齿轮
  settings: {
    bg: 'linear-gradient(180deg, #e8e8ed 0%, #c9c9cf 100%)',
    glyph: (
      <svg viewBox="0 0 60 60" width="100%" height="100%">
        {/* 大齿轮 */}
        <g fill="#4a4a4e">
          {Array.from({ length: 8 }).map((_, i) => (
            <rect key={i} x="22" y="8" width="4" height="7" rx="1" transform={`rotate(${i * 45} 24 24)`} />
          ))}
          <circle cx="24" cy="24" r="11" />
          <circle cx="24" cy="24" r="4.5" fill="#d9d9de" />
        </g>
        {/* 小齿轮 */}
        <g fill="#4a4a4e">
          {Array.from({ length: 8 }).map((_, i) => (
            <rect key={i} x="39.5" y="30" width="3" height="5.5" rx="0.8" transform={`rotate(${i * 45 + 22.5} 41 41)`} />
          ))}
          <circle cx="41" cy="41" r="8.5" />
          <circle cx="41" cy="41" r="3.5" fill="#d9d9de" />
        </g>
      </svg>
    ),
  },

  // 照片 —— 白底 + 8 瓣彩色花
  photos: {
    bg: '#fff',
    glyph: (
      <svg viewBox="0 0 60 60" width="100%" height="100%">
        {['#ff9f0a', '#ffd60a', '#32d74b', '#64d2ff', '#0a84ff', '#bf5af2', '#ff375f', '#ff453a'].map(
          (c, i) => (
            <ellipse
              key={i}
              cx="30"
              cy="19"
              rx="5.5"
              ry="11"
              fill={c}
              opacity="0.85"
              transform={`rotate(${i * 45} 30 30)`}
            />
          ),
        )}
      </svg>
    ),
  },

  // 相机 —— 浅灰底 + 黑色镜头（真实 iOS 是浅灰不是深灰）
  camera: {
    bg: 'linear-gradient(180deg, #ececf0 0%, #cfcfd5 100%)',
    glyph: (
      <svg viewBox="0 0 60 60" width="100%" height="100%">
        <circle cx="30" cy="30" r="14" fill="#1c1c1e" />
        <circle cx="30" cy="30" r="10" fill="#3a3a3c" />
        <circle cx="30" cy="30" r="6.5" fill="#0f4c81" />
        <circle cx="27.5" cy="27.5" r="2.5" fill="#5ac8fa" opacity="0.9" />
        <circle cx="43" cy="19" r="2" fill="#8e8e93" />
      </svg>
    ),
  },

  // 时钟 —— 白表盘 + 实时指针（和真实 iOS 一样显示当前时间）
  clock: {
    bg: '#fff',
    glyph: (
      <svg viewBox="0 0 60 60" width="100%" height="100%">
        <circle cx="30" cy="30" r="21" fill="#fff" stroke="#d1d1d6" strokeWidth="1" />
        {Array.from({ length: 12 }).map((_, i) => (
          <line
            key={i}
            x1="30"
            y1="12"
            x2="30"
            y2={i % 3 === 0 ? '16' : '14.5'}
            stroke={i % 3 === 0 ? '#1c1c1e' : '#c7c7cc'}
            strokeWidth={i % 3 === 0 ? 1.5 : 1}
            transform={`rotate(${i * 30} 30 30)`}
          />
        ))}
        {/* 时针 */}
        <line
          x1="30" y1="30" x2="30" y2="20"
          stroke="#1c1c1e" strokeWidth="2.5" strokeLinecap="round"
          transform={`rotate(${(new Date().getHours() % 12) * 30 + new Date().getMinutes() * 0.5} 30 30)`}
        />
        {/* 分针 */}
        <line
          x1="30" y1="30" x2="30" y2="14"
          stroke="#1c1c1e" strokeWidth="1.8" strokeLinecap="round"
          transform={`rotate(${new Date().getMinutes() * 6} 30 30)`}
        />
        {/* 秒针（橙色） */}
        <line
          x1="30" y1="33" x2="30" y2="13"
          stroke="#ff9500" strokeWidth="1" strokeLinecap="round"
          transform={`rotate(${new Date().getSeconds() * 6} 30 30)`}
        />
        <circle cx="30" cy="30" r="1.8" fill="#1c1c1e" />
      </svg>
    ),
  },

  // 日历 —— 白底 + 红色星期 + 黑色大号日期（动态显示真实日期）
  calendar: {
    bg: '#fff',
    glyph: (
      <svg viewBox="0 0 60 60" width="100%" height="100%">
        <text
          x="30" y="21" textAnchor="middle"
          fontSize="10" fontWeight="600" fill="#ff3b30"
          fontFamily="-apple-system, sans-serif"
        >
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()]}
        </text>
        <text
          x="30" y="48" textAnchor="middle"
          fontSize="26" fontWeight="400" fill="#1c1c1e"
          fontFamily="-apple-system, sans-serif"
        >
          {new Date().getDate()}
        </text>
      </svg>
    ),
  },

  // App Store —— 蓝渐变 + 三笔白色 A
  'app-store': {
    bg: 'linear-gradient(180deg, #22b6f6 0%, #0a63ff 100%)',
    glyph: (
      <svg viewBox="0 0 60 60" width="100%" height="100%">
        <line x1="30" y1="14" x2="20" y2="46" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
        <line x1="30" y1="14" x2="40" y2="46" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
        <line x1="23.5" y1="35" x2="36.5" y2="35" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
      </svg>
    ),
  },

  // 备忘录 —— 白底 + 顶部黄色条 + 灰色横线
  notes: {
    bg: '#fff',
    glyph: (
      <svg viewBox="0 0 60 60" width="100%" height="100%">
        <path d="M9 14 Q9 9 14 9 L46 9 Q51 9 51 14 L51 22 L9 22 Z" fill="#ffd60a" />
        {[32, 39, 46].map((y) => (
          <line key={y} x1="15" y1={y} x2="45" y2={y} stroke="#d1d1d6" strokeWidth="2" strokeLinecap="round" />
        ))}
      </svg>
    ),
  },

  // 音乐 —— 粉红渐变 + 白色音符
  music: {
    bg: 'linear-gradient(180deg, #fc5c7d 0%, #f9215a 100%)',
    glyph: (
      <svg viewBox="0 0 60 60" width="100%" height="100%">
        <path d="M26 40 V19 L44 16 V36" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        <ellipse cx="22" cy="41" rx="6" ry="4.5" fill="#fff" />
        <ellipse cx="40" cy="37" rx="6" ry="4.5" fill="#fff" />
      </svg>
    ),
  },

  // 地图 —— 地图底纹 + 蓝色路线 + 红色大头针
  maps: {
    bg: '#e6f2e8',
    glyph: (
      <svg viewBox="0 0 60 60" width="100%" height="100%">
        {/* 陆地块 */}
        <path d="M0 0 L34 0 L28 22 L0 30 Z" fill="#a8d5a2" />
        <path d="M60 12 L60 40 L40 46 L36 24 Z" fill="#a8d5a2" opacity="0.7" />
        {/* 水域 */}
        <path d="M0 44 L22 40 L30 60 L0 60 Z" fill="#a8d8f0" />
        {/* 白色道路 */}
        <path d="M0 36 Q26 26 60 30" fill="none" stroke="#fff" strokeWidth="6" />
        {/* 蓝色路线 */}
        <path d="M8 50 Q26 32 44 24" fill="none" stroke="#0a84ff" strokeWidth="2.5" strokeLinecap="round" />
        {/* 大头针 */}
        <path d="M44 8 c-4 0 -7 3 -7 7 c0 5 7 12 7 12 c0 0 7 -7 7 -12 c0 -4 -3 -7 -7 -7 z" fill="#ff3b30" />
        <circle cx="44" cy="15" r="2.5" fill="#fff" />
      </svg>
    ),
  },

  // 天气 —— 蓝渐变 + 太阳半掩白云
  weather: {
    bg: 'linear-gradient(180deg, #4fb8f8 0%, #0a6fe0 100%)',
    glyph: (
      <svg viewBox="0 0 60 60" width="100%" height="100%">
        <circle cx="38" cy="20" r="7" fill="#ffd60a" />
        <path
          d="M18 44 Q11 44 11 38 Q11 32 18 32 Q20 25 28 25 Q36 25 38 31 Q46 30 46 38 Q46 44 39 44 Z"
          fill="#fff"
        />
      </svg>
    ),
  },

  // FaceTime —— 绿渐变 + 白色摄像机
  facetime: {
    bg: 'linear-gradient(180deg, #6ae46e 0%, #2cbd48 100%)',
    glyph: (
      <svg viewBox="0 0 60 60" width="100%" height="100%">
        <rect x="11" y="21" width="27" height="19" rx="5" fill="#fff" />
        <polygon points="38,27 49,20 49,41 38,34" fill="#fff" />
      </svg>
    ),
  },

  // 邮件 —— 蓝渐变 + 白色信封（真实 iOS 是蓝底不是白底）
  mail: {
    bg: 'linear-gradient(180deg, #2bb8f7 0%, #0a63f6 100%)',
    glyph: (
      <svg viewBox="0 0 60 60" width="100%" height="100%">
        <rect x="11" y="19" width="38" height="25" rx="3" fill="#fff" />
        <polyline points="12,21 30,35 48,21" fill="none" stroke="#0a63f6" strokeWidth="2" />
      </svg>
    ),
  },

  // 提醒事项 —— 白底 + 彩色圆点 + 横线
  reminders: {
    bg: '#fff',
    glyph: (
      <svg viewBox="0 0 60 60" width="100%" height="100%">
        {[
          { y: 20, c: '#ff9f0a' },
          { y: 30, c: '#0a84ff' },
          { y: 40, c: '#ffd60a' },
        ].map((r) => (
          <g key={r.y}>
            <circle cx="15" cy={r.y} r="3.5" fill={r.c} />
            <line x1="24" y1={r.y} x2="47" y2={r.y} stroke="#d1d1d6" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        ))}
      </svg>
    ),
  },

  // 股市 —— 深灰 + 折线
  stocks: {
    bg: 'linear-gradient(180deg, #2c2c2e 0%, #1c1c1e 100%)',
    glyph: (
      <svg viewBox="0 0 60 60" width="100%" height="100%">
        {/* 网格 */}
        <line x1="10" y1="15" x2="50" y2="15" stroke="#48484a" strokeWidth="0.5" />
        <line x1="10" y1="30" x2="50" y2="30" stroke="#48484a" strokeWidth="0.5" />
        <line x1="10" y1="45" x2="50" y2="45" stroke="#48484a" strokeWidth="0.5" />
        {/* 折线 */}
        <polyline
          points="10,38 18,32 25,40 33,22 40,28 50,18"
          fill="none"
          stroke="#34c759"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },

  // 查找 —— 深灰 + 绿色圆形
  find: {
    bg: 'linear-gradient(180deg, #3a3a3c 0%, #1c1c1e 100%)',
    glyph: (
      <svg viewBox="0 0 60 60" width="100%" height="100%">
        <circle cx="30" cy="30" r="20" fill="#34c759" opacity="0.3" />
        <circle cx="30" cy="30" r="12" fill="#34c759" opacity="0.5" />
        <circle cx="30" cy="30" r="5" fill="#fff" />
        <line x1="30" y1="10" x2="30" y2="20" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },

  // 播客 —— 深紫 + 麦克风
  podcasts: {
    bg: 'linear-gradient(180deg, #b084f0 0%, #5856d6 100%)',
    glyph: (
      <svg viewBox="0 0 60 60" width="100%" height="100%">
        <rect x="26" y="14" width="8" height="18" rx="4" fill="#fff" />
        <path d="M20 28 Q20 40 30 40 Q40 40 40 28" fill="none" stroke="#fff" strokeWidth="2.5" />
        <line x1="22" y1="46" x2="38" y2="46" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="30" y1="40" x2="30" y2="46" stroke="#fff" strokeWidth="2.5" />
      </svg>
    ),
  },

  // 图书 —— 深紫 + 书本
  books: {
    bg: 'linear-gradient(180deg, #c098f0 0%, #8e44ad 100%)',
    glyph: (
      <svg viewBox="0 0 60 60" width="100%" height="100%">
        <path d="M14 16 Q30 20 46 16 L46 46 Q30 50 14 46 Z" fill="#fff" />
        <line x1="30" y1="18" x2="30" y2="48" stroke="#8e44ad" strokeWidth="1.5" />
      </svg>
    ),
  },

  // 钱包 —— 黑底 + 彩色卡片
  wallet: {
    bg: '#1c1c1e',
    glyph: (
      <svg viewBox="0 0 60 60" width="100%" height="100%">
        <rect x="8" y="22" width="44" height="22" rx="4" fill="#ff3b30" />
        <rect x="8" y="22" width="28" height="14" rx="4" fill="#ffcc00" />
        <rect x="8" y="22" width="16" height="8" rx="4" fill="#fff" />
      </svg>
    ),
  },

  // 健康 —— 白底 + 红色心形
  health: {
    bg: '#fff',
    glyph: (
      <svg viewBox="0 0 60 60" width="100%" height="100%">
        <path
          d="M30 48 Q10 34 14 22 Q18 12 28 16 Q30 18 30 22 Q30 18 32 16 Q42 12 46 22 Q50 34 30 48 Z"
          fill="#ff3b30"
        />
      </svg>
    ),
  },

  // 文件 —— 白底 + 蓝色文件夹
  files: {
    bg: '#fff',
    glyph: (
      <svg viewBox="0 0 60 60" width="100%" height="100%">
        <path
          d="M10 20 Q10 14 16 14 L24 14 L30 20 L44 20 Q50 20 50 26 L50 46 Q50 52 44 52 L16 52 Q10 52 10 46 Z"
          fill="#5ac8fa"
        />
      </svg>
    ),
  },

  // 提示 —— 黄色渐变 + 灯泡
  tips: {
    bg: 'linear-gradient(180deg, #ffd54f 0%, #ffb300 100%)',
    glyph: (
      <svg viewBox="0 0 60 60" width="100%" height="100%">
        <path
          d="M30 12 Q18 12 18 24 Q18 32 24 38 L24 42 L36 42 L36 38 Q42 32 42 24 Q42 12 30 12 Z"
          fill="#fff"
          stroke="#ffb300"
          strokeWidth="2"
        />
        <line x1="24" y1="46" x2="36" y2="46" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },

  // WhatsApp —— 绿色 + 双气泡（复用 messages 风格但颜色略深）
  whatsapp: {
    bg: 'linear-gradient(180deg, #25d366 0%, #128c7e 100%)',
    glyph: (
      <svg viewBox="0 0 60 60" width="100%" height="100%">
        <path
          d="M26 13c-10 0-18 7-18 16 0 4 2 8 5 11l-2 7 7-2c2 1 4 1 6 1 10 0 18-7 18-16S36 13 26 13z"
          fill="#fff"
        />
      </svg>
    ),
  },

  // Instagram —— 渐变 + 相机图案
  instagram: {
    bg: 'linear-gradient(135deg, #feda75 0%, #fa7e1e 25%, #d62976 50%, #962fbf 75%, #4f5bd5 100%)',
    glyph: (
      <svg viewBox="0 0 60 60" width="100%" height="100%">
        <rect x="10" y="10" width="40" height="40" rx="10" fill="none" stroke="#fff" strokeWidth="3" />
        <circle cx="30" cy="30" r="9" fill="none" stroke="#fff" strokeWidth="3" />
        <circle cx="41" cy="19" r="2" fill="#fff" />
      </svg>
    ),
  },

  // 视频（tv）—— 深灰 + 苹果 TV 风格
  tv: {
    bg: 'linear-gradient(180deg, #2c2c2e 0%, #000 100%)',
    glyph: (
      <svg viewBox="0 0 60 60" width="100%" height="100%">
        <rect x="14" y="18" width="32" height="24" rx="3" fill="#fff" opacity="0.9" />
        <polygon points="26,26 40,30 26,34" fill="#1c1c1e" />
      </svg>
    ),
  },

  // 游戏（games）—— 橙色渐变 + 游戏手柄
  games: {
    bg: 'linear-gradient(180deg, #ffb366 0%, #ff6b35 100%)',
    glyph: (
      <svg viewBox="0 0 60 60" width="100%" height="100%">
        <rect x="10" y="22" width="40" height="18" rx="8" fill="#fff" />
        <rect x="16" y="28" width="6" height="2" fill="#ff6b35" />
        <rect x="18" y="26" width="2" height="6" fill="#ff6b35" />
        <circle cx="40" cy="28" r="1.5" fill="#ff6b35" />
        <circle cx="44" cy="32" r="1.5" fill="#ff6b35" />
        <circle cx="36" cy="32" r="1.5" fill="#ff6b35" />
      </svg>
    ),
  },

  // 家庭（home）—— 绿色 + 房屋
  home: {
    bg: 'linear-gradient(180deg, #5fe065 0%, #34c759 100%)',
    glyph: (
      <svg viewBox="0 0 60 60" width="100%" height="100%">
        <polygon points="30,12 10,28 16,28 16,46 26,46 26,34 34,34 34,46 44,46 44,28 50,28" fill="#fff" />
      </svg>
    ),
  },

  // 健身 —— 红色渐变 + 哑铃
  fitness: {
    bg: 'linear-gradient(180deg, #ff6b8a 0%, #ff2d55 100%)',
    glyph: (
      <svg viewBox="0 0 60 60" width="100%" height="100%">
        <rect x="12" y="26" width="36" height="8" rx="2" fill="#fff" />
        <rect x="6" y="22" width="8" height="16" rx="2" fill="#fff" />
        <rect x="46" y="22" width="8" height="16" rx="2" fill="#fff" />
      </svg>
    ),
  },

  // Watch —— 深灰 + 手表
  watch: {
    bg: 'linear-gradient(180deg, #3a3a3c 0%, #1c1c1e 100%)',
    glyph: (
      <svg viewBox="0 0 60 60" width="100%" height="100%">
        <rect x="14" y="16" width="32" height="28" rx="6" fill="#fff" />
        <circle cx="30" cy="30" r="8" fill="#1c1c1e" />
        <line x1="30" y1="30" x2="30" y2="24" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        <line x1="30" y1="30" x2="35" y2="32" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },

  // 通讯录（contacts）—— 白底 + 人物
  contacts: {
    bg: '#fff',
    glyph: (
      <svg viewBox="0 0 60 60" width="100%" height="100%">
        <circle cx="30" cy="22" r="10" fill="#ff9500" />
        <ellipse cx="30" cy="50" rx="18" ry="10" fill="#ff9500" />
      </svg>
    ),
  },

  // 预览（preview）—— 浅蓝 + 放大镜
  preview: {
    bg: '#5ac8fa',
    glyph: (
      <svg viewBox="0 0 60 60" width="100%" height="100%">
        <circle cx="25" cy="25" r="12" fill="none" stroke="#fff" strokeWidth="3" />
        <line x1="34" y1="34" x2="48" y2="48" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
        <rect x="16" y="16" width="18" height="18" rx="2" fill="#fff" opacity="0.3" />
      </svg>
    ),
  },

  // 实用工具（utilities）—— 深灰 + 工具图案
  utilities: {
    bg: '#8e8e93',
    glyph: (
      <svg viewBox="0 0 60 60" width="100%" height="100%">
        <rect x="14" y="14" width="14" height="14" rx="2" fill="#fff" />
        <rect x="32" y="14" width="14" height="14" rx="2" fill="#fff" opacity="0.6" />
        <rect x="14" y="32" width="14" height="14" rx="2" fill="#fff" opacity="0.6" />
        <rect x="32" y="32" width="14" height="14" rx="2" fill="#fff" />
      </svg>
    ),
  },

  // iTunes Store（itunes）—— 橙色 + 音符
  itunes: {
    bg: 'linear-gradient(180deg, #ffcc66 0%, #ff9500 100%)',
    glyph: (
      <svg viewBox="0 0 60 60" width="100%" height="100%">
        <circle cx="30" cy="30" r="18" fill="#fff" />
        <path d="M27 36 V18 L41 16 V34" fill="none" stroke="#ff9500" strokeWidth="2.5" strokeLinecap="round" />
        <ellipse cx="25" cy="36" rx="5" ry="3.5" fill="#ff9500" />
        <ellipse cx="39" cy="34" rx="5" ry="3.5" fill="#ff9500" />
      </svg>
    ),
  },

  // 翻译（translate）—— 浅蓝 + 对话框
  translate: {
    bg: 'linear-gradient(180deg, #5ac8fa 0%, #0ea5e9 100%)',
    glyph: (
      <svg viewBox="0 0 60 60" width="100%" height="100%">
        <rect x="12" y="14" width="36" height="28" rx="6" fill="#fff" />
        <text x="30" y="32" textAnchor="middle" fontSize="14" fontWeight="600" fill="#0ea5e9">A</text>
      </svg>
    ),
  },

  // 无边记（shortcuts）—— 深灰 + 彩色块
  shortcuts: {
    bg: 'linear-gradient(135deg, #3a3a3c 0%, #1c1c1e 100%)',
    glyph: (
      <svg viewBox="0 0 60 60" width="100%" height="100%">
        <rect x="12" y="12" width="20" height="20" rx="4" fill="#af52de" />
        <rect x="28" y="28" width="20" height="20" rx="4" fill="#007aff" />
      </svg>
    ),
  },

  // 手记（music-memo）—— 紫粉渐变 + 波形
  'music-memo': {
    bg: 'linear-gradient(180deg, #d49cff 0%, #af52de 100%)',
    glyph: (
      <svg viewBox="0 0 60 60" width="100%" height="100%">
        {[14, 20, 26, 32, 38, 44, 50].map((x, i) => (
          <rect
            key={i}
            x={x}
            y={22 + Math.abs(i - 3) * 3}
            width="3"
            height={16 - Math.abs(i - 3) * 5}
            rx="1.5"
            fill="#fff"
          />
        ))}
      </svg>
    ),
  },

  // Apple Store —— 蓝色 + 购物袋
  'apple-store': {
    bg: 'linear-gradient(180deg, #5aa8ff 0%, #007aff 100%)',
    glyph: (
      <svg viewBox="0 0 60 60" width="100%" height="100%">
        <path d="M22 20 Q22 14 28 14 Q34 14 34 20" fill="none" stroke="#fff" strokeWidth="3" />
        <rect x="16" y="20" width="28" height="26" rx="3" fill="#fff" />
        <rect x="20" y="28" width="20" height="2" rx="1" fill="#007aff" />
        <rect x="20" y="33" width="14" height="2" rx="1" fill="#007aff" />
      </svg>
    ),
  },
}

interface AppIconProps {
  name: keyof typeof ICONS
  size?: 'grid' | 'dock'
  style?: CSSProperties
}

/**
 * 应用图标组件：
 * 1. 优先使用 data/iconAssets.ts 中映射的真实 iOS 图标 PNG
 *    （素材自带圆角，按需求不再添加任何边框/阴影/滤镜/二次圆角）。
 * 2. 无素材时回退到 SVG 仿制版本（渐变背景 + 前景图形）。
 * 3. 两者都没有时显示通用占位。
 */
export function AppIcon({ name, size = 'grid', style }: AppIconProps) {
  const asset = ICON_ASSETS[name as AppId]
  const pxSize = 75
  const radius = ICON_RADIUS

  if (asset) {
    return (
      <img
        src={asset}
        alt={String(name)}
        draggable={false}
        loading="lazy"
        decoding="async"
        className={`ai-icon ai-icon-img ai-icon-${size}`}
        style={{
          width: pxSize,
          height: pxSize,
          display: 'block',
          ...style,
        }}
      />
    )
  }

  const icon = ICONS[name as string]

  if (!icon) {
    return (
      <div
        className="ai-icon ai-icon-fallback"
        style={{ background: '#333', ...style }}
      >
        <span style={{ fontSize: size === 'dock' ? 24 : 20, color: '#fff' }}>?</span>
      </div>
    )
  }

  return (
    <div
      className={`ai-icon ai-icon-${size}`}
      style={{
        width: pxSize,
        height: pxSize,
        borderRadius: radius,
        background: icon.bg,
        boxShadow:
          '0 1px 2px rgba(0,0,0,0.15), 0 4px 10px rgba(0,0,0,0.25), inset 0 0 0 0.5px rgba(255,255,255,0.1)',
        ...style,
      }}
    >
      {icon.glyph}
    </div>
  )
}
