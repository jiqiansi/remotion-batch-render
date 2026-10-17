/**
 * 伤寒钤法排盘推算（与排盘程序同源）。
 *
 * 已用分镜表里的实例逐项复核过（第十七讲例一 / 第十八讲例四）：
 *   司天 = 病日支
 *   司地 = 环序顺数三宫（净进三宫：本宫不算）
 *   司人 = 司地在环序上「阴退阳进」一格（按司地自身阴阳）
 *   天盘支[宫] = 年命支 + 环距(司人宫 → 宫)
 *   天盘干[宫] = 日干 + 环距(年命支宫 → 宫)，十干循环
 *
 * 环序：巳→午→未→申→酉→戌→亥→子→丑→寅→卯→辰。
 */
import {
  ZHI, GAN, zhiIdx, ringIdxOf, isYangZhi, type Zhi, type Gan,
} from './data';

export interface Plate {
  yearZhi: Zhi; yearGan: string;
  dayZhi: Zhi; dayGan: Gan;
  sitian: Zhi; sidi: Zhi; sinren: Zhi;
  /** 地盘支 → 天盘支 */
  tz: Record<string, Zhi>;
  /** 地盘支 → 天盘干 */
  tg: Record<string, Gan>;
  jing: string;      // 司天宫上见支所属六经
  shangJianZhi: Zhi; // 司天宫上见支
  shangJianGan: Gan; // 司天宫上见干
}

const ZHI_BY_RING: Zhi[] = ['巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑', '寅', '卯', '辰'];
const ringByStep = (z: Zhi, n: number): Zhi => ZHI_BY_RING[((ringIdxOf(z) + n) % 12 + 12) % 12];
const isYang = (z: Zhi) => isYangZhi(z);

/** 由「年命干支 + 病日干支」推整副盘。 */
export const buildPlate = (yearGan: Gan | '', yearZhi: Zhi, dayGan: Gan, dayZhi: Zhi): Plate => {
  const sitian = dayZhi;
  const sidi = ringByStep(sitian, 3);
  const sinren = isYang(sidi) ? ringByStep(sidi, 1) : ringByStep(sidi, -1);

  const tz: Record<string, Zhi> = {};
  const tg: Record<string, Gan> = {};
  const baseRing = (z: Zhi) => ringIdxOf(z);
  for (const gong of ZHI) {
    const d1 = (baseRing(gong) - baseRing(sinren) + 240) % 12;
    tz[gong] = ZHI[(zhiIdx(yearZhi) + d1) % 12];
    const d2 = (baseRing(gong) - baseRing(yearZhi) + 240) % 12;
    tg[gong] = GAN[(GAN.indexOf(dayGan) + d2) % 10];
  }
  const JING: Record<string, string> = {
    辰: '太阳', 戌: '太阳', 卯: '阳明', 酉: '阳明', 寅: '少阳', 申: '少阳',
    丑: '太阴', 未: '太阴', 子: '少阴', 午: '少阴', 巳: '厥阴', 亥: '厥阴',
  };
  const shangJianZhi = tz[sitian];
  return {
    yearZhi, yearGan, dayZhi, dayGan, sitian, sidi, sinren, tz, tg,
    shangJianZhi, shangJianGan: tg[sitian], jing: JING[shangJianZhi],
  };
};

/**
 * 铺盘事件序列（照表盘样式规范 §四 七步）。
 * stage 用来把同一副盘拆到不同镜头里逐段演，避免每个盘面镜头都从头铺一遍。
 *   sansi 只演三司定位与顺数三宫；zhi 追加铺天盘支；gan 再追加铺干；read 加读盘定格。
 */
export const plateEvents = (
  p: Plate,
  stage: 'dipan' | 'sansi' | 'zhi' | 'gan' | 'read' = 'read',
): import('./plate').PanEvent[] => {
  const ev: import('./plate').PanEvent[] = [];
  if (stage === 'dipan') return ev;   // 只立地盘，不做任何标记
  // 1 司天定位
  ev.push({k: 'focus', zhi: p.sitian});
  ev.push({k: 'mark', zhi: p.sitian, text: '司天', tone: 'cinnabar'});
  // 2 顺数三宫（本宫不算，净进三宫）
  ev.push({k: 'mark', zhi: p.sitian, text: '0', tone: 'gray'});
  for (let i = 1; i <= 3; i++) {
    const z = ringByStep(p.sitian, i);
    ev.push({k: 'mark', zhi: z, text: String(i), tone: i === 3 ? 'cinnabar' : 'ink'});
  }
  // 3 阴退阳进 → 司人
  ev.push({k: 'mark', zhi: p.sinren, text: '司人', tone: 'cinnabar'});
  if (stage === 'sansi') return ev;
  // 4 铺天盘支（从司人宫起，按环序逐宫）
  for (let i = 0; i < 12; i++) {
    const gong = ZHI_BY_RING[i];
    ev.push({k: 'tz', zhi: gong, gz: p.tz[gong]});
  }
  if (stage === 'zhi') return ev;
  // 5 铺天盘干（从年命支宫起）
  const yBase = ringIdxOf(p.yearZhi);
  for (let i = 0; i < 12; i++) {
    const gong = ZHI_BY_RING[(yBase + i) % 12];
    ev.push({k: 'tg', zhi: gong, gz: p.tg[gong]});
  }
  if (stage === 'gan') return ev;
  // 6 读盘定格（只看司天一宫）
  ev.push({k: 'focus', zhi: p.sitian});
  return ev;
};
