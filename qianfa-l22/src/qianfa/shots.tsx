import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CText} from '../ui';
import {clamp01} from '../common';
import {FONT_KAI, FONT_KAI_BOLD, CINNABAR, INK, INK_SOFT} from '../shushu/paper';
import {PanGrid, type PanEvent} from './plate';
import {buildPlate, plateEvents} from './compute';
import {ChangShengWheel, SanQiuWuMuTable, MuWeiRow} from './wheels';
import {DataTable, BingchuanGrid, HandTable, ZihaoTable, type TableCol} from './tables';
import {Slide, type SlideSpec} from './slides';
import {WuxingRing} from '../shushu/charts';
import type {WuXing} from '../shushu/chartdata';
import {DizhiWheel} from '../shushu/ganzhi';
import type {Zhi, Gan} from './data';

/**
 * 伤寒钤法镜头派发器：一个 shot 由一份 `ShotSpec` 决定画面。
 *
 * 生成方式：`scripts/make_lecture.py` 从每期文稿 + 分镜表产出
 * `src/qianfa/spec.ts`（`SHOT_SPECS`），本文件按顺序装配成 `SHOTS`。
 * 帧区间由 `tts_build.py` 按真实语音生成，镜头内动画一律用**镜头局部帧** N（1 起）。
 */

export type ShotSpec =
  | {kind: 'title'; /** 本讲路线（章节名，按序）。片头大标题淡出后接续在场，别让开头只剩一张白纸 */
     agenda?: string[]; lecname?: string}
  | {kind: 'slide'; slide: SlideSpec}
  /** 盘面快写：plate = [年命干, 年命支, 病日干, 病日支]，三司与天地盘全部推导，不手填。
   *  年命未知时给 plate:null + sansi:[司天,司地,司人]，只演三司那三步。 */
  | {kind: 'pan'; pan: {plate: [Gan | '', Zhi, Gan, Zhi] | null; sansi?: [Zhi, Zhi, Zhi];
     stage?: 'dipan' | 'sansi' | 'zhi' | 'gan' | 'read';
     /** 生成端按该镜口播算好的逐宫时序（rel = 镜头时长内的比例）；缺省时按 stage 均铺 */
     events?: PanEvent[];
     centerNote?: string; cx?: number; cy?: number; cell?: number; perStep?: number}}
  | {kind: 'changSheng'; wuxing?: '木' | '火' | '金' | '水土'; cx?: number; cy?: number; r?: number}
  | {kind: 'wuxingRing'; focus?: [WuXing, WuXing]; mode?: 'both' | 'sheng' | 'ke'; cx?: number; cy?: number; r?: number}
  | {kind: 'dizhiWheel'; active?: Zhi[]; cx?: number; cy?: number; r?: number}
  | {kind: 'sanQiuWuMu'; focus?: string}
  | {kind: 'muWei'; cx?: number; cy?: number}
  | {kind: 'table'; x?: number; y?: number; w?: number; cols?: TableCol[]; rows: string[][];
     rowH?: number; perCell?: number; hotRow?: number; title?: string; caption?: string}
  | {kind: 'handTable'; rows: string[][]; hotRow?: number}
  | {kind: 'zihaoTable'; rows: string[][]; hotRow?: number; title?: string}
  | {kind: 'bingchuan'; cells: Array<{d: string; gz: string; jing?: string; hao?: string}>;
     dir?: '逆' | '顺'; hotIndex?: number}
  | {kind: 'combo'; parts: ShotSpec[]};

const Inner: React.FC<{spec: ShotSpec; N: number; dur: number}> = ({spec, N, dur}) => {
  switch (spec.kind) {
    case 'title':
      return <AbsoluteFill />;
    case 'slide':
      return <Slide spec={spec.slide} N={N} f0={1} dur={dur} />;
    case 'pan': {
      const [sanT, sanD, sanR] = spec.pan.sansi ?? ['子', '卯', '寅'] as Zhi[];
      const st = spec.pan.stage ?? (spec.pan.plate ? 'read' : 'sansi');
      const geo = {cx: spec.pan.cx ?? 640, cy: spec.pan.cy ?? 372, cell: spec.pan.cell ?? 108, dur};
      if (!spec.pan.plate || st === 'dipan') {
        // 只立地盘（空盘摆支），或年命未知时只演三司三步
        const partial = {sitian: sanT, sidi: sanD, sinren: sanR} as unknown as Parameters<typeof plateEvents>[0];
        const ev = spec.pan.events ?? plateEvents(partial, st);
        return <PanGrid {...geo}
                        sanSi={st === 'dipan' ? undefined : {sitian: sanT, sidi: sanD, sinren: sanR}}
                        showHeader={st !== 'dipan'}
                        events={ev}
                        perStep={spec.pan.perStep ?? Math.max(8, Math.floor(dur / Math.max(1, ev.length)))}
                        centerNote={spec.pan.centerNote} />;
      }
      const [yg, yz, dg, dz] = spec.pan.plate;
      const p = buildPlate(yg, yz, dg, dz);
      const ev = spec.pan.events ?? plateEvents(p, st);
      return <PanGrid {...geo}
                      sanSi={{sitian: p.sitian, sidi: p.sidi, sinren: p.sinren, yearZhi: p.yearZhi, yearGan: p.yearGan}}
                      events={ev}
                      perStep={spec.pan.perStep ?? Math.max(6, Math.floor(dur / Math.max(1, ev.length)))}
                      centerNote={spec.pan.centerNote} />;
    }
    case 'changSheng':
      return <ChangShengWheel cx={spec.cx ?? 640} cy={spec.cy ?? 372} r={spec.r ?? 190} wuxing={spec.wuxing} N={N} f0={1} />;
    case 'wuxingRing':
      return <WuxingRing cx={spec.cx ?? 640} cy={spec.cy ?? 400} r={spec.r ?? 170} N={N} f0={1}
                         mode={spec.mode ?? 'both'} focus={spec.focus} relationText labels />;
    case 'dizhiWheel':
      return <DizhiWheel cx={spec.cx ?? 640} cy={spec.cy ?? 400} r={spec.r ?? 175} N={N} f0={1}
                         active={spec.active ?? []} showWuxing showDirection />;
    case 'sanQiuWuMu':
      return <SanQiuWuMuTable x={370} y={250} w={720} N={N} f0={1} focus={spec.focus} />;
    case 'muWei':
      return <MuWeiRow cx={spec.cx ?? 640} cy={spec.cy ?? 400} N={N} f0={1} />;
    case 'table':
      return <DataTable x={spec.x ?? 200} y={spec.y ?? 250} w={spec.w ?? 900}
                        cols={spec.cols ?? []} rows={spec.rows} rowH={spec.rowH ?? 54}
                        perCell={spec.perCell ?? 0} hotRow={spec.hotRow ?? -1}
                        title={spec.title} caption={spec.caption} N={N} f0={1} />;
    case 'handTable':
      return <HandTable x={70} y={250} rows={spec.rows} hotRow={spec.hotRow ?? -1} N={N} f0={1} />;
    case 'zihaoTable':
      return <ZihaoTable x={190} y={250} rows={spec.rows} hotRow={spec.hotRow ?? -1} title={spec.title} N={N} f0={1} />;
    case 'bingchuan':
      return <BingchuanGrid cx={640} cy={395} cells={spec.cells} dir={spec.dir} hotIndex={spec.hotIndex ?? -1} N={N} f0={1} />;
    case 'combo':
      return <>{spec.parts.map((p, i) => <Inner key={i} spec={p} N={N} dur={dur} />)}</>;
    default:
      return <AbsoluteFill />;
  }
};

/** 镜头用带标题的通用外壳：所有非盘面镜头统一压一个题头，避免「无题浮图」。 */
export const QianfaShot: React.FC<{spec: ShotSpec; dur: number}> = ({spec, dur}) => {
  const N = useCurrentFrame() + 1;
  if (spec.kind === 'title') return <TitleCard agenda={spec.agenda ?? []} lecname={spec.lecname} N={N} />;
  return (
    <AbsoluteFill>
      <Inner spec={spec} N={N} dur={dur} />
    </AbsoluteFill>
  );
};

/**
 * 片头卡。前 ~90 帧让给 `PaperTitle` 的大标题（它在 SENTENCES[0].from 淡出），
 * 之后**本讲路线**接续在场——以前这里直接返回空 AbsoluteFill，
 * 片头 20 多秒就只剩一张白纸加底部字幕（用户：「开头画面太空」）。
 * 章节名是每期都有的现成材料，拿来当路线图既不编造、又兑现了口播里
 * 「整副盘七步，一步一步来」的承诺。
 */
const TitleCard: React.FC<{agenda: string[]; lecname?: string; N: number}> = ({agenda, lecname, N}) => {
  const n = N;
  const p = clamp01((n - 92) / 16);                 // 大标题退场后再进，不抢戏
  if (p <= 0 || agenda.length === 0) return <AbsoluteFill />;
  // **7 条全显示**。分镜表每期都是 7 个节拍，原来 `slice(0, 6)`
  // **把每一期的第 7 条静默丢掉了**（21 期全中，内容丢失）。
  // 行距从 62 收到 56、起点从 262 上移到 250：末行 250+6×56 = 586，
  // 离字幕（top: 637）还有 51px。
  const rows = agenda.slice(0, 7);
  // **整块水平居中，但行内不对齐**。
  // 两版都试过：
  //   ① 按每行各自估宽居中 → 长短不一的条目让列表呈锯齿状，很难看；
  //   ② 序号列固定、条目列固定（左对齐成列）→ 整块按**最长一条**居中，
  //      这是列表该有的样子（用户指出「不好看」的就是 ①）。
  const y0 = 250, dy = 56, BADGE_D = 32;
  const size = Math.min(30, Math.max(20, 900 / Math.max(...rows.map((t) => t.length))));
  // 楷体是全角字：**字宽 = 字号 × 字数**（无 letterSpacing）。
  // 按 1.06 倍估会偏 19%，整块就偏出去 56px（抽帧量过）。
  const twMax = Math.max(...rows.map((t) => t.length)) * size * 1.02;
  const blockW = 16 + BADGE_D + 16 + twMax;          // 左边距 + 序号牌 + 间隔 + 最宽条目
  const blockL = 640 - blockW / 2;
  const badgeX = blockL + 16 + BADGE_D / 2;
  const textL = blockL + 16 + BADGE_D + 16;            // 条目列的固定左边界
  // 列表要**左对齐**（CText 以 cx 为中心，所以每行 cx = 左边界 + 本行半宽）——
  // 全部按最宽一条居中会让左边参差，不像列表。
  const rowCx = (t: string) => textL + (t.length * size * 1.02) / 2;
  return (
    <AbsoluteFill>
      <CText cx={640} cy={152} size={30} weight={600} family={FONT_KAI_BOLD} color={INK}
             opacity={p} dy={-2}>{lecname ? `${lecname} · 本讲路线` : '本讲路线'}</CText>
      <div style={{position: 'absolute', left: 640 - 70 * p, top: 190, width: 140 * p, height: 2,
                   background: CINNABAR, opacity: .72}} />
      {rows.map((t, i) => {
        const ip = clamp01((n - (108 + i * 9)) / 14);
        return (
          <div key={t} style={{opacity: ip}}>
            <div style={{position: 'absolute', left: badgeX - BADGE_D / 2, top: y0 + i * dy - BADGE_D / 2,
                         width: BADGE_D, height: BADGE_D, borderRadius: BADGE_D / 2,
                         border: `1.5px solid ${CINNABAR}`, opacity: .6}} />
            <CText cx={badgeX} cy={y0 + i * dy} size={20} weight={700} family={FONT_KAI_BOLD}
                   color={CINNABAR} dy={0}>{`${i + 1}`}</CText>
            <CText cx={rowCx(t)} cy={y0 + i * dy} size={size} weight={600} family={FONT_KAI}
                   color={INK} dy={-1}>{t}</CText>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** 镜头题头（单独成镜时用）。 */
export const ShotHead: React.FC<{title: string; sub?: string; N: number}> = ({title, sub, N}) => {
  const p = clamp01((N - 2) / 14);
  return (
    <>
      <CText cx={640} cy={112} size={44} weight={700} family={FONT_KAI_BOLD} color={INK} opacity={p} dy={-2}>{title}</CText>
      <div style={{position: 'absolute', left: 640 - 110 * p, top: 142, width: 220 * p, height: 2.5, background: CINNABAR, opacity: .8}} />
      {sub ? <CText cx={640} cy={178} size={24} weight={600} family={FONT_KAI} color={INK_SOFT} opacity={clamp01((N - 8) / 14)} dy={-1}>{sub}</CText> : null}
    </>
  );
};

export type {PanEvent, SlideSpec, TableCol, Zhi, Gan};
