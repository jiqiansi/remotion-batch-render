import React from 'react';
import {CanvasScene, drawTitle} from './shared';

const draw = (ctx, frame, w, h, fps, p) => {
  ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0,0,w,h);
  const ease = t => t<0.5 ? 2*t*t : 1-Math.pow(-2*t+2,2)/2;
  const pp = ease(Math.min(1, Math.max(0, p)));
  const leakIntensity = Math.sin(pp * Math.PI);

  // 模拟胶片漏光
  for (let i=0;i<8;i++) {
    const seed = i * 173.7;
    const x = (seed % 1) * w;
    const y = (seed % 0.5) * h;
    const r = 150 + (i%3)*100;
    const hue = (i*45 + frame*2) % 360;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    const alpha = leakIntensity * (0.3 + (i%3)*0.15);
    grad.addColorStop(0, `hsla(${hue},80%,60%,${alpha})`);
    grad.addColorStop(0.5, `hsla(${hue+30},70%,40%,${alpha*0.3})`);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
  }
  // 顶部光条
  const topGrad = ctx.createLinearGradient(0, 0, 0, h*0.4);
  topGrad.addColorStop(0, `rgba(255,200,100,${leakIntensity*0.4})`);
  topGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = topGrad; ctx.fillRect(0, 0, w, h*0.4);

  // 底部光条
  const botGrad = ctx.createLinearGradient(0, h, 0, h*0.6);
  botGrad.addColorStop(0, `rgba(100,200,255,${leakIntensity*0.3})`);
  botGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = botGrad; ctx.fillRect(0, h*0.6, w, h*0.4);

  // 条纹噪点
  ctx.globalAlpha = leakIntensity * 0.1;
  for (let i=0;i<20;i++) {
    const y = (i * 50 + frame * 3) % h;
    ctx.fillStyle = i%2===0 ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, y, w, 2);
  }
  ctx.globalAlpha = 1;

  const fadeIn = Math.min(1, frame/30);
  const fadeOut = Math.max(0, 1-(frame-200)/40);
  const a = Math.min(fadeIn, fadeOut) * (0.5 + leakIntensity*0.5);
  if (a > 0) {
    drawTitle(ctx, 'LIGHT LEAK', frame, w/2, h/2 - 60, a);
    ctx.globalAlpha = a * 0.6;
    ctx.font = '32px sans-serif'; ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,220,180,0.8)';
    ctx.fillText('胶片漏光', w/2, h/2 + 50);
    ctx.globalAlpha = 1;
  }
};

export const LightLeak = () => <CanvasScene draw={draw} background="#0a0a0a" />;
