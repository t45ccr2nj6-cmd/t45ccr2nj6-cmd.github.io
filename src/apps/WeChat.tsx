import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  useStoryState,
  startChatScript,
  sendMeMessage,
  setViewingChat,
  clearUnread,
  clearOpenChatRequest,
} from '@/data/story'
import { KINGSTON_SCRIPT, type StoryStep } from '@/data/kingstonScript'
import { CHAT2_SCRIPT } from '@/data/chat2Script'
import { SINGLEE_SCRIPT } from '@/data/singleeScript'
import './WeChat.css'

/* ============================================================
   数据类型与占位数据（群聊 / 联系人 / 微信号之后由用户给定）
   ============================================================ */
interface WxMsg {
  id: string
  /** 繁体（默认显示） */
  text: string
  /** 简体版本：有值时点气泡可切换 */
  simp?: string
  /** 表情包图片（此时忽略 text） */
  sticker?: string
  /** 图片消息（按原始比例显示） */
  photo?: string
  /** 文件/文档截图：略宽一些 */
  filePhoto?: boolean
  time?: string
  out: boolean
  /** 群聊里发言者昵称（仅收到的群消息用） */
  sender?: string
  /** 系统提示（灰色小字居中，如「你已添加了…」） */
  sys?: boolean
  /** 只显示居中的时间气泡（没有消息气泡） */
  timeOnly?: boolean
}

interface WxChat {
  id: string
  name: string
  /** 单头像：渐变底色 + 首字 */
  color: string
  initial: string
  /** 图片头像（优先于纯色） */
  img?: string
  /** 内置应用图标（微信运动 / 文件传输助手 / 微信团队） */
  appIcon?: 'werun' | 'file' | 'team'
  /** 群聊九宫格头像（多宫格） */
  groupColors?: string[]
  /** 群成员（用于拼九宫格头像，以及群消息的发言者头像） */
  groupMembers?: Array<{ name: string; avatar: string }>
  preview: string
  time: string
  unread?: number
  muted?: boolean
  isGroup?: boolean
  /** 置顶会话 */
  pinned?: boolean
  /** 设为 true 后列表里不可点开 */
  locked?: boolean
  messages: WxMsg[]
}

const PALETTE = ['#5b8def', '#f2a93b', '#36c5a0', '#e05d5d', '#7c5cff', '#ff6b9d', '#4a9eff', '#8a8f99', '#c86bfa']

const CHATS: WxChat[] = [
  {
    id: 'jy',
    name: '史上最勁抽無敵霹靂靚仔',
    color: '',
    initial: '',
    img: '/wechat/avatar-p1.webp',
    preview: '我好快就返嚟啦',
    time: '11/4',
    pinned: true,
    // 默认显示繁体，点气泡切换简体（simp）
    messages: [
      { id: 'j01', text: 'Leo', out: false, time: '10/12/2026 11:42 PM' },
      { id: 'j02', text: '瞓唔着', simp: '睡不着', out: false },
      { id: 'j03', text: '我咪喺你隔篱咩', simp: '我就在你旁边', out: true },
      { id: 'j04', text: '做咩要喺WeChat讲啫', simp: '为什么发微信说', out: true },
      { id: 'j05', text: '咁你唔好覆我囉', simp: '那你别回我', out: false },
      { id: 'j06', text: '我点会唔覆你啊', simp: '要回的', out: true },
      { id: 'j07', text: '哦', out: false },
      { id: 'j08', text: '记唔记得你之前讲过嗰个故仔', simp: '你之前讲的那个故事', out: false },
      { id: 'j09', text: '大灰狼同小绵羊嗰个', simp: '大灰狼和小绵羊的', out: false },
      { id: 'j10', text: '点呀', simp: '怎么了', out: true },
      { id: 'j11', text: '你仲争个结局未讲喎', simp: '你还没讲完', out: false },
      { id: 'j12', text: '讲完啦啩', simp: '讲完了吧', out: true },
      { id: 'j13', text: '边有啊', simp: '没有', out: false },
      { id: 'j14', text: '咁小绵羊之后点呀', simp: '小绵羊后来呢', out: false },
      { id: 'j15', text: '之后就一直陪住大灰狼囉', simp: '后来一直和大灰狼在一起', out: true },
      { id: 'j16', text: '就咁㗎啦？', simp: '就这样？', out: false },
      { id: 'j17', text: '系啊', simp: '嗯', out: true },
      { id: 'j18', text: '咁你想佢哋之后点呀', simp: '你希望他们后来怎么样', out: true },
      { id: 'j19', text: '明明系你讲故事俾我听喎', simp: '不是你讲故事给我听吗', out: false },
      { id: 'j20', text: '你都可以讲埋落去㗎', simp: '你也可以讲呀', out: true },
      { id: 'j21', text: '我就系想听你讲嘛', simp: '我要听续集', out: false },
      { id: 'j22', text: '听日再讲俾你听', simp: '明天给你讲', out: true },
      { id: 'j23', text: '早d瞓啦，小绵羊', simp: '早点睡，小绵羊', out: true },

      { id: 'j24', text: '今日出门嗰阵都冇锡我', simp: '今天出门的时候没亲我', out: false, time: '10/18/2026 9:26 AM' },
      { id: 'j25', text: '想点呀', simp: '想怎', out: false },
      { id: 'j26', text: '我只系出去攞快递啫', simp: '我只是出去拿快递了', out: true, time: '10/18/2026 9:41 AM' },
      { id: 'j27', text: '返嚟补锡返你啦', simp: '回来补上', out: true },

      { id: 'j28', text: 'Kingston仲未换好衫呀', simp: 'Kingston衣服还没换好吗', out: true, time: '10/23/2026 10:23 AM' },
      { id: 'j29', text: '要出门啦軒軒', simp: '要出门了轩轩', out: true, time: '10/23/2026 10:38 AM' },
      { id: 'j30', text: '佢哋催紧啦bb', simp: '她们来催了bb', out: true, time: '10/23/2026 10:52 AM' },
      { id: 'j31', text: '嚟啦', simp: '来啦', out: false },
      { id: 'j32', text: '彭梓烨你好恶喎', simp: '好凶啊彭梓烨', out: false },
      { id: 'j33', text: '有咩？', simp: '有吗？', out: true },
      { id: 'j34', text: '有咁恶咩？', simp: '还好吧？', out: true },
      { id: 'j35', text: '有', out: false },
      { id: 'j36', text: '', sticker: '/wechat/sticker-1.webp', out: true },
      { id: 'j37', text: '阵间锡返你', simp: '一会补偿你', out: true },

      { id: 'j38', text: '我就快返到嚟啦', simp: '我马上回来了', out: false, time: '10/27/2026 5:38 PM' },
      { id: 'j39', text: '今晚想食咩', simp: '晚饭想吃什么', out: false },
      { id: 'j40', text: '想食', simp: '想吃', out: true },
      { id: 'j41', text: '三文治', simp: '三明治', out: true },
      { id: 'j42', text: '👌', out: false },
      { id: 'j43', text: '', sticker: '/wechat/sticker-2.webp', out: false },
      { id: 'j44', text: '', sticker: '/wechat/sticker-3.webp', out: true },

      { id: 'j45', text: '', sticker: '/wechat/sticker-4.webp', out: false, time: '10/31/2026 2:15 PM' },
      { id: 'j46', text: '', sticker: '/wechat/sticker-5.webp', out: true },

      { id: 'j47', text: 'Leo', out: false, time: '11/4/2026 8:47 PM' },
      { id: 'j48', text: 'Leo？', out: false },
      { id: 'j49', text: '彭梓燁', simp: '彭梓烨', out: false },
      { id: 'j50', text: '彭梓燁？', simp: '彭梓烨？', out: false },
      { id: 'j51', text: '做咩呀，Kingston', simp: '怎么了Kingston', out: true },
      { id: 'j52', text: '冇嘢', simp: '没事', out: false },
      { id: 'j53', text: '咪叫下你囉', simp: '就叫叫你', out: false },
      { id: 'j54', text: '我好快就返嚟啦', simp: '我很快就回来了', out: true },
    ],
  },
  {
    id: 'team',
    name: 'Weixin Team',
    color: '#07c160',
    initial: '',
    appIcon: 'team',
    preview: 'Weixin Security Alert',
    time: 'Yesterday',
    locked: true,
    messages: [{ id: 't1', text: 'Weixin Security Alert', out: false }],
  },
  {
    id: 'werun',
    name: 'WeRun',
    color: '#07c160',
    initial: '',
    appIcon: 'werun',
    preview: '[App Message]',
    time: 'Yesterday',
    locked: true,
    messages: [{ id: 'w1', text: '[App Message]', out: false }],
  },
  {
    id: 'file',
    name: 'File Transfer',
    color: '#07c160',
    initial: '',
    appIcon: 'file',
    preview: '[Photo]',
    time: 'Yesterday',
    messages: [{ id: 'f1', text: '', photo: '/wechat/file-transfer.webp', out: true, time: '11/3/2026 3:26 PM' }],
  },
  {
    id: 'ctbz',
    name: 'CTBZ',
    color: '',
    initial: '',
    groupColors: PALETTE.slice(0, 9),
    preview: '史上最勁抽無敵霹靂靚仔：ok',
    time: '11/4',
    isGroup: true,
    groupMembers: [
      { name: '朝阳', avatar: '/wechat/m-chaoyang.webp' },
      { name: '人民', avatar: '/wechat/m-renmin.webp' },
      { name: '群众', avatar: '/wechat/m-qunzhong.webp' },
      { name: 'Sweetie', avatar: '/wechat/m-sweetie.webp' },
      { name: 'singlee', avatar: '/wechat/m-singlee.webp' },
      { name: '史上最勁抽無敵霹靂靚仔', avatar: '/wechat/m-kingston.webp' },
      { name: '我', avatar: '/wechat/me.webp' },
    ],
    messages: [
      { id: 'c01', text: '@所有人 老师们查收一下用语规范，务必仔细阅读～', out: false, sender: '朝阳', time: '10/8/2026 4:12 PM' },
      { id: 'c02', text: '', out: false, sender: '朝阳', photo: '/wechat/file-1.webp', filePhoto: true },
      { id: 'c03', text: '哦坤', out: false, sender: 'singlee' },
      { id: 'c04', text: '👌', out: false, sender: '史上最勁抽無敵霹靂靚仔' },
      { id: 'c05', text: '收到', out: true },

      { id: 'c06', text: '@singlee 下播之后我们线上开个小会～', out: false, sender: 'Sweetie', time: '10/10/2026 9:23 PM' },
      { id: 'c07', text: '', out: false, sender: 'singlee', sticker: '/wechat/sticker-6.webp', time: '10/10/2026 10:11 PM' },

      { id: 'c08', text: '@ziyip.l 你係咪删咗我个指纹啊😡', simp: '@ziyip.l 你是不是把我指纹删了😡', out: false, sender: 'singlee', time: '10/16/2026 11:08 PM' },
      { id: 'c09', text: '删咗咪删咗咯', simp: '删了就删了吧', out: false, sender: '史上最勁抽無敵霹靂靚仔' },
      { id: 'c10', text: '你想上嚟玩就叫我哋帮你开门', simp: '你要上来玩就叫我们给你开门', out: false, sender: '史上最勁抽無敵霹靂靚仔' },
      { id: 'c11', text: '你做咩帮佢讲话啊！', simp: '你怎么帮他说话！', out: false, sender: 'singlee' },
      { id: 'c12', text: 'Kingston梗系帮我啦', simp: 'Kingston肯定帮我呀', out: true },
      { id: 'c13', text: '😉', out: false, sender: '史上最勁抽無敵霹靂靚仔' },

      { id: 'c14', text: '@singlee 我哋买咗奶茶返嚟俾你', simp: '@singlee 我们给你带了奶茶回来', out: false, sender: '史上最勁抽無敵霹靂靚仔', time: '10/19/2026 8:14 PM' },
      { id: 'c15', text: '挂咗喺门柄度啦', simp: '挂在门把手上了', out: false, sender: '史上最勁抽無敵霹靂靚仔' },
      { id: 'c16', text: '多谢Kingston🥺', simp: '谢谢Kingston🥺', out: false, sender: 'singlee' },
      { id: 'c17', text: '唔使客气', simp: '不用谢', out: true },
      { id: 'c18', text: '9', out: false, sender: 'singlee' },

      { id: 'c19', text: '@所有人 老师们，明天下午1点车来接，先去做妆造～', out: false, sender: '朝阳', time: '10/21/2026 9:12 PM' },
      { id: 'c20', text: '@singlee 不要迟到哦～', out: false, sender: 'Sweetie' },
      { id: 'c21', text: '我哪会迟到', out: false, sender: 'singlee' },
      { id: 'c22', text: '每次都是我等他们俩😃', out: false, sender: 'singlee' },
      { id: 'c23', text: '👌', out: false, sender: '史上最勁抽無敵霹靂靚仔' },
      { id: 'c24', text: '收到', out: true },
      { id: 'c25', text: '是我比较慢，让Kingston等我了🥺', out: true },
      { id: 'c26', text: '还好吧', out: false, sender: '史上最勁抽無敵霹靂靚仔' },
      { id: 'c27', text: '我有时候也弄很久', out: false, sender: '史上最勁抽無敵霹靂靚仔' },
      { id: 'c28', text: '。', out: false, sender: 'singlee' },

      { id: 'c29', text: '@所有人 老师们查收一下11月日历，微博需同步一下～', out: false, sender: '人民', time: '11/3/2026 3:26 PM' },
      { id: 'c30', text: '', out: false, sender: '人民', photo: '/wechat/photo-1.webp' },
      { id: 'c31', text: '', out: false, sender: '人民', photo: '/wechat/photo-2.webp' },
      { id: 'c32', text: '', out: false, sender: '人民', photo: '/wechat/photo-3.webp' },
      { id: 'c33', text: '哦坤', out: false, sender: 'singlee' },
      { id: 'c34', text: '', out: false, sender: 'singlee', sticker: '/wechat/sticker-7.webp' },
      { id: 'c35', text: '课会不会有点太少了', out: false, sender: 'singlee' },
      { id: 'c36', text: '@ziyip.l @kingstooo_n 你们两个', out: false, sender: 'singlee' },
      { id: 'c37', text: '谁想代替我上课，名额9块9便宜卖', out: false, sender: 'singlee' },
      { id: 'c38', text: '你给我一百万，我替你上', out: false, sender: '史上最勁抽無敵霹靂靚仔' },
      { id: 'c39', text: 'Kingston去我就去🥺', out: true },
      { id: 'c40', text: '🫰', out: false, sender: '史上最勁抽無敵霹靂靚仔' },
      { id: 'c41', text: '。。。开你俩的见面会吧', out: false, sender: 'singlee' },

      { id: 'c42', text: '@ziyip.l @kingstooo_n 两位老师，由于欧莱雅look1的品牌方存在争议，需要删除相关微博～', out: false, sender: '人民', time: '11/4/2026 11:02 AM' },
      { id: 'c43', text: '👌', out: false, sender: '史上最勁抽無敵霹靂靚仔' },
      { id: 'c44', text: '收到', out: true },
      { id: 'c45', text: '@kingstooo_n 品牌官宣帖也需要删除～', out: false, sender: '人民' },
      { id: 'c46', text: 'ok', out: false, sender: '史上最勁抽無敵霹靂靚仔' },
    ],
  },
  {
    id: 'singlee',
    name: 'singlee',
    color: '',
    initial: '',
    img: '/wechat/m-singlee.webp',
    preview: '我系阿Sing',
    time: '10/13',
    messages: [
      { id: 'n1', text: '我系阿Sing', out: false, time: '10/13/2026 9:41 PM' },
      { id: 'n2', text: "You've added singlee. Greetings are shown above.", out: false, sys: true },
    ],
  },
  {
    id: 'sweetie',
    name: 'Sweetie',
    color: '',
    initial: '',
    img: '/wechat/m-sweetie.webp',
    preview: '好',
    time: '9/14',
    messages: [
      { id: 's01', text: '确定都处理好了？', out: false, time: '9/14/2026 7:42 PM' },
      { id: 's02', text: '嗯', out: true },
      { id: 's03', text: '哎', out: false },
      { id: 's04', text: '一会直播好好说就行了', out: false },
      { id: 's05', text: '好', out: true },
    ],
  },
]

interface WxContact {
  name: string
  color: string
  initial: string
  img?: string
  /** 内置应用头像（文件传输助手 / 微信团队等） */
  appIcon?: 'werun' | 'file' | 'team'
}

const CONTACT_GROUPS: Array<{ letter: string; items: WxContact[] }> = [
  {
    letter: 'F',
    items: [{ name: 'File Transfer', color: '#07c160', initial: '', appIcon: 'file' }],
  },
  {
    letter: 'S',
    items: [
      { name: 'singlee', color: '', initial: '', img: '/wechat/m-singlee.webp' },
      { name: 'Sweetie', color: '', initial: '', img: '/wechat/m-sweetie.webp' },
      { name: '史上最勁抽無敵霹靂靚仔', color: '', initial: '', img: '/wechat/avatar-p1.webp' },
    ],
  },
  {
    letter: 'W',
    items: [{ name: 'Weixin Team', color: '#07c160', initial: '', appIcon: 'team' }],
  },
  {
    letter: 'Z',
    items: [{ name: 'ziyip.l', color: '', initial: '', img: '/wechat/me.webp' }],
  },
]

/* ============================================================
   通用小部件
   ============================================================ */
/** 单方头像（圆角矩形渐变 + 首字） */
function WxAvatar({ color, initial, size = 46 }: { color: string; initial: string; size?: number }) {
  return (
    <span className="wx-avatar" style={{ background: color, width: size, height: size, fontSize: size * 0.38, borderRadius: size * 0.14 }}>
      {initial}
    </span>
  )
}

/** 群聊九宫格头像：有成员照片时用照片拼，否则用纯色块 */
function WxGroupAvatar({ chat, size = 46 }: { chat: WxChat; size?: number }) {
  const members = chat.groupMembers?.slice(0, 9)
  const colors = (chat.groupColors ?? []).slice(0, 9)
  return (
    <span className="wx-group-avatar" style={{ width: size, height: size, borderRadius: size * 0.14 }}>
      {members
        ? members.map((m, i) => <img key={i} src={m.avatar} alt="" />)
        : colors.map((c, i) => <span key={i} style={{ background: c }} />)}
    </span>
  )
}

/** 图片头像 */
function WxImgAvatar({ src, size = 46 }: { src: string; size?: number }) {
  return <img className="wx-avatar wx-avatar-img" src={src} alt="" style={{ width: size, height: size, borderRadius: size * 0.14 }} />
}

/** 内置应用头像：微信运动 / 微信团队（同款双气泡）/ 文件传输助手（文件夹） */
function WxAppAvatar({ kind, size = 46 }: { kind: 'werun' | 'file' | 'team'; size?: number }) {
  return (
    <span className="wx-app-avatar" style={{ width: size, height: size, borderRadius: size * 0.14 }}>
      {kind === 'werun' || kind === 'team' ? (
        <svg viewBox="0 0 32 32" width={size * 0.76} height={size * 0.76}>
          <g fill="#fff">
            <ellipse cx="12.6" cy="12.8" rx="8.7" ry="7.3" />
            <path d="M8.4 18l-2.5 4.3 5-1.9z" />
            <ellipse cx="21.3" cy="20.8" rx="6.3" ry="5.2" />
            <path d="M24.2 24.2l2 3.5-4-1.5z" />
          </g>
          <g fill="#07c160">
            <circle cx="9.7" cy="11" r="1.25" />
            <circle cx="15.5" cy="11" r="1.25" />
            <circle cx="19.1" cy="19.4" r="1" />
            <circle cx="23.5" cy="19.4" r="1" />
          </g>
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width={size * 0.72} height={size * 0.72}>
          <path
            d="M3.7 6.2h5.4l1.9 2.2h9.1c1 0 1.8.8 1.8 1.8v8.3c0 1-.8 1.8-1.8 1.8H3.7c-1 0-1.8-.8-1.8-1.8V8c0-1 .8-1.8 1.8-1.8z"
            fill="#fff"
          />
          <path d="M10.3 13.4h4.6M13 11.5l1.9 1.9-1.9 1.9" fill="none" stroke="#07c160" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  )
}

function ChatAvatar({ chat, size = 46 }: { chat: WxChat; size?: number }) {
  if (chat.img) return <WxImgAvatar src={chat.img} size={size} />
  if (chat.appIcon) return <WxAppAvatar kind={chat.appIcon} size={size} />
  return chat.groupColors || chat.groupMembers ? <WxGroupAvatar chat={chat} size={size} /> : <WxAvatar color={chat.color} initial={chat.initial} size={size} />
}

function ChevronRight() {
  return (
    <svg className="wx-chevron" width="9" height="15" viewBox="0 0 8 14" fill="none" stroke="#c8c8cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 1l6 6-6 6" />
    </svg>
  )
}

/** 静音小铃铛 */
function MuteIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#b2b2b2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4a5 5 0 0 1 5 5v3l1.6 3H5.6L7 12V9a5 5 0 0 1 5-5z" />
      <path d="M10 18a2 2 0 0 0 4 0" />
      <path d="M3.5 3.5l17 17" />
    </svg>
  )
}

/** 页头（Weixin / Contacts / Discover） */
function WxHeader({ title }: { title: string }) {
  return (
    <header className="wx-header">
      <h1 className="wx-header-title">{title}</h1>
      <div className="wx-header-actions">
        <span className="wx-header-icon" aria-label="Search">
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="M20.5 20.5l-4.2-4.2" />
          </svg>
        </span>
        <span className="wx-header-icon" aria-label="Add">
          <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.6">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v8M8 12h8" strokeLinecap="round" />
          </svg>
        </span>
      </div>
    </header>
  )
}

/* ============================================================
   Tab 1：微信（会话列表）
   ============================================================ */
function ChatsPage({ chats, onOpen }: { chats: WxChat[]; onOpen: (id: string) => void }) {
  const story = useStoryState()

  /** 剧情会话的实时消息（全部存在全局状态里，离开聊天也会继续） */
  const liveMsgsOf = (c: WxChat) => {
    if (c.id === 'jy' && story.calledKingston) return story.jyMsgs
    if (c.id === 'singlee' && story.singStarted) return story.singMsgs
    return null
  }

  /** 会话列表预览：统一显示该会话最后一条消息 */
  const previewOf = (c: WxChat) => {
    const live = liveMsgsOf(c)
    if (live) {
      for (let i = live.length - 1; i >= 0; i -= 1) {
        const m = live[i]
        if (m.kind !== 'time') return m.text
      }
      return c.preview
    }
    for (let i = c.messages.length - 1; i >= 0; i -= 1) {
      const last = c.messages[i]
      if (last.sys) continue
      if (last.sticker) return '[Sticker]'
      if (last.photo) return '[Photo]'
      const sender = c.isGroup && last.sender ? `${last.sender}：` : ''
      return `${sender}${last.text}`
    }
    return c.preview
  }

  /** 会话列表右侧时间：同样跟随最后一条消息 */
  const timeOf = (c: WxChat) => {
    const live = liveMsgsOf(c)
    if (live) {
      for (let i = live.length - 1; i >= 0; i -= 1) {
        const m = live[i]
        if (m.kind === 'time') return m.text
      }
    }
    for (let i = c.messages.length - 1; i >= 0; i -= 1) {
      const raw = c.messages[i].time
      const m = raw ? /^(\d{1,2})\/(\d{1,2})\/2026/.exec(raw) : null
      if (m) return `${Number(m[1])}/${Number(m[2])}`
    }
    return c.time
  }

  /** 各会话未读数 */
  const unreadOf = (c: WxChat) => (c.id === 'singlee' ? story.unread.singlee : c.id === 'jy' ? story.unread.jy : 0)

  return (
    <div className="wx-page">
      <WxHeader title="Weixin" />
      <div className="wx-scroll">
        {chats.map((c) => (
          <button
            key={c.id}
            className={`wx-chat-row${c.pinned ? ' is-pinned' : ''}${c.locked ? ' is-locked' : ''}`}
            onClick={() => { if (!c.locked) onOpen(c.id) }}
          >
            <span className="wx-chat-avatar-wrap">
              <ChatAvatar chat={c} />
              {!!c.unread && !c.muted && <span className="wx-badge">{c.unread}</span>}
              {!!c.unread && c.muted && <span className="wx-dot" />}
            </span>
            <span className="wx-chat-main">
              <span className="wx-chat-top">
                <span className="wx-chat-name">{c.name}</span>
                <span className="wx-chat-time">{timeOf(c)}</span>
              </span>
              <span className="wx-chat-bottom">
                <span className="wx-chat-preview">{previewOf(c)}</span>
                {c.muted && <MuteIcon />}
                {unreadOf(c) > 0 && <span className="wx-unread">{unreadOf(c)}</span>}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ============================================================
   Tab 2：通讯录
   ============================================================ */
function ContactsPage() {
  const quick = [
    {
      label: 'New Friends',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="10" cy="8" r="3.4" />
          <path d="M4 19c.8-3 3-4.6 6-4.6s5.2 1.6 6 4.6M18.5 8.5v5M16 11h5" />
        </svg>
      ),
      bg: '#f5a623',
    },
    {
      label: 'Group Chats',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="8.4" r="3.2" />
          <path d="M3.4 18.8c.7-2.8 2.8-4.3 5.6-4.3s4.9 1.5 5.6 4.3" />
          <path d="M15.5 5.6a3.2 3.2 0 0 1 0 5.6M17.8 14.7c1.5.7 2.5 2.2 2.8 4.1" />
        </svg>
      ),
      bg: '#07c160',
    },
    {
      label: 'Tags',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3.5 12.2V5a1.5 1.5 0 0 1 1.5-1.5h7.2L21 12.3a1.5 1.5 0 0 1 0 2.1l-6.6 6.6a1.5 1.5 0 0 1-2.1 0z" />
          <circle cx="8.5" cy="8.5" r="1.4" fill="#fff" stroke="none" />
        </svg>
      ),
      bg: '#3b7dff',
    },
    {
      label: 'Service Accounts',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff">
          <rect x="4" y="4" width="7.4" height="7.4" rx="1.2" transform="rotate(45 7.7 7.7)" />
          <rect x="12.6" y="4" width="7.4" height="7.4" rx="1.2" transform="rotate(45 16.3 7.7)" />
          <rect x="4" y="12.6" width="7.4" height="7.4" rx="1.2" transform="rotate(45 7.7 16.3)" />
          <rect x="12.6" y="12.6" width="7.4" height="7.4" rx="1.2" transform="rotate(45 16.3 16.3)" />
        </svg>
      ),
      bg: '#3d7fff',
    },
  ]

  return (
    <div className="wx-page">
      <WxHeader title="Contacts" />
      <div className="wx-scroll">
        {quick.map((q) => (
          <button key={q.label} className="wx-row wx-row-lg">
            <span className="wx-row-icon wx-row-icon-lg" style={{ background: q.bg }}>{q.icon}</span>
            <span className="wx-row-label">{q.label}</span>
          </button>
        ))}

        <div className="wx-group-title">My Work & Work Contacts</div>
        <button className="wx-row">
          <span className="wx-row-label wx-row-indent">WeCom Contacts</span>
        </button>

        {CONTACT_GROUPS.map((g) => (
          <div key={g.letter}>
            <div className="wx-group-title">{g.letter}</div>
            {g.items.map((c) => (
              <button key={c.name} className="wx-row">
                {c.appIcon
                  ? <WxAppAvatar kind={c.appIcon} size={38} />
                  : c.img
                    ? <WxImgAvatar src={c.img} size={38} />
                    : <WxAvatar color={c.color} initial={c.initial} size={38} />}
                <span className="wx-row-label">{c.name}</span>
              </button>
            ))}
          </div>
        ))}

        <div className="wx-friend-row">4 friends</div>
        <div className="wx-list-tail" />
      </div>

      {/* 右侧字母索引 */}
      <div className="wx-index">
        {['↑', '☆', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), '#'].map((ch) => (
          <span key={ch}>{ch}</span>
        ))}
      </div>
    </div>
  )
}

/* ============================================================
   Tab 3：发现
   ============================================================ */
function DiscoverPage() {
  return (
    <div className="wx-page">
      <WxHeader title="Discover" />
      <div className="wx-scroll">
        <div className="wx-card">
          <button className="wx-row">
            <span className="wx-glyph" style={{ color: '#07c160' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="12" cy="12" r="8.6" />
                <path d="M12 3.4L15.5 9M20.6 12l-5.6 2M12 20.6L8.5 15M3.4 12l5.6-2M12 3.4L8.5 9l-5.1 3M12 20.6l3.5-5.6 5.1-3" />
              </svg>
            </span>
            <span className="wx-row-label">Moments</span>
            <ChevronRight />
          </button>
        </div>
        <div className="wx-card">
          <button className="wx-row">
            <span className="wx-glyph" style={{ color: '#ff9500' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
                <path d="M5 4.5c2.8 0 5 3.3 5 7.5s-2.2 7.5-5 7.5S3 16.2 3 12s2.2-7.5 2-7.5zM19 4.5c-2.8 0-5 3.3-5 7.5s2.2 7.5 5 7.5 2-3.3 2-7.5-2.2-7.5-2-7.5z" />
              </svg>
            </span>
            <span className="wx-row-label">Channels</span>
            <ChevronRight />
          </button>
          <button className="wx-row">
            <span className="wx-glyph" style={{ color: '#fa5151' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="12" cy="12" r="8.6" />
                <circle cx="12" cy="12" r="3.4" />
              </svg>
            </span>
            <span className="wx-row-label">Live Stream</span>
            <ChevronRight />
          </button>
        </div>
        <div className="wx-card">
          <button className="wx-row">
            <span className="wx-glyph" style={{ color: '#2b7fff' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M3.5 8V6a2.5 2.5 0 0 1 2.5-2.5h2M16 3.5h2A2.5 2.5 0 0 1 20.5 6v2M20.5 16v2a2.5 2.5 0 0 1-2.5 2.5h-2M8 20.5H6A2.5 2.5 0 0 1 3.5 18v-2M3.5 12h17" />
              </svg>
            </span>
            <span className="wx-row-label">Scan</span>
            <ChevronRight />
          </button>
          <button className="wx-row">
            <span className="wx-glyph" style={{ color: '#fa5151' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.5 17.5V6l10-2v11" />
                <circle cx="7" cy="17.5" r="2.5" />
                <circle cx="17" cy="15" r="2.5" />
              </svg>
            </span>
            <span className="wx-row-label">Listen</span>
            <ChevronRight />
          </button>
        </div>
        <div className="wx-card">
          <button className="wx-row">
            <span className="wx-glyph" style={{ color: '#00c8b8' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="3.4" />
                <path d="M5.5 19.5c.8-3 3.2-4.6 6.5-4.6s5.7 1.6 6.5 4.6" />
              </svg>
            </span>
            <span className="wx-row-label">People Nearby</span>
            <ChevronRight />
          </button>
        </div>
        <div className="wx-card">
          <button className="wx-row">
            <span className="wx-glyph" style={{ color: '#7c5cff' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="4" width="16" height="16" rx="3.5" />
                <path d="M9 15l6-6M9.5 9.5h.01M14.5 14.5h.01" />
              </svg>
            </span>
            <span className="wx-row-label">Mini Programs</span>
            <ChevronRight />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   Tab 4：我
   ============================================================ */
function MePage() {
  const groups: Array<Array<{ label: string; icon: ReactNode; color: string }>> = [
    [
      {
        label: 'Pay and Services',
        color: '#07c160',
        icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /><path d="M9 10.5l2 2 4-4.5" strokeLinecap="round" /></svg>,
      },
    ],
    [
      { label: 'Favorites', color: '#f0a020', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"><path d="M12 3l9 5-9 5-9-5z" /><path d="M3.5 12.5L12 16.5l8.5-4.5M3.5 16.5L12 20.5l8.5-4" /></svg> },
      { label: 'My Posts', color: '#2b7fff', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3.5" y="3.5" width="17" height="17" rx="2.5" /><circle cx="9" cy="9.5" r="1.6" /><path d="M20 14.5l-4.5-4.5L7 18.5" strokeLinecap="round" strokeLinejoin="round" /></svg> },
      { label: 'Works', color: '#00b8d4', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="3.5" y="5" width="17" height="12.5" rx="2" /><path d="M9 21h6M12 17.5V21" /></svg> },
      { label: 'Stores and Cards', color: '#f6416c', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"><path d="M4 9.5l1.2-4.5h13.6L20 9.5M4 9.5v9A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5v-9M4 9.5h16M9.5 20v-6h5v6" /></svg> },
      { label: 'Sticker Gallery', color: '#ffb020', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="12" r="8.6" /><path d="M8.5 14.5c2 1.6 5 1.6 7 0M9 9.6h.01M15 9.6h.01" /></svg> },
    ],
    [
      { label: 'Settings', color: '#8e9efc', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.01a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55h.01a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.01a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1z" /></svg> },
    ],
  ]

  return (
    <div className="wx-page wx-page-plain">
      <div className="wx-scroll wx-scroll-me">
        {/* 资料卡 */}
        <button className="wx-me-card">
          <WxImgAvatar src="/wechat/me.webp" size={58} />
          <span className="wx-me-info">
            <span className="wx-me-name">ziyip.l</span>
            <span className="wx-me-id">Weixin ID: wxid_8k3p7m2q9r5t</span>
          </span>
          <span className="wx-me-qr">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b2b2b2" strokeWidth="1.7"><rect x="3.5" y="3.5" width="7" height="7" rx="1" /><rect x="13.5" y="3.5" width="7" height="7" rx="1" /><rect x="3.5" y="13.5" width="7" height="7" rx="1" /><path d="M13.5 13.5h3v3h-3zM20.5 13.5v.01M16.5 20.5h4M20.5 16.5v4" /></svg>
          </span>
          <ChevronRight />
        </button>
        <div className="wx-me-status-row">
          <span className="wx-me-status">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#576b95" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
            Status
          </span>
        </div>

        {groups.map((g, gi) => (
          <div key={gi} className="wx-card">
            {g.map((r) => (
              <button key={r.label} className="wx-row">
                <span className="wx-glyph" style={{ color: r.color }}>{r.icon}</span>
                <span className="wx-row-label">{r.label}</span>
                <ChevronRight />
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ============================================================
   聊天详情页（默认浅灰背景）
   ============================================================ */

const KEY_LETTERS = 'qwertyuiopasdfghjklzxcvbnm'

/** 中文没有实体按键，按字符映射到一个字母键做按下效果 */
function keyFor(ch: string, i: number) {
  const code = ch.charCodeAt(0)
  if (code >= 48 && code <= 57) return ch
  return KEY_LETTERS[(code + i * 7) % KEY_LETTERS.length]
}

const KB_ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
]

/** 仓颉字根：字母键帽上显示对应的仓颉字母 */
const CANGJIE_ROOTS: Record<string, string> = {
  q: '手', w: '田', e: '水', r: '口', t: '廿', y: '卜', u: '山', i: '戈', o: '人', p: '心',
  a: '日', s: '尸', d: '木', f: '火', g: '土', h: '竹', j: '十', k: '大', l: '中',
  z: '重', x: '難', c: '金', v: '女', b: '月', n: '弓', m: '一',
}

/** iOS 仓颉键盘：候选词 + 仓颉字根键帽 + 底部功能键 */
const KB_CANDIDATES = ['我', '你', '咁', '佢', '唔', '有', '如果', '因為']

function Keyboard({ activeKey }: { activeKey: string | null }) {
  return (
    <div className="wx-keyboard" aria-hidden="true">
      <div className="wx-kb-candidates">
        <div className="wx-kb-cand-list">
          {KB_CANDIDATES.map((c) => (
            <span key={c}>{c}</span>
          ))}
        </div>
        <svg className="wx-kb-cand-more" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3a3a3c" strokeWidth="2" strokeLinecap="round">
          <path d="M5 9l7 7 7-7" />
        </svg>
      </div>

      {KB_ROWS.map((row, ri) => (
        <div key={ri} className={`wx-kb-row${ri === 1 ? ' is-mid' : ''}`}>
          {row.map((k) => (
            <span key={k} className={`wx-kb-key wx-kb-key--cjk${activeKey === k ? ' is-active' : ''}`}>
              {CANGJIE_ROOTS[k] ?? k}
            </span>
          ))}
          {ri === 2 && (
            <span className="wx-kb-key is-sys">
              <svg width="23" height="17" viewBox="0 0 28 20" fill="none" stroke="#3a3a3c" strokeWidth="1.5" strokeLinejoin="round">
                <path d="M9 2.5h14.5a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H9L2 10z" />
                <path d="M13.5 7.4l5.2 5.2M18.7 7.4l-5.2 5.2" strokeLinecap="round" />
              </svg>
            </span>
          )}
        </div>
      ))}

      <div className="wx-kb-row">
        <span className="wx-kb-key is-num">123</span>
        <span className="wx-kb-key is-emoji">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#3a3a3c" strokeWidth="1.4">
            <circle cx="12" cy="12" r="9" />
            <path d="M8.4 14.4c1.9 1.8 5.3 1.8 7.2 0" strokeLinecap="round" />
            <circle cx="9" cy="9.6" r="1" fill="#3a3a3c" stroke="none" />
            <circle cx="15" cy="9.6" r="1" fill="#3a3a3c" stroke="none" />
          </svg>
        </span>
        <span className="wx-kb-key is-space">空格</span>
        <span className="wx-kb-key is-return">傳送</span>
      </div>

      <div className="wx-kb-bottom">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3a3a3c" strokeWidth="1.3">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <ellipse cx="12" cy="12" rx="4.2" ry="9" />
        </svg>
        <svg width="16" height="19" viewBox="0 0 20 24" fill="none" stroke="#3a3a3c" strokeWidth="1.4" strokeLinecap="round">
          <rect x="7" y="2.5" width="6" height="11" rx="3" />
          <path d="M4 12.5a6 6 0 0 0 12 0M10 18.5v3" />
        </svg>
      </div>
    </div>
  )
}

function ChatPage({ chat, onBack }: { chat: WxChat; onBack: () => void }) {
  // 已切换成简体的气泡
  const [simpOn, setSimpOn] = useState<Set<string>>(new Set())
  const scrollRef = useRef<HTMLDivElement>(null)

  // —— 剧情脚本（「靓仔」需先打过电话；singlee 由第一段剧情触发） ——
  const story = useStoryState()
  const isStoryChat = chat.id === 'jy'
  const isSingChat = chat.id === 'singlee'
  const storyReady = isStoryChat && story.calledKingston

  /** 靓仔的动态消息（两段对话共用一条全局时间线，离开聊天也会继续） */
  const jyWxMsgs: WxMsg[] = isStoryChat && story.calledKingston
    ? story.jyMsgs.map((m, i) => ({
        id: `sj${i}`,
        text: m.text,
        simp: m.simp,
        out: m.kind === 'me',
        timeOnly: m.kind === 'time',
        sys: m.recalled,
      }))
    : []

  /** singlee 的动态消息（全部存放在全局剧情状态里，离开聊天也能继续收） */
  const singWxMsgs: WxMsg[] = isSingChat
    ? story.singMsgs.map((m, i) =>
        m.kind === 'time'
          ? { id: `sg${i}`, text: m.text, out: false, timeOnly: true, sys: m.recalled }
          : { id: `sg${i}`, text: m.text, simp: m.simp, out: m.kind === 'me', sys: m.recalled },
      )
    : []

  const [kbOpen, setKbOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const timers = useRef<number[]>([])
  const busy = useRef(false)

  const titleTyping = isStoryChat ? story.jyTyping : (isSingChat && story.singTyping)

  const schedule = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms)
    timers.current.push(id)
    return id
  }

  // 标记正在查看的会话（清未读、收消息时不弹横幅）；离开时清掉所有动画计时器
  useEffect(() => {
    setViewingChat(chat.id)
    if (chat.id === 'singlee' || chat.id === 'jy') clearUnread(chat.id)
    return () => {
      setViewingChat(null)
      timers.current.forEach((id) => window.clearTimeout(id))
      timers.current = []
    }
  }, [chat.id])

  // 打开聊天 / 出现新消息 / 弹出键盘时滚到最底部
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [chat.id, jyWxMsgs.length, singWxMsgs.length, titleTyping, kbOpen])

  const toggleSimp = (id: string) => {
    setSimpOn((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  /** 键盘逐字打出，打完自动发送；onDone 由各会话自己处理后续 */
  const typeDraft = (s: Extract<StoryStep, { kind: 'me' }>, onDone: () => void) => {
    if (busy.current) return
    busy.current = true
    const chars = Array.from(s.text)
    const per = s.slow ? 190 : 120
    let i = 0
    const tick = () => {
      if (i >= chars.length) {
        schedule(() => {
          setDraft('')
          setActiveKey(null)
          busy.current = false
          onDone()
        }, 380)
        return
      }
      const ch = chars[i]
      const key = keyFor(ch, i)
      setDraft((d) => d + ch)
      setActiveKey(key)
      schedule(() => setActiveKey((k) => (k === key ? null : k)), 140)
      i += 1
      schedule(tick, per)
    }
    schedule(tick, s.slow ? 420 : 260)
  }

  /** 点输入框：第一次开始脚本；之后每点一次发下一条「我」的消息 */
  const onInputTap = () => {
    if (isSingChat) {
      if (!story.singStarted) return
      setKbOpen(true)
      const s = SINGLEE_SCRIPT[story.singStep]
      if (s && s.kind === 'me') typeDraft(s, () => sendMeMessage('singlee'))
      return
    }
    if (!storyReady) return
    setKbOpen(true)
    if (!story.chatStarted) {
      startChatScript()
      return
    }
    // 第一段走完后：等通话挂断 1 分钟后的「Leo」推送，点输入框不再触发
    if (!story.chat2Started && story.chatStep >= KINGSTON_SCRIPT.length) return
    const script = story.chat2Started ? CHAT2_SCRIPT : KINGSTON_SCRIPT
    const step = story.chat2Started ? story.chat2Step : story.chatStep
    const s = script[step]
    if (s && s.kind === 'me') {
      // 这一段必须先再去电话里打一次 Kingston（被秒挂断）
      if (s.gate === 'secondCall' && story.kingstonCallCount < 2) return
      typeDraft(s, () => sendMeMessage('jy'))
    }
  }

  const renderMessage = (m: WxMsg) => {
    if (m.timeOnly) return <div key={m.id} className="wx-time-pill">{m.text}</div>
    if (m.sys) return <div key={m.id} className="wx-sys-tip">{m.text}</div>
    const senderAvatar = m.sender ? chat.groupMembers?.find((g) => g.name === m.sender)?.avatar : undefined
    return (
      <div key={m.id}>
        {m.time && <div className="wx-time-pill">{m.time}</div>}
        <div className={`wx-msg-row${m.out ? ' is-out' : ''}`}>
          {!m.out &&
            (senderAvatar ? <WxImgAvatar src={senderAvatar} size={42} /> : <ChatAvatar chat={chat} size={42} />)}
          <div className="wx-msg-main">
            {chat.isGroup && !m.out && m.sender && <span className="wx-msg-sender">{m.sender}</span>}
            {m.sticker ? (
              <img className="wx-sticker" src={m.sticker} alt="" />
            ) : m.photo ? (
              <img className={`wx-photo${m.filePhoto ? ' is-file' : ''}`} src={m.photo} alt="" />
            ) : (
              <div
                className={`wx-bubble${m.out ? ' is-out' : ''}${m.simp ? ' can-toggle' : ''}`}
                onClick={m.simp ? () => toggleSimp(m.id) : undefined}
              >
                {m.simp && simpOn.has(m.id) ? m.simp : m.text}
              </div>
            )}
          </div>
          {m.out && <WxImgAvatar src="/wechat/me.webp" size={42} />}
        </div>
      </div>
    )
  }
  return (
    <div className="wx-chat-page">
      <header className="wx-chat-header">
        <button className="wx-back" onClick={onBack} aria-label="Back">
          <svg width="13" height="21" viewBox="0 0 8 14" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 1L1 7l6 6" /></svg>
        </button>
        <span className={`wx-chat-title${titleTyping ? ' is-typing' : ''}`}>{titleTyping ? 'Typing…' : chat.name}</span>
        <span className="wx-header-icon" aria-label="More">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#111"><circle cx="5" cy="12" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="19" cy="12" r="1.7" /></svg>
        </span>
      </header>

      <div className="wx-msg-scroll" ref={scrollRef}>
        {chat.messages.map(renderMessage)}
        {isStoryChat && jyWxMsgs.map(renderMessage)}
        {isSingChat && singWxMsgs.map(renderMessage)}
      </div>

      <div className={`wx-input-bar${kbOpen ? ' is-kb' : ''}`}>
        <span className="wx-input-icon" aria-label="Voice">
          <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.6" strokeLinecap="round">
            <circle cx="12" cy="12" r="8.8" />
            {/* 三道由小到大向右扩散的声波弧线 */}
            <path d="M9.1 10a2.9 2.9 0 0 1 0 4" />
            <path d="M11.1 8.4a5.1 5.1 0 0 1 0 7.2" />
            <path d="M13.1 6.8a7.3 7.3 0 0 1 0 10.4" />
          </svg>
        </span>
        <div className={`wx-input-wrap${kbOpen ? ' is-open' : ''}`} onClick={onInputTap}>
          <input readOnly value={draft} />
        </div>
        <span className="wx-input-icon" aria-label="Emoji">
          <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M8.5 14.5c2 1.6 5 1.6 7 0M9 9.8h.01M15 9.8h.01" /></svg>
        </span>
        <span className="wx-input-icon" aria-label="More">
          <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.7"><circle cx="12" cy="12" r="9" /><path d="M12 8.5v7M8.5 12h7" strokeLinecap="round" /></svg>
        </span>
      </div>

      {kbOpen && <Keyboard activeKey={activeKey} />}
    </div>
  )
}

/* ============================================================
   底部 Tab Bar：Weixin / Contacts / Discover / Me
   ============================================================ */
type Tab = 'chats' | 'contacts' | 'discover' | 'me'

function WxTabBar({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  const items: Array<{ key: Tab; label: string; badge?: number; dot?: boolean; icon: (active: boolean) => ReactNode }> = [
    {
      key: 'chats',
      label: 'Weixin',
      icon: (a) => (
        <svg viewBox="0 0 32 32" fill={a ? '#07c160' : 'none'} stroke={a ? '#07c160' : '#2b2b2b'} strokeWidth="1.8" strokeLinejoin="round">
          {/* 单个聊天气泡：圆形，尾巴在左下 */}
          <path d="M16 3C22.4 3 28 7.9 28 13.9c0 5.1-4.6 9.4-11.3 9.9l-5.3 2.8 2.6-4.7C5.6 20.3 4 17.3 4 13.9 4 7.9 9.6 3 16 3z" />
        </svg>
      ),
    },
    {
      key: 'contacts',
      label: 'Contacts',
      icon: (a) => (
        <svg viewBox="0 0 24 24" fill="none" stroke={a ? '#07c160' : '#2b2b2b'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9.5" cy="8" r="3.6" />
          <path d="M2.8 19.5c.9-3.4 3.4-5.2 6.7-5.2s5.8 1.8 6.7 5.2" />
          <path d="M16.4 6.6h4.8M16.4 10.2h4.8M16.4 13.8h4.8" />
        </svg>
      ),
    },
    {
      key: 'discover',
      label: 'Discover',
      icon: (a) => (
        <svg viewBox="0 0 24 24" fill="none" stroke={a ? '#07c160' : '#2b2b2b'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="8.6" />
          <path d="M15.8 8.2l-2.3 5.3-5.3 2.3 2.3-5.3z" />
        </svg>
      ),
    },
    {
      key: 'me',
      label: 'Me',
      dot: true,
      icon: (a) => (
        <svg viewBox="0 0 24 24" fill="none" stroke={a ? '#07c160' : '#2b2b2b'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="7.8" r="3.8" />
          <path d="M3.6 19.8c.9-3.6 3.7-5.4 8.4-5.4s7.5 1.8 8.4 5.4" />
        </svg>
      ),
    },
  ]

  return (
    <nav className="wx-tabbar">
      {items.map((it) => (
        <button key={it.key} className={`wx-tab${tab === it.key ? ' is-active' : ''}`} onClick={() => onChange(it.key)}>
          <span className="wx-tab-icon">
            {it.icon(tab === it.key)}
            {!!it.badge && <span className="wx-badge wx-badge-tab">{it.badge}</span>}
            {!!it.dot && <span className="wx-dot wx-dot-tab" />}
          </span>
          <span className="wx-tab-label">{it.label}</span>
        </button>
      ))}
    </nav>
  )
}

/* ============================================================
   入口
   ============================================================ */
export function WeChat() {
  const [tab, setTab] = useState<Tab>('chats')
  const [openId, setOpenId] = useState<string | null>(null)
  const [closing, setClosing] = useState(false)
  const story = useStoryState()

  /** singlee 有过来信之后，会话排到置顶会话之后（仅次靓仔） */
  const chatList = (() => {
    if (!story.singStarted) return CHATS
    const pinned = CHATS.filter((c) => c.pinned)
    const rest = CHATS.filter((c) => !c.pinned)
    const idx = rest.findIndex((c) => c.id === 'singlee')
    if (idx > 0) {
      const [singlee] = rest.splice(idx, 1)
      rest.unshift(singlee)
    }
    return [...pinned, ...rest]
  })()

  const openChat = CHATS.find((c) => c.id === openId)

  // 点击通知横幅：直接进入对应会话
  useEffect(() => {
    if (!story.openChatRequest) return
    setTab('chats')
    setOpenId(story.openChatRequest)
    clearOpenChatRequest()
  }, [story.openChatRequest])

  const back = () => {
    setClosing(true)
    setTimeout(() => {
      setOpenId(null)
      setClosing(false)
    }, 260)
  }

  return (
    <div className="wx ios-app">
      {tab === 'chats' && <ChatsPage chats={chatList} onOpen={setOpenId} />}
      {tab === 'contacts' && <ContactsPage />}
      {tab === 'discover' && <DiscoverPage />}
      {tab === 'me' && <MePage />}
      <WxTabBar tab={tab} onChange={setTab} />
      {openChat && (
        <div className={`wx-chat-overlay${closing ? ' is-closing' : ''}`}>
          <ChatPage key={openChat.id} chat={openChat} onBack={back} />
        </div>
      )}
    </div>
  )
}
