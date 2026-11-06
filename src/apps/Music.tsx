import { useEffect, useRef, useState } from 'react'
import './Music.css'

interface Track {
  id: string
  title: string
  artist: string
  album: string
  duration: string
  /** 实际音频文件（public/music 下） */
  src: string
  /** 内嵌封面导出后的图片；没有封面时用渐变色块 */
  cover?: string
  colors: [string, string, string]
}

const TRACKS: Track[] = [
  { id: 't1', title: '蜚蜚', artist: '亿轩_Kingston', album: '煙灰Ash 影视原声带', duration: '3:40', src: '/music/song1.mp3', cover: '/music/covers/ash.webp', colors: ['#0d2b3e', '#1f6f8b', '#9fd8e0'] },
  { id: 't2', title: '分分鐘需要你', artist: '林忆莲', album: '陪着我走 In Search Of Lost Time', duration: '4:12', src: '/music/song2.mp3', cover: '/music/covers/fenfen.webp', colors: ['#5a1f0e', '#e06b3c', '#ffd8a8'] },
  { id: 't3', title: '黑玻璃', artist: '洪嘉豪', album: '', duration: '3:39', src: '/music/song3.mp3', cover: '/music/covers/heibo.webp', colors: ['#141018', '#463a55', '#b9a7d6'] },
  { id: 't4', title: '你瞞我瞞', artist: '陈柏宇', album: "Can't Be Half", duration: '3:59', src: '/music/song4.mp3', cover: '/music/covers/niman.webp', colors: ['#1c2a3a', '#41618a', '#a9c4e6'] },
  { id: 't5', title: '恰逢其時', artist: '彭梓烨_Leo', album: '煙灰Ash 影视原声带', duration: '3:48', src: '/music/song5.mp3', cover: '/music/covers/ash.webp', colors: ['#3b1220', '#a8425f', '#f0b9c8'] },
  { id: 't6', title: '深夜告別練習', artist: 'Zpecial', album: '', duration: '3:34', src: '/music/song6.mp3', cover: '/music/covers/shenye.webp', colors: ['#0b1226', '#2a3f6b', '#8fa6d8'] },
]

function Artwork({ track, size, radius = 12 }: { track: Track; size: number; radius?: number }) {
  if (track.cover) {
    return (
      <img
        className="mus-art mus-art-cover"
        src={track.cover}
        alt=""
        style={{ width: size, height: size, borderRadius: radius }}
      />
    )
  }
  return (
    <div
      className="mus-art"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: `radial-gradient(120% 100% at 24% 18%, ${track.colors[2]} 0%, ${track.colors[1]} 42%, ${track.colors[0]} 100%)`,
      }}
    >
      <div className="mus-art-ring" />
      <div className="mus-art-glow" />
    </div>
  )
}

function formatTime(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) sec = 0
  const s = Math.floor(sec)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

function Player({
  track,
  index,
  playing,
  current,
  duration,
  onClose,
  onToggle,
  onPrev,
  onNext,
  onSeek,
}: {
  track: Track
  index: number
  playing: boolean
  current: number
  duration: number
  onClose: () => void
  onToggle: () => void
  onPrev: () => void
  onNext: () => void
  onSeek: (sec: number) => void
}) {
  const pct = duration > 0 ? (current / duration) * 100 : 0
  return (
    <div className="mus-player">
      <div
        className="mus-player-bg"
        style={{ background: `linear-gradient(170deg, ${track.colors[2]} 0%, #f7f7fa 58%, #fff 100%)` }}
      />

      <header className="mus-player-nav">
        <button className="mus-nav-btn" onClick={onClose} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M5 9l7 7 7-7" />
          </svg>
        </button>
        <span className="mus-player-nav-title">Now Playing</span>
        <button className="mus-nav-btn" aria-label="More">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="12" r="1.7" />
            <circle cx="12" cy="12" r="1.7" />
            <circle cx="19" cy="12" r="1.7" />
          </svg>
        </button>
      </header>

      <div className="mus-player-body">
        <Artwork track={track} size={300} radius={18} />

        <div className="mus-now">
          <h1 className="mus-now-title">{track.title}</h1>
          <p className="mus-now-artist">{track.album ? `${track.artist} · ${track.album}` : track.artist}</p>
        </div>

        <div className="mus-progress">
          <input
            className="mus-range"
            type="range"
            min={0}
            max={Math.max(duration, 0.1)}
            step={0.1}
            value={Math.min(current, duration)}
            onChange={(e) => onSeek(Number(e.target.value))}
            style={{ background: `linear-gradient(90deg, rgba(0,0,0,.68) ${pct}%, rgba(0,0,0,.14) ${pct}%)` }}
          />
          <div className="mus-times">
            <span>{formatTime(current)}</span>
            <span>-{formatTime(duration - current)}</span>
          </div>
        </div>

        <div className="mus-controls">
          <button className="mus-ctrl is-small" onClick={onPrev} aria-label="Previous">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 5h2v14H6zM19 5v14l-9.5-7z" />
            </svg>
          </button>
          <button className="mus-play" onClick={onToggle} aria-label={playing ? 'Pause' : 'Play'}>
            {playing ? (
              <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
                <rect x="7" y="5" width="3.6" height="14" rx="1" />
                <rect x="13.4" y="5" width="3.6" height="14" rx="1" />
              </svg>
            ) : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 4.6l13 7.4-13 7.4z" />
              </svg>
            )}
          </button>
          <button className="mus-ctrl is-small" onClick={onNext} aria-label="Next">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 5h2v14h-2zM5 5v14l9.5-7z" />
            </svg>
          </button>
        </div>

        <div className="mus-volume">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(0,0,0,.4)">
            <path d="M4 9h4l5-4v14l-5-4H4z" />
          </svg>
          <div className="mus-volume-track"><div className="mus-volume-fill" /></div>
          <svg width="18" height="14" viewBox="0 0 24 24" fill="rgba(0,0,0,.4)">
            <path d="M4 9h4l5-4v14l-5-4H4z" />
            <path d="M16 8.6a4.8 4.8 0 0 1 0 6.8M18.6 6a8.4 8.4 0 0 1 0 12" stroke="rgba(0,0,0,.4)" strokeWidth="2" fill="none" />
          </svg>
        </div>

        <div className="mus-bottom-actions">
          <button className="mus-bottom-btn" aria-label="Lyrics">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,.55)" strokeWidth="1.8" strokeLinecap="round">
              <path d="M4 7h11M4 12h11M4 17h7" />
              <circle cx="18" cy="15" r="2.6" />
            </svg>
          </button>
          <span className="mus-track-index">{index + 1} of {TRACKS.length}</span>
          <button className="mus-bottom-btn" aria-label="Queue">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,.55)" strokeWidth="1.8" strokeLinecap="round">
              <path d="M4 7h13M4 12h10M4 17h13" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * 音乐 —— 资料库 + 正在播放。
 */
export function Music() {
  const [view, setView] = useState<'library' | 'player'>('library')
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)

  const audioRef = useRef<HTMLAudioElement>(null)
  /** 切歌后是否需要自动播放 */
  const wantPlay = useRef(false)

  const track = TRACKS[index]

  // 切歌：换音频源、进度归零，按需续播
  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    a.src = track.src
    a.load()
    setCurrent(0)
    setDuration(0)
    if (wantPlay.current) {
      a.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
    }
  }, [index, track.src])

  // 拨打电话时暂停播放（App 通过 window 事件广播；退出 App / 回桌面 / 锁屏都不触发）
  useEffect(() => {
    const onCallStart = () => {
      const a = audioRef.current
      if (a && !a.paused) {
        wantPlay.current = false
        a.pause()
        setPlaying(false)
      }
    }
    window.addEventListener('app:phone-call-start', onCallStart)
    return () => window.removeEventListener('app:phone-call-start', onCallStart)
  }, [])

  const select = (i: number) => {
    wantPlay.current = true
    setPlaying(true)
    setView('player')
    if (i === index) {
      const a = audioRef.current
      if (a) {
        a.currentTime = 0
        setCurrent(0)
        a.play().catch(() => setPlaying(false))
      }
    } else {
      setIndex(i)
    }
  }

  const toggle = () => {
    const a = audioRef.current
    if (!a) return
    if (playing) {
      a.pause()
      setPlaying(false)
    } else {
      wantPlay.current = true
      a.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
    }
  }

  const prev = () => {
    wantPlay.current = playing
    setIndex((i) => (i === 0 ? TRACKS.length - 1 : i - 1))
  }
  const next = () => {
    wantPlay.current = playing
    setIndex((i) => (i + 1) % TRACKS.length)
  }

  const seek = (sec: number) => {
    const a = audioRef.current
    if (!a) return
    a.currentTime = sec
    setCurrent(sec)
  }

  const handleEnded = () => {
    wantPlay.current = true
    setIndex((i) => (i + 1) % TRACKS.length)
  }

  const audioEl = (
    <audio
      ref={audioRef}
      preload="metadata"
      onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
      onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      onEnded={handleEnded}
    />
  )

  if (view === 'player') {
    return (
      <div className="mus ios-app mus-app">
        {audioEl}
        <Player
          track={track}
          index={index}
          playing={playing}
          current={current}
          duration={duration}
          onClose={() => setView('library')}
          onToggle={toggle}
          onPrev={prev}
          onNext={next}
          onSeek={seek}
        />
      </div>
    )
  }

  return (
    <div className="mus ios-app mus-app">
      {audioEl}
      <header className="ios-header mus-header">
        <h1 className="ios-header-title">Music</h1>
        <span className="mus-header-sub">Library</span>
      </header>

      <div className="ios-scroll mus-scroll">
        <div className="mus-search">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="M20.5 20.5l-4.2-4.2" />
          </svg>
          <span>Search</span>
        </div>

        <div className="mus-section-title">Recently Added</div>

        <div className="mus-list">
          {TRACKS.map((t, i) => (
            <button key={t.id} className="mus-row" onClick={() => select(i)}>
              <Artwork track={t} size={54} radius={8} />
              <div className="mus-row-main">
                <span className="mus-row-title">{t.title}</span>
                <span className="mus-row-artist">{t.album ? `${t.artist} · ${t.album}` : t.artist}</span>
              </div>
              <span className="mus-row-dur">{t.duration}</span>
            </button>
          ))}
        </div>

        <div className="mus-section-title">Playlists</div>
        <div className="mus-playlist">
          <img className="mus-playlist-cover-img" src="/music/covers/lalaland.webp" alt="" />
          <div className="mus-playlist-text">
            <span className="mus-playlist-name">La La Land (Original Motion Picture Soundtrack)</span>
            <span className="mus-playlist-sub">15 songs · 45 min 47 sec</span>
          </div>
        </div>

        <div className="mus-spacer" />
      </div>

      {/* 迷你播放条 */}
      <div className="mus-mini">
        <button className="mus-mini-tap" onClick={() => setView('player')}>
          <Artwork track={track} size={38} radius={6} />
          <span className="mus-mini-title">{track.title}</span>
        </button>
        <button className="mus-mini-btn" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
          {playing ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <rect x="7" y="5" width="3.6" height="14" rx="1" />
              <rect x="13.4" y="5" width="3.6" height="14" rx="1" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 4.6l13 7.4-13 7.4z" />
            </svg>
          )}
        </button>
        <button className="mus-mini-btn" onClick={next} aria-label="Next">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 5h2v14h-2zM5 5v14l9.5-7z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
