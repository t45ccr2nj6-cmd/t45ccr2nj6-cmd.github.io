import type { StoryStep } from './kingstonScript'

/**
 * 「我」发了「因为我担心你吖嘛～」之后，singlee 主动发来的对话。
 * them 消息全局自动播放（横幅 + 未读）；me 消息等用户在 singlee 聊天里点输入框。
 */
export const SINGLEE_SCRIPT: StoryStep[] = [
  { kind: 'time', text: '10:13 AM' },

  { kind: 'them', text: '我今晚直播要用灯', simp: '我晚上直播要用灯' },
  { kind: 'them', text: '上嚟攞一下', simp: '上来拿一下' },
  { kind: 'them', text: 'Kingston唔覆我', simp: 'Kingston不回我消息' },
  { kind: 'them', text: '唯有嚟搵你啦', simp: '只能来找你' },

  { kind: 'time', text: '10:14 AM' },

  { kind: 'me', text: '哦', simp: '哦' },

  { kind: 'them', text: '你哋想唔想试下可可粉', simp: '可可粉你们要尝尝吗' },
  { kind: 'them', text: '我拎d上嚟', simp: '我带点上来' },

  { kind: 'time', text: '10:17 AM' },

  { kind: 'me', text: '你唔好上嚟', simp: '你别上来' },

  { kind: 'them', text: '？', simp: '？' },
]
