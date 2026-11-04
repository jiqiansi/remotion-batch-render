import React from 'react';
import {
  AbsoluteFill,
  Canvas,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from 'remotion';

/**
 * 隧道转场 (Tunnel Transition)
 * 3D 透视隧道 + 环形光束 + 粒子，纯 Canvas 实现。
 * 动画分两段：0-50% 隧道收缩加速，50-100% 爆发式展开 + 白闪
 */

export interface TunnelProps {
  colorA?: string;
  colorB?: string;
  duration?: number;
  ringCount?: number;
  particleCount?: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

const Tunnel: React.FC<TunnelProps> = ({
  colorA = '#0a0e27',
  colorB = '#1a0a3e',
  duration = 60,
  ringCount = 24,
  particleCount = 40,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const progress = frame / duration;
  const ease = Easing.inOut(Easing.cubic);
  const p = ease(clamp(progress, 0, 1));

  return (
    <AbsoluteFill style={{ background: colorA }}>
      <Canvas
        width={width}
        height={height}
        draw={(ctx) => {
          const cx = width / 2;
          const cy = height / 2;
          const maxR = Math.max(width, height) * 0.85;

          const phase = p < 0.5 ? p * 2 : (1 - p) * 2;
          const speed = phase < 0.5 ? phase * 2 : 2 - phase * 2;
          const zoom = 1 + speed * 4;

          // 背景径向渐变
          const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
          bgGrad.addColorStop(0, colorB);
          bgGrad.addColorStop(0.6, colorA);
          bgGrad.addColorStop(1, '#000');
          ctx.fillStyle = bgGrad;
          ctx.fillRect(0, 0, width, height);

          // 环形隧道
          ctx.lineWidth = 2;
          for (let i = 0; i < ringCount; i++) {
            const depth = (i / ringCount + frame / (fps * 3)) % 1;
            const baseR = depth * maxR * 0.9 * zoom;
            if (baseR < 2) continue;

            const alpha = depth * 0.85 * (0.5 + speed * 0.5);
            const hue = (i * 15 + frame * 2) % 360;
            ctx.strokeStyle = `hsla(${hue}, 70%, 55%, ${alpha})`;
            ctx.lineWidth = 1.5 + depth * 3;
            ctx.beginPath();
            ctx.arc(cx, cy, baseR, 0, Math.PI * 2);
            ctx.stroke();

            // 放射线
            if (i % 3 === 0 && depth > 0.3) {
              ctx.strokeStyle = `hsla(${hue}, 60%, 50%, ${alpha * 0.4})`;
              ctx.lineWidth = 1;
              for (let a = 0; a < 12; a++) {
                const ang = (a / 12) * Math.PI * 2 + frame * 0.01;
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.lineTo(cx + Math.cos(ang) * baseR, cy + Math.sin(ang) * baseR);
                ctx.stroke();
              }
            }
          }

          // 中心光核
          const coreR = maxR * 0.12 * (1 + speed * 3);
          const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 2);
          coreGrad.addColorStop(0, `hsla(${(frame * 3) % 360}, 80%, 75%, 0.95)`);
          coreGrad.addColorStop(0.5, `hsla(${(frame * 3 + 60) % 360}, 70%, 50%, 0.4)`);
          coreGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = coreGrad;
          ctx.beginPath();
          ctx.arc(cx, cy, coreR * 2, 0, Math.PI * 2);
          ctx.fill();

          // 粒子
          for (let i = 0; i < particleCount; i++) {
            const seed = i * 137.5 + frame * 0.1;
            const ang = (seed * 0.618) % (Math.PI * 2);
            const dist = ((seed * 0.7) % 1) * maxR * zoom;
            const px = cx + Math.cos(ang) * dist;
            const py = cy + Math.sin(ang) * dist;
            const size = (dist / maxR) * 4 + 1;
            const pa = (1 - dist / maxR) * 0.8 * (0.4 + speed * 0.6);
            ctx.fillStyle = `hsla(${(i * 20 + frame * 4) % 360}, 70%, 60%, ${pa})`;
            ctx.beginPath();
            ctx.arc(px, py, size, 0, Math.PI * 2);
            ctx.fill();
          }

          // 爆发白闪
          if (p > 0.45 && p < 0.6) {
            const flash = interpolate(p, [0.45, 0.5, 0.6], [0, 1, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: Easing.out(Easing.quad),
            });
            ctx.fillStyle = `rgba(255, 255, 255, ${flash * 0.85})`;
            ctx.fillRect(0, 0, width, height);
          }
        }}
      />
    </AbsoluteFill>
  );
};

export { Tunnel };
