import { useState, type ReactNode } from 'react'
import { PHOTOS } from '@/data/photos'
import { Chevron, IconTile, Switch } from '@/styles/apps-ui'
import './Settings.css'

/** 机主 Apple ID 名称 */
const OWNER = 'ziyip.l'

type Page = 'root' | 'general' | 'about'

interface IconDef {
  color: string
  glyph: ReactNode
}

const G = (d: string) => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)

/** 设置页各行的彩色小图标 */
const ICON: Record<string, IconDef> = {
  airplane: {
    color: '#FF9500',
    glyph: <img className="stg-glyph is-lg" src="/settings-icons/airplane.webp" alt="" style={{ transform: 'translateY(2px)' }} />,
  },
  wifi: {
    color: '#007AFF',
    glyph: <img className="stg-glyph" src="/settings-icons/wifi.webp" alt="" />,
  },
  bluetooth: {
    color: '#007AFF',
    glyph: <img className="stg-glyph" src="/settings-icons/bluetooth.webp" alt="" />,
  },
  cellular: {
    color: '#34C759',
    glyph: <img className="stg-glyph" src="/settings-icons/cellular.webp" alt="" />,
  },
  hotspot: {
    color: '#34C759',
    glyph: <img className="stg-glyph" src="/settings-icons/hotspot.webp" alt="" />,
  },
  general: {
    color: '#8E8E93',
    glyph: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round">
        <circle cx="10" cy="10" r="3.1" />
        <path d="M10 2.6v1.8M10 15.6v1.8M2.6 10h1.8M15.6 10h1.8M4.8 4.8l1.3 1.3M13.9 13.9l1.3 1.3M15.2 4.8l-1.3 1.3M6.1 13.9l-1.3 1.3" />
      </svg>
    ),
  },
  accessibility: {
    color: '#007AFF',
    glyph: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round">
        <circle cx="10" cy="4.4" r="1.7" />
        <path d="M4 7.6l6 1.4 6-1.4M10 9v4.2M10 13.2l-2.6 4M10 13.2l2.6 4" />
      </svg>
    ),
  },
  action: {
    color: '#8E8E93',
    glyph: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="1.6">
        <rect x="4.4" y="7.4" width="11.2" height="5.2" rx="2.6" fill="#fff" stroke="none" />
      </svg>
    ),
  },
  camera: {
    color: '#8E8E93',
    glyph: G('M3.4 7h3l1-1.6h5l1 1.6h3v7.6H3.4V7zm6.6 5.4a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2z'),
  },
  control: {
    color: '#8E8E93',
    glyph: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="1.6">
        <path d="M3 6.6h14M3 13.4h14" />
        <circle cx="7" cy="6.6" r="2.2" fill="#8E8E93" />
        <circle cx="13" cy="13.4" r="2.2" fill="#8E8E93" />
      </svg>
    ),
  },
  display: {
    color: '#007AFF',
    glyph: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round">
        <circle cx="10" cy="10" r="4" />
        <path d="M10 2.6v1.6M10 15.8v1.6M2.6 10h1.6M15.8 10h1.6M4.8 4.8l1.1 1.1M14.1 14.1l1.1 1.1M15.2 4.8l-1.1 1.1M5.9 14.1l-1.1 1.1" />
      </svg>
    ),
  },
  homescreen: {
    color: '#007AFF',
    glyph: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="#fff">
        <rect x="3.4" y="3.4" width="5.6" height="5.6" rx="1.4" />
        <rect x="11" y="3.4" width="5.6" height="5.6" rx="1.4" />
        <rect x="3.4" y="11" width="5.6" height="5.6" rx="1.4" />
        <rect x="11" y="11" width="5.6" height="5.6" rx="1.4" />
      </svg>
    ),
  },
  search: {
    color: '#8E8E93',
    glyph: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="9" cy="9" r="4.6" />
        <path d="M12.4 12.4l4 4" />
      </svg>
    ),
  },
  siri: {
    color: '#0A0A0A',
    glyph: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="1.6">
        <circle cx="10" cy="10" r="4.4" />
        <path d="M10 2.6a7.4 7.4 0 0 1 0 14.8" />
      </svg>
    ),
  },
  focus: {
    color: '#3A3A8C',
    glyph: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="#fff">
        <path d="M12.6 2.6a7.8 7.8 0 1 0 4.8 12.6A6.2 6.2 0 0 1 12.6 2.6z" />
      </svg>
    ),
  },
  screentime: {
    color: '#5E5CE6',
    glyph: G('M6.6 3.2h6.8M6.6 16.8h6.8M7.8 3.2c0 3 2.2 4.2 2.2 6.8s-2.2 3.8-2.2 6.8M12.2 3.2c0 3-2.2 4.2-2.2 6.8s2.2 3.8 2.2 6.8'),
  },
  battery: {
    color: '#34C759',
    glyph: <img className="stg-glyph" src="/settings-icons/battery-white.svg" alt="" />,
  },
  privacy: {
    color: '#007AFF',
    glyph: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round">
        <path d="M10 2.8l5.8 2.2v4.6c0 3.4-2.4 6.2-5.8 7.6-3.4-1.4-5.8-4.2-5.8-7.6V5z" />
      </svg>
    ),
  },
  appstore: {
    color: '#007AFF',
    glyph: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="#fff">
        <text x="10" y="14.6" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="-apple-system, sans-serif">A</text>
      </svg>
    ),
  },
  wallet: {
    color: '#111111',
    glyph: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="1.6">
        <rect x="2.8" y="5.2" width="14.4" height="9.6" rx="2.2" />
        <path d="M2.8 8.6h14.4" />
      </svg>
    ),
  },
  passwords: {
    color: '#8E8E93',
    glyph: G('M8.2 8.4a3 3 0 1 0-2 2.6l-2.6 2.6v2h2v-1.4h1.4v-1.4l1.2-1.2'),
  },
  vpn: {
    color: '#007AFF',
    glyph: (
      <svg width="21" height="21" viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="1.4" strokeLinecap="round">
        <circle cx="10" cy="10" r="7" />
        <path d="M3 10h14" />
        <ellipse cx="10" cy="10" rx="3" ry="7" />
      </svg>
    ),
  },
}

interface RowProps {
  icon?: keyof typeof ICON | IconDef
  label: string
  value?: string
  onClick?: () => void
  right?: ReactNode
  chevron?: boolean
  last?: boolean
  badge?: string
}

function Row({ icon, label, value, onClick, right, chevron = true, last = false, badge }: RowProps) {
  const def: IconDef | undefined = icon === undefined ? undefined : typeof icon === 'string' ? ICON[icon] : icon
  return (
    <>
      <button type="button" className="ios-row" onClick={onClick}>
        {def && <IconTile color={def.color}>{def.glyph}</IconTile>}
        <span className="ios-row-label">{label}</span>
        {badge && <span className="stg-badge">{badge}</span>}
        {value && <span className="ios-row-value">{value}</span>}
        {right ?? (chevron ? <Chevron size={15} /> : null)}
      </button>
      {!last && <div className="ios-row-sep" style={def ? undefined : { marginLeft: 16 }} />}
    </>
  )
}

/** 关于本机 —— 机型 / 系统版本等静态信息 */
function AboutPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="stg-page ios-app">
      <header className="ios-subnav">
        <button className="ios-back" onClick={onBack}>
          <svg width="10" height="17" viewBox="0 0 8 14" fill="none" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 1L1 7l6 6" />
          </svg>
          General
        </button>
        <span className="ios-nav-title">About</span>
      </header>

      <div className="ios-scroll stg-scroll stg-scroll--sub">
        <div className="ios-card">
          <Row label="Name" value={OWNER} chevron={false} />
          <Row label="Songs" value="0" chevron={false} />
          <Row label="Videos" value="0" chevron={false} />
          <Row label="Photos" value={String(PHOTOS.length)} chevron={false} />
          <Row label="Applications" value="18" chevron={false} last />
        </div>

        <div className="ios-card">
          <Row label="iOS Version" value="26.0.1" chevron={false} />
          <Row label="Model Name" value="iPhone 17 Pro Max" chevron={false} />
          <Row label="Model Number" value="MGQK4CH/A" chevron={false} />
          <Row label="Serial Number" value="H9VK2P8Q4L" chevron={false} />
          <Row label="Carrier" value="中国移动 58.0" chevron={false} last />
        </div>

        <div className="ios-card">
          <Row label="Capacity" value="256 GB" chevron={false} />
          <Row label="Available" value="84.2 GB" chevron={false} />
          <Row label="Wi-Fi Address" value="8C:85:90:1F:42:A7" chevron={false} />
          <Row label="Bluetooth" value="8C:85:90:1F:42:A9" chevron={false} />
          <Row label="IMEI" value="35 612907 448372 1" chevron={false} last />
        </div>

        <p className="stg-legal">
          Apple Inc. · iPhone 17 Pro Max<br />
          Copyright © 2026 Apple Inc. All rights reserved.
        </p>
      </div>
    </div>
  )
}

/** 通用 —— 二级页 */
function GeneralPage({ onBack, onAbout }: { onBack: () => void; onAbout: () => void }) {
  return (
    <div className="stg-page ios-app">
      <header className="ios-subnav">
        <button className="ios-back" onClick={onBack}>
          <svg width="10" height="17" viewBox="0 0 8 14" fill="none" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 1L1 7l6 6" />
          </svg>
          设置
        </button>
        <span className="ios-nav-title">通用</span>
      </header>

      <div className="ios-scroll stg-scroll stg-scroll--sub">
        <div className="ios-card">
          <Row icon="general" label="关于本机" onClick={onAbout} />
          <Row label="软件更新" badge="1" last />
        </div>

        <div className="ios-card">
          <Row label="隔空投送" value="仅限联系人" />
          <Row label="隔空播放与接力" />
          <Row label="画中画" last />
        </div>

        <div className="ios-card">
          <Row label="iPhone 存储空间" value="172 GB" />
          <Row label="后台 App 刷新" />
          <Row label="日期与时间" last />
        </div>

        <div className="ios-card">
          <Row label="键盘" value="2" />
          <Row label="词典" last />
        </div>

        <div className="ios-card">
          <Row label="语言与地区" value="简体中文" />
          <Row label="VPN 与设备管理" last />
        </div>

        <div className="ios-card">
          <Row label="传输或还原 iPhone" />
          <Row label="关机" last onClick={() => undefined} />
        </div>
      </div>
    </div>
  )
}

/**
 * Settings —— iOS 26 style, English.
 * Root page keeps the account card + the top group (Airplane → VPN);
 * everything else is removed per user request.
 */
export function Settings() {
  const [page, setPage] = useState<Page>('root')
  const [airplane, setAirplane] = useState(false)
  const [wifi] = useState(true)
  const [bt] = useState(true)
  const [hotspot, setHotspot] = useState(false)
  const [vpn, setVpn] = useState(false)

  if (page === 'general') return <GeneralPage onBack={() => setPage('root')} onAbout={() => setPage('about')} />
  if (page === 'about') return <AboutPage onBack={() => setPage('general')} />

  return (
    <div className="stg-page ios-app">
      <header className="ios-header">
        <h1 className="ios-header-title">Settings</h1>
      </header>

      <div className="ios-scroll stg-scroll">
        {/* Apple ID */}
        <div className="stg-account">
          <div className="stg-avatar">z</div>
          <div className="stg-account-text">
            <span className="stg-account-name">{OWNER}</span>
            <span className="stg-account-sub">Apple Account, iCloud, Media &amp; Purchases</span>
          </div>
          <Chevron size={15} />
        </div>

        {/* Top group only */}
        <div className="ios-card">
          <Row icon="airplane" label="Airplane Mode" chevron={false} right={<Switch on={airplane} onChange={setAirplane} />} />
          <Row icon="wifi" label="Wi-Fi" value={wifi ? 'CMCC-5G' : 'Not Connected'} />
          <Row icon="bluetooth" label="Bluetooth" value={bt ? 'On' : 'Off'} />
          <Row icon="cellular" label="Cellular" value="5G" />
          <Row
            icon="hotspot"
            label="Personal Hotspot"
            value={hotspot ? 'On' : 'Off'}
            chevron={false}
            right={<Switch on={hotspot} onChange={setHotspot} />}
          />
          <Row icon="battery" label="Battery" value="100%" />
          <Row icon="vpn" label="VPN" chevron={false} right={<Switch on={vpn} onChange={setVpn} />} last />
        </div>

      </div>
    </div>
  )
}
