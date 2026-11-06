import { useRef, useState } from 'react'
import './Safari.css'

interface Site {
  name: string
  domain: string
  bg: string
  fg: string
  initial: string
  tagline: string
  /** 收藏里不可点击 */
  disabled?: boolean
  /** Google 使用单独的搜索页 */
  kind?: 'google'
}

const GOOGLE: Site = {
  name: 'Google',
  domain: 'google.com',
  bg: '#ffffff',
  fg: '#4285f4',
  initial: 'G',
  tagline: 'Search the world.',
  kind: 'google',
}

const YOUTUBE: Site = {
  name: 'YouTube',
  domain: 'youtube.com',
  bg: '#ff0000',
  fg: '#ffffff',
  initial: 'Y',
  tagline: 'Broadcast yourself.',
  disabled: true,
}

const FAVORITES: Site[] = [
  { name: 'Apple', domain: 'apple.com', bg: '#f5f5f7', fg: '#1d1d1f', initial: '', tagline: 'Think different.', disabled: true },
  GOOGLE,
  { name: 'Weibo', domain: 'weibo.com', bg: '#e6162d', fg: '#ffffff', initial: '微', tagline: '随时随地发现新鲜事', disabled: true },
  { name: 'Netflix', domain: 'netflix.com', bg: '#000000', fg: '#e50914', initial: 'N', tagline: 'Watch TV shows and movies.', disabled: true },
  YOUTUBE,
  { name: 'Threads', domain: 'threads.com', bg: '#000000', fg: '#ffffff', initial: '@', tagline: 'Say more.', disabled: true },
  { name: 'X', domain: 'x.com', bg: '#000000', fg: '#ffffff', initial: 'X', tagline: "What's happening?", disabled: true },
  {
    name: 'Instagram',
    domain: 'instagram.com',
    bg: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)',
    fg: '#ffffff',
    initial: 'IG',
    tagline: 'Share your moments.',
    disabled: true,
  },
]

const VISITED: Site[] = [
  {
    name: 'Apple Store',
    domain: 'apple.com.cn',
    bg: '#1d1d1f',
    fg: '#ffffff',
    initial: 'A',
    tagline: 'Your favorite Apple products.',
  },
  GOOGLE,
  YOUTUBE,
]

/** Google 搜索历史：默认粤语，点一条切换普通话 */
const GOOGLE_HISTORY: Array<{ text: string; simp: string }> = [
  { text: '点氹返变咗细路嘅另一半', simp: '怎么安抚变成小孩的爱人' },
  { text: '另一半变咗细路点算', simp: '爱人变成小孩怎么办' },
  { text: '脚痛有咩方法舒缓', simp: '缓解腿痛的方法' },
  { text: '冇胃口食咩好', simp: '胃口不好应该吃什么' },
  { text: '真心半解', simp: '真心半解' },
  { text: '扔扇子係咩意思', simp: '扔扇子是什么意思' },
  { text: '点解嚼得多嘢之后牙齿会唔舒服', simp: '为什么嚼多东西之后牙齿会不舒服' },
  { text: '普通話拼音', simp: '普通话拼音' },
]

function AppleGlyph({ color }: { color: string }) {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill={color}>
      <path d="M16.4 12.6c0-2.2 1.8-3.2 1.9-3.3-1-1.5-2.6-1.7-3.2-1.7-1.4-.1-2.6.8-3.3.8-.7 0-1.7-.8-2.9-.8-1.5 0-2.9.9-3.6 2.2-1.5 2.7-.4 6.6 1.1 8.8.7 1 1.6 2.2 2.7 2.1 1.1 0 1.5-.7 2.8-.7 1.3 0 1.6.7 2.8.7 1.1 0 1.9-1.1 2.6-2.1.6-.9.9-1.4 1.4-2.4-3.5-1.3-3.6-5.3-3.6-5.4z" opacity=".9" />
      <path d="M13 5.6c.7-.9 1.2-2.1 1-3.2-1 .1-2.1.7-2.7 1.5-.6.8-1.2 2-1 3.1 1.1.1 2.1-.5 2.7-1.4z" opacity=".9" />
    </svg>
  )
}

function StartPage({ onOpen }: { onOpen: (s: Site) => void }) {
  return (
    <div className="ios-scroll saf-scroll">
      <div className="saf-start">
        <h2 className="saf-start-title">Favorites</h2>
        <div className="saf-fav-grid">
          {FAVORITES.map((f) => (
            <button
              key={f.domain}
              className="saf-fav"
              disabled={f.disabled}
              onClick={() => onOpen(f)}
            >
              <span className="saf-fav-icon" style={{ background: f.bg, color: f.fg }}>
                {f.initial || <AppleGlyph color={f.fg} />}
              </span>
              <span className="saf-fav-name">{f.name}</span>
            </button>
          ))}
        </div>

        <h2 className="saf-start-title saf-start-title--gap">Frequently Visited</h2>
        <div className="saf-visited">
          {VISITED.map((v, i) => (
            <button key={i} className="saf-visit-row" onClick={() => onOpen(v)}>
              <span className="saf-visit-icon" style={{ background: v.bg, color: v.fg }}>
                {v.initial}
              </span>
              <span className="saf-visit-main">
                <span className="saf-visit-name">{v.name}</span>
                <span className="saf-visit-domain">{v.domain}</span>
              </span>
              <span className="saf-visit-chev">›</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Google 搜索页：点搜索栏展开搜索记录 */
function GooglePage() {
  const [showHistory, setShowHistory] = useState(false)
  /** 每条记录是否切换成普通话 */
  const [lang, setLang] = useState<Record<number, boolean>>({})

  return (
    <div className="ios-scroll saf-scroll">
      <div className="saf-g">
        <div className="saf-g-logo" aria-label="Google">
          <span style={{ color: '#4285f4' }}>G</span>
          <span style={{ color: '#ea4335' }}>o</span>
          <span style={{ color: '#fbbc05' }}>o</span>
          <span style={{ color: '#4285f4' }}>g</span>
          <span style={{ color: '#34a853' }}>l</span>
          <span style={{ color: '#ea4335' }}>e</span>
        </div>

        <button
          className={`saf-g-search${showHistory ? ' is-open' : ''}`}
          onClick={() => setShowHistory((v) => !v)}
          aria-label="Search"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9aa0a6" strokeWidth="2" strokeLinecap="round">
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="M15.4 15.4L21 21" />
          </svg>
          <span className="saf-g-placeholder">Search</span>
        </button>

        {showHistory && (
          <div className="saf-g-history">
            {GOOGLE_HISTORY.map((h, i) => (
              <button
                key={i}
                className="saf-g-row"
                onClick={() => setLang((p) => ({ ...p, [i]: !p[i] }))}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="rgba(60,60,67,0.4)" strokeWidth="1.8" strokeLinecap="round">
                  <circle cx="12" cy="12" r="8.5" />
                  <path d="M12 7.6v4.8l3.2 2" />
                </svg>
                <span className="saf-g-text">{lang[i] ? h.simp : h.text}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function SitePage({ site }: { site: Site }) {
  return (
    <div className="ios-scroll saf-scroll">
      <div className="saf-hero" style={{ background: site.bg, color: site.fg }}>
        <div className="saf-hero-icon" style={{ color: site.fg, borderColor: site.fg }}>
          {site.initial || <AppleGlyph color={site.fg} />}
        </div>
        <div className="saf-hero-name">{site.name}</div>
        <div className="saf-hero-tag">{site.tagline}</div>
      </div>

      <div className="saf-article">
        <h1 className="saf-art-title">{site.tagline}</h1>
        <p className="saf-art-meta">Updated {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · {site.domain}</p>
        <p className="saf-art-p">
          Welcome to {site.name}. This page is rendered inside the simulator so you can preview how the
          web looks on this device. Everything here is local — no network requests are made.
        </p>
        <p className="saf-art-p">
          Scroll down to explore the layout. The toolbar at the bottom stays on screen while you read,
          just like Safari in iOS 26.
        </p>
        <div className="saf-art-card">
          <div className="saf-art-card-title">Reader mode</div>
          <div className="saf-art-card-desc">
            Clean typography, generous spacing and a comfortable line height for long reads.
          </div>
        </div>
        <p className="saf-art-p">
          Use the back arrow to return to your start page, or tap the address field to open another site.
        </p>
        <div className="saf-art-filler" />
      </div>
    </div>
  )
}

/**
 * Safari —— 起始页（收藏 / 常访问）+ 地址栏 + 模拟网页浏览。
 */
export function Safari() {
  const [site, setSite] = useState<Site | null>(null)
  const [draft, setDraft] = useState('')
  const [history, setHistory] = useState<Site[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const open = (s: Site) => {
    setSite(s)
    setHistory((h) => [...h, s])
    setDraft('')
  }

  const goBack = () => {
    setHistory((h) => {
      const next = h.slice(0, -1)
      setSite(next.length ? next[next.length - 1] : null)
      return next
    })
  }

  const submit = () => {
    const raw = draft.trim()
    if (!raw) return
    const host = raw.replace(/^https?:\/\//, '').split('/')[0]
    const name = host.split('.')[0]
    open({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      domain: host,
      bg: '#f2f2f7',
      fg: '#1d1d1f',
      initial: name.charAt(0).toUpperCase(),
      tagline: host,
    })
    inputRef.current?.blur()
  }

  return (
    <div className="saf ios-app">
      {site ? (
        site.kind === 'google' ? <GooglePage /> : <SitePage site={site} />
      ) : (
        <StartPage onOpen={open} />
      )}

      {/* 底部：地址栏 + 工具栏 */}
      <div className="saf-bottom">
        <button className="saf-tool" onClick={goBack} disabled={history.length === 0} aria-label="Back">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 5L8 12l7 7" />
          </svg>
        </button>
        <button className="saf-tool" disabled aria-label="Forward">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <button className="saf-tool" aria-label="Share">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 16V4M8 8l4-4 4 4" />
            <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
          </svg>
        </button>

        <div className="saf-address">
          <svg width="12" height="14" viewBox="0 0 12 14" fill="none" stroke="rgba(60,60,67,0.45)" strokeWidth="1.4">
            <rect x="1.5" y="6" width="9" height="7" rx="1.6" />
            <path d="M3.6 6V4.2a2.4 2.4 0 0 1 4.8 0V6" />
          </svg>
          <input
            ref={inputRef}
            value={draft}
            placeholder={site ? site.domain : 'Search or enter website'}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            spellCheck={false}
          />
          {draft && (
            <button className="saf-clear" onClick={() => setDraft('')} aria-label="Clear">×</button>
          )}
        </div>

        <button className="saf-tool" aria-label="Bookmarks">
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 4h12v17l-6-4-6 4z" />
          </svg>
        </button>
        <button className="saf-tool" aria-label="Tabs">
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <rect x="6" y="6" width="13" height="13" rx="2.4" />
            <path d="M9 2.6h9.4a3 3 0 0 1 3 3V15" opacity="0.5" />
          </svg>
        </button>
      </div>
    </div>
  )
}
