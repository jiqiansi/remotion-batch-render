import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CText, abs} from '../ui';
import {clamp01} from '../common';
import {FONT_KAI, FONT_KAI_BOLD, CINNABAR, INK, INK_SOFT, INK_FAINT, RULE, PAPER_HI} from '../shushu/paper';
import {PZ, ZHI, zhiIdx, CHANGSHENG_STEPS, CHANGSHENG_START, type Zhi} from './data';

const ringPoint = (cx: number, cy: number, r: number, deg: number) => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return {x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad)};
};
/** 地支在轮上的角度：午顶（-90°）、子底，顺时针。 */
const zhiAngle = (z: Zhi) => -90 + (((zhiIdx(z) - 6) % 12) + 12) % 12 * 30;

/**
 * 十二长生轮。
 *
 * 内圈：长生 → 养 十二步；外圈：十二地支。
 * 选定五行后，内圈十二步按该行的**长生起支**对齐到地支。
 * **水土同宫**：画「水土」两个字在同一格（起于申），并用同一色阶。
 * 口径提示（用户 2026-10 定死）：这是**五行**十二长生，不是八字十干阴阳顺逆那一套。
 */
export const ChangShengWheel: React.FC<{
  cx: number; cy: number; r?: number;
  /** 高亮哪一行：木/火/金/水土（做为一格用 '水土'） */
  wuxing?: '木' | '火' | '金' | '水土';
  N?: number; f0?: number;
  /** 同时并列显示多行（占比小图） */
  compare?: Array<'木' | '火' | '金' | '水土'>;
  showNote?: boolean;
}> = ({cx, cy, r = 200, wuxing, N = 1, f0 = 1, showNote = true}) => {
  const n = N - f0;
  if (n < 0) return null;
  const zhiR = r;
  const stepR = r * 0.62;
  const rows = wuxing ? CHANGSHENG_STEPS.map((step, i) => ({step, zhi: zhiAddLocal(CHANGSHENG_START[wuxing], i)})) : [];

  return (
    <div>
      {/* 外圈地支 */}
      {ZHI.map((z, i) => {
        const a = zhiAngle(z);
        const p = ringPoint(cx, cy, zhiR, a);
        const p2 = ringPoint(cx, cy, zhiR - 34, a);
        const on = rows.some((rw) => rw.zhi === z && CHANGSHENG_STEPS.indexOf(rw.step) >= 0);
        const lit = clamp01((n - (4 + i * 3)) / 10);
        return (
          <React.Fragment key={z}>
            <div style={{
              ...abs(p.x - 22, p.y - 22, 44, 44), boxSizing: 'border-box', borderRadius: 22,
              background: on ? PZ.center : 'rgba(255,253,246,.72)',
              border: `2px solid ${on ? PZ.tian1 : RULE}`, opacity: lit,
            }} />
            <CText cx={p.x} cy={p.y} size={30} weight={700} family={FONT_KAI_BOLD}
                   color={on ? PZ.tian1 : INK_SOFT} opacity={lit} dy={-2}>{z}</CText>
            {on ? null : (
              <div style={{...abs(Math.min(p.x, p2.x), Math.min(p.y, p2.y), 0.1, 0.1)}} />
            )}
          </React.Fragment>
        );
      })}

      {/* 内圈十二步 */}
      {rows.map((rw, i) => {
        const a = zhiAngle(rw.zhi);
        const p = ringPoint(cx, cy, stepR, a);
        const lit = clamp01((n - (18 + i * 8)) / 10);
        const start = i === 0;
        const mu = rw.step === '墓';
        return (
          <div key={rw.step} style={{opacity: lit}}>
            <div style={{
              ...abs(p.x - 30, p.y - 15, 60, 30), boxSizing: 'border-box', borderRadius: 8,
              background: mu ? 'rgba(178,58,46,.10)' : start ? PZ.center : 'rgba(255,253,246,.6)',
              border: `1.5px solid ${mu ? CINNABAR : start ? PZ.tian1 : RULE}`,
            }} />
            <CText cx={p.x} cy={p.y} size={22} weight={700}
                   family={FONT_KAI_BOLD} color={mu ? CINNABAR : start ? PZ.tian1 : INK} dy={-1}>
              {rw.step}
            </CText>
          </div>
        );
      })}

      {/* 中心：五行名 + 起支 */}
      {wuxing ? (
        <>
          <CText cx={cx} cy={cy - 26} size={wuxing.length > 1 ? 40 : 46} weight={700}
                 family={FONT_KAI_BOLD} color={PZ.tian1} dy={-2}>{wuxing}</CText>
          <CText cx={cx} cy={cy + 22} size={24} weight={600} family={FONT_KAI} color={INK_SOFT} dy={-1}>
            {`长生起${CHANGSHENG_START[wuxing]} · 墓在${muOf(wuxing)}`}
          </CText>
        </>
      ) : null}

      {/* 口径注 */}
      {showNote ? (
        <CText cx={cx} cy={cy + zhiR + 46} size={22} weight={600} family={FONT_KAI} color={INK_FAINT} dy={-1}>
          五行十二长生 · 水土同宫（非八字十干阴阳顺逆）
        </CText>
      ) : null}
    </div>
  );
};

const zhiAddLocal = (z: Zhi, k: number): Zhi => ZHI[(((zhiIdx(z) + k) % 12) + 12) % 12];
const muOf = (w: '木' | '火' | '金' | '水土') => ({木: '未', 火: '戌', 金: '丑', 水土: '辰'} as const)[w];

/** 三丘五墓四季表：三丘与五墓互为对宫。 */
export const SanQiuWuMuTable: React.FC<{
  x: number; y: number; w?: number;
  N?: number; f0?: number;  focus?: string;
}> = ({x, y, w = 760, N = 1, f0 = 1, focus}) => {
  const n = N - f0;
  if (n < 0) return null;
  const rows = [
    {s: '春', a: '丑', b: '未'}, {s: '夏', a: '辰', b: '戌'},
    {s: '秋', a: '未', b: '丑'}, {s: '冬', a: '戌', b: '辰'},
  ];
  const rh = 62, hh = 52;
  const colW = [w * 0.22, w * 0.39, w * 0.39];
  return (
    <div>
      <div style={{...abs(x, y, w, hh), boxSizing: 'border-box', borderRadius: 10,
        background: PZ.head, border: `1.5px solid ${PZ.border}`}} />
      <CText cx={x + colW[0] / 2} cy={y + hh / 2} size={26} weight={700} family={FONT_KAI_BOLD} color={PZ.ink3} dy={-2}>季</CText>
      <CText cx={x + colW[0] + colW[1] / 2} cy={y + hh / 2} size={26} weight={700} family={FONT_KAI_BOLD} color={PZ.ink3} dy={-2}>三丘</CText>
      <CText cx={x + colW[0] + colW[1] + colW[2] / 2} cy={y + hh / 2} size={26} weight={700} family={FONT_KAI_BOLD} color={PZ.ink3} dy={-2}>五墓</CText>
      {rows.map((r, i) => {
        const p = clamp01((n - (10 + i * 16)) / 12);
        const ry = y + hh + i * rh;
        const hot = focus === r.s;
        return (
          <div key={r.s} style={{opacity: p}}>
            <div style={{...abs(x, ry, w, rh), boxSizing: 'border-box',
              background: hot ? 'rgba(178,58,46,.06)' : PAPER_HI, border: `1.5px solid ${PZ.cell}`}} />
            <CText cx={x + colW[0] / 2} cy={ry + rh / 2} size={30} weight={700} family={FONT_KAI_BOLD} color={INK} dy={-2}>{r.s}</CText>
            <CText cx={x + colW[0] + colW[1] / 2} cy={ry + rh / 2} size={40} weight={700} family={FONT_KAI_BOLD} color={PZ.tian1} dy={-2}>{r.a}</CText>
            <CText cx={x + colW[0] + colW[1] + colW[2] / 2} cy={ry + rh / 2} size={40} weight={700} family={FONT_KAI_BOLD} color={CINNABAR} dy={-2}>{r.b}</CText>
          </div>
        );
      })}
      <CText cx={x + w / 2} cy={y + hh + 4 * rh + 26} size={22} weight={600} family={FONT_KAI} color={INK_FAINT} dy={-1}>
        三丘与五墓永远互为对宫（相隔六位）
      </CText>
    </div>
  );
};

/** 五行墓位小表（木未·火戌·金丑·水土辰）。 */
export const MuWeiRow: React.FC<{cx: number; cy: number; N?: number; f0?: number}> = ({cx, cy, N = 1, f0 = 1}) => {
  const n = N - f0;
  if (n < 0) return null;
  const items = [
    {k: '木', v: '未'}, {k: '火', v: '戌'}, {k: '金', v: '丑'}, {k: '水土', v: '辰'},
  ];
  const gap = 168, startX = cx - (gap * (items.length - 1)) / 2;
  return (
    <div>
      {items.map((it, i) => {
        const p = clamp01((n - (8 + i * 12)) / 10);
        return (
          <div key={it.k} style={{opacity: p}}>
            <div style={{...abs(startX + i * gap - 62, cy - 42, 124, 84), boxSizing: 'border-box',
              borderRadius: 10, background: PAPER_HI, border: `1.5px solid ${RULE}`}} />
            <CText cx={startX + i * gap} cy={cy - 12} size={24} weight={600} family={FONT_KAI} color={INK_SOFT} dy={-1}>{it.k}</CText>
            <CText cx={startX + i * gap} cy={cy + 20} size={38} weight={700} family={FONT_KAI_BOLD} color={CINNABAR} dy={-2}>{it.v}</CText>
          </div>
        );
      })}
    </div>
  );
};
