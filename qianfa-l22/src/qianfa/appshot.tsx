import React from 'react';
import {useCurrentFrame, AbsoluteFill, Img, staticFile} from 'remotion';
import {CText, abs, SoftIn} from '../ui';
import {clamp01} from '../common';
import {FONT_KAI, FONT_KAI_BOLD, CINNABAR, INK, INK_MID, INK_SOFT} from '../shushu/paper';

/**
 * AppShot · 左功能列表 + 右手机截图（视频核心卖点：观众真正看到软件）
 *
 * 截图来自 public/assets/qianfa-l22/ui-*.png，全部手机竖屏比例（1000×1450 ≈ 9:13）。
 * 布局：
 *   - 左 40%：功能列表（items，当前条朱砂）
 *   - 右 60%：手机截图（手机壳 + 圆角 + 阴影）
 *   - 顶部：标题/副标题（可省）
 *   - 底部：foot 注脚（如「界面：汗瘥日期卡」）
 */

export interface AppShotSpec {
  title?: string;
  sub?: string;
  items?: string[];
  hot?: number;
  foot?: string;
  /** 截图路径（相对 public/） */
  shot?: string;
}

export const AppShot: React.FC<{spec: AppShotSpec; N: number; f0: number; dur: number}> = ({spec, N, f0, dur}) => {
  const n = N - f0;
  const {title, sub, items = [], hot = -1, foot, shot} = spec;

  const showHead = !!title;
  const shotSrc = shot ? staticFile(`assets/qianfa-l22/${shot}`) : null;

  return (
    <AbsoluteFill>
      {/* 顶部标题 */}
      {showHead && title ? (
        <>
          <CText cx={360} cy={90} size={40} weight={700} family={FONT_KAI_BOLD} color={INK}
                 opacity={clamp01((n - 2) / 14)} dy={-2}>{title}</CText>
          {sub ? (
            <CText cx={360} cy={140} size={22} weight={600} family={FONT_KAI} color={INK_SOFT}
                   opacity={clamp01((n - 8) / 14)} dy={-1}>{sub}</CText>
          ) : null}
        </>
      ) : null}

      {/* 左侧功能列表 */}
      <div style={{position: 'absolute', left: 56, top: 210, width: 470}}>
        {items.map((it, i) => {
          const p = clamp01((n - (10 + i * 8)) / 12);
          const isHot = i === hot;
          return (
            <div key={i} style={{opacity: p, marginBottom: 34}}>
              <div style={{
                display: 'flex', alignItems: 'center',
                borderLeft: `4px solid ${isHot ? CINNABAR : 'rgba(0,0,0,0.08)'}`,
                paddingLeft: 14,
              }}>
                <span style={{
                  fontFamily: FONT_KAI, fontWeight: 600, fontSize: 26,
                  color: isHot ? CINNABAR : INK_MID, lineHeight: 1.4,
                }}>{it}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 左列收口细线（PPT 语法：一个视觉块要有边界） */}
      <div style={{
        position: 'absolute', left: 56, top: 560, width: 380, height: 1.5,
        background: 'rgba(0,0,0,0.10)', opacity: clamp01((n - 20) / 12),
      }} />
      <CText cx={180} cy={598} size={19} weight={600} family={FONT_KAI}
             color={INK_SOFT} opacity={clamp01((n - 22) / 12)} dy={-1}>
        伤寒钤法排盘 · 开源
      </CText>

      {/* 右侧手机截图 */}
      {shotSrc ? (
        <div style={{
          position: 'absolute', right: 90, top: showHead ? 100 : 70,
          width: 420, height: 600, borderRadius: 28,
          background: '#fff', padding: 8,
          boxShadow: '0 14px 38px rgba(0,0,0,0.16)',
          opacity: clamp01((n - 6) / 14),
        }}>
          <Img src={shotSrc} style={{
            width: '100%', height: '100%', objectFit: 'cover',
            objectPosition: 'top', borderRadius: 22, display: 'block',
          }} />
        </div>
      ) : null}

      {/* 底注 */}
      {foot ? (
        <CText cx={640} cy={676} size={20} weight={600} family={FONT_KAI} color={INK_SOFT}
               opacity={clamp01((n - 16) / 12)} dy={-1}>{foot}</CText>
      ) : null}
    </AbsoluteFill>
  );
};
