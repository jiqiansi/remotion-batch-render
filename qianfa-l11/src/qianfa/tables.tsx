import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CText, abs} from '../ui';
import {clamp01} from '../common';
import {FONT_KAI, FONT_KAI_BOLD, FONT_NUM, CINNABAR, INK, INK_SOFT, INK_FAINT, RULE, PAPER_HI} from '../shushu/paper';
import {PZ} from './data';

/**
 * 通用表格（手算表 / 字号表 / 速查卡都用它）。
 * 规格照表盘样式规范 §五：表头浅青渐层、行高 ≥52px、逐格点亮、当前格朱砂框。
 */
export interface TableCol {t: string; w?: number; align?: 'left' | 'center' | 'right'; tone?: 'ink' | 'green' | 'orange' | 'cinnabar'}

export const DataTable: React.FC<{
  x: number; y: number; w: number;
  cols: TableCol[];
  rows: string[][];
  rowH?: number; headH?: number;
  N?: number; f0?: number;
  /** 每格停留帧（逐格点亮）。0 = 整表一次出现 */
  perCell?: number;
  /** 高亮行/列索引 */
  hotRow?: number; hotCol?: number;
  caption?: string;
  title?: string;
}> = ({x, y, w, cols, rows, rowH = 56, headH = 52, N = 1, f0 = 1, perCell = 0, hotRow = -1, hotCol = -1, caption, title}) => {
  const n = N - f0;
  if (n < 0) return null;
  const totalW = cols.reduce((a, c) => a + (c.w ?? 1), 0);
  const xs: number[] = [];
  let acc = x;
  for (const c of cols) { xs.push(acc); acc += (w * (c.w ?? 1)) / totalW; }
  const colWs = cols.map((c) => (w * (c.w ?? 1)) / totalW);
  const toneCol = (t?: string) => (t === 'green' ? PZ.tian1 : t === 'orange' ? PZ.tian2 : t === 'cinnabar' ? CINNABAR : INK);

  const titleH = title ? 44 : 0;
  const cellP = (r: number, c: number) => {
    if (perCell <= 0) return clamp01((n - 6) / 12);
    const idx = r * cols.length + c;
    return clamp01((n - (8 + idx * perCell)) / 8);
  };

  return (
    <div>
      {title ? (
        <CText cx={x + w / 2} cy={y + 20} size={28} weight={700} family={FONT_KAI_BOLD} color={INK} dy={-2}>{title}</CText>
      ) : null}
      <div style={{...abs(x, y + titleH, w, headH), boxSizing: 'border-box', borderRadius: 10,
        background: PZ.head, border: `1.5px solid ${PZ.border}`}} />
      {cols.map((c, i) => (
        <CText key={c.t} cx={xs[i] + colWs[i] / 2} cy={y + titleH + headH / 2} size={24} weight={700}
               family={FONT_KAI_BOLD} color={i === hotCol ? CINNABAR : PZ.ink3} dy={-2}>{c.t}</CText>
      ))}
      {rows.map((r, ri) => {
        const ry = y + titleH + headH + ri * rowH;
        const rowP = perCell <= 0 ? clamp01((n - (10 + ri * 6)) / 10) : cellP(ri, 0);
        const hot = ri === hotRow;
        return (
          <React.Fragment key={ri}>
            <div style={{...abs(x, ry, w, rowH), boxSizing: 'border-box',
              background: hot ? 'rgba(178,58,46,.06)' : ri % 2 ? 'rgba(255,253,246,.55)' : PAPER_HI,
              border: `1.5px solid ${PZ.cell}`, opacity: rowP}} />
            {hot ? <div style={{...abs(x - 3, ry, 4, rowH), background: CINNABAR, opacity: rowP}} /> : null}
            {r.map((v, ci) => {
              const cp = perCell <= 0 ? rowP : cellP(ri, ci);
              return (
                <CText key={ci} cx={xs[ci] + colWs[ci] / 2} cy={ry + rowH / 2}
                       size={Math.min(30, rowH * 0.52)} weight={700} family={FONT_KAI_BOLD}
                       color={ci === hotCol ? CINNABAR : toneCol(cols[ci].tone)}
                       opacity={cp} dy={-2}>{v}</CText>
              );
            })}
          </React.Fragment>
        );
      })}
      {caption ? (
        <CText cx={x + w / 2} cy={y + titleH + headH + rows.length * rowH + 28} size={21} weight={600}
               family={FONT_KAI} color={INK_FAINT} dy={-1}>{caption}</CText>
      ) : null}
    </div>
  );
};

/**
 * 病传六日：六格横排，每格「日 / 支 / 干 / 经 / 号」。
 * 男逆女顺的箭头方向必须可辨 —— 方向由 `dir` 决定，箭头画在格间。
 */
export const BingchuanGrid: React.FC<{
  cx: number; cy: number; w?: number;
  /** 六日：[{d, gz, jing, hao}]，d=第几日 */
  cells: Array<{d: string; gz: string; jing?: string; hao?: string}>;
  dir?: '逆' | '顺';
  N?: number; f0?: number;
  hotIndex?: number;
}> = ({cx, cy, w = 1120, cells, dir = '逆', N = 1, f0 = 1, hotIndex = -1}) => {
  const n = N - f0;
  if (n < 0) return null;
  const gap = 14;
  const cw = (w - gap * (cells.length - 1)) / cells.length;
  const x0 = cx - w / 2;
  const h = 210;
  const y0 = cy - h / 2;
  return (
    <div>
      {cells.map((c, i) => {
        const p = clamp01((n - (8 + i * 16)) / 12);
        const x = x0 + i * (cw + gap);
        const hot = i === hotIndex;
        return (
          <React.Fragment key={i}>
            <div style={{opacity: p}}>
              <div style={{...abs(x, y0, cw, h), boxSizing: 'border-box', borderRadius: 12,
                background: hot ? 'rgba(178,58,46,.07)' : PAPER_HI,
                border: `${hot ? 2.5 : 1.5}px solid ${hot ? CINNABAR : PZ.border}`,
                boxShadow: '0 5px 15px rgba(0,0,0,.05)'}} />
              <CText cx={x + cw / 2} cy={y0 + 30} size={23} weight={700} family={FONT_KAI_BOLD}
                     color={hot ? CINNABAR : PZ.ink3} dy={-2}>{c.d}</CText>
              <div style={{...abs(x + 16, y0 + 52, cw - 32, 1), background: PZ.cell}} />
              <CText cx={x + cw / 2} cy={y0 + 92} size={46} weight={700} family={FONT_KAI_BOLD}
                     color={PZ.tian1} dy={-2}>{c.gz}</CText>
              {c.jing ? (
                <CText cx={x + cw / 2} cy={y0 + 144} size={26} weight={600} family={FONT_KAI}
                       color={INK} dy={-1}>{c.jing}</CText>
              ) : null}
              {c.hao ? (
                <CText cx={x + cw / 2} cy={y0 + 182} size={30} weight={700} family={FONT_KAI_BOLD}
                       color={CINNABAR} dy={-2}>{c.hao}</CText>
              ) : null}
            </div>
            {i < cells.length - 1 ? (
              <CText cx={x + cw + gap / 2} cy={cy} size={30} weight={700} family={FONT_KAI_BOLD}
                     color={hot || i === hotIndex ? CINNABAR : INK_FAINT}
                     opacity={clamp01((n - (16 + i * 16)) / 10)} dy={-2}>
                {dir === '逆' ? '←' : '→'}
              </CText>
            ) : null}
          </React.Fragment>
        );
      })}
      <CText cx={cx} cy={y0 + h + 34} size={24} weight={700} family={FONT_KAI_BOLD} color={CINNABAR} dy={-2}>
        {dir === '逆' ? '男逆传：自落宫起，逐日逆退' : '女顺传：自落宫起，逐日顺进'}
      </CText>
    </div>
  );
};

/** 手算表十栏（读盘次第用）：十栏横表，逐格点亮。 */
export const HandTable: React.FC<{
  x: number; y: number; w?: number;
  cols?: string[];
  rows: string[][];
  N?: number; f0?: number; hotRow?: number;
}> = ({x, y, w = 1140, cols, rows, N = 1, f0 = 1, hotRow = -1}) => (
  <DataTable x={x} y={y} w={w}
             cols={(cols ?? ['年命', '病日', '司天', '司地', '司人', '上见支', '上见干', '经', '字号', '方']).map((t) => ({t}))}
             rows={rows} rowH={54} headH={50} N={N} f0={f0} perCell={6} hotRow={hotRow} />
);

/** 字号表（经名/字号/证位/方名四列）。 */
export const ZihaoTable: React.FC<{
  x: number; y: number; w?: number;
  rows: string[][];
  N?: number; f0?: number; hotRow?: number; title?: string;
}> = ({x, y, w = 900, rows, N = 1, f0 = 1, hotRow = -1, title}) => (
  <DataTable x={x} y={y} w={w} title={title}
             cols={[{t: '六经', tone: 'green'}, {t: '字号', tone: 'cinnabar'}, {t: '证位'}, {t: '方名', tone: 'orange'}]}
             rows={rows} rowH={58} headH={50} N={N} f0={f0} perCell={8} hotRow={hotRow} />
);
