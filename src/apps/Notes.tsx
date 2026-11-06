import { useRef, useState } from 'react'
import { useStoryState } from '@/data/story'
import './Notes.css'

interface NoteLine {
  yue: string
  zh: string
}

interface Note {
  id: string
  title: string
  body: string
  date: string
  /** 可点句切换粤语 / 普通话的只读笔记（通话结束后解锁） */
  storyLines?: NoteLine[]
}

const INITIAL_NOTES: Note[] = [
  {
    id: 'n0',
    title: '坐在连锁咖啡館里',
    body: '坐在连锁咖啡館里\n窗外正维修着道路\n路人撑着各花各色的雨伞\n在下雨的日子里\n\n我想起我们俩静静地坐在沙發上\n當我望向你的眼睛時\n我在你的眼中找到了我自己\n\n有時你带着疲惫的身躯走向我时\n有時你會帶著撒娇的語氣面向我时\n我找到的，是最纯粹的你',
    date: '8/26',
  },
  {
    id: 'n1',
    title: '萬寧 DAY5',
    body: 'To Kingston：\n\n從第一天見到你到今天我們在萬寧的最後一個晚上，我經歷不止是一段時間，而是一段可能我一輩子都不會忘記的回憶。我不是在這裡跟你道別哦，而是我覺得從我遇見你第一天開始，我的命運輪盤感覺就在運轉起來了。我不是一個很會表達自己的一個人，在和你相處的日子裡面，我覺得我自己變了，變了一個更加敢於表達自己，變了一個更有擔當，變了一個更優秀，變了一個我愛的人。\n\n我們看了無數的太陽日出日落，晚上的月亮，走過無數的里數，談過數不清的心話。有你在我身邊，我想說的是幸好有你，如果不是你的話我覺得這一路走過來，也沒有那麼如意快樂。可能我覺得這就是緣分吧，我不知道我們的默契是從哪裡來的，因為我發現很多時候，我們的一些不經意喜歡的東西還有一些想法都是挺一致的。可能這就是一輩子留下來的姻緣吧。\n\n說到姻緣吧有時候也會亂猜，是不是一輩子留下來要還的債。因為有時候呢，你的確也是挺難對付的，讓我有點真的不知所措。不過反正也是這樣一跌一倒了，這樣走過來了。回想起我也覺得也挺荒謬的，但是這可能為什麼兩個人怎麼樣也分不開吧。\n\n好，說回萬寧了。這幾天發生的事情，還真的挺多的，好多事在這裡也說不完。說一下我的感受吧，其實我想說跟你一起做什麼都無所謂。這是你的對白對嗎？不過也是我想說的。這幾天我覺得最開心最幸福充電的時刻，就是和你在晚上看電影的時間。可能也因為我喜歡看，但這就是我覺得最舒服的一個活動。請原諒我的情緒，有時候我特別敏感，相信我也讓你受了不少苦。我們可以相處那麼久，那麼又哭又鬧的。\n謝謝你。\nP.S. Love You 3000\n\nFrom Leo',
    date: '8/1',
  },
  {
    id: 'n2',
    title: '萬寧 DAY4',
    body: 'To Kingston：\n\n今天我們終於鬧彆扭了，不過也正常吧，畢竟每一對情侶都會在旅行中經歷過這些事情，反正我們也是把問題給解決了，就不多說了…雖然我們發生了一些不愉快的事情，不過我們兩始終沒有離開雙方，沒有不開心或冷戰，反而在不斷的溝通表達情緒。\n\n可能是因為發生事情了吧，我們在這一天送給對方的禮物居然是在今天，可能是想彌補對方不適當的過錯，又不知道怎麼去表達。最後想在這裡說句對不起，謝謝你的包答～倒數最後一天了，希望我們明天可以開開心心吧～\n\nFrom Leo',
    date: '7/31',
  },
  {
    id: 'n3',
    title: '萬寧 DAY3',
    body: 'To Kingston：\n\n我煮的早餐也不賴吧～下次給你一杯港式奶茶讓你試試！今天一起做飯好玩嗎？不斷在偷我的食材，不過都讓我看見了，下次可以再努力點～\n\n老實說今天我説被蟲子咬的時候你的反應有點讓我有點不開心，因為你好像在猜我是不是在扮的，不過還好我也沒有太多想，可能就當下跟你說清楚，很期待我們的跳舞祝頻，因為我很努力在跳，期待明大的活動～時間也剩下不多了，享受每一天吧～\n\nFrom Leo',
    date: '7/30',
  },
  {
    id: 'n4',
    title: '萬寧 DAY2',
    body: 'To Kingston：\n\n謝謝你的早餐，為我準備了那麼久，你應該多休息一點。誤會了你是點外賣的。不過往好的看，也就說明你做的早餐很有水平呀！不過無論好吃與否，心意最重要，我感受到了～\n\n明天早餐就我來負責吧！\n\n還有今天晚上，我們聊著聊著就哭了，我想承諾就是你的淚點吧～不過當下我不敢多問，如果你想說，就在這裡跟我說說，因為我也想知道你心裡壓了什麼，希望之後我可以多留意一下，如果不想說也沒關係，因為每個人都有自己難以說出口的事情吧！！\n\nFrom Leo',
    date: '7/29',
  },
  {
    id: 'n5',
    title: '萬寧 DAY1',
    body: 'To Kingston：\n\n從我們討論要去哪裡玩，到坐飛機、訂酒店，不對，應該是我們的家，去到一起出去DIY朱古力，拍神圖，吃漂亮飯，逛書店，在日月灣喝酒。每一個環節我都能感受到心中有你，心中有我。沒想到無論在家或者是別的地方，我們兩也是心意相通。\n\n希望之後的四天也可以像今天一樣，開開心心，大笑大鬧，甜甜蜜蜜地度過。我們一起創造更多美好的回憶，就像以前，現在，還有之後的每一天。\n\nFrom Leo',
    date: '7/28',
  },
]

/** 通话结束后解锁的笔记：默认粤语，点句切换普通话 */
const STORY_NOTE: Note = {
  id: 'story-note',
  title: '五岁嘅Kingston好得意',
  date: '11:42 AM',
  body: '就由得佢当係一场梦啦。\n好好哋瞓一觉啦。',
  storyLines: [
    {
      yue: '五岁嘅Kingston好得意，十八岁嘅Kingston都好得意，二十七岁嘅Kingston仲得意。',
      zh: '五岁的Kingston好可爱，十八岁的Kingston也好可爱，二十七岁的Kingston更可爱。',
    },
    { yue: '就由得佢当係一场梦啦。', zh: '就让他以为是个梦好了。' },
    { yue: '好好哋瞓一觉啦。', zh: '好好睡一觉吧。' },
  ],
}

/**
 * 备忘录 —— 列表 / 阅读 / 新建与编辑。
 */
export function Notes() {
  const story = useStoryState()
  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES)
  const [openId, setOpenId] = useState<string | null>(null)
  const [noteSimp, setNoteSimp] = useState<Set<number>>(new Set())
  const bodyRef = useRef<HTMLTextAreaElement>(null)

  // 通话结束后，最新一条笔记出现在最上面
  const allNotes = story.connectedCallDone ? [STORY_NOTE, ...notes] : notes

  const update = (id: string, patch: Partial<Note>) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...patch } : n)))
  }

  const current = allNotes.find((n) => n.id === openId)

  const toggleNoteLine = (i: number) =>
    setNoteSimp((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })

  if (current?.storyLines) {
    return (
      <div className="not ios-app not-editor-page">
        <header className="ios-subnav not-subnav">
          <button className="ios-back" onClick={() => setOpenId(null)}>
            <svg width="10" height="17" viewBox="0 0 8 14" fill="none" stroke="#FF9F0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 1L1 7l6 6" />
            </svg>
            <span className="not-back-text">Notes</span>
          </button>
          <button className="not-done" onClick={() => setOpenId(null)}>Done</button>
        </header>

        <div className="not-editor">
          <div className="not-editor-date">{current.date}</div>
          <div className="not-tap-title">{current.title}</div>
          {current.storyLines.map((line, i) => (
            <button key={i} className="not-tap-line" onClick={() => toggleNoteLine(i)}>
              {noteSimp.has(i) ? line.zh : line.yue}
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (current) {
    return (
      <div className="not ios-app not-editor-page">
        <header className="ios-subnav not-subnav">
          <button className="ios-back" onClick={() => setOpenId(null)}>
            <svg width="10" height="17" viewBox="0 0 8 14" fill="none" stroke="#FF9F0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 1L1 7l6 6" />
            </svg>
            <span className="not-back-text">Notes</span>
          </button>
          <button className="not-done" onClick={() => setOpenId(null)}>Done</button>
        </header>

        <div className="not-editor">
          <div className="not-editor-date">{current.date}</div>
          <input
            className="not-title-input"
            value={current.title}
            placeholder="Title"
            autoFocus={!current.title}
            onChange={(e) => update(current.id, { title: e.target.value })}
          />
          <textarea
            ref={bodyRef}
            className="not-body-input"
            value={current.body}
            placeholder="Start writing…"
            onChange={(e) => update(current.id, { body: e.target.value })}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="not ios-app">
      <header className="ios-header not-header">
        <h1 className="ios-header-title">Notes</h1>
        <button className="ios-header-action not-edit">Edit</button>
      </header>

      <div className="ios-scroll not-scroll">
        <div className="not-count">{allNotes.length} {allNotes.length === 1 ? 'Note' : 'Notes'}</div>

        <div className="not-list">
          {allNotes.map((n) => (
            <button key={n.id} className="not-row" onClick={() => setOpenId(n.id)}>
              <div className="not-row-main">
                <span className="not-row-title">{n.title || 'New Note'}</span>
                <span className="not-row-preview">
                  {n.body ? n.body.split('\n')[0] : 'No additional text'}
                </span>
              </div>
              <span className="not-row-date">{n.date}</span>
            </button>
          ))}
        </div>
      </div>

      <button className="ios-fab not-fab is-locked" aria-label="New note">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 20v-3.2L16.4 4.4a1.8 1.8 0 0 1 2.5 0l.7.7a1.8 1.8 0 0 1 0 2.5L7.2 20H4z" />
          <path d="M14.4 6.4l3.2 3.2" />
        </svg>
      </button>
    </div>
  )
}
