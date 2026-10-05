import React from 'react';
import {useCurrentFrame, AbsoluteFill} from 'remotion';
import {CText, abs, SoftIn} from '../ui';
import {clamp01} from '../common';
import {FONT_KAI, FONT_KAI_BOLD, FONT_NUM, CINNABAR, INK, INK_MID, INK_SOFT, INK_FAINT, RULE, PAPER_HI} from '../shushu/paper';
import {PZ} from './data';

/**
 * 非盘面镜头的通用版式：标题、要点、步骤链、卡片、对照、歌诀、收尾。
 * 一屏一个焦点：朱砂只给当前讲的那一条。
 */

export type SlideKind = 'title' | 'points' | 'steps' | 'cards' | 'compare' | 'gatha' | 'quote' | 'boundary' | 'closing';

export interface SlideSpec {
  kind: SlideKind;
  title?: string;
  sub?: string;
  items?: string[];
  /** cards / compare 用 */
  cards?: {k?: string; v?: string; note?: string; tone?: 'green' | 'orange' | 'cinnabar'}[];
  /** gatha：整屏列出的歌诀行（不逐字念） */
  lines?: string[];
  /** 焦点索引 */
  hot?: number;
  /** 底注 */
  foot?: string;
}

const Card: React.FC<{x: number; y: number; w: number; h: number; k?: string; v?: string; note?: string;
  tone?: string; p: number; hot?: boolean}> = ({x, y, w, h, k, v, note, tone = PZ.tian1, p, hot}) => (
  <div style={{opacity: p}}>
    <div style={{...abs(x, y, w, h), boxSizing: 'border-box', borderRadius: 12,
      background: hot ? 'rgba(178,58,46,.06)' : PAPER_HI,
      border: `${hot ? 2.5 : 1.5}px solid ${hot ? CINNABAR : PZ.border}`,
      boxShadow: '0 5px 15px rgba(0,0,0,.05)'}} />
    {k ? (
      <CText cx={x + w / 2} cy={y + Math.min(38, h * 0.24)} size={Math.min(26, h * 0.19)} weight={700}
             family={FONT_KAI_BOLD} color={hot ? CINNABAR : INK_SOFT} dy={-2}>{k}</CText>
    ) : null}
    {v ? (
      <CText cx={x + w / 2} cy={y + h * (k ? 0.55 : 0.42)} size={Math.min(52, h * (k ? 0.34 : 0.42))} weight={700}
             family={FONT_KAI_BOLD} color={hot ? CINNABAR : tone} dy={-2}>{v}</CText>
    ) : null}
    {note ? (
      <CText cx={x + w / 2} cy={y + h - Math.min(24, h * 0.17)} size={Math.min(22, h * 0.145)} weight={600}
             family={FONT_KAI} color={INK_FAINT} dy={-1}>{note}</CText>
    ) : null}
  </div>
);

export const Slide: React.FC<{spec: SlideSpec; N: number; f0: number; dur: number}> = ({spec, N, f0, dur}) => {
  const n = N - f0;
  if (n < 0) return null;
  const {kind, title, sub, items = [], cards = [], lines = [], hot = -1, foot} = spec;

  // SC01 title slide is transparent — PaperTitle owns the opening card.
  if (kind === 'title') return <AbsoluteFill />;

  const tp = clamp01((n - 2) / 14);
  const showHead = kind !== 'closing';
  return (
    <AbsoluteFill>
      {showHead && title ? (
        <>
          <CText cx={640} cy={112} size={44} weight={700} family={FONT_KAI_BOLD} color={INK}
                 opacity={tp} dy={-2}>{title}</CText>
          <div style={{...abs(640 - 110 * tp, 142, 220 * tp, 2.5), background: CINNABAR, opacity: .8}} />
          {sub ? (
            <CText cx={640} cy={178} size={24} weight={600} family={FONT_KAI} color={INK_SOFT}
                   opacity={clamp01((n - 8) / 14)} dy={-1}>{sub}</CText>
          ) : null}
        </>
      ) : null}

      {/* 要点列表 → **卡片墙**。
          以前是一行一条 32px 的短句，1280×720 上只占中间一条窄带，右上右下全空。
          现在每条要点切出「小标题 / 释义」做成卡片，按 2 列铺开。

          ⚠ **CText 是以 `cx` 为中心定位的**（内部 `transform: translate(-50%,-50%)`
          且 `whiteSpace: nowrap`）。**绝不能给它传 `width` + `textAlign:left` 想做左对齐**——
          那样盒子会以 cx 为中心向左右各撑一半，文字整段跑到卡片外面，
          卡片本身看着是空的（2026-10-03 用户看片发现：3:59 那两屏是两张白卡，
          4:05 的「年命 / 就是属相那一支」全在卡外左边）。
          要左对齐就把 cx 挪到 `x + pad + w/2`；本项目统一走**居中**，与上面
          `Card` 组件一致，最不容易出错。 */}
      {kind === 'points' ? (() => {
        // **按条目数选列数，让卡片接近方形**（用户：不好看也是问题）：
        //   1 条 → 1 列 640 宽、170 高（3.8:1）
        //   2 条 → **并排**两列 457 宽、170 高（2.7:1），而不是叠成 760×148（5:1，
        //         太宽太扁、字显得空）
        //   3+ 条 → 两列 940 版心
        const COLS = items.length === 1 ? 1 : 2;
        const rows = Math.ceil(items.length / COLS);
        // 单条 → **主卡规格** 900×230。原来 640×170 只占画面 24% 高度，
        // 一张卡孤零零飘在中间、四周全是空（用户：不好看也是问题）。
        const GW = items.length === 1 ? 900 : 940;
        const GX = 640 - GW / 2;
        const GY = 240, GH = 352;                              // 版心
        // ⚠ 版心底边必须**留在字幕上方**。字幕在 `top: 637`，原来 GH=400 让版心
        // 底边到 650，**卡片下沿压到字幕上**（2026-10-03 全尺寸审查发现，
        // 缩略图看不出来）。现在 240+352 = 592，留 45px 余量。
        const gapX = 26, gapY = 20;
        const cw = (GW - gapX * (COLS - 1)) / COLS;
        // 1–2 条时给更高的卡（170），3+ 条保持 148，版面更饱满
        // 主卡高度**跟有没有正文走**：整句当标题（切不出「小标题/释义」对）时，
        // 只有一行字，230 高的卡内部全是空的。压到 130 像个横幅更好看。
        const hasBody = items.some((t) => /^(.{2,12}?)[，：:](.+)$/.test(t));
        const oneH = hasBody ? 230 : 130;
        const ch = Math.min(items.length === 1 ? oneH : items.length === 2 ? 170 : 148,
                          (GH - gapY * (rows - 1)) / rows);
        const y0 = GY + Math.max(0, (GH - rows * ch - (rows - 1) * gapY)) / 2;
        return items.map((t, i) => {
          // 逐条淡入的间隔：12 帧（0.4s/条）太久——两列网格里右边整列空着，
          // 6 条要等 1.2 秒才齐。收到 8 帧（0.27s/条），整齐感更快出来。
          const p = clamp01((n - (14 + i * 8)) / 10);
          const r = Math.floor(i / COLS), c = i % COLS;
          // **落单的那条跨满整行**。奇数条目在两列网格里会留一个洞
          // （5 条 → 2+2+1，右下角空着），看着像没排完。让它跨满就像有意为之。
          const alone = COLS === 2 && rows > 1 && i === items.length - 1
                        && items.length % 2 === 1;
          const cwFull = GW;
          const cwCol = (GW - gapX) / COLS;
          const cw = alone ? cwFull : cwCol;
          const x = alone ? GX : GX + c * (cwCol + gapX);
          const y = y0 + r * (ch + gapY);
          // 「小标题 / 释义」：按第一个逗号或冒号切。切不开就整句当小标题，释义留空。
          const mm = t.match(/^(.{2,12}?)[，：:](.+)$/);
          const k = mm ? mm[1] : t;
          const v = mm ? mm[2].replace(/[。．.]$/, '') : '';
          const isHot = i === hot;
          const ccx = x + cw / 2;
          // 字号按字数收敛，但**有下限 18px**：再小就读不清了（16px 的字在
          // 1280×720 上几乎是噪点，2026-10-03 审查发现 28 字的条目被压到 16px）。
          // 超过能放下的字数就**拆成两行**（CText 是 nowrap，不能自动折行），
          // 优先在逗号处断，其次硬断。宁可两行小字，也不要一行看不清的。
          const FIT = Math.max(6, Math.floor((cw - 56) / 19));      // 19px 字可放字数
          const kMax = items.length === 1 ? 34 : 30;
          const vMax = items.length === 1 ? 26 : 23;
          const kSize = Math.min(kMax, Math.max(18, (cw - 56) / k.length));
          const vSize = Math.min(vMax, Math.max(18, (cw - 56) / Math.min(v.length, FIT)));
          const vLines = !v ? [] : v.length <= FIT ? [v] : (() => {
            const cut = v.lastIndexOf('，', FIT);
            if (cut > 3) return [v.slice(0, cut), v.slice(cut + 1)];
            return [v.slice(0, FIT), v.slice(FIT)];
          })();
          const hasV = vLines.length > 0;
          const kY = hasV ? (vLines.length > 1 ? y + ch * 0.26 : y + ch * 0.36) : y + ch * 0.5;
          const vY0 = hasV ? y + ch * (vLines.length > 1 ? 0.55 : 0.72) : 0;
          return (
            <div key={i} style={{opacity: p}}>
              <div style={{...abs(x, y, cw, ch), boxSizing: 'border-box', borderRadius: 12,
                background: isHot ? 'rgba(178,58,46,.06)' : PAPER_HI,
                border: `${isHot ? 2.5 : 1.5}px solid ${isHot ? CINNABAR : PZ.border}`,
                boxShadow: '0 5px 15px rgba(0,0,0,.05)'}} />
              {/* 左侧朱砂小条：只给当前讲的那一条 */}
              <div style={{...abs(x, y + 16, 5, ch - 32), background: isHot ? CINNABAR : RULE, borderRadius: 3}} />
              <CText cx={ccx} cy={kY} size={kSize} weight={700}
                     family={FONT_KAI_BOLD} color={isHot ? CINNABAR : INK} dy={-2}>{k}</CText>
              {vLines.map((ln, j) => (
                <CText key={j} cx={ccx} cy={vY0 + j * 26} size={vSize} weight={600} family={FONT_KAI}
                       color={INK_SOFT} dy={-1}>{ln}</CText>
              ))}
            </div>
          );
        });
      })() : null}

      {/* 步骤链 */}
      {kind === 'steps' ? (() => {
        const gap = Math.min(280, 1040 / Math.max(1, items.length - 1));
        const x0 = 640 - (gap * (items.length - 1)) / 2;
        return items.map((t, i) => {
          const p = clamp01((n - (14 + i * 16)) / 12);
          const x = x0 + i * gap;
          return (
            <React.Fragment key={i}>
              <div style={{opacity: p}}>
                <div style={{...abs(x - 74, 330, 148, 78), boxSizing: 'border-box', borderRadius: 10,
                  background: PAPER_HI, border: `${i === hot ? 2.5 : 1.5}px solid ${i === hot ? CINNABAR : PZ.border}`}} />
                <CText cx={x} cy={369} size={30} weight={700} family={FONT_KAI_BOLD}
                       color={i === hot ? CINNABAR : INK_MID} dy={-2}>{t}</CText>
              </div>
              {i < items.length - 1 ? (
                <CText cx={x + gap / 2} cy={369} size={28} weight={700} family={FONT_KAI} color={INK_FAINT}
                       opacity={clamp01((n - (22 + i * 16)) / 10)} dy={-2}>→</CText>
              ) : null}
            </React.Fragment>
          );
        });
      })() : null}

      {/* 卡片阵 */}
      {kind === 'cards' || kind === 'compare' ? (() => {
        const perRow = cards.length <= 4 ? cards.length : Math.ceil(cards.length / 2);
        const rowsN = Math.ceil(cards.length / perRow);
        const gw = Math.min(300, 1080 / perRow);
        const gap = (1080 - gw * perRow) / Math.max(1, perRow - 1);
        return cards.map((c, i) => {
          const r = Math.floor(i / perRow), col = i % perRow;
          const rowCount = Math.min(perRow, cards.length - r * perRow);
          const rowW = gw * rowCount + gap * (rowCount - 1);
          const x0 = 640 - rowW / 2;
          const p = clamp01((n - (14 + i * 12)) / 12);
          const h = rowsN > 1 ? 150 : 180;
          return <Card key={i} x={x0 + col * (gw + gap)} y={rowsN > 1 ? 258 + r * (h + 26) : 300}
                       w={gw} h={h} k={c.k} v={c.v} note={c.note} tone={c.tone}
                       p={p} hot={i === hot} />;
        });
      })() : null}

      {/* 歌诀 / 引文：整屏列出，不逐字念 */}
      {kind === 'gatha' || kind === 'quote' ? lines.map((t, i) => {
        const p = clamp01((n - (16 + i * 10)) / 12);
        return (
          <CText key={i} cx={640} cy={268 + i * 56} size={34} weight={700} family={FONT_KAI_BOLD}
                 color={i === hot ? CINNABAR : INK} opacity={p} dy={-2}>{t}</CText>
        );
      }) : null}

      {/* 边界卡 */}
      {kind === 'boundary' ? (() => {
        const p = clamp01((n - 16) / 14);
        return (
          <div style={{opacity: p}}>
            <div style={{...abs(280, 300, 720, 170), boxSizing: 'border-box', borderRadius: 14,
              background: 'rgba(178,58,46,.05)', border: `2.5px solid ${CINNABAR}`}} />
            <CText cx={640} cy={352} size={30} weight={700} family={FONT_KAI_BOLD} color={CINNABAR} dy={-2}>
              {title || '算法结果 ≠ 临床辨证'}
            </CText>
            <CText cx={640} cy={408} size={25} weight={600} family={FONT_KAI} color={INK_MID} dy={-1}>
              {sub || '本课只讲古书的算法，不替代辨证，也不开方。'}
            </CText>
          </div>
        );
      })() : null}

      {/* 收尾 */}
      {kind === 'closing' ? (() => {
        const p = clamp01((n - 10) / 16);
        return (
          <div style={{opacity: p}}>
            <CText cx={640} cy={300} size={52} weight={700} family={FONT_KAI_BOLD} color={INK} dy={-2}>
              {title || '掐指一算 · 把算法拆开'}
            </CText>
            {sub ? (
              <CText cx={640} cy={372} size={27} weight={600} family={FONT_KAI} color={INK_SOFT} dy={-1}>{sub}</CText>
            ) : null}
            <div style={{...abs(640 - 90, 420, 180, 2.5), background: CINNABAR, opacity: .8}} />
          </div>
        );
      })() : null}

      {foot ? (
        <CText cx={640} cy={662} size={21} weight={600} family={FONT_KAI} color={INK_FAINT}
               opacity={clamp01((n - 20) / 14)} dy={-1}>{foot}</CText>
      ) : null}
      {kind === 'gatha' || kind === 'quote' || kind === 'cards' || kind === 'compare' || kind === 'points' || kind === 'steps' ? (
        <SoftIn N={N} f0={f0 + Math.min(dur - 20, 40)} len={12} dy={6}>
          <div style={{...abs(0, 0, 0, 0)}} />
        </SoftIn>
      ) : null}
    </AbsoluteFill>
  );
};
