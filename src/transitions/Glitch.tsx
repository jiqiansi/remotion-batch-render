import React from 'react';
import {CanvasScene, drawTitle} from './shared';

const draw = (ctx, frame, w, h, fps, p) => {
  ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0,0,w,h);
  const ease = t => t<0.5 ? 2*t*t : 1-Math.pow(-2*t+2,2)/2;
  const pp = ease(Math.min(1, Math.max(0, p)));
  const glitchIntensity = Math.sin(pp * Math.PI);

  // 扫描线
  for (let y=0; y<h; y+=3) {
    const offset = Math.sin(y*0.01 + frame*0.1) * glitchIntensity * 30;
    ctx.fillStyle = `rgba(${10+Math.random()*20},${10+Math.random()*20},${20+Math.random()*30},0.8)`;
    ctx.fillRect(offset, y, w, 2);
  }
  // 随机色块
  for (let i=0;i<15*glitchIntensity;i++) {
    const x = Math.random()*w;
    const y = Math.random()*h;
    const sz = 20 + Math.random()*100;
    const hue = Math.random()*360;
    ctx.fillStyle = `hsla(${hue},80%,50%,${0.3+Math.random()*0.3})`;
    ctx.fillRect(x, y, sz, Math.random()*20);
  }
  // RGB 分离文字效果
  ctx.font = 'bold 120px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const text = 'GLITCH';
  const cx = w/2, cy = h/2;
  const off = glitchIntensity * 20;
  ctx.fillStyle = `rgba(255,0,0,${0.5*glitchIntensity})`;
  ctx.fillText(text, cx-off, cy);
  ctx.fillStyle = `rgba(0,255,0,${0.5*glitchIntensity})`;
  ctx.fillText(text, cx, cy);
  ctx.fillStyle = `rgba(0,0,255,${0.5*glitchIntensity})`;
  ctx.fillText(text, cx+off, cy);
  ctx.fillStyle = `rgba(255,255,255,${0.9})`;
  ctx.fillText(text, cx, cy);

  const fadeIn = Math.min(1, frame/20);
  const fadeOut = Math.max(0, 1-(frame-210)/30);
  const a = Math.min(fadeIn, fadeOut);
  if (a > 0) {
    ctx.globalAlpha = a * 0.5;
    ctx.font = '32px sans-serif'; ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(180,200,220,0.7)';
    ctx.fillText('数字故障', cx, cy + 100);
    ctx.globalAlpha = 1;
  }
};

export const Glitch = () => <CanvasScene draw={draw} background="#0a0a0a" />;
