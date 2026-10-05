import type {ShotSpec} from './shots';

export const SHOT_SPECS: Record<string, ShotSpec> = {
  SC01: {kind: 'title', lecname: "整盘例解", agenda: ["本期路线", "例四·三司", "例四·铺盘", "例四·取号", "例五·落宫手推", "例五·男逆传", "边界与下期钩子"]},
  SC02: {kind: 'bingchuan', dir: '逆', cells: [{d: "第1日", gz: "丁巳", jing: "厥阴"}, {d: "第2日", gz: "丙辰", jing: "太阳"}, {d: "第3日", gz: "乙卯", jing: "阳明"}, {d: "第4日", gz: "甲寅", jing: "少阳"}, {d: "第5日", gz: "癸丑", jing: "太阴"}, {d: "第6日", gz: "壬子", jing: "少阴"}]},
  SC03: {kind: 'pan', pan: {plate: ['', '酉', '丁', '酉'], sansi: ['酉', '子', '丑'], stage: 'sansi', events: [{k: 'mark', zhi: "酉", text: "司天", tone: "cinnabar", rel: 0.0}, {k: 'mark', zhi: "戌", text: "1", tone: "ink", rel: 0.05}, {k: 'mark', zhi: "亥", text: "2", tone: "ink", rel: 0.2932}, {k: 'mark', zhi: "子", text: "3", tone: "cinnabar", rel: 0.5363}, {k: 'mark', zhi: "子", text: "司地", tone: "cinnabar", rel: 0.7795}, {k: 'focus', zhi: "酉", rel: 0.8595}], centerNote: "复述酉子丑"}},
  SC04: {kind: 'pan', pan: {plate: ['', '酉', '丁', '酉'], sansi: ['酉', '子', '丑'], stage: 'sansi', events: [{k: 'mark', zhi: "酉", text: "司天", tone: "cinnabar", rel: 0.0}, {k: 'focus', zhi: "酉", rel: 0.55}], centerNote: "说出两宫重合"}},
  SC05: {kind: 'slide', slide: {kind: 'points', title: "例四·取号", sub: "复述坤丁与白头翁汤", items: ["干的起头，就是读盘的那一格，一步都不用挪", "铺天盘干，年命酉就落在地盘酉宫", "读盘，只看司天一宫", "酉宫，这三行，地盘酉，天盘支巳，天盘干，丁", "巳是巳亥厥阴，六经定厥阴"]}},
  SC06: {kind: 'slide', slide: {kind: 'points', title: "第一步·看日支配哪一组", sub: "复述坤丁与白头翁汤", items: ["酉属巳午未申酉戌一组，取坤字号"]}},
  SC07: {kind: 'bingchuan', dir: '逆', cells: [{d: "第1日", gz: "乙酉", jing: "阳明"}, {d: "第2日", gz: "甲申", jing: "少阳"}, {d: "第3日", gz: "癸未", jing: "太阴"}, {d: "第4日", gz: "壬午", jing: "少阴"}, {d: "第5日", gz: "辛巳", jing: "厥阴"}, {d: "第6日", gz: "庚辰", jing: "太阳"}]},
  SC08: {kind: 'slide', slide: {kind: 'points', title: "例五·落宫手推", sub: "推出落宫乙酉", items: ["落宫两行，就是乙酉，酉是卯酉阳明，落宫定阳明", "主线一副盘算完就算完，病传，要一日一日传过去", "落宫这一步，先推出来", "司人这一步，怎么定？", "天盘支，从寅宫起放年命亥", "天盘干，从亥宫起放日干甲"]}},
  SC09: {kind: 'table', cols: [{t: '地盘'}, {t: '司地'}, {t: '地盘'}, {t: '司地'}], rows: [["子", "卯", "午", "酉"], ["丑", "辰", "未", "戌"], ["寅", "巳", "申", "亥"], ["卯", "午", "酉", "子"], ["辰", "未", "戌", "丑"], ["巳", "申", "亥", "寅"]], rowH: 46, perCell: 5, x: 400, y: 232, w: 480, title: "顺数三宫对照", caption: "司天顺数三宫，本宫不算"},
  SC10: {kind: 'table', cols: [{t: '地盘'}, {t: '司地'}, {t: '地盘'}, {t: '司地'}], rows: [["子", "卯", "午", "酉"], ["丑", "辰", "未", "戌"], ["寅", "巳", "申", "亥"], ["卯", "午", "酉", "子"], ["辰", "未", "戌", "丑"], ["巳", "申", "亥", "寅"]], rowH: 46, perCell: 5, x: 400, y: 232, w: 480, title: "顺数三宫对照", caption: "司天顺数三宫，本宫不算"},
  SC11: {kind: 'slide', slide: {kind: 'points', title: "例六·落宫手推", sub: "推出落宫丁未", items: ["天盘支，从巳宫起放年命亥"]}},
  SC12: {kind: 'table', cols: [{t: '地盘'}, {t: '司地'}, {t: '地盘'}, {t: '司地'}], rows: [["子", "卯", "午", "酉"], ["丑", "辰", "未", "戌"], ["寅", "巳", "申", "亥"], ["卯", "午", "酉", "子"], ["辰", "未", "戌", "丑"], ["巳", "申", "亥", "寅"]], rowH: 46, perCell: 5, x: 400, y: 232, w: 480, title: "顺数三宫对照", caption: "司天顺数三宫，本宫不算"},
  SC13: {kind: 'table', cols: [{t: '地盘'}, {t: '司地'}, {t: '地盘'}, {t: '司地'}], rows: [["子", "卯", "午", "酉"], ["丑", "辰", "未", "戌"], ["寅", "巳", "申", "亥"], ["卯", "午", "酉", "子"], ["辰", "未", "戌", "丑"], ["巳", "申", "亥", "寅"]], rowH: 46, perCell: 5, x: 400, y: 232, w: 480, title: "顺数三宫对照", caption: "司天顺数三宫，本宫不算"},
  SC14: {kind: 'pan', pan: {plate: ['', '子', '庚', '辰'], sansi: ['辰', '未', '午'], stage: 'sansi', events: [{k: 'mark', zhi: "辰", text: "司天", tone: "cinnabar", rel: 0.0}, {k: 'focus', zhi: "辰", rel: 0.55}], centerNote: "逐支复述起局路"}},
  SC15: {kind: 'slide', slide: {kind: 'points', title: "例七·表里与歌", sub: "说出两感为何成立", items: ["太阳与少阴互为表里，两感成立"]}},
  SC16: {kind: 'bingchuan', dir: '逆', cells: [{d: "第1日", gz: "甲戌", jing: "太阳"}, {d: "第2日", gz: "癸酉", jing: "阳明"}, {d: "第3日", gz: "壬申", jing: "少阳"}, {d: "第4日", gz: "辛未", jing: "太阴"}, {d: "第5日", gz: "庚午", jing: "少阴"}, {d: "第6日", gz: "己巳", jing: "厥阴"}]},
  SC17: {kind: 'slide', slide: {kind: 'points', title: "边界与下期钩子", sub: "知道下期讲校勘与十则已决疑案", items: ["再交代一句，上面算出来的都是古籍算法的结果", "讲到这里，本期内容就结束了", "先摆两套起法差一宫的公案，讲清楚为什么以后半部为准"]}},
};
