import type {ShotSpec} from './shots';

/**
 * L22 · 药方计算姬 · v2 FINAL · 27 镜
 * 与 script/narration.txt 的 27 个 `## shot` 严格一一对应。
 *
 * 结构（操作者定）：
 *   - 原稿一字不动（含错字/口癖，TTS 照念）
 *   - 演示镜头（SC05-10, SC20-21, SC25）用 appshot：
 *     左 = 功能列表，右 = 手机竖屏截图（观众真正看到软件）
 *   - 非演示镜头（观点/转折/收尾）用原有 slide 类型
 *
 * appshot 素材（public/assets/qianfa-l22/ui-*.png，1000×1450 手机竖屏）：
 *   ui-01-input   输入页（年命/得病日干支）
 *   ui-02-date    日期选择（公历/农历）
 *   ui-03-result  排盘结果（太阳经·破戊·歌诀）
 *   ui-04-pan     十六宫天地盘 + 8 盘面 tab
 *   ui-05-hancuo  汗瘥日期卡（甲日 10-17 / 丁日 10-20）
 *   ui-06-coffin  棺墓五步推演
 *   ui-07-wuyun   五运受病
 *   ui-08-keZhu   客主加临
 *   ui-09-mainflow 主病行流
 *   ui-10-notebook 案例管理
 *
 * 口播（narration.txt）SC 顺序对应：
 *   01片头 02开场 03转场 04免责 05输入 06中药 07别删 08感冒(汗瘥) 09嘎(棺墓)
 *   10未病(五运) 11老板情景 12骂引 13啥啊 14钤法 15算法 16错 17吗
 *   18数术×中医 19相容 20六经(盘) 21行流 22诸如此类 23不是真理 24思维
 *   25开源 26收尾 27BGM
 */
export const SHOT_SPECS: Record<string, ShotSpec> = {
  // ═══ 开场 ═══
  SC01: {kind: 'title', lecname: "药方计算姬", agenda: ["开场", "免责", "演示", "情景", "它是啥", "道理", "定位"]},
  SC02: {kind: 'slide', slide: {kind: 'quote', title: "药方计算姬", sub: "没有医生怎么办", lines: ["生病了要吃药，药要医生", "没有医生怎么办", "看这个"]}},
  SC03: {kind: 'slide', slide: {kind: 'quote', title: "无信号", sub: "", lines: ["▚▚▚ ▚▚▚ ▚▚▚"]}},

  // ═══ 免责 ═══
  SC04: {kind: 'slide', slide: {kind: 'boundary', title: "免责声明", sub: "", items: ["本视频仅供历算模型", "不够成任何医疗指导"]}},

  // ═══ 演示（左功能 / 右截图）═══
  SC05: {kind: 'appshot', shot: {title: "打开软件", sub: "简介的页面", items: ["输入你的年龄", "输入得病日期", "下滑"], hot: 0, shot: "ui-01-input.png", foot: "界面：软件输入页"}},
  SC06: {kind: 'appshot', shot: {title: "诶我去", sub: "怎么是中药啊", items: ["难喝", "不喝", "删掉。。。"], hot: 0, shot: "ui-03-result.png", foot: "界面：排盘结果（先别急着删）"}},
  SC07: {kind: 'appshot', shot: {title: "我劝你别删", sub: "", items: ["往下看"], hot: -1, shot: "ui-04-pan.png", foot: "界面：天地盘 + 8 盘面"}},

  // 感冒 → 汗瘥（甲丁日卡）
  SC08: {kind: 'appshot', shot: {title: "我感冒了", sub: "想知道不吃药多会儿会好", items: ["看这个", "它已经做出了预测", "你将在几号几号好"], hot: 1, shot: "ui-05-hancuo.png", foot: "界面：汗瘥卡（甲日 10-17 / 丁日 10-20）"}},
  // 快嘎 → 棺墓
  SC09: {kind: 'appshot', shot: {title: "病的严重", sub: "快嘎了，多会儿会嘎", items: ["看这个", "它已经做出了预测", "几号几号退出生物圈"], hot: 2, shot: "ui-06-coffin.png", foot: "界面：棺墓法五步推演"}},

  // 没病 → 五运（每月不一样）
  SC10: {kind: 'appshot', shot: {title: "治胃袋，额不，未病", sub: "预防季节性疾病", items: ["看这个", "每个月都不一样"], hot: 1, shot: "ui-07-wuyun.png", foot: "界面：五运受病（按月推）"}},

  // 拿活人试刀（老板）
  SC11: {kind: 'appshot', shot: {title: "拿活人试刀", sub: "我没病，我也没想病", items: ["把我老板的生日填进去了", "想看看他多会儿会嘎", "十秒钟，它真给了个日期", "默默把软件关了"], hot: 2, shot: "ui-03-result.png", foot: "界面：同一个结果卡，输入换个人"}},

  // ═══ 骂点（观点，不用截图）═══
  SC12: {kind: 'slide', slide: {kind: 'quote', title: "说了这么多", sub: "", lines: ["你可能已经忍不住骂我了"]}},
  SC13: {kind: 'slide', slide: {kind: 'quote', title: "这他妈的是啥啊这是？", sub: "灵魂发问", lines: ["这他妈的是啥啊这是？"]}},

  // ═══ 拆解 ═══
  SC14: {kind: 'slide', slide: {kind: 'points', title: "伤寒钤法", sub: "一部托名于医圣张仲景的预测模型", items: ["臭算卦的和古代野郎中编的", "用来给病算命", "说难听点，就是这样"]}},
  SC15: {kind: 'slide', slide: {kind: 'points', title: "它的算法", sub: "", items: ["有争议", "有缺失"]}},
  SC16: {kind: 'slide', slide: {kind: 'quote', title: "它是错的。", sub: "", lines: ["它是错的。"]}},
  SC17: {kind: 'slide', slide: {kind: 'quote', title: "吗？", sub: "", lines: ["吗？"]}},

  // ═══ 道理 ═══
  SC18: {kind: 'slide', slide: {kind: 'compare', title: "数术 × 中医", sub: "都用抽象符号", cards: [
    {k: "数术", v: "预测未来", note: "表达世界上的道理"},
    {k: "中医", v: "理解疾病", note: "表达人体上的运行"},
  ]}},
  SC19: {kind: 'slide', slide: {kind: 'points', title: "符号相容", sub: "在漫长的发展中", items: ["有的一致", "有的近似", "高度相容"]}},

  // 六经营卫 → 右侧盘面截图（嵌套结构实证）
  SC20: {kind: 'appshot', shot: {title: "六经营卫 · 一般算法", sub: "", items: ["天地盘嵌套，表示极其细微的关系", "传变规律量化在 12 地支的加临上", "表示病邪深浅"], hot: 0, shot: "ui-04-pan.png", foot: "界面：天地盘（嵌套结构本尊）"}},

  // 主病行流 → 主病行流卡
  SC21: {kind: 'appshot', shot: {title: "主病行流 · 简便算法", sub: "", items: ["五脏和六邪侵害关系", "病邪种类", "侵袭位置"], hot: 1, shot: "ui-09-mainflow.png", foot: "界面：主病行流（主病庚·大肠 / 行流丁·心）"}},

  SC22: {kind: 'slide', slide: {kind: 'quote', title: "诸如此类", sub: "", lines: ["诸如此类"]}},

  // ═══ 定位 ═══
  SC23: {kind: 'slide', slide: {kind: 'points', title: "", sub: "", items: ["它不是真理", "也并非一文不值", "有缺陷纰漏，但不是废纸"]}},
  SC24: {kind: 'slide', slide: {kind: 'points', title: "思维模型", sub: "", items: ["看待问题的新角度", "新思路", "不以算病搏猎奇感的方式宣传"]}},

  // ═══ 收尾 ═══
  SC25: {kind: 'appshot', shot: {title: "往期视频 + 开源", sub: "", items: ["免费讲解了这门技术", "软件已开源至 GitHub", "下载链接在简介，只支持安卓版本和网页端"], hot: 1, shot: "ui-10-notebook.png", foot: "界面：案例管理（App 核心功能）"}},
  SC26: {kind: 'slide', slide: {kind: 'closing', title: "正本清源", sub: "我是清源", items: ["摘夺那天上宫阙"]}},
  SC27: {kind: 'slide', slide: {kind: 'quote', title: "", sub: "", lines: ["▚▚▚ BGM 起 ▚▚▚"]}},
};
