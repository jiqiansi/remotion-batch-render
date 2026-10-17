import type {ShotSpec} from './shots';

/**
 * L22 · 药方计算姬 · 24 镜
 * 与 script/narration.txt 的 24 个 `## shot` 严格一一对应。
 *
 * 结构（照爆款模式重构）：
 *   场景开场（那天我感冒了）→ 十秒悬念 → 免责 → 演示递进（什么时候好→多会儿嘎→没病）
 *   → 观众骂点替说 → 「它是错的。/吗。」反转 → 数术×中医符号相容的道 → 定位 → 收尾
 * 演示数据全部来自 shanghanCore 实测（丙午命·甲子日 = 2026-10-17）。
 */
export const SHOT_SPECS: Record<string, ShotSpec> = {
  SC01: {kind: 'title', lecname: "药方计算姬", agenda: ["感冒那天", "十秒出答案", "先说丑话", "演示", "反转", "拆解", "道理"]},

  SC02: {kind: 'slide', slide: {kind: 'quote', title: "十秒之后", sub: "它给了我一个答案", lines: ["几号能好？"]}},

  SC03: {kind: 'slide', slide: {kind: 'boundary', title: "免责声明", sub: "丑话说在前面", items: ["只讲历算模型，算法拆解", "不构成医疗建议", "感冒多喝水，大病去医院"]}},

  SC04: {kind: 'slide', slide: {kind: 'steps', title: "回到软件", sub: "填两样", items: ["出生年", "得病日期：2026-10-17（甲子日）", "点计算"]}},

  SC05: {kind: 'pan', pan: {plate: ['丙', '午', '甲', '子'], stage: 'read', centerNote: "太阳经 · 破戊"}},

  SC06: {kind: 'slide', slide: {kind: 'gatha', title: "汗瘥法", sub: "不吃药多会儿好", lines: ["水木元来号甲丁", "—— 甲日或丁日解"]}},

  SC07: {kind: 'slide', slide: {kind: 'cards', title: "公历都换算好了", sub: "丙午命 · 甲子日实测", cards: [
    {k: "甲日", v: "10月17日", note: "当天", tone: 'green'},
    {k: "丁日", v: "10月20日", note: "后天", tone: 'green'},
  ]}},

  SC08: {kind: 'slide', slide: {kind: 'gatha', title: "多会儿嘎？", sub: "棺墓法 · 换个输入它也答", lines: ["金火尸中有气微", "—— 翻译：还有气，死不了"]}},

  SC09: {kind: 'slide', slide: {kind: 'points', title: "没病也能看", sub: "五运受病 · 治未病", items: ["预防季节性疾病", "每个月算法不一样", "按月推"]}},

  SC10: {kind: 'slide', slide: {kind: 'quote', title: "你可能要骂了", sub: "我等这一刻很久了", lines: ["这时候"]}},

  SC11: {kind: 'slide', slide: {kind: 'quote', title: "这他妈的是什么玩意儿", sub: "替你骂", lines: ["病还没看，药方先出来", "症状一句没问，几号能好", "这不是拿人命开玩笑吗"]}},

  SC12: {kind: 'slide', slide: {kind: 'quote', title: "你骂得对", sub: "我接着骂", lines: ["接着往下看"]}},

  SC13: {kind: 'slide', slide: {kind: 'points', title: "伤寒钤法", sub: "托名医圣的书", items: ["古代算卦的 + 走方郎中", "给病算命的方法", "历史上恶评如潮"]}},

  SC14: {kind: 'slide', slide: {kind: 'points', title: "算法有问题", sub: "我不装", items: ["前后矛盾", "五个证对十个天干", "多出来的怎么归，原书没写"]}},

  SC15: {kind: 'slide', slide: {kind: 'quote', title: "它是错的。", sub: "先下结论", lines: ["它是错的。"]}},

  SC16: {kind: 'slide', slide: {kind: 'quote', title: "吗。", sub: "一个字，全片的扣", lines: ["吗。"]}},

  SC17: {kind: 'slide', slide: {kind: 'compare', title: "两套符号系统", sub: "都是抽象符号模型", cards: [
    {k: "数术", v: "预测未来", note: "世界规律"},
    {k: "中医", v: "理解疾病", note: "人体运行"},
  ]}},

  SC18: {kind: 'slide', slide: {kind: 'points', title: "高度相容", sub: "几千年互相渗透", items: ["有的符号相同", "有的近似", "伤寒钤法就长在交叉点上"]}},

  SC19: {kind: 'slide', slide: {kind: 'points', title: "量化", sub: "古人做过的尝试", items: ["传变规律 → 十二地支加临", "五脏六邪侵害关系 → 可推演", "个位输入，结构化输出，全程可复算"]}},

  SC20: {kind: 'slide', slide: {kind: 'quote', title: "作为思维模型", sub: "它是成立的", lines: ["算得稳，才谈得上读和校"]}},

  SC21: {kind: 'slide', slide: {kind: 'points', title: "它的位置", sub: "不神化，不全盘否定", items: ["靠它开方抓药会出人命", "但也不是废纸", "是古人用数理理解人体的尝试"]}},

  SC22: {kind: 'slide', slide: {kind: 'boundary', title: "两种糟蹋", sub: "都要避开", items: ["当猎奇玩具", "当神仙下凡", "都不是正路"]}},

  SC23: {kind: 'slide', slide: {kind: 'points', title: "想学往下看", sub: "免费 · 开源", items: ["21 讲从零讲到一，就在这个账号", "软件开源，GitHub 可下", "安卓和网页端都有"]}},

  SC24: {kind: 'slide', slide: {kind: 'closing', title: "正本清源", sub: "我是清源", items: ["摘夺那天上宫阙"]}},
};
