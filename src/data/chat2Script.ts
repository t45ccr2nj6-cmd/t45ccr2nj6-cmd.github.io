import type { StoryStep } from './kingstonScript'

/** 通话结束后、傍晚时分的第二段微信对话（默认粤语，点气泡切普通话） */
export const CHAT2_SCRIPT: StoryStep[] = [
  { kind: 'time', text: '5:12 PM' },

  { kind: 'them', text: 'Leo', simp: 'Leo' },
  { kind: 'me', text: '做咩呀，Kingston', simp: '怎么了Kingston' },

  { kind: 'them', text: '我係咪瞓过头，错过咗个rehearsal呀', simp: '我是不是睡过排练了' },

  { kind: 'me', text: '系啊，小猪猪', simp: '对呀，小猪猪' },
  { kind: 'me', text: '冇事', simp: '没事' },
  { kind: 'me', text: '我已经帮你请咗假啦', simp: '我帮你请过假了' },

  { kind: 'them', text: '我点解会瞓咗喺呢度', simp: '我怎么睡在这里' },

  { kind: 'me', text: '可能', simp: '可能', slow: true },
  { kind: 'me', text: '梦游咗呀？', simp: '梦游了？' },
  { kind: 'me', text: '我醒嗰阵你已经唔喺度啦', simp: '我醒来的时候你就不在' },
  { kind: 'me', text: '打电话你又唔听', simp: '打电话也不接' },
  { kind: 'me', text: '真系吓死我啦', simp: '吓死我了' },

  { kind: 'them', text: '我瞓得咁死㗎？', simp: '我睡这么死？' },

  { kind: 'me', text: '可能最近排练太攰啦', simp: '可能是最近排练累了吧' },

  { kind: 'them', text: '可能系啩', simp: '可能吧' },
  { kind: 'them', text: '我同你讲件好奇怪嘅事', simp: '我跟你分享一个特别奇怪的事' },
  { kind: 'them', text: '我梦见自己变咗五岁', simp: '我梦见我变成5岁了' },
  { kind: 'them', text: '你仲要我嗌你Leo哥哥', simp: '你还让我叫你Leo哥哥' },

  { kind: 'me', text: '我边有啊', simp: '我可没有' },

  { kind: 'them', text: '明明就有', simp: '肯定有' },

  { kind: 'me', text: '咁你叫声嚟听下？', simp: '那你叫一个？' },

  { kind: 'them', text: '彭梓燁', simp: '彭梓烨' },

  { kind: 'me', text: '好啦，快d起身啦，小猪猪', simp: '好了，快起床吧小猪猪' },
  { kind: 'me', text: '晚饭已经整好啦', simp: '晚饭已经做好了' },
]
