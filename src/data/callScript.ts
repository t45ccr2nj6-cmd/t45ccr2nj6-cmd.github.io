/**
 * 微信剧情结束后那通电话的字幕对话
 * text 为粤语（默认显示），simp 为点击后切换的普通话版本
 */
export interface CallLine {
  speaker: 'Kingston' | 'Ziyip.l'
  text: string
  simp?: string
}

export const CALL_SCRIPT: CallLine[] = [
  { speaker: 'Kingston', text: '喂' },
  { speaker: 'Ziyip.l', text: '喂 Kingston' },
  {
    speaker: 'Ziyip.l',
    text: '（笑）你而家把声听落都成个细路仔咁',
    simp: '（笑）你的声音现在听起来也是小孩子了',
  },
  { speaker: 'Kingston', text: '你笑咩啊', simp: '你笑什么' },
  { speaker: 'Ziyip.l', text: '觉得你好得意啊', simp: '觉得你可爱呀' },
  { speaker: 'Kingston', text: '咁而家点算', simp: '那现在怎么办' },
  { speaker: 'Ziyip.l', text: '你冻唔冻啊', simp: '你冷吗' },
  {
    speaker: 'Ziyip.l',
    text: '你之前嗰d衫应该着唔落啦',
    simp: '原来的衣服应该穿不了了吧',
  },
  { speaker: 'Kingston', text: '都OK', simp: '还好' },
  { speaker: 'Kingston', text: '有暖气' },
  { speaker: 'Kingston', text: '而且我冚住张被', simp: '而且我盖着被子' },
  {
    speaker: 'Ziyip.l',
    text: '咁我叫佢哋去帮你买衫',
    simp: '那我让她们去给你买衣服',
  },
  { speaker: 'Kingston', text: '点解唔系你去买', simp: '怎么不是你去买' },
  {
    speaker: 'Ziyip.l',
    text: '点可以留低bb自己一个喺屋企㗎',
    simp: '怎么能留小宝宝一个人在家',
  },
  { speaker: 'Kingston', text: '下昼个rehearsal点算', simp: '下午排练怎么办' },
  { speaker: 'Ziyip.l', text: '就话你病咗', simp: '说你生病了' },
  { speaker: 'Ziyip.l', text: '请个假咪得咯', simp: '请假好了' },
  { speaker: 'Kingston', text: '你同佢哋讲咗未', simp: '你告诉她们了吗' },
  { speaker: 'Ziyip.l', text: '仲未', simp: '还没有' },
  { speaker: 'Ziyip.l', text: '你想唔想我同佢哋讲', simp: '你想我告诉她们吗' },
  { speaker: 'Kingston', text: '咁你点叫佢哋买衫', simp: '那你怎么让她们买衣服？' },
  { speaker: 'Ziyip.l', text: '咁叫外卖咪得咯', simp: '那叫外卖好了' },
  {
    speaker: 'Kingston',
    text: '如果我一路都变唔返大人咁点算',
    simp: '要是我一直变不回去呢',
  },
  { speaker: 'Ziyip.l', text: '咁我咪重新养大你咯', simp: '那我就把你重新养大咯' },
  { speaker: 'Ziyip.l', text: '做你嘅Leo哥哥', simp: '当你的Leo哥哥' },
  { speaker: 'Kingston', text: '彭梓燁', simp: '彭梓烨' },
  { speaker: 'Ziyip.l', text: '（笑）' },
  { speaker: 'Ziyip.l', text: '好啦 唔逗你啦', simp: '好了 不开玩笑了' },
  { speaker: 'Ziyip.l', text: '唔好谂咁多啦', simp: '不想这么多' },
  {
    speaker: 'Ziyip.l',
    text: '瞓一觉先 话唔定一觉醒嚟就变返大Kingston啦',
    simp: '睡一觉 说不定起来就变回大KIngston了',
  },
  { speaker: 'Kingston', text: '（无语）' },
  { speaker: 'Kingston', text: '希望啦', simp: '希望吧' },
  { speaker: 'Ziyip.l', text: '瞓啦', simp: '睡吧' },
  { speaker: 'Ziyip.l', text: '（亲）' },
]
