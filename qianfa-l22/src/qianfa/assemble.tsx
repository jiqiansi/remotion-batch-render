import React from 'react';
import type {ShotDef} from '../common';
import {SHOT_RANGES, TOTAL_FRAMES} from '../common/timeline';
import {QianfaShot, type ShotSpec} from './shots';
import type {PanEvent} from './plate';
import {SHOT_SPECS} from './spec';

/**
 * 把 `spec.ts` 里的镜头表装配成 Remotion 播放序列。
 *
 * ## 两层时间概念，别再混为一谈
 *
 * - **镜头（shot / SCnn）**：由 `tts_build.py` 按**真实 TTS 时长**切出来的句级区间
 *   （`SHOT_RANGES`），和字幕、音轨同源。一句一个镜头。
 * - **场景（scene）**：**若干连续镜头**合成的一段连续画面——同一副盘、同一张表、
 *   同一张要点屏。一个场景挂**一个** `<Sequence>`，所以场景内动画只走一遍。
 *
 * ## 为什么要有「场景」这一层（踩过的坑）
 *
 * `Sequence` 里的 `useCurrentFrame()` 从 0 重开。镜头的入场动画（标题淡入、
 * `PanGrid` 逐宫铺盘、要点逐条落位）全部由局部帧驱动，所以**一镜一 Sequence**
 * 会让同一副盘每句从零重铺一遍、标题每句重新淡入——观众看到的是「每句闪一次入场」。
 * Remotion 官方给的两条正路是「在顶层取绝对帧往下传」或「让一个 Sequence 覆盖整段」；
 * 这里走第二条：**场景合并**。
 *
 * 合并的判据是**视觉上下文相同且只能向前推进**：
 *   - 盘面：同一副盘（plate + 三司相同）。卯日例与寅日例是两副盘 → 两个场景。
 *   - 要点屏：同一标题。
 *   - 表格类：同一 kind + 同一标题。
 *   - 换 kind（盘 → 表 → 要点）一律新开场景，硬切保留，作为「换了个东西讲」的信号。
 *
 * 配对规则（曾经出过 bug，别再改成 `sentenceShot(i)`）：
 *   `SHOT_RANGES[k]` 就是第 k+1 个镜头 SC(k+1) 的区间，`SENTENCES[k]` 是它的口播；
 *   首镜多吃了开头的片头留白，所以 from 取 1。
 *   配对不上就抛错——画面/字幕/音轨宁可当场炸，也不能各自漂移。
 */
const ids = Object.keys(SHOT_SPECS).sort();

if (ids.length !== SHOT_RANGES.length) {
  throw new Error(
    `镜头数不一致：spec.ts ${ids.length} 镜，时间线 ${SHOT_RANGES.length} 镜。` +
    `（script/narration.txt 的 ## shot 数与 spec.ts 必须相同）`);
}

type Member = {id: string; spec: ShotSpec; from: number; to: number};

const members: Member[] = ids.map((id, i) => {
  const rng = SHOT_RANGES[i];
  if (rng.id !== id) {
    throw new Error(`镜头表与时间线错位：spec 第 ${i + 1} 个是 ${id}，时间线是 ${rng.id}`);
  }
  return {id, spec: SHOT_SPECS[id], from: i === 0 ? 1 : rng.from,
          to: Math.min(rng.to, TOTAL_FRAMES)};
});

/** 视觉上下文指纹；返回 null 表示「本镜不与前镜合并」。 */
const stageOf = (s: ShotSpec): string =>
  s.kind === 'pan' ? (s.pan.stage ?? '') : '';

const contextKey = (s: ShotSpec): string | null => {
  switch (s.kind) {
    case 'pan':
      return `pan|${s.pan.plate ?? 'x'}|${(s.pan.sansi ?? []).join('')}`;
    case 'slide':
      return `slide|${s.slide.kind}|${s.slide.title ?? ''}`;
    case 'table':
      return `table|${s.title ?? ''}|${s.rows.length}`;
    case 'handTable':
      return `handTable|${s.rows[0]?.join('') ?? ''}`;
    case 'zihaoTable':
      return `zihaoTable|${s.title ?? ''}`;
    case 'bingchuan':
      return `bingchuan|${s.dir ?? '逆'}|${s.cells.map((c) => c.d).join('')}`;
    case 'changSheng':
      return `changSheng|${s.wuxing ?? ''}`;
    case 'wuxingRing':
      return `wuxingRing|${(s.focus ?? []).join('')}|${s.mode ?? 'both'}`;
    case 'dizhiWheel':
      return `dizhiWheel|${(s.active ?? []).join('')}`;
    case 'sanQiuWuMu':
      return `sanQiuWuMu|${s.focus ?? ''}`;
    case 'muWei':
      return 'muWei';
    default:
      return null;                                   // title / combo：不合并
  }
};

/** 把同一场景内几个镜头的事件表拼成一条**场景时间线**：
 *  第 i 镜在场景里的占比 [w0, w1) 由真实帧数决定，镜内 rel 线性搬进这一区间。
 *  这样「念到哪铺到哪」在整段场景里依然成立，而盘只铺一次。 */
/** 同一动作换不换镜也不会做第二遍，所以跨子镜头去重只留**一份**。
 *  key 把「做了什么」定死：铺支看宫+支，铺干看宫+干，落签看宫+签文（故「3」与「司地」不冲突）。 */
const dedupKey = (e: PanEvent): string | null => {
  if (e.k === 'tz' || e.k === 'tg') return `${e.k}|${e.zhi}|${e.gz}`;
  if (e.k === 'mark') return `mark|${e.zhi}|${e.text}`;
  if (e.k === 'dz') return `dz|${e.zhi}`;
  return null;                                 // focus/ring/wait 各镜各管各的
};

const stitch = (group: Member[]): ShotSpec => {
  const first = group[0];
  if (group.length === 1) return first.spec;
  const total = group.reduce((a, m) => a + (m.to - m.from + 1), 0);
  const last = group[group.length - 1];
  if (first.spec.kind === 'pan' && last.spec.kind === 'pan') {
    const raw: NonNullable<typeof first.spec.pan.events> = [];
    let acc = 0;
    for (const m of group) {
      const span = m.to - m.from + 1;
      const w0 = acc / total, w1 = (acc + span) / total;
      acc += span;
      const sp = m.spec as Extract<ShotSpec, {kind: 'pan'}>;
      for (const e of sp.pan.events ?? []) {
        raw.push(e.rel == null ? e : {...e, rel: +(w0 + e.rel * (w1 - w0)).toFixed(4)});
      }
    }
    // 去重：**优先留被念到的那一版**。
    // 同一铺宫动作常常在几个子镜头里各列一遍：某一个镜真的在念它（有真实时刻），
    // 其余的镜只是让它继续铺在盘上（carry，rel=0）。不挑的话就会被 carry 的 rel=0
    // 提前抠出来，观众看到「还没念到，字已经落下了」。
    const best = new Map<string, {e: PanEvent; i: number}>();
    raw.forEach((e, i) => {
      const key = dedupKey(e);
      if (key === null) { best.set(`#${i}`, {e, i}); return; }
      const prev = best.get(key);
      if (!prev || (prev.e.carry && !e.carry)) best.set(key, {e, i});
    });
    const events = Array.from(best.values()).sort((a, b) => a.i - b.i).map((v) => v.e);
    return {...first.spec,
            pan: {...first.spec.pan, plate: last.spec.pan.plate ?? first.spec.pan.plate, events}};
  }
  if (first.spec.kind === 'slide' && last.spec.kind === 'slide'
      && first.spec.slide.kind === 'points') {
    // 同一标题的连续要点屏：条目取并集，整段里逐条落位（不再整屏重来）
    const seen = new Set<string>();
    const items: string[] = [];
    for (const m of group) {
      const sp = m.spec as Extract<ShotSpec, {kind: 'slide'}>;
      for (const it of sp.slide.items ?? []) {
        if (!seen.has(it)) { seen.add(it); items.push(it); }
      }
    }
    return {...first.spec, slide: {...first.spec.slide, items: items.slice(0, 6)}};
  }
  return first.spec;                                 // 表格类：整段只画一张
};

/** 一个场景最长 60s：再长就主动断一刀，给「换了口气」一个视觉节拍。
 *  合并的价值是**不让同一副盘从零重铺**（12 宫天盘支铺两遍就是观众说的「重复」）；
 *  但一块完全静止的画面顶太久也留不住人，所以给个上限。 */
const MAX_SCENE_FRAMES = 60 * 30;

const scenes: Array<{id: string; from: number; to: number}> = [];
const membersOf = new Map<object, Member[]>();
for (const m of members) {
  const key = contextKey(m.spec);
  const prev = scenes[scenes.length - 1];
  const head = prev ? membersOf.get(prev)![0] : null;
  const sameCtx = !!prev && key !== null && key === contextKey(head!.spec);
  const sameStage = sameCtx && stageOf(head!.spec) === stageOf(m.spec);
  const fits = !!prev && (m.to - prev.from + 1) <= MAX_SCENE_FRAMES;
  if (prev && sameCtx && sameStage && fits) {
    prev.to = m.to;
    membersOf.get(prev)!.push(m);
  } else {
    const scene = {id: m.id, from: m.from, to: m.to};
    scenes.push(scene);
    membersOf.set(scene, [m]);
  }
}

// 合并每个场景的事件表，并给出最终 id
const finalScenes = scenes.map((sc) => {
  const group = membersOf.get(sc)!;
  return {id: group.length > 1 ? `${group[0].id}-${group[group.length - 1].id}` : group[0].id,
          from: sc.from, to: sc.to, spec: stitch(group)};
});

export const SHOTS: ShotDef[] = finalScenes.map((sc) => ({
  id: sc.id, from: sc.from, to: sc.to,
  Comp: () => <QianfaShot spec={sc.spec} dur={sc.to - sc.from + 1} />,
}));

export const SCENE_COUNT = finalScenes.length;
