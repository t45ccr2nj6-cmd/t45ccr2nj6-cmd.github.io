import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { CALL_SCRIPT, type CallLine } from '@/data/callScript'
import { KINGSTON_SCRIPT } from '@/data/kingstonScript'
import {
  KINGSTON_MISSED_TIMES,
  markConnectedCall,
  recordKingstonCall,
  scheduleLeoPush,
  useMissedCallCount,
  useStoryState,
} from '@/data/story'
import './Phone.css'

type Tab = 'calls' | 'contacts' | 'keypad'
type Dir = 'in' | 'out' | 'missed'

interface Call {
  number: string
  label: string
  dir: Dir
  time: string
  note?: string
  /** 已接通通话的时长（如 5 min） */
  duration?: string
}

/** 运营商 / 服务号码的通话记录（不含任何虚构联系人） */
const CALLS: Call[] = [
  { number: '10086', label: '中国移动', dir: 'missed', time: 'Yesterday' },
  { number: '95588', label: 'ICBC', dir: 'out', time: 'Yesterday' },
  { number: 'No Caller ID', label: 'Unknown', dir: 'missed', time: 'Yesterday', note: '"Your parcel is still at the gate, please call back…"' },
  { number: '95533', label: 'CCB', dir: 'missed', time: '10/25' },
  { number: '10086', label: '中国移动', dir: 'out', time: '10/24' },
]



/** 通讯录联系人（letter 用于分组与右侧索引） */
interface Contact {
  name: string
  letter: string
}

const CONTACTS: Contact[] = [
  { name: '爸爸', letter: 'B' },
  { name: '朝阳', letter: 'C' },
  { name: 'Kingston', letter: 'K' },
  { name: '媽媽', letter: 'M' },
  { name: '群众', letter: 'Q' },
  { name: '人民', letter: 'R' },
  { name: 'Sing', letter: 'S' },
  { name: 'Sweetie', letter: 'S' },
  { name: '细佬', letter: 'X' },
]

/** 按首字母分组（A–Z 顺序） */
const CONTACT_GROUPS = CONTACTS.reduce<Array<{ letter: string; items: Contact[] }>>((acc, c) => {
  const last = acc[acc.length - 1]
  if (last && last.letter === c.letter) last.items.push(c)
  else acc.push({ letter: c.letter, items: [c] })
  return acc
}, [])

/* ---------- glyphs ---------- */

function PersonGlyph({ size = 26, color = '#f4f4f7' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <circle cx="12" cy="8.2" r="4" />
      <path d="M3.5 20c0-4.2 3.8-6.6 8.5-6.6s8.5 2.4 8.5 6.6c0 .5-.4.9-.9.9H4.4c-.5 0-.9-.4-.9-.9z" />
    </svg>
  )
}

function PhoneGlyph({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2z" />
    </svg>
  )
}

function DirArrow({ dir }: { dir: Dir }) {
  // missed/incoming：箭头指向左下；outgoing：指向右上
  return (
    <svg className="phn-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="rgba(60,60,67,.5)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {dir === 'out' ? <path d="M3 9L9 3M4.6 3H9v4.4" /> : <path d="M9 3L3 9M7.4 9H3V4.6" />}
    </svg>
  )
}

/* ---------- 最近通话行 ---------- */

function CallRow({ call, onCall }: { call: Call; onCall: (n: string) => void }) {
  const missed = call.dir === 'missed'
  return (
    <div className="phn-row">
      <div className="phn-avatar">
        <PersonGlyph />
      </div>
      <div className="phn-row-main">
        <span className={`phn-number${missed ? ' is-missed' : ''}`}>{call.number}</span>
        <span className="phn-sub">
          <DirArrow dir={call.dir} />
          {call.label}
          {call.duration ? ` · ${call.duration}` : ''}
        </span>
        {call.note && <span className="phn-note">{call.note}</span>}
      </div>
      <span className="phn-time">{call.time}</span>
      <button className="phn-callback" onClick={() => onCall(call.number)} aria-label={`Call ${call.number}`}>
        <PhoneGlyph size={17} color="#007AFF" />
      </button>
    </div>
  )
}

/* ---------- 拨号键盘 ---------- */

const KEYS = [
  { d: '1', l: '' },
  { d: '2', l: 'ABC' },
  { d: '3', l: 'DEF' },
  { d: '4', l: 'GHI' },
  { d: '5', l: 'JKL' },
  { d: '6', l: 'MNO' },
  { d: '7', l: 'PQRS' },
  { d: '8', l: 'TUV' },
  { d: '9', l: 'WXYZ' },
  { d: '*', l: '' },
  { d: '0', l: '+' },
  { d: '#', l: '' },
]

function Keypad({ number, onChange, onCall }: { number: string; onChange: (n: string) => void; onCall: () => void }) {
  return (
    <div className="phn-keypad">
      <div className="phn-display">{number}</div>

      <div className="phn-keys">
        {KEYS.map((k) => (
          <button key={k.d} className="phn-key" onClick={() => onChange(number + k.d)}>
            <span className="phn-key-d">{k.d}</span>
            {k.l && <span className="phn-key-l">{k.l}</span>}
          </button>
        ))}
      </div>

      <div className="phn-keypad-actions">
        <span />
        <button className="phn-call-btn" onClick={onCall} aria-label="Call">
          <PhoneGlyph size={32} color="#fff" />
        </button>
        <button
          className="phn-del"
          onClick={() => onChange(number.slice(0, -1))}
          aria-label="Delete"
          style={{ visibility: number ? 'visible' : 'hidden' }}
        >
          <svg width="30" height="22" viewBox="0 0 30 22">
            <path d="M10 1.5h17a1.5 1.5 0 0 1 1.5 1.5v16a1.5 1.5 0 0 1-1.5 1.5H10L1.5 11z" fill="none" stroke="#8e8e93" strokeWidth="1.6" />
            <path d="M13.5 7.5l7 7M20.5 7.5l-7 7" stroke="#8e8e93" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}

/* ---------- Dock 图标 ---------- */

function DockIcon({ tab }: { tab: Tab }) {
  if (tab === 'calls') return <PhoneGlyph size={22} />
  if (tab === 'contacts') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="8" r="4.2" />
        <path d="M3.8 20.2c0-4.4 3.7-6.9 8.2-6.9s8.2 2.5 8.2 6.9c0 .4-.4.8-.8.8H4.6c-.4 0-.8-.4-.8-.8z" />
      </svg>
    )
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      {[5, 12, 19].map((cx) => [4.6, 12, 19.4].map((cy) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.1" />))}
    </svg>
  )
}

/* ---------- 接通后的字幕 ---------- */

/** 一次只显示一句，逐字打出；上滚后仍可手动翻看之前的句子 */
function CallSubtitles() {
  const [idx, setIdx] = useState(0)
  const [typed, setTyped] = useState('')
  const [simpOn, setSimpOn] = useState<Set<number>>(new Set())
  const boxRef = useRef<HTMLDivElement>(null)
  const curRef = useRef<HTMLDivElement>(null)
  /** 气泡高度跟随当前这一句的行数，保证一屏只露出一句 */
  const [boxH, setBoxH] = useState(36)

  useLayoutEffect(() => {
    const el = curRef.current
    if (el) setBoxH(el.offsetHeight)
  }, [typed, idx])

  // 逐字演出：粤语语速偏慢，标点稍作停顿；演完后留在通话界面，由用户自己挂断
  useEffect(() => {
    const line = CALL_SCRIPT[idx]
    if (!line) return
    setTyped('')
    const chars = Array.from(line.text)
    let i = 0
    let timer = 0
    let stopped = false
    const step = () => {
      if (stopped) return
      i += 1
      setTyped(chars.slice(0, i).join(''))
      if (i >= chars.length) {
        timer = window.setTimeout(() => setIdx((n) => n + 1), 950)
        return
      }
      timer = window.setTimeout(step, /[，。？！、；：]/.test(chars[i - 1]) ? 420 : 200)
    }
    timer = window.setTimeout(step, 550)
    return () => {
      stopped = true
      window.clearTimeout(timer)
    }
  }, [idx])

  // 新句子出现时滚到最新；打字过程中仅在接近底部时跟随
  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight, behavior: 'smooth' })
  }, [idx])
  useEffect(() => {
    const el = boxRef.current
    if (el && el.scrollHeight - el.scrollTop - el.clientHeight < 40) el.scrollTop = el.scrollHeight
  }, [typed])

  const toggle = (i: number) =>
    setSimpOn((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })

  const shown = (line: CallLine, i: number, content: string) =>
    simpOn.has(i) && line.simp ? line.simp : content

  return (
    <div className="phn-subtitle" ref={boxRef} style={{ height: boxH }}>
      {CALL_SCRIPT.slice(0, idx).map((line, i) => (
        <div key={i} className="phn-sub-line" onClick={() => toggle(i)}>
          <span className="phn-sub-name">{line.speaker}：</span>
          {shown(line, i, line.text)}
        </div>
      ))}
      {CALL_SCRIPT[idx] && typed && (
        <div ref={curRef} className="phn-sub-line is-current" onClick={() => toggle(idx)}>
          <span className="phn-sub-name">{CALL_SCRIPT[idx].speaker}：</span>
          {shown(CALL_SCRIPT[idx], idx, typed)}
        </div>
      )}
    </div>
  )
}

/* ---------- 电话（iOS 26 统一设计） ---------- */

export function Phone() {
  const [tab, setTab] = useState<Tab>('calls')
  const [number, setNumber] = useState('')
  const [calling, setCalling] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [editing, setEditing] = useState(false)
  /** 计时起点：接通后才重新计时，未接通不显示计时 */
  const timerBase = useRef(0)
  const story = useStoryState()

  /** 未接来电数：静态记录 + 已经打过的 Kingston 未接通电话 */
  const missedCount = useMissedCallCount()

  /** 微信脚本走完后、尚未演过字幕的那一通会被接听 */
  const isFinalCall =
    calling === 'Kingston' &&
    !story.connectedCallDone &&
    story.kingstonCallCount >= 2 &&
    story.chatStep >= KINGSTON_SCRIPT.length

  const startCall = (n: string) => {
    if (!n.trim()) return
    // 广播拨号事件：Music 等正在播放的音频据此暂停
    window.dispatchEvent(new CustomEvent('app:phone-call-start'))
    setConnected(false)
    setCalling(n)
  }

  /** 主动挂断 / 被对方挂断：Kingston 这通会留下未接通记录并解锁微信剧情 */
  const endCall = () => {
    if (calling === 'Kingston') {
      if (connected) {
        markConnectedCall()
        // 挂断 1 分钟后，微信里靓仔推来「Leo」
        scheduleLeoPush()
      } else {
        recordKingstonCall()
      }
    }
    setConnected(false)
    setCalling(null)
  }

  useEffect(() => {
    if (!calling) return
    timerBase.current = Date.now()
    setElapsed(0)
    const tick = window.setInterval(() => setElapsed(Math.floor((Date.now() - timerBase.current) / 1000)), 500)
    if (isFinalCall) {
      // 微信剧情结束后的这一通：很快接起，由字幕演完 / 用户挂断来结束
      const connectTimer = window.setTimeout(() => {
        // 接通之后才开始计时
        timerBase.current = Date.now()
        setElapsed(0)
        setConnected(true)
      }, 2400)
      return () => {
        window.clearInterval(tick)
        window.clearTimeout(connectTimer)
      }
    }
    // 第一通：响铃 1 分钟无人接听；之后：对方秒挂断
    const hangupAfter = calling === 'Kingston' && story.kingstonCallCount > 0 ? 1500 : 60_000
    const timeout = window.setTimeout(() => endCall(), hangupAfter)
    return () => {
      window.clearInterval(tick)
      window.clearTimeout(timeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calling])

  return (
    <div className="phn ios-app">
      {/* 顶部：Edit 胶囊 + 标题 + 筛选（Keypad 页无顶栏） */}
      {tab !== 'keypad' && (
        <header className="phn-topbar">
          {tab === 'calls' ? (
            <button className="phn-glass phn-edit" onClick={() => setEditing(!editing)}>
              {editing ? 'Done' : 'Edit'}
            </button>
          ) : (
            <span className="phn-topside" />
          )}
          <h1 className="phn-title">{tab === 'calls' ? 'Calls' : 'Contacts'}</h1>
          {tab === 'calls' ? (
            <button className="phn-glass phn-filter" aria-label="Filter">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                <path d="M2.5 4.5h13M2.5 9h13M2.5 13.5h8" />
              </svg>
            </button>
          ) : (
            <span className="phn-topside" />
          )}
        </header>
      )}

      {/* 通话列表 */}
      {tab === 'calls' && (
        <div className="ios-scroll phn-scroll">
          <div className="phn-section-title">Recents</div>
          <div className="phn-list">
            {story.connectedCallDone && (
              <CallRow
                call={{ number: 'Kingston', label: 'Mobile', dir: 'out', time: '10:25 AM', duration: '3 min' }}
                onCall={startCall}
              />
            )}
            {[...KINGSTON_MISSED_TIMES.slice(0, story.kingstonCallCount)].reverse().map((time) => (
              <CallRow
                key={time}
                call={{ number: 'Kingston', label: 'Mobile', dir: 'missed', time }}
                onCall={startCall}
              />
            ))}
            {CALLS.map((c) => (
              <CallRow key={`${c.number}-${c.time}`} call={c} onCall={startCall} />
            ))}
          </div>
          <div className="phn-tail" />
        </div>
      )}

      {/* 通讯录 */}
      {tab === 'contacts' && (
        <>
          <div className="ios-scroll phn-scroll">
            <div className="phn-mycard">
              <div className="phn-myavatar">z</div>
              <div className="phn-mycard-text">
                <span className="phn-mycard-name">ziyip.l</span>
                <span className="phn-mycard-sub">My Card</span>
              </div>
              <span className="phn-mycard-chev">›</span>
            </div>
            {CONTACT_GROUPS.map((g) => (
              <div key={g.letter}>
                <div className="phn-group-head">{g.letter}</div>
                <div className="phn-list">
                  {g.items.map((c) =>
                    c.name === 'Kingston' ? (
                      <button key={c.name} className="phn-row phn-contact-btn" onClick={() => startCall(c.name)}>
                        <span className="phn-letter-avatar">{c.name[0]}</span>
                        <div className="phn-row-main">
                          <span className="phn-number">{c.name}</span>
                        </div>
                      </button>
                    ) : (
                      <div key={c.name} className="phn-row">
                        <span className="phn-letter-avatar">{c.name[0]}</span>
                        <div className="phn-row-main">
                          <span className="phn-number">{c.name}</span>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            ))}
            <div className="phn-tail" />
          </div>
          <div className="phn-index" aria-hidden="true">
            {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((l) => (
              <span key={l} className={CONTACT_GROUPS.some((g) => g.letter === l) ? 'is-on' : ''}>
                {l}
              </span>
            ))}
            <span>#</span>
          </div>
        </>
      )}

      {/* 拨号键盘 */}
      {tab === 'keypad' && (
        <Keypad
          number={number}
          onChange={setNumber}
          onCall={() => {
            startCall(number)
            setNumber('')
          }}
        />
      )}

      {/* 底部悬浮 Dock：胶囊三页 + 独立搜索圆钮 */}
      <div className="phn-dock">
        <nav className="phn-dock-pill">
          {(['calls', 'contacts', 'keypad'] as Tab[]).map((t) => (
            <button
              key={t}
              className={`phn-dock-item${tab === t ? ' is-active' : ''}`}
              onClick={() => setTab(t)}
            >
              <span className="phn-dock-icon">
                <DockIcon tab={t} />
                {t === 'calls' && missedCount > 0 && <span className="phn-badge">{missedCount}</span>}
              </span>
              <span className="phn-dock-label">{t === 'calls' ? 'Calls' : t === 'contacts' ? 'Contacts' : 'Keypad'}</span>
            </button>
          ))}
        </nav>
        <button className="phn-dock-search" aria-label="Search">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="9.5" cy="9.5" r="6.2" />
            <path d="M14.2 14.2L19.5 19.5" />
          </svg>
        </button>
      </div>

      {/* 通话中浮层 */}
      {calling && (
        <div className="phn-call">
          <div className="phn-call-inner">
            <div className="phn-call-avatar">
              <PersonGlyph size={48} color="rgba(255,255,255,.85)" />
            </div>
            <div className="phn-call-number">{calling}</div>
            <div className="phn-call-status">{connected ? 'connected' : 'calling…'}</div>
            {connected && elapsed > 0 && (
              <div className="phn-call-timer">
                {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}
              </div>
            )}
            {connected && <CallSubtitles />}
          </div>
          <button className="phn-end" onClick={endCall} aria-label="End call">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="#fff">
              <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2z" transform="rotate(135 12 12)" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
