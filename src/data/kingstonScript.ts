/** 微信「靓仔」聊天里的剧情脚本：默认粤语，点气泡可切普通话 */
export type StoryStep =
  | { kind: 'time'; text: string }
  | {
      kind: 'me'
      text: string
      simp: string
      /** 必须先完成第二次给 Kingston 打电话，点输入框才会继续 */
      gate?: 'secondCall'
      /** 输入速度更慢 */
      slow?: boolean
    }
  | {
      kind: 'them'
      text: string
      simp: string
      /** 对方打字时间更久（模拟停顿） */
      slow?: boolean
      /** 发出后秒撤回 */
      recall?: boolean
    }

export const KINGSTON_SCRIPT: StoryStep[] = [
  { kind: 'time', text: '10:12 AM' },

  { kind: 'me', text: '你去咗边啊？', simp: '你去哪了？' },
  { kind: 'me', text: '做咩唔听电话？', simp: '怎么不接电话？' },

  { kind: 'them', text: '我去咗gym', simp: '我去健身了', slow: true },
  { kind: 'them', text: '冇听到', simp: '没听到' },

  { kind: 'me', text: '你出咗门？', simp: '你出门了吗？' },
  { kind: 'me', text: '但系对鞋仲喺门口喎', simp: '但是鞋在门口' },
  { kind: 'me', text: '拖鞋又唔喺门口', simp: '拖鞋不在门口' },

  { kind: 'them', text: '我着咗第二对', simp: '我穿了另一双' },

  { kind: 'me', text: '我啱啱开咗鞋柜睇过', simp: '我刚打开鞋柜看了' },
  { kind: 'me', text: '冇少鞋喎', simp: '没有少鞋' },
  { kind: 'me', text: '而且你个水杯仲喺饭枱度', simp: '而且你的水杯还在餐桌上' },

  { kind: 'them', text: '彭梓燁', simp: '彭梓烨' },
  { kind: 'them', text: '你点解咁多问题㗎', simp: '你问题怎么这么多' },

  { kind: 'me', text: '因为我担心你吖嘛～', simp: '因为担心你呀～' },
  { kind: 'me', text: 'Kingston你究竟喺边啊？', simp: 'Kingston你到底在哪里？' },

  { kind: 'them', text: '我偷偷同Sing出去date咗', simp: '我偷偷跟Sing出去约会了', recall: true },

  { kind: 'me', text: '真㗎', simp: '真的假的' },

  { kind: 'them', text: '嘎嘎都系嘎嘎', simp: '嘎嘎都是嘎嘎' },

  { kind: 'time', text: '10:16 AM' },

  { kind: 'me', text: '我听到声音啦', simp: '我听到声音了', gate: 'secondCall' },
  { kind: 'me', text: '听电话', simp: '接电话' },
  { kind: 'me', text: '咁样唔好玩', simp: '这样不好玩' },

  { kind: 'them', text: '你嬲咗啊？', simp: '你生气了', slow: true },

  { kind: 'me', text: '冇啊', simp: '没有' },
  { kind: 'me', text: '我只系好担心你啫', simp: '很担心你而已' },
  { kind: 'me', text: 'bb唔好吓我啦，好唔好？', simp: 'bb别吓我了好不好' },

  { kind: 'them', text: '我喺客房', simp: '我在次卧' },
  { kind: 'them', text: '你暂时唔好开门住', simp: '你先别开门' },

  { kind: 'me', text: '点解？', simp: '为什么？' },

  { kind: 'time', text: '10:20 AM' },

  { kind: 'them', text: '如果我话畀你听', simp: '如果我说' },
  { kind: 'them', text: '我变咗细路仔', simp: '我变成小孩子了' },
  { kind: 'them', text: '你会唔会信？', simp: '你会信吗？' },

  { kind: 'me', text: '所以你而家系五岁嘅Kingston？', simp: '所以你现在是5岁的Kingston了？' },

  { kind: 'them', text: '我系认真㗎彭梓燁', simp: '我认真的彭梓烨' },

  { kind: 'me', text: '信', simp: '信啊' },
  { kind: 'me', text: '梗系信啦', simp: '当然信啊' },
  { kind: 'me', text: '识咗你之后，每一日都觉得好奇妙', simp: '遇见你后的每一天都挺不可思议的' },
  { kind: 'me', text: '听电话啦Kingston', simp: '接电话吧Kingston' },
]
