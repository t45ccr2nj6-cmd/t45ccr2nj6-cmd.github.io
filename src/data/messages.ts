/**
 * 信息 App 数据层
 * 会话 + 消息。所有"营销垃圾短信"集中在这里，方便后续增删。
 */

export type MessageType = 'text' | 'image' | 'system'

export interface Message {
  id: string
  /** 是否是本机发出的消息 */
  outgoing: boolean
  text: string
  /** 点气泡可切换的另一版本文案（如粤语原句） */
  alt?: string
  /** 发送时间，ISO 字符串 */
  time: string
  type?: MessageType
  /** iMessage 已送达 / 已读回执（仅发出的消息有） */
  receipt?: 'sent' | 'delivered' | 'read'
  /** 是否为 iMessage（蓝色气泡）；false = SMS（绿色气泡） */
  isImessage?: boolean
}

export interface Sender {
  id: string
  /** 显示名称：联系人姓名或机构名 */
  name: string
  /** 头像配色（占位渐变的两个色） */
  colors: [string, string]
  /** 头像上的文字：联系人首字母或机构缩写 */
  avatarText: string
  /** 是否是营销/通知类号码（iOS 会归到"交易与推广"分类） */
  isTransaction?: boolean
  /** 是否已置顶 */
  pinned?: boolean
}

export interface Conversation {
  senderId: string
  messages: Message[]
  /** 未读消息数 */
  unread: number
}

// —— 联系人 / 机构列表（垃圾信息：只保留美团、菜鸟裹裹、中国移动、淘宝、顺丰） ——
export const SENDERS: Sender[] = [
  {
    id: 'mama',
    name: '媽媽',
    colors: ['#F78CA0', '#F9748F'],
    avatarText: '妈',
  },
  {
    id: 'taobao',
    name: '淘宝',
    colors: ['#FF512F', '#DD2476'],
    avatarText: '淘',
    isTransaction: true,
  },
  {
    id: 'meituan',
    name: '美团',
    colors: ['#FDC830', '#F37335'],
    avatarText: '美',
    isTransaction: true,
  },
  {
    id: 'sf',
    name: '顺丰速运',
    colors: ['#000000', '#434343'],
    avatarText: '顺',
    isTransaction: true,
  },
  {
    id: 'cainiao',
    name: '菜鸟裹裹',
    colors: ['#F7971E', '#FFD200'],
    avatarText: '菜',
    isTransaction: true,
  },
  {
    id: '10086',
    name: '中国移动',
    colors: ['#11998e', '#38ef7d'],
    avatarText: '移',
    isTransaction: true,
  },
]

// 时间辅助：生成相对现在的偏移时间
const now = Date.now()
const ago = (days: number, hours = 0, mins = 0) =>
  new Date(now - days * 86400000 - hours * 3600000 - mins * 60000).toISOString()

// —— 会话数据 ——
export const CONVERSATIONS: Conversation[] = [
  // —— 媽媽（家人短信：默认粤语，点气泡切普通话） ——
  {
    senderId: 'mama',
    unread: 0,
    messages: [
      {
        id: 'mama1',
        outgoing: false,
        text: '儿子，妈妈给你寄的补品应该到了，记得去拿',
        alt: '仔，妈咪寄俾你嘅补品应该到咗啦，记得去攞啊',
        time: '2026-11-01T18:20:00',
      },
      {
        id: 'mama2',
        outgoing: true,
        text: '好，谢谢妈咪',
        alt: '好啊，多谢晒妈咪',
        time: '2026-11-01T18:23:00',
      },
      {
        id: 'mama3',
        outgoing: false,
        text: '北京很冷吧，多穿点',
        alt: '北京应该好冻啦，记得着多d衫啊',
        time: '2026-11-01T18:27:00',
      },
      {
        id: 'mama4',
        outgoing: true,
        text: '知道了妈咪，你和阿爸都要保重身体',
        alt: '知啦阿妈，你同阿爸都保重啊',
        time: '2026-11-01T18:30:00',
      },
    ],
  },
  // —— 淘宝（营销） ——
  {
    senderId: 'taobao',
    unread: 0,
    messages: [
      { id: 'tb1', outgoing: false, text: '【淘宝】双11狂欢节来了！跨店满300减50，更有百亿补贴等你来抢！点击 t.tb.cn/xxx 查看详情，回T退订', time: ago(1, 12, 0) },
      { id: 'tb2', outgoing: false, text: '【淘宝】亲，您收藏的商品降价啦！原价299，现在只要99！仅限今天，手慢无～', time: ago(0, 5, 0) },
    ],
  },
  // —— 美团 ——
  {
    senderId: 'meituan',
    unread: 2,
    messages: [
      { id: 'mt1', outgoing: false, text: '【美团】您在"小象超市"的订单已接单，骑手正在赶来，预计25分钟送达。', time: ago(0, 1, 30) },
      { id: 'mt2', outgoing: false, text: '【美团】外卖红包已到账！满30减8，今晚夜宵就靠它～ 点击领取 mturl.cn/xx 回T退订', time: ago(0, 0, 30) },
    ],
  },
  // —— 顺丰 ——
  {
    senderId: 'sf',
    unread: 0,
    messages: [
      { id: 'sf1', outgoing: false, text: '【顺丰速运】您的快件已放入丰巢柜（取件码882937），请凭码取件，24小时内免费。', time: ago(0, 8, 0) },
    ],
  },
  // —— 菜鸟 ——
  {
    senderId: 'cainiao',
    unread: 1,
    messages: [
      { id: 'cn1', outgoing: false, text: '【菜鸟裹裹】您有1个包裹待取：驿站取件码5-2-3308。取件时可顺路领券，最高88元！', time: ago(0, 1, 0) },
    ],
  },
  // —— 中国移动 ——
  {
    senderId: '10086',
    unread: 0,
    messages: [
      { id: '10086-1', outgoing: false, text: '【中国移动】您本月已使用流量28.6GB，剩余1.4GB。回复"加油包"可购买流量加餐包。', time: ago(0, 7, 0) },
      { id: '10086-2', outgoing: false, text: '【中国移动】尊敬的用户，您的积分已达12,580分，可兑换话费/视频会员。登录中国移动APP查看。', time: ago(0, 2, 30) },
    ],
  },
]

// —— 派生数据 ——
export const SENDER_MAP: Record<string, Sender> = Object.fromEntries(
  SENDERS.map((s) => [s.id, s]),
)

/** 按置顶和最近消息时间排序的会话列表 */
export function getSortedConversations(): Conversation[] {
  return [...CONVERSATIONS].sort((a, b) => {
    const sa = SENDER_MAP[a.senderId]
    const sb = SENDER_MAP[b.senderId]
    // 置顶优先
    if (sa.pinned && !sb.pinned) return -1
    if (!sa.pinned && sb.pinned) return 1
    // 同组内按最后一条消息时间倒序
    const ta = new Date(a.messages[a.messages.length - 1].time).getTime()
    const tb = new Date(b.messages[b.messages.length - 1].time).getTime()
    return tb - ta
  })
}
