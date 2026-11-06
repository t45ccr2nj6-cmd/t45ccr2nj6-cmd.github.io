import { useState } from 'react'
import { useStoryState } from '@/data/story'
import './Reminders.css'

interface Reminder {
  id: string
  /** 粤语（默认显示） */
  text: string
  /** 普通话：点标题可切换 */
  simp?: string
  due: string
  done: boolean
}

/** 初始待办 */
const BASE: Reminder[] = [
  { id: 'gym', text: '去gym', simp: '去健身', due: 'Today · 10:30 AM', done: false },
  { id: 'eggs', text: '買雞蛋', simp: '买鸡蛋', due: 'Today', done: false },
  { id: 'laundry', text: '洗衫', simp: '洗衣服', due: 'Today', done: false },
]

/** 第三通电话挂断后新增的待办 */
const AFTER_CONNECTED_CALL: Reminder[] = [
  { id: 'dinner', text: '煮晚飯', simp: '做晚饭', due: 'Today · 5:00 PM', done: false },
  {
    id: 'delete-chat',
    text: '趁Kingston未醒，删佢手机我哋嘅chat',
    simp: '趁Kingston没醒，把他和我的聊天记录删了',
    due: 'Today',
    done: true,
  },
]

/**
 * 提醒事项 —— 剧情待办会随电话进度增减；点标题切换粤语/普通话，点圆圈勾选完成。
 */
export function Reminders() {
  const story = useStoryState()
  /** 用户手动切换过语言的条目 */
  const [lit, setLit] = useState<Record<string, boolean>>({})
  /** 用户手动勾选/取消过的条目（覆盖剧情默认状态） */
  const [flipped, setFlipped] = useState<Record<string, boolean>>({})
  const [custom, setCustom] = useState<Reminder[]>([])
  const [draft, setDraft] = useState('')

  // 第一通电话结束后，「去gym」被删掉
  const items = [
    ...BASE.filter((r) => !(r.id === 'gym' && story.kingstonCallCount > 0)),
    ...(story.connectedCallDone ? AFTER_CONNECTED_CALL : []),
    ...custom,
  ]

  const isDone = (r: Reminder) => (flipped[r.id] !== undefined ? flipped[r.id] : r.done)
  const titleOf = (r: Reminder) => (r.simp && lit[r.id] ? r.simp : r.text)

  const toggleDone = (r: Reminder) => {
    setFlipped((prev) => ({ ...prev, [r.id]: !(prev[r.id] !== undefined ? prev[r.id] : r.done) }))
  }

  const add = () => {
    const t = draft.trim()
    if (!t) return
    setCustom((prev) => [...prev, { id: `r-${Date.now()}`, text: t, due: 'Today', done: false }])
    setDraft('')
  }

  const open = items.filter((r) => !isDone(r))
  const done = items.filter((r) => isDone(r))

  return (
    <div className="rmd ios-app">
      <header className="ios-header">
        <h1 className="ios-header-title">Reminders</h1>
        <button className="rmd-add" aria-label="New list">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v8M8 12h8" />
          </svg>
        </button>
      </header>

      <div className="ios-scroll rmd-scroll">
        <div className="rmd-section">
          <span className="rmd-section-title">Today</span>
          <span className="rmd-section-count">{open.length}</span>
        </div>

        <div className="rmd-list">
          {open.map((r) => (
            <div key={r.id} className="rmd-row">
              <button className="rmd-check" onClick={() => toggleDone(r)} aria-label="Complete">
                <span className="rmd-dot" />
              </button>
              <button
                className="rmd-row-main"
                onClick={() => (r.simp ? setLit((p) => ({ ...p, [r.id]: !p[r.id] })) : toggleDone(r))}
              >
                <span className="rmd-title">{titleOf(r)}</span>
                <span className="rmd-due">{r.due}</span>
              </button>
            </div>
          ))}

          <div className="rmd-row rmd-row--input">
            <span className="rmd-plus">＋</span>
            <input
              className="rmd-input"
              placeholder="New Reminder"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && add()}
            />
            {draft.trim() && (
              <button className="rmd-confirm" onClick={add}>Add</button>
            )}
          </div>
        </div>

        {done.length > 0 && (
          <>
            <div className="rmd-section">
              <span className="rmd-section-title">Completed</span>
              <span className="rmd-section-count">{done.length}</span>
            </div>
            <div className="rmd-list">
              {done.map((r) => (
                <div key={r.id} className="rmd-row">
                  <button className="rmd-check is-done" onClick={() => toggleDone(r)} aria-label="Restore">
                    <span className="rmd-dot">
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                        <path d="M2 6.4l2.6 2.6L10 3.4" />
                      </svg>
                    </span>
                  </button>
                  <button
                    className="rmd-row-main"
                    onClick={() => (r.simp ? setLit((p) => ({ ...p, [r.id]: !p[r.id] })) : toggleDone(r))}
                  >
                    <span className="rmd-title is-done">{titleOf(r)}</span>
                    <span className="rmd-due">{r.due}</span>
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        <p className="rmd-footnote">Reminders with a due time will also appear on your Lock Screen.</p>
      </div>
    </div>
  )
}
