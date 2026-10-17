import type {ShotSpec} from './shots';

/**
 * L22 · 排盘软件 · 19 镜
 * 与 script/narration.txt 的 19 个 `## shot` 严格一一对应（数量不等会直接抛错）。
 * 开场钩子 → 真盘演示（丙午·甲子，实测结果）→ but → 用法 → 三处不糊弄 → 边界 → 免责/下期。
 */
export const SHOT_SPECS: Record<string, ShotSpec> = {
  SC01: {kind: 'title', lecname: "排盘软件", agenda: ["现场演示", "它怎么用", "三处不糊弄", "做不到的事", "免责与下期"]},

  SC02: {kind: 'slide', slide: {kind: 'steps', title: "本期分四块", sub: "四块讲完", items: ["演示：十秒出号", "它怎么用", "三处不糊弄（重点）", "做不到的事，一次说清"]}},

  SC03: {kind: 'slide', slide: {kind: 'cards', title: "先来一副真的", sub: "丙午年 · 甲子日", cards: [{k: "年命", v: "丙午"}, {k: "得病日", v: "甲子"}]}},

  SC04: {kind: 'pan', pan: {plate: ['丙', '午', '甲', '子'], stage: 'read', centerNote: "太阳经 · 破戊"}},

  SC05: {kind: 'slide', slide: {kind: 'gatha', title: "歌诀跳出来", sub: "从填表到方名，十秒", lines: ["脉沉而结病身黄；", "小便不利茵陈汤；", "便利如狂血证谛；", "抵当汤用泻之良。"]}},

  SC06: {kind: 'slide', slide: {kind: 'boundary', title: "but 不在这十秒", sub: "我想讲的是它怎么不跑", items: ["我开发这东西", "but 在它能跑", "我却先给你看它怎么不跑"]}},

  SC07: {kind: 'slide', slide: {kind: 'compare', title: "见过的反例", sub: "这一步走反了", cards: [{k: "有人", v: "填进去 · 直接抓药"}, {k: "它给你的", v: "永远是索引"}]}},

  SC08: {kind: 'slide', slide: {kind: 'points', title: "用法就两样", sub: "年命 + 得病日", items: ["干支齐全最好", "只记得属相也能排", "不记得干支，按日期选，它自己换算"]}},

  SC09: {kind: 'slide', slide: {kind: 'points', title: "拿号去查", sub: "换盘不用重填", items: ["歌诀按字号分好了栏", "一条一条列着", "标签换盘：病传 / 两感 / 五运受病", "盘不用重填"]}},

  SC10: {kind: 'slide', slide: {kind: 'quote', title: "第一处 · 无方", sub: "看到无方，就是无方", lines: ["附表里有些号", "书上就写一个无字", "别人会顺手补个方", "我没有"]}},
  SC11: {kind: 'slide', slide: {kind: 'points', title: "第二处 · 异文", sub: "各说并排，不替你选", items: ["同一个位置", "不同传本写法不一样", "异文对照页并排放着"]}},

  SC12: {kind: 'slide', slide: {kind: 'points', title: "第三处 · 书中未明确", sub: "没写清就不编", items: ["字号只有五个证", "天干却能取到十个", "多出来的怎么归，原书无明文", "标注：书中未明确"]}},

  SC13: {kind: 'slide', slide: {kind: 'quote', title: "做文章可以存疑，做软件不行", sub: "我选的是空着", lines: ["屏幕必须显示点什么", "我选的是空着", "空着比编一个强"]}},

  SC14: {kind: 'slide', slide: {kind: 'boundary', title: "做不到 · 一", sub: "它不知道你是什么病", items: ["填对干支，它就推", "号对不对得上实情，它管不着"]}},

  SC15: {kind: 'slide', slide: {kind: 'boundary', title: "做不到 · 二", sub: "剂量一概不碰", items: ["两、几铢是那个年代的衡制", "折成今天的克数各家不一", "这一块我不做"]}},

  SC16: {kind: 'slide', slide: {kind: 'points', title: "做不到 · 三", sub: "它是一把尺子", items: ["古病名跟今天对不上号", "它给的是古书里的号，不是诊断", "量出来的是一个数", "这个数什么意思，还得你自己看"]}},

  SC17: {kind: 'slide', slide: {kind: 'boundary', title: "用之前", sub: "读六经是查歌诀，看病还是看病", items: ["先有中医基础，再看这个软件", "这两件事它分得很开", "别替它合并"]}},

  SC18: {kind: 'slide', slide: {kind: 'boundary', title: "免责声明", sub: "请务必看清", items: ["古籍算法的拆解和复现，传统文化研究", "不是医疗器械，也不是诊断工具", "每个号只是古书里的一条索引", "身体不舒服，去医院"]}},

  SC19: {kind: 'slide', slide: {kind: 'closing', title: "免费 · 下期", sub: "挑几副真盘，全程手推", items: ["下载在简介里，安卓直接装", "下一讲换个方向", "从输入到方名，全程手推给你看"]}},
};
