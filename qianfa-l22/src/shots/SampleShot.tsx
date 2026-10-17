import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CText} from '../ui';
import {HexChart, SplitMergeGua} from '../shushu/chart';
import {BaguaCompare, CeGuiBoard, SiXiangPanel, WangShuaiScale, WuxingRing, YingqiTimeline} from '../shushu/charts';
import {DizhiWheel, NajiaPanel, type NajiaLine} from '../shushu/ganzhi';
import {DEMO_BIAN, DEMO_HEX, DEMO_HU, DEMO_MOVING, GUA, YAO_POS} from '../shushu/chartdata';
import {CINNABAR, FONT_KAI, FONT_KAI_BOLD, INK, INK_FAINT, INK_MID, INK_SOFT} from '../shushu/paper';

export type SampleKind =
  | 'title' | 'intro' | 'question' | 'chain' | 'gua' | 'gua_detail' | 'split' | 'hex' | 'hex_check'
  | 'mutual' | 'moving' | 'change' | 'tiyong' | 'wuxing' | 'relation' | 'wang' | 'tiyong_relation'
  | 'bagua' | 'bagua_detail' | 'dizhi' | 'najia' | 'cegui' | 'cegui_rule' | 'sixxiang'
  | 'yingqi' | 'yingqi_check' | 'boundary' | 'review' | 'summary_hex' | 'summary_rules' | 'next' | 'closing';

const COPY: Record<SampleKind, [string, string]> = {
  title: ['十分钟术数排盘', '静音视觉样片 · 待接入经过确认的配音'],
  intro: ['先定讲解边界', '边界不清，后面的盘面再整齐，也可能答非所问。'],
  question: ['追踪排盘步骤', '输入、规则、中间态与复算结果，一个环节也不能跳。'],
  chain: ['从输入到复算', '能复算的地方讲规则，不能复算的地方标待核。'],
  gua: ['八卦先看三爻', '阴阳爻画组成卦的身份，字段全部从事实层读取。'],
  gua_detail: ['同一个事实层', '爻画、五行、先后天数与方位不在镜头里各写一份。'],
  split: ['上下卦拆合', '先分开落位，再合成六爻本卦；初爻始终在下。'],
  hex: ['本卦落定', '卦名由上下卦计算，盘面不手写结果。'],
  hex_check: ['先做一遍对账', '八卦表、64 卦表与洛书九宫由独立脚本复算。'],
  mutual: ['互卦从中段抽取', '二三四组成下互，三四五组成上互。'],
  moving: ['先圈出动爻', '朱砂只给当前焦点，先停住，再进入翻转。'],
  change: ['只翻这一爻', '变卦同步出现，非动爻保持不变。'],
  tiyong: ['体用贴在对应位置', '归属跟着动爻口径走，双动边界要另行确认。'],
  wuxing: ['五行生克', '相生顺环，相克交错；关系线说明方向。'],
  relation: ['当前关系才用朱砂', '其他路径退成淡墨，避免整张盘一起发亮。'],
  wang: ['旺相休囚死', '这是状态层的墨色深浅，不是换一套元素身份。'],
  tiyong_relation: ['把体用放回生克环', '箭头从起点指向终点，不反画。'],
  bagua: ['先天与后天', '八个卦按身份逐个追踪位置，不把整图旋转代替推导。'],
  bagua_detail: ['方向先说清楚', '上南下北、左东右西，每一张方位图都显式标注。'],
  dizhi: ['十二地支轮', '子在北、午在南；地支方向和卦图方向分开解释。'],
  najia: ['纳甲六爻表', '没有核实的数据就留空，组件不替调用方猜映射。'],
  cegui: ['原会运世', '缺数显示缺，不把未知值偷偷填成零。'],
  cegui_rule: ['公式要留在画面上', '输入、每步运算、中间值与结果都应可回看。'],
  sixxiang: ['四象与用数', '只有在材料有出处时才把数值写进课程。'],
  yingqi: ['应期推演', '先列候选范围，再逐层筛选，最后才谈落点。'],
  yingqi_check: ['待核就明确待核', '没有经过核验的历法算法，不直接报日期。'],
  boundary: ['讲规则，也讲边界', '一张图能复算，不等于所有问题都适用同一套方法。'],
  review: ['配音也要校验', '卦名、多音字与术语逐句复听，不让模型猜读音。'],
  summary_hex: ['回到本互变三列', '把输入、抽取、翻转与体用重新串成一条链。'],
  summary_rules: ['画面给过程，旁白给判断', '二者互相补充，不能用一张完成图替代推导。'],
  next: ['下一集再进古籍', '先把事实层、资料出处与待核清单钉牢。'],
  closing: ['盘面不是插图', '每一爻、每一步、每个数，都应该有出处，也能复算。'],
};

const FrameTitle: React.FC<{kind: SampleKind; n: number}> = ({kind, n}) => {
  const [title, sub] = COPY[kind];
  const p = Math.min(1, Math.max(0, (n + 1) / 18));
  // 图表镜头要给列标题/图形留出独立的上沿，不能让副标题压到本卦、五行环或方位图。
  const visual = !['title','intro','question','chain','gua','gua_detail','hex_check','relation','boundary','review','summary_rules','next','closing'].includes(kind);
  const titleY = visual ? 104 : 160;
  const ruleY = visual ? 136 : 196;
  const subY = visual ? 168 : 232;
  return <>
    <CText cx={640} cy={titleY} size={42} weight={700} family={FONT_KAI_BOLD} color={INK} opacity={p}>{title}</CText>
    <div style={{position:'absolute',left:640-110*p,top:ruleY,width:220*p,height:2,background:CINNABAR,opacity:.75}} />
    <CText cx={640} cy={subY} size={24} family={FONT_KAI} color={INK_SOFT} opacity={p}>{sub}</CText>
  </>;
};

const TextFrame: React.FC<{kind: SampleKind; n: number}> = ({kind, n}) => {
  const [title, sub] = COPY[kind];
  const steps = kind === 'chain' ? ['输入', '规则', '中间态', '核验'] : ['看见事实', '逐帧动作', '留下出处'];
  return <>
    <FrameTitle kind={kind} n={n} />
    {steps.map((s, i) => {
      const p = Math.min(1, Math.max(0, (n - 24 - i * 14) / 16));
      const x = 250 + i * (kind === 'chain' ? 260 : 330);
      return <React.Fragment key={s}>
        <div style={{position:'absolute',left:x-72,top:355,width:144,height:74,border:`1.5px solid ${i===1?CINNABAR:'#C7B990'}`,background:'rgba(255,253,246,.48)',opacity:p}} />
        <CText cx={x} cy={392} size={28} weight={700} family={FONT_KAI_BOLD} color={i===1?CINNABAR:INK_MID} opacity={p}>{s}</CText>
        {i < steps.length-1 ? <CText cx={x+130} cy={392} size={24} family={FONT_KAI} color={INK_FAINT} opacity={p}>→</CText> : null}
      </React.Fragment>;
    })}
  </>;
};

const NAJIA_DEMO: NajiaLine[] = DEMO_HEX.yao.map((v, i) => ({pos:i+1, yinYang:v?'yang':'yin', moving:DEMO_MOVING.includes(i+1)}));

export const SampleShot: React.FC<{kind: SampleKind}> = ({kind}) => {
  const n = useCurrentFrame() + 1;
  // SC01 is deliberately transparent: the shared PaperTitle owns the opening card.
  if (kind === 'title') return <AbsoluteFill />;
  if (['intro','question','chain','gua','gua_detail','hex_check','relation','boundary','review','summary_rules','next','closing'].includes(kind)) {
    return <AbsoluteFill><TextFrame kind={kind} n={n} /></AbsoluteFill>;
  }
  return <AbsoluteFill>
    <FrameTitle kind={kind} n={n} />
    {kind === 'split' ? <SplitMergeGua cx={640} cy={420} upper={DEMO_HEX.upper} lower={DEMO_HEX.lower} N={n} f0={1} mergeAt={90} gap={210} label /> : null}
    {['hex','mutual','moving','change','tiyong','summary_hex'].includes(kind) ? <HexChart cx={245} cy={392} colGap={340} ben={DEMO_HEX} hu={DEMO_HU} bian={DEMO_BIAN} moving={DEMO_MOVING} N={n} f0={1} flipAt={140} show={{hu:true,bian:true}} tiYong /> : null}
    {['wuxing','relation','wang','tiyong_relation'].includes(kind) ? <>
      <WuxingRing cx={640} cy={405} r={170} N={n} f0={1} mode="both" focus={['木','土']} relationText labels />
      {kind === 'wang' ? <WangShuaiScale x={360} y={570} w={560} N={n} f0={60} active="旺" /> : null}
    </> : null}
    {['bagua','bagua_detail'].includes(kind) ? <BaguaCompare cx={640} cy={390} size={270} N={n} f0={1} stepFrames={22} /> : null}
    {kind === 'dizhi' ? <DizhiWheel cx={360} cy={405} r={170} N={n} f0={1} active={['子','午']} showWuxing showDirection /> : null}
    {kind === 'najia' ? <NajiaPanel x={300} y={245} w={680} rowH={46} gua={DEMO_HEX.upper} lines={NAJIA_DEMO} N={n} f0={1} /> : null}
    {['cegui','cegui_rule'].includes(kind) ? <>
      <CeGuiBoard x={160} y={285} w={960} h={220} values={{原:null,会:null,运:null,世:null}} missing={['原','会','运','世']} N={n} f0={1} hierarchy />
      <CText cx={640} cy={585} size={22} family={FONT_KAI} color={kind==='cegui_rule'?CINNABAR:INK_FAINT}>{kind==='cegui_rule'?'输入 → 进位 → 中间值 → 结果（待核）':'结构先行，缺数不代算'}</CText>
    </> : null}
    {kind === 'sixxiang' ? <SiXiangPanel x={370} y={270} w={540} h={270} N={n} f0={1} active="少阴" /> : null}
    {['yingqi','yingqi_check'].includes(kind) ? <YingqiTimeline x={120} y={320} w={1040} N={n} f0={1} points={['输入','候选','初筛','复核','结论'].map((label, i) => ({label, kind:i===0?'起点':'待核', note:i===0?'已确认':'不代算'}))} /> : null}
  </AbsoluteFill>;
};
