import type {ShotSpec} from './shots';

export const SHOT_SPECS: Record<string, ShotSpec> = {
  SC01: {kind: 'title', lecname: "病传", agenda: ["本期三块", "总纲一·男逆女顺", "总纲二·只传足经", "起点·主盘司天宫天盘干支", "为什么六日", "七日续推", "下期钩子卡"]},
  SC02: {kind: 'bingchuan', dir: '逆', cells: [{d: "第1日", gz: "乙酉", jing: "阳明"}, {d: "第2日", gz: "甲申", jing: "少阳"}, {d: "第3日", gz: "癸未", jing: "太阴"}, {d: "第4日", gz: "壬午", jing: "少阴"}, {d: "第5日", gz: "辛巳", jing: "厥阴"}, {d: "第6日", gz: "庚辰", jing: "太阳"}]},
  SC03: {kind: 'slide', slide: {kind: 'points', title: "总纲一·男逆女顺", sub: "说出第一条纲", items: ["男逆（朱砂逆时针箭头）／右：女顺（绿顺时针箭头）双向箭头"]}},
  SC04: {kind: 'pan', pan: {plate: ['', '亥', '甲', '戌'], sansi: ['戌', '丑', '子'], stage: 'sansi', events: [{k: 'mark', zhi: "戌", text: "司天", tone: "cinnabar", rel: 0.0}, {k: 'focus', zhi: "戌", rel: 0.55}], centerNote: "说出第二条纲"}},
  SC05: {kind: 'pan', pan: {plate: ['', '亥', '甲', '戌'], sansi: ['戌', '丑', '子'], stage: 'sansi', events: [{k: 'mark', zhi: "戌", text: "司天", tone: "cinnabar", rel: 0.0}, {k: 'focus', zhi: "戌", rel: 0.55}], centerNote: "知道起点不用另算"}},
  SC06: {kind: 'slide', slide: {kind: 'points', title: "为什么六日", sub: "说出六日的来历", items: ["一条不多，一条不少"]}},
  SC07: {kind: 'slide', slide: {kind: 'points', title: "七日续推", sub: "分清底本与续推", items: ["要还，是按同一个方向走，第七日会回到第一日的经上", "绕回起点，等于重来一圈", "续推可以用，但你得知道它不是底本原文"]}},
  SC08: {kind: 'bingchuan', dir: '逆', cells: [{d: "第1日", gz: "乙酉", jing: "阳明"}, {d: "第2日", gz: "甲申", jing: "少阳"}, {d: "第3日", gz: "癸未", jing: "太阴"}, {d: "第4日", gz: "壬午", jing: "少阴"}, {d: "第5日", gz: "辛巳", jing: "厥阴"}, {d: "第6日", gz: "庚辰", jing: "太阳"}]},
  SC09: {kind: 'slide', slide: {kind: 'points', title: "取号四处特殊", sub: "能指出哪一处最易错", items: ["什么，叫循环归证？", "主线遇到未日，按支组作母乙", "两条规则各管一处，串了号就对不上", "串了的后果很直接，号对不上，翻出来的方也就不对", "书里给了例子，待会儿推到你就看见了"]}},
  SC10: {kind: 'pan', pan: {plate: ['', '亥', '甲', '子'], sansi: ['子', '卯', '寅'], stage: 'sansi', events: [{k: 'mark', zhi: "子", text: "司天", tone: "cinnabar", rel: 0.0}, {k: 'focus', zhi: "子", rel: 0.55}], centerNote: "知道男例的三个输入"}},
  SC11: {kind: 'bingchuan', dir: '逆', cells: [{d: "第1日", gz: "乙酉", jing: "阳明"}, {d: "第2日", gz: "甲申", jing: "少阳"}, {d: "第3日", gz: "癸未", jing: "太阴"}, {d: "第4日", gz: "壬午", jing: "少阴"}, {d: "第5日", gz: "辛巳", jing: "厥阴"}, {d: "第6日", gz: "庚辰", jing: "太阳"}]},
  SC12: {kind: 'zihaoTable', rows: [["太阳", "十三字号 · 三附证", "", ""], ["阳明", "五行字号 · 霍 劳", "", ""], ["少阳", "纪", "", ""], ["太阴", "母", "", ""], ["少阴", "天 人 地", "", ""], ["厥阴", "乾 坤", "", ""]], title: "六经字号一览", hotRow: 3},
  SC13: {kind: 'zihaoTable', rows: [["太阳", "十三字号 · 三附证", "", ""], ["阳明", "五行字号 · 霍 劳", "", ""], ["少阳", "纪", "", ""], ["太阴", "母", "", ""], ["少阴", "天 人 地", "", ""], ["厥阴", "乾 坤", "", ""]], title: "六经字号一览", hotRow: 5},
  SC14: {kind: 'bingchuan', dir: '逆', cells: [{d: "第1日", gz: "丁未", jing: "太阴"}, {d: "第2日", gz: "丙午", jing: "少阴"}, {d: "第3日", gz: "乙巳", jing: "厥阴"}, {d: "第4日", gz: "甲辰", jing: "太阳"}, {d: "第5日", gz: "癸卯", jing: "阳明"}, {d: "第6日", gz: "壬寅", jing: "少阳"}]},
  SC15: {kind: 'slide', slide: {kind: 'points', title: "十二日校验", sub: "明白校验怎么算过", items: ["所谓逐格相合，是一行一行对着底本核下来的", "我认为，这，是病传算法最硬的一处校验", "女例第四日正好撞上戌，书里特意点了这一句", "对上了，说明顺逆方向没搞反", "对不上，先查方向，再查当天取的是哪一支", "方向再一反，十二天就把两边都盖住了"]}},
  SC16: {kind: 'slide', slide: {kind: 'points', title: "边界卡", sub: "记住本讲边界", items: ["病传这一套，给你的，就是日数和号", "数错了能查，病看得怎么样，靠的是医理", "真要落到用药，那一步在你自己身上"]}},
  SC17: {kind: 'sanQiuWuMu'},
};
