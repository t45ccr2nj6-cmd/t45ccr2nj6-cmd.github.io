import { useCallback, useEffect, useState } from 'react'
import './Red.css'

type Page = 'home' | 'me' | 'messages'
type MsgView = 'main' | 'nonfollow' | 'detail'

interface HomeNote {
  id: string
  img: string
  title: string
  height: number
  author: string
  avatarColor: string
  likes: string
  people?: string
  overlay?: boolean
  live?: boolean
  video?: boolean
}

interface MeNote {
  id: string
  img: string
  title: string
  views: string
  time: string
  likes: string
  isVideo?: boolean
  wide?: boolean
}

interface NonFollowMsg {
  id: string
  avatarColor: string
  name: string
  time: string
  preview: string
  detailQuote: string
  detailMeta: string
}

const AVATAR_COLORS = ['#ff6b9d', '#7c5cff', '#4a9eff', '#ff8a3d', '#36c5a0', '#c86bfa', '#f2a93b', '#5bbd8a', '#e05d5d']
// 框高保持原有 8 个不动
const HEIGHTS = [268, 214, 246, 130, 232, 256, 204, 238]

const HOME_NOTES: HomeNote[] = [
  { img: '/red-feed/p1.webp', title: '如果你丢下我 我将在半梦半醒中度过余生', author: '我和我的猫', likes: '1175' },
  { img: '/red-feed/p2.webp', title: '所有人严肃感受环颜一💛', author: '不中亲签不改名', likes: '1121' },
  { img: '/red-feed/p3.webp', title: '与星星人一起烘焙美味的小饼干～', author: 'POP MART 泡泡玛特', likes: '', people: '162' },
  { img: '/red-feed/p4.webp', title: '“爱是混乱、糟糕、自私...而且大胆的”', author: '惬意冰糖', likes: '666', video: true },
  { img: '/red-feed/p5.webp', title: '🥺老师我家孩子…', author: 'L.', likes: '3' },
  { img: '/red-feed/p6.webp', title: 'Kingston的leo小狗狗#leoking #亿轩kingsto…', author: '喜碧GAE-', likes: '203' },
  { img: '/red-feed/p7.webp', title: '一颗kingstonnnn大头', author: '我去当大王', likes: '7' },
  { img: '/red-feed/p8.webp', title: '隐形20cm八团来袭！小个子出成男自信外挂…', author: '官杨', likes: '3.9K', video: true },
].map((n, i) => ({
  id: `hn-${i}`,
  ...n,
  height: HEIGHTS[i],
  avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
  overlay: i === 0,
  live: i === 2,
}))

const ME_NOTES: MeNote[] = [
  { id: 'mn-00', img: '/red-me/p14.webp', title: '♥♣', views: '127351', time: '11-05', likes: '13.6K' },
  { id: 'mn-0', img: '/red-me/p1.webp', title: '一起去捣蛋😜🍬', views: '105200', time: '10-31', likes: '10.3K' },
  { id: 'mn-1', img: '/red-me/p2.webp', title: 'Together', views: '115346', time: '10-16', likes: '12.7K' },
  { id: 'mn-2', img: '/red-me/p3.webp', title: '谁来了', views: '124672', time: '10-13', likes: '13.8K' },
  { id: 'mn-3', img: '/red-me/p4.webp', title: '这句话我想说很久了', views: '100325', time: '10-01', likes: '11.1K' },
  { id: 'mn-4', img: '/red-me/p5.webp', title: '今天出门了🙂‍↕️', views: '153527', time: '09-08', likes: '15.3K', isVideo: true },
  { id: 'mn-5', img: '/red-me/p6.webp', title: '遇到北京的秋天了🍂', views: '112436', time: '09-25', likes: '12.1K' },
  { id: 'mn-6', img: '/red-me/p7.webp', title: '晒会太阳☀️', views: '98735', time: '09-03', likes: '8,033' },
  { id: 'mn-7', img: '/red-me/p8.webp', title: '这次就📸了两秒', views: '91354', time: '09-08', likes: '7,382' },
  { id: 'mn-8', img: '/red-me/p9.webp', title: 'GG EZ🙌🎮🖤', views: '72536', time: '07-06', likes: '5,000', isVideo: true },
  { id: 'mn-9', img: '/red-me/p10.webp', title: '可以交给我吧✨🤵‍♂️', views: '63521', time: '08-16', likes: '4,406', wide: true },
  { id: 'mn-10', img: '/red-me/p11.webp', title: '踏青🧃🍃🪵😎', views: '46561', time: '06-19', likes: '3,191' },
  { id: 'mn-11', img: '/red-me/p12.webp', title: '▶️🔴remix ver.', views: '42361', time: '05-20', likes: '3,109', isVideo: true },
  { id: 'mn-12', img: '/red-me/p13.webp', title: '没有墨镜🙌🏼🕶️', views: '36791', time: '03-28', likes: '2,236', isVideo: true },
]

const NON_FOLLOW_MSGS: NonFollowMsg[] = [
  {
    id: 'nf-14',
    avatarColor: '#4a9eff',
    name: '只想退休的季同学',
    time: '11/04 6:38 PM',
    preview: '这周六北京就要初雪啦～～～这是不是你俩一起看的第一场雪啊～真怕初雪那天你俩在雪里跳“初雪”，怕什么来什么～',
    detailQuote: '早日退休，环游世界。',
    detailMeta: 'IP Beijing, China    Taurus',
  },
  {
    id: 'nf-15',
    avatarColor: '#ff6b9d',
    name: '11',
    time: '11/04 10:12 AM',
    preview: '宝宝你线下帅成这样不许再颜值焦虑了！松弛点更帅！',
    detailQuote: '今天也要开心。',
    detailMeta: 'IP Hangzhou, China    Virgo',
  },
  {
    id: 'nf-2',
    avatarColor: '#7c5cff',
    name: '不用碳',
    time: '11/03 10:17 PM',
    preview: '宝宝，太累吃不下东西别硬来，可能跟Leo两个人吃點清爽开胃的吧，记得好好休息，好好照顧自己！！',
    detailQuote: '所有的热爱都要不遗余力。',
    detailMeta: 'IP Guangzhou, China    Sagittarius',
  },
  {
    id: 'nf-1',
    avatarColor: '#ff6b9d',
    name: '雪倾城影向谁',
    time: '11/03 9:32 PM',
    preview: '吃不下的话，开什么吃播？？？',
    detailQuote: '温柔半两，从容一生。',
    detailMeta: 'IP Shanghai, China    Libra',
  },
  {
    id: 'nf-11',
    avatarColor: '#3aa7a3',
    name: 'alexis',
    time: '11/02 9:41 PM',
    preview: `我真没法替你说话了zjj
多次说感谢粉丝的支持
但是pzy主动Q清汤寡水2次都无动于衷
装啥呢你这么高敏听不懂吗
刚捞到就忘如本是吧
不会真以为所有人期待的是你的爱豆梦和唱跳舞台吧`,
    detailQuote: '自在如风。',
    detailMeta: 'IP Hong Kong, China    Aquarius',
  },
  {
    id: 'nf-12',
    avatarColor: '#e05d5d',
    name: '蛋糕骗局_',
    time: '11/01 11:26 PM',
    preview: '直播状态不好是要给pzy摆脸色要跟cpf摆脸色的，pzy可以有义务围着你的情绪转，但cpf好像没有吧？调侃两句应援色是妈咪脸色真敢当真啊？',
    detailQuote: '人间清醒，难得糊涂。',
    detailMeta: 'IP Shanghai, China    Leo',
  },
  {
    id: 'nf-8',
    avatarColor: '#5bbd8a',
    name: '芋泥啵啵67',
    time: '11/01 3:14 PM',
    preview: '给我看吐了，给自己舞万人迷呢，求求了照照镜子吧😂',
    detailQuote: '万事顺意。',
    detailMeta: 'IP Nanjing, China    Virgo',
  },
  {
    id: 'nf-6',
    avatarColor: '#c86bfa',
    name: '澄澄光亮',
    time: '10/31 10:55 PM',
    preview: `海底捞事件，leo说相信你，不要听别人怎么说，最重要的是我们两个怎么相处，不要内耗。
这次，你核心思想只有一句，看你以后怎么做再说？这眼神是在跟自己仇人对话吗？
你们以后是要二搭？你是要让leo给你跪着二搭吗？`,
    detailQuote: '心之所向，素履以往。',
    detailMeta: 'IP Shenzhen, China    Taurus',
  },
  {
    id: 'nf-4',
    avatarColor: '#ff8a3d',
    name: '小红薯6ADCADC',
    time: '10/30 8:15 PM',
    preview: '億軒，本来我這種觀眾是不看内娱偶像的，你之前的偶像形象，我是無緣認識你的。但透過煙灰及直播等，我才看見你。你和彭梓燁的互動，讓我漸漸認識你的性格为人，你們才華及有愛的關係，吸引了我這類的觀眾。你們是很棒的人，加油',
    detailQuote: '慢慢来，比较快。',
    detailMeta: 'IP Hangzhou, China    Scorpio',
  },
  {
    id: 'nf-13',
    avatarColor: '#8f7bff',
    name: '点点叉',
    time: '10/30 6:09 AM',
    preview: 'kk今天做了指甲，追了这么多年星第一次把名字写在指甲上呢！',
    detailQuote: '热爱生活的一万种方式。',
    detailMeta: 'IP Xiamen, China    Pisces',
  },
  {
    id: 'nf-3',
    avatarColor: '#4a9eff',
    name: '小红薯6466D731',
    time: '10/27 2:46 PM',
    preview: 'Kingston一定要爱自己啊！别给不值得的人花💰了',
    detailQuote: '星光不问赶路人。',
    detailMeta: 'IP Beijing, China    Aries',
  },
  {
    id: 'nf-5',
    avatarColor: '#36c5a0',
    name: 'emm小姐姐',
    time: '10/26 1:03 AM',
    preview: '自麽第一人，我看到了啥。左脸好看还是右脸好看？好low的问答！建议你回去重修一下精神文明学😅😅😅',
    detailQuote: '把日子过成诗。',
    detailMeta: 'IP Chengdu, China    Gemini',
  },
  {
    id: 'nf-9',
    avatarColor: '#e05d5d',
    name: 'dirty',
    time: '10/25 5:47 AM',
    preview: '大军双眼皮要不去修复一下吧，太自然了💙💙💙💙💙💙💙',
    detailQuote: '热爱可抵岁月漫长。',
    detailMeta: 'IP Xi\'an, China    Pisces',
  },
  {
    id: 'nf-7',
    avatarColor: '#f2a93b',
    name: '小红薯6670466532',
    time: '10/24 7:20 PM',
    preview: '为什么一直让leo丹麦？啥意思？',
    detailQuote: '且停且忘且随风。',
    detailMeta: 'IP Wuhan, China    Cancer',
  },
  {
    id: 'nf-10',
    avatarColor: '#b0653a',
    name: 'tui34',
    time: '10/22 4:05 PM',
    preview: '什么时候改掉喷口水这个毛病我再回来，直一场播能接一盆水',
    detailQuote: '简单点，生活没那么多观众。',
    detailMeta: 'IP Chongqing, China    Capricorn',
  },
]

/* ============================================================
   开屏页
   ============================================================ */
function Splash() {
  return (
    <div className="red-splash">
      <img className="red-splash-img" src="/red-splash.webp" alt="rednote" />
    </div>
  )
}

/* ============================================================
   首页顶部：消息 + 头像(new) + 频道 tab + 搜索
   ============================================================ */
function HomeHeader({ tab, onTab }: { tab: string; onTab: (t: string) => void }) {
  const tabs = ['Explore', 'Nearby']
  return (
    <header className="red-header">
      <div className="red-topbar">
        <button className="red-msg-btn" aria-label="Messages">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        </button>
        <div className="red-avatar-new">
          <div className="red-mini-avatar-lg" style={{ background: '#e5e5e5' }} />
          <span className="red-new-badge">new</span>
        </div>
        <div className="red-tabs">
          {tabs.map((t) => (
            <button key={t} className={`red-tab${tab === t ? ' is-active' : ''}`} onClick={() => onTab(t)}>
              {t}
            </button>
          ))}
        </div>
        <button className="red-search-btn" aria-label="Search">
          <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="M20.5 20.5l-4.2-4.2" />
          </svg>
        </button>
      </div>
    </header>
  )
}

/* ============================================================
   瀑布流卡片
   ============================================================ */
function HomeCard({ note }: { note: HomeNote }) {
  return (
    <div className="red-card">
      <div className="red-card-imgwrap">
        <div className="red-card-img" style={{ height: note.height }}>
          <img className="red-card-img-inner" src={note.img} loading="lazy" alt="" />
        </div>
        {note.overlay && <div className="red-card-overlay">{note.title}</div>}
        {note.live && (
          <div className="red-live-badge">
            <span className="red-live-dot" />Live
          </div>
        )}
        {note.video && (
          <div className="red-play-badge">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M8 5.5v13l11-6.5z" /></svg>
          </div>
        )}
      </div>
      {!note.overlay && <div className="red-card-title">{note.title}</div>}
      <div className="red-card-footer">
        <span className="red-mini-avatar" style={{ background: note.avatarColor }}>{note.author[0]}</span>
        <span className="red-card-name">{note.author}</span>
        <span className="red-card-likes">
          {note.people ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M4.5 20c.9-3.6 3.9-5.5 7.5-5.5s6.6 1.9 7.5 5.5" />
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20.4l-1.5-1.4C5.4 14.4 2 11.3 2 7.6 2 4.8 4.2 2.6 7 2.6c1.6 0 3.1.7 4.1 1.9l.9 1 .9-1c1-1.2 2.5-1.9 4.1-1.9 2.8 0 5 2.2 5 5 0 3.7-3.4 6.8-8.5 11.4z" />
            </svg>
          )}
          {note.people ?? note.likes}
        </span>
      </div>
    </div>
  )
}

/* ============================================================
   关注·新品发布 横卡
   ============================================================ */
function FollowCard() {
  return (
    <div className="red-follow-card">
      <div className="red-follow-head">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="#ff2442"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8 5.8 21.3l2.4-7.4L2 9.4h7.6z" /></svg>
        <span className="red-follow-label">Following · New release</span>
      </div>
      <div className="red-follow-img">
        <img className="red-follow-img-inner" src="/red-feed/p9.webp" loading="lazy" alt="" />
      </div>
      <div className="red-follow-footer">
        <span className="red-mini-avatar" style={{ background: '#ff8a3d' }}>彭</span>
        <span className="red-follow-author">彭梓燁_Leo</span>
        <span className="red-follow-views">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20.4l-1.5-1.4C5.4 14.4 2 11.3 2 7.6 2 4.8 4.2 2.6 7 2.6c1.6 0 3.1.7 4.1 1.9l.9 1 .9-1c1-1.2 2.5-1.9 4.1-1.9 2.8 0 5 2.2 5 5 0 3.7-3.4 6.8-8.5 11.4z" /></svg>
          11K
        </span>
      </div>
    </div>
  )
}

/* ============================================================
   底部 Tab Bar
   ============================================================ */
function TabBar({ page, onChange }: { page: Page; onChange: (p: Page) => void }) {
  return (
    <nav className="red-tabbar">
      <button className={`red-tabbar-item${page === 'home' ? ' is-active' : ''}`} onClick={() => onChange('home')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /></svg>
        <span>Home</span>
      </button>
      <button className="red-tabbar-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16l-1.2 12.5A1.5 1.5 0 0 1 17.3 21H6.7a1.5 1.5 0 0 1-1.5-1.5L4 7z" /><path d="M9 7V5.5A3 3 0 0 1 12 2.5" /><path d="M15 7V5.5A3 3 0 0 0 12 2.5" /></svg>
        <span>Market</span>
      </button>
      <button className="red-publish-btn" aria-label="Post">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
      </button>
      <button className={`red-tabbar-item${page === 'messages' ? ' is-active' : ''}`} onClick={() => onChange('messages')}>
        <span className="red-tabbar-ico">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
          <span className="red-tabbar-badge">99+</span>
        </span>
        <span>Messages</span>
      </button>
      <button className={`red-tabbar-item${page === 'me' ? ' is-active' : ''}`} onClick={() => onChange('me')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c.8-3.5 4-5.5 8-5.5s7.2 2 8 5.5" /></svg>
        <span>Me</span>
      </button>
    </nav>
  )
}

const EMOJI_RE = /(\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic}|\p{Emoji_Modifier})*)/gu

/** 把 emoji 单独包一层，只拉开 emoji 与相邻文字/emoji 的间距 */
function renderEmojiSpaced(text: string) {
  return text.split(EMOJI_RE).map((part, i) => (i % 2 === 1 ? <span key={i} className="red-emoji">{part}</span> : part))
}

/* ============================================================
   「我」页面 —— Comments / Saves 不可点
   ============================================================ */
function MePage() {
  const subTabs = [
    { key: 'Notes', locked: false },
    { key: 'Comments', locked: true },
    { key: 'Saves', locked: true },
  ]
  // 下滑后顶部收起为：菜单 + 居中头像 + 两个图标
  const [compact, setCompact] = useState(false)

  return (
    <div className={`red-me${compact ? ' is-compact' : ''}`}>
      <div className="red-me-topbar">
        <button className="red-me-menu" aria-label="Menu">
          <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
        </button>
        {compact && <img className="red-me-top-avatar" src="/red-avatar.webp" alt="" />}
        <div className="red-me-actions">
          {!compact && (
            <button className="red-me-edit">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></svg>
              Edit Profile
            </button>
          )}
          <button className="red-me-icon" aria-label="Scan">
            <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" /><path d="M3 12h18" /></svg>
          </button>
          <button className="red-me-icon" aria-label="Share">
            <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" /><path d="M16 6l-4-4-4 4" /><path d="M12 2v14" /></svg>
          </button>
        </div>
      </div>

      <div className="red-me-scroll" onScroll={(e) => setCompact(e.currentTarget.scrollTop > 64)}>
        <div className="red-me-hero">
          <div className="red-me-bg" />
          <div className="red-profile">
            <img className="red-avatar" src="/red-avatar.webp" alt="" />
            <div className="red-profile-info">
              <div className="red-profile-name">
                <span>亿轩_kingston</span>
              </div>
              <div className="red-profile-id">
                <svg width="15" height="15" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#ff2442" /><path d="M7.5 12.2l2.8 2.8 6-6" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                艺人
              </div>
              <div className="red-profile-ip">IP: Beijing</div>
            </div>
          </div>

          <div className="red-stats">
            <div className="red-stat"><b>3</b><span>Following</span></div>
            <div className="red-stat-divider" />
            <div className="red-stat"><b>53.8K</b><span>Followers</span></div>
            <div className="red-stat-divider" />
            <div className="red-stat"><b>168K</b><span>Likes &amp; Saves</span></div>
          </div>

          <div className="red-bio">
            <span className="red-bio-emojis">🕶🎮📼🔌</span><br /><span className="red-bio-mail"><span className="red-bio-mail-icon">✉️</span>yx_official@yeah.net</span>
            <div className="red-bio-gender"><span className="red-gender">♂</span></div>
          </div>

          <div className="red-me-cards">
            <div className="red-me-card">
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
              <div className="red-me-card-title">History</div>
              <div className="red-me-card-sub">看过的笔记</div>
            </div>
            <div className="red-me-card">
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M21 8v6M18 11h6" /></svg>
              <div className="red-me-card-title">Group chats</div>
              <div className="red-me-card-sub">View details</div>
            </div>
            <div className="red-me-card">
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7h-3V5a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1z" /><path d="M9 11h6v6H9z" /></svg>
              <div className="red-me-card-title">Personal Sale</div>
              <div className="red-me-card-sub">Sell &amp; earn</div>
            </div>
          </div>
        </div>

        <div className="red-me-tabs">
          {subTabs.map((t) => (
            <button
              key={t.key}
              className={`red-me-tab${t.key === 'Notes' ? ' is-active' : ' is-locked'}`}
              disabled={t.locked}
            >
              {t.locked && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="10" width="18" height="12" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>}
              {t.key}
            </button>
          ))}
          <button className="red-me-search" aria-label="Search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M20.5 20.5l-4.2-4.2" /></svg>
          </button>
        </div>

        <div className="red-me-masonry">
          {[0, 1].map((col) => (
            <div className="red-me-col" key={col}>
              {ME_NOTES.filter((_, i) => i % 2 === col).map((n) => (
                <div key={n.id} className="red-me-note">
                  <div className={`red-me-note-img${n.wide ? ' is-wide' : ''}`}>
                    <img className="red-me-note-img-inner" src={n.img} loading="lazy" alt="" />
                    <span className="red-me-views">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                      {n.views}
                    </span>
                    {n.isVideo && (
                      <span className="red-me-play">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z" /></svg>
                      </span>
                    )}
                  </div>
                  <div className="red-me-note-title">{renderEmojiSpaced(n.title)}</div>
                  <div className="red-me-note-foot">
                    <img className="red-mini-avatar" src="/red-avatar.webp" alt="" />
                    <div className="red-me-note-meta">
                      <span className="red-me-note-author">亿轩_kingston</span>
                      <span className="red-me-note-time">{n.time}</span>
                    </div>
                    <span className="red-me-note-likes">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20.4l-1.5-1.4C5.4 14.4 2 11.3 2 7.6 2 4.8 4.2 2.6 7 2.6c1.6 0 3.1.7 4.1 1.9l.9 1 .9-1c1-1.2 2.5-1.9 4.1-1.9 2.8 0 5 2.2 5 5 0 3.7-3.4 6.8-8.5 11.4z" /></svg>
                      {n.likes}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   消息主页
   ============================================================ */
/** 消息类型图标：手绘 SVG，图案中间的空隙用图标底色「挖空」 */
function MsgThreadIcon({ type, color }: { type: string; color: string }) {
  if (type === 'event') {
    return (
      <svg width="32" height="32" viewBox="0 0 24 24">
        <rect x="4" y="7" width="16" height="10" rx="2.6" fill="#fff" />
        <path d="M8 16.7l2 2.6 2.1-2.6z" fill="#fff" />
        <rect x="6.9" y="10.2" width="8.3" height="1.7" rx="0.85" fill={color} />
        <rect x="6.9" y="13.3" width="4.6" height="1.7" rx="0.85" fill={color} />
      </svg>
    )
  }
  if (type === 'nonfollow') {
    return (
      <svg width="32" height="32" viewBox="0 0 24 24">
        <circle cx="12" cy="10.8" r="6.3" fill="#fff" />
        <path d="M6.6 15.3l1.2 3.7 3.2-1.8z" fill="#fff" />
        <ellipse cx="12" cy="12.7" rx="2.3" ry="1.15" fill={color} />
      </svg>
    )
  }
  if (type === 'support') {
    return (
      <svg width="32" height="32" viewBox="0 0 24 24">
        <rect x="2.4" y="5.8" width="13" height="10.2" rx="2.7" fill="#fff" />
        <path d="M5.9 15.8l1.7 2.8 2-2.8z" fill="#fff" />
        <ellipse cx="8.6" cy="10.6" rx="1.9" ry="1" fill={color} />
        <circle cx="17.1" cy="14.4" r="4.6" fill="#fff" />
      </svg>
    )
  }
  // system：铃铛
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="#fff">
      <path d="M12 4c-2.7 0-4.9 2.2-4.9 4.9v3.1c0 1.2-.5 2.1-1.4 2.8h12.6c-.9-.7-1.4-1.6-1.4-2.8v-3.1c0-2.7-2.2-4.9-4.9-4.9z" />
      <ellipse cx="12" cy="17.7" rx="1.9" ry="1.2" />
    </svg>
  )
}

function MessagesMain({ onOpenNonFollow, nonFollowUnread }: { onOpenNonFollow: () => void; nonFollowUnread: number }) {
  const topIcons = [
    { label: 'Likes & Saves', color: '#ffe8ec', glyph: <svg width="30" height="30" viewBox="0 0 24 24" fill="#ff2442"><path d="M12 20.4l-1.5-1.4C5.4 14.4 2 11.3 2 7.6 2 4.8 4.2 2.6 7 2.6c1.6 0 3.1.7 4.1 1.9l.9 1 .9-1c1-1.2 2.5-1.9 4.1-1.9 2.8 0 5 2.2 5 5 0 3.7-3.4 6.8-8.5 11.4z" /></svg> },
    { label: 'New followers', color: '#e8f0ff', glyph: <svg width="30" height="30" viewBox="0 0 24 24" fill="#3b7dff"><path d="M16 11c1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3 1.3 3 3 3zM8 11c1.7 0 3-1.3 3-3S9.7 5 8 5 5 6.3 5 8s1.3 3 3 3zm0 2c-2.7 0-8 1.3-8 4v3h16v-3c0-2.7-5.3-4-8-4zm8 0c-.3 0-.7 0-1.1.1 1.3.9 2.1 2.1 2.1 3.9v3h5v-3c0-2.7-3.6-4-6-4z" /></svg> },
    { label: 'Comments & @', color: '#e8f7ee', glyph: <svg width="30" height="30" viewBox="0 0 24 24" fill="#34c759"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg> },
  ]

  const threads: Array<{
    id: string
    iconBg: string
    name: string
    preview: string
    time: string
    dot?: boolean
    clickable?: boolean
    unread?: number
  }> = [
    { id: 'event', iconBg: '#4a9eff', name: 'Event notifications', preview: '刘恋 × 薛凯琪，邀你共赴欲望晚宴', time: 'Tue', dot: true },
    { id: 'nonfollow', iconBg: '#ff6b6b', name: 'Messages from people you don\'t follow', preview: '只想退休的季同学: 这周六北京就要初雪啦～～～这是不是你俩一起看的第一场雪啊～', time: '11/4', clickable: true, unread: nonFollowUnread },
    { id: 'support', iconBg: '#ff8a3d', name: 'Support Messages', preview: '商业合作官方客服：[自助消息]', time: '9/9' },
    { id: 'system', iconBg: '#3b7dff', name: 'System Messages', preview: '举报结果通知', time: '7/25' },
  ]

  return (
    <div className="red-msg-page">
      <header className="red-msg-header">
        <span className="red-msg-title">Messages</span>
        <div className="red-msg-header-actions">
          <button aria-label="Search"><svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M20.5 20.5l-4.2-4.2" /></svg></button>
          <button aria-label="New"><svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg></button>
        </div>
      </header>

      <div className="red-msg-scroll">
        <div className="red-msg-topicons">
          {topIcons.map((ic) => (
            <button key={ic.label} className="red-msg-topicon" disabled>
              <div className="red-msg-topicon-wrap">
                <div className="red-msg-topicon-icon" style={{ background: ic.color }}>{ic.glyph}</div>
                <span className="red-badge-99">99+</span>
              </div>
              <span className="red-msg-topicon-label">{ic.label}</span>
            </button>
          ))}
        </div>

        <div className="red-msg-threads">
          {threads.map((t) => (
            <button
              key={t.id}
              className={`red-msg-thread${t.clickable ? ' is-clickable' : ''}`}
              disabled={!t.clickable}
              onClick={t.clickable ? onOpenNonFollow : undefined}
            >
              <div className="red-msg-thread-icon" style={{ background: t.iconBg }}>
                <MsgThreadIcon type={t.id} color={t.iconBg} />
              </div>
              <div className="red-msg-thread-body">
                <div className="red-msg-thread-head">
                  <span className="red-msg-thread-name">{t.name}</span>
                  <span className="red-msg-thread-time">{t.time}</span>
                </div>
                <div className="red-msg-thread-preview">{t.preview}</div>
              </div>
              {t.unread ? <span className="red-msg-unread">{t.unread}</span> : null}
              {t.dot && <span className="red-msg-dot" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   未关注人消息列表
   ============================================================ */
function NonFollowList({ msgs, deletingId, isClosing, readIds, onBack, onOpen, onDelete }: { msgs: NonFollowMsg[]; deletingId: string | null; isClosing: boolean; readIds: Set<string>; onBack: () => void; onOpen: (id: string) => void; onDelete: (id: string) => void }) {
  return (
    <div className={`red-msg-page red-nonfollow-overlay${isClosing ? ' is-closing' : ''}`}>
      <header className="red-msg-subheader">
        <button className="red-back-btn" onClick={onBack}>
          <svg width="13" height="21" viewBox="0 0 8 14" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 1L1 7l6 6" /></svg>
        </button>
        <span className="red-msg-subtitle">Messages from people you don't follow</span>
        <div className="red-msg-sub-actions">
          <span aria-label="Clear" className="red-msg-action-disabled"><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M10.3 3.8h3.4v3.7H17a2.8 2.8 0 0 1 2.8 2.8v7.4a2.8 2.8 0 0 1-2.8 2.8H7a2.8 2.8 0 0 1-2.8-2.8v-7.4A2.8 2.8 0 0 1 7 7.5h3.3V3.8z" /><path d="M4.2 11.4h15.6" /><path d="M10 20.5v-3.4" /></svg></span>
          <button aria-label="More"><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round"><circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" /></svg></button>
        </div>
      </header>

      <div className="red-msg-scroll">
        {msgs.length === 0 ? (
          <div className="red-nf-empty">
            <img className="red-nf-empty-img" src="/red-empty.webp" alt="" />
            <div className="red-nf-empty-text">No messages yet</div>
          </div>
        ) : (
          msgs.map((m) => (
            <div key={m.id} className={`red-nf-item${deletingId === m.id ? ' is-deleting' : ''}`} onClick={() => onOpen(m.id)}>
              <div className="red-nf-avatar" style={{ background: m.avatarColor }} />
              <div className="red-nf-body">
                <div className="red-nf-head">
                  <span className="red-nf-name">{m.name}</span>
                  <span className="red-nf-time">{m.time}</span>
                </div>
                <div className="red-nf-preview">{m.preview}</div>
                <div className="red-nf-actions">
                  <button className="red-nf-reply" disabled>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
                    Reply
                  </button>
                  <button
                    className="red-nf-close"
                    onClick={(e) => { e.stopPropagation(); onDelete(m.id) }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
              {!readIds.has(m.id) && <span className="red-nf-unread" aria-label="unread">1</span>}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

/* ============================================================
   消息详情
   ============================================================ */
function MessageDetail({ msg, onBack, onDelete, isClosing }: { msg: NonFollowMsg; onBack: () => void; onDelete: () => void; isClosing: boolean }) {
  return (
    <div className={`red-msg-page red-detail-overlay${isClosing ? ' is-closing' : ''}`}>
      <header className="red-msg-subheader">
        <button className="red-back-btn" onClick={onBack}>
          <svg width="13" height="21" viewBox="0 0 8 14" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 1L1 7l6 6" /></svg>
        </button>
        <div className="red-detail-head">
          <div className="red-detail-avatar" style={{ background: msg.avatarColor }} />
          <span className="red-detail-name">{msg.name}</span>
        </div>
        <button aria-label="More" className="red-detail-more">
          <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round"><circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" /></svg>
        </button>
      </header>

      <div className="red-detail-scroll">
        <div className="red-detail-profile">
          <div className="red-detail-big-avatar" style={{ background: msg.avatarColor }} />
          <div className="red-detail-profile-name">
            {msg.name}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
          </div>
          <div className="red-detail-quote">{msg.detailQuote}</div>
          <div className="red-detail-meta">{msg.detailMeta}</div>
        </div>

        <div className="red-detail-time">{msg.time}</div>

        <div className="red-detail-msg">{msg.preview}</div>
      </div>

      <div className="red-detail-actions-bar">
        <button className="red-detail-action" disabled>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="9" /><path d="M15.5 8.5l-5 7M8.5 8.5l5 7" /></svg>
          Block
        </button>
        <button className="red-detail-action" disabled>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></svg>
          Report
        </button>
        <button className="red-detail-action" onClick={onDelete}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>
          Delete a ···
        </button>
      </div>

      <div className="red-detail-input-bar">
        <button className="red-input-mic"><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.7"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4" /></svg></button>
        <div className="red-input-field">Say something...</div>
        <button className="red-input-smile"><svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.7"><circle cx="12" cy="12" r="9" /><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" /></svg></button>
        <button className="red-input-plus"><svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.7"><path d="M12 5v14M5 12h14" /></svg></button>
      </div>
    </div>
  )
}

/* ============================================================
   删除确认底部弹窗
   ============================================================ */
function ConfirmSheet({ text, onOk, onCancel }: { text: string; onOk: () => void; onCancel: () => void }) {
  return (
    <div className="red-confirm-mask" onClick={onCancel}>
      <div className="red-confirm-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="red-confirm-text">{text}</div>
        <button className="red-confirm-ok" onClick={onOk}>OK</button>
        <div className="red-confirm-divider" />
        <button className="red-confirm-cancel" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}

/* ============================================================
   rednote 主组件
   ============================================================ */
interface RedProps {
  /** 个人主页（深色底）时通知外层把状态栏文字转白 */
  onDarkStatusChange?: (dark: boolean) => void
}

export function Red({ onDarkStatusChange }: RedProps) {
  const [showSplash, setShowSplash] = useState(true)
  const [page, setPage] = useState<Page>('home')
  const [tab, setTab] = useState('Explore')
  const [msgView, setMsgView] = useState<MsgView>('main')
  const [activeMsgId, setActiveMsgId] = useState<string | null>(null)
  const [nonFollowMsgs, setNonFollowMsgs] = useState<NonFollowMsg[]>(NON_FOLLOW_MSGS)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [showDetailDelete, setShowDetailDelete] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [detailClosing, setDetailClosing] = useState(false)
  const [nonfollowClosing, setNonfollowClosing] = useState(false)
  /** 已读消息 id 集合：点进详情后标记，该条未读红标消失、外部未读数减 1 */
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  /** 未读数由剩余未读消息推导：点开看（标记已读）或未看就删除都会自动减 */
  const nonFollowUnread = nonFollowMsgs.filter((m) => !readIds.has(m.id)).length

  const markRead = useCallback((id: string) => {
    setReadIds((prev) => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 1800)
    return () => clearTimeout(t)
  }, [])

  const activeMsg = nonFollowMsgs.find((m) => m.id === activeMsgId)

  const removeMsgAfterAnim = (id: string) => {
    setDeletingId(id)
    setTimeout(() => {
      setNonFollowMsgs((prev) => prev.filter((m) => m.id !== id))
      setDeletingId(null)
    }, 280)
  }

  const handleDeleteFromList = (id: string) => {
    setDeleteTargetId(null)
    removeMsgAfterAnim(id)
  }

  const handleDeleteFromDetail = () => {
    setShowDetailDelete(false)
    const id = activeMsgId
    setActiveMsgId(null)
    setMsgView('nonfollow')
    // 先回到列表渲染出该条，下一帧再加 is-deleting 触发 transition
    if (id) requestAnimationFrame(() => requestAnimationFrame(() => removeMsgAfterAnim(id)))
  }

  const handleBackFromDetail = () => {
    setDetailClosing(true)
    setTimeout(() => {
      setMsgView('nonfollow')
      setDetailClosing(false)
    }, 260)
  }

  const handleBackFromNonFollow = () => {
    setNonfollowClosing(true)
    setTimeout(() => {
      setMsgView('main')
      setNonfollowClosing(false)
    }, 260)
  }

  // 「我」页为深色底：同步外层状态栏颜色（替代原先的 :has(.red-on-dark)）
  useEffect(() => {
    onDarkStatusChange?.(page === 'me')
  }, [page, onDarkStatusChange])

  return (
    <div className={`red ios-app${page === 'me' ? ' red-on-dark' : ''}`}>
      {showSplash ? (
        <Splash />
      ) : (
        <>
          {page === 'home' && (
            <>
              <HomeHeader tab={tab} onTab={setTab} />
              <div className="ios-scroll red-scroll">
                <div className="red-masonry">
                  {[0, 1].map((col) => (
                    <div key={col} className="red-col">
                      {col === 0 && <FollowCard />}
                      {HOME_NOTES.filter((_, i) => i % 2 === col).map((n) => (
                        <HomeCard key={n.id} note={n} />
                      ))}
                    </div>
                  ))}
                </div>
                <div className="red-bottom-space" />
              </div>
            </>
          )}

          {page === 'me' && <MePage />}

          {page === 'messages' && (
            <MessagesMain onOpenNonFollow={() => setMsgView('nonfollow')} nonFollowUnread={nonFollowUnread} />
          )}
          {(msgView === 'nonfollow' || msgView === 'detail') && (
            <NonFollowList
              msgs={nonFollowMsgs}
              deletingId={deletingId}
              isClosing={nonfollowClosing}
              readIds={readIds}
              onBack={handleBackFromNonFollow}
              onOpen={(id) => { markRead(id); setActiveMsgId(id); setMsgView('detail') }}
              onDelete={(id) => setDeleteTargetId(id)}
            />
          )}
          {page === 'messages' && msgView === 'detail' && activeMsg && (
            <MessageDetail
              msg={activeMsg}
              isClosing={detailClosing}
              onBack={handleBackFromDetail}
              onDelete={() => setShowDetailDelete(true)}
            />
          )}

          {deleteTargetId && (
            <ConfirmSheet
              text="All chat history will be cleared after deletion"
              onOk={() => handleDeleteFromList(deleteTargetId)}
              onCancel={() => setDeleteTargetId(null)}
            />
          )}
          {showDetailDelete && (
            <ConfirmSheet
              text="Chat deleted, all records cleared"
              onOk={handleDeleteFromDetail}
              onCancel={() => setShowDetailDelete(false)}
            />
          )}

          <TabBar page={page} onChange={(p) => { setPage(p); if (p === 'messages') setMsgView('main') }} />
        </>
      )}
    </div>
  )
}
