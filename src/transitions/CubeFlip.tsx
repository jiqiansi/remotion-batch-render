import React from 'react';
import {CanvasScene, drawTitle} from './shared';

const draw = (ctx, frame, w, h, fps, p) => {
  ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0,0,w,h);
  const ease = t => t<0.5 ? 2*t*t : 1-Math.pow(-2*t+2,2)/2;
  const pp = ease(Math.min(1, Math.max(0, p)));
  const angle = pp * Math.PI * 2;

  const cx = w/2, cy = h/2;
  const size = Math.min(w, h) * 0.25;

  // 模拟3D方块旋转（简化投影）
  const faces = [
    {z: 0, color: '#1a1a3e'},   // 前
    {z: -1, color: '#2a2a5e'},  // 后
    {z: 0.5, color: '#1e1e4e'}, // 右
    {z: -0.5, color: '#0e0e2e'}, // 左
    {z: 1, color: '#3a3a6e'},   // 上
    {z: -1, color: '#0a0a1a'},  // 下
  ];

  // 计算投影
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  const scale = 0.8 + Math.abs(cosA) * 0.2;

  // 画6个面（简化为四边形投影）
  for (let face=0; face<6; face++) {
    const f = faces[face];
    const fz = f.z;
    const offsetX = Math.sin(angle) * fz * size * 0.5;
    const offsetY = Math.cos(angle) * fz * size * 0.5;
    const alpha = Math.abs(cosA) * 0.5 + 0.3;

    ctx.fillStyle = f.color;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.moveTo(cx + offsetX - size*scale/2, cy + offsetY - size*scale/2);
    ctx.lineTo(cx + offsetX + size*scale/2, cy + offsetY - size*scale/2);
    ctx.lineTo(cx + offsetX + size*scale/2, cy + offsetY + size*scale/2);
    ctx.lineTo(cx + offsetX - size*scale/2, cy + offsetY + size*scale/2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = `rgba(${100+face*20},150,200,0.5)`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // 发光边缘
  if (pp > 0.2 && pp < 0.8) {
    const glow = Math.sin(pp * Math.PI);
    ctx.strokeStyle = `rgba(100,200,255,${glow*0.5})`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, size * scale * 1.2, 0, Math.PI*2);
    ctx.stroke();
  }

  const fadeIn = Math.min(1, frame/30);
  const fadeOut = Math.max(0, 1-(frame-200)/40);
  const a = Math.min(fadeIn, fadeOut);
  if (a > 0) {
    drawTitle(ctx, 'CUBE FLIP', frame, cx, cy - size - 80, a);
    ctx.globalAlpha = a * 0.6;
    ctx.font = '32px sans-serif'; ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(180,200,220,0.7)';
    ctx.fillText('3D方块翻转', cx, cy + size + 80);
    ctx.globalAlpha = 1;
  }
};

export const CubeFlip = () => <CanvasScene draw={draw} background="#0a0a1a" />;
