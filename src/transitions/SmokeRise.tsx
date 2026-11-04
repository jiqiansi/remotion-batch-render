import React from 'react';
import {CanvasScene, drawTitle} from './shared';

const draw = (ctx, frame, w, h, fps, p) => {
  ctx.fillStyle = '#0a0a15'; ctx.fillRect(0,0,w,h);
  const ease = t => t<0.5 ? 2*t*t : 1-Math.pow(-2*t+2,2)/2;
  const pp = ease(Math.min(1, Math.max(0, p)));
  const smokeIntensity = Math.sin(pp * Math.PI);

  const cx = w/2;
  const groundY = h * 0.85;

  // 多个烟柱
  const puffs = 30;
  for (let i=0;i<puffs;i++) {
    const seed = i * 137.5;
    const x = cx + Math.sin(seed) * w * 0.3;
    const baseY = groundY;
    const riseSpeed = 1 + (seed % 3) * 0.5;
    const rise = frame * riseSpeed * 2;
    const y = baseY - rise * smokeIntensity * 3;
    if (y < 0) continue;
    const r = 30 + (seed % 5) * 15 + smokeIntensity * 20;
    const alpha = (1 - y/h) * smokeIntensity * 0.4;
    const hue = 200 + (seed % 3) * 20;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, `hsla(${hue},30%,50%,${alpha})`);
    grad.addColorStop(0.5, `hsla(${hue},20%,30%,${alpha*0.5})`);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI*2);
    ctx.fill();
  }

  // 地面发光
  const groundGrad = ctx.createLinearGradient(0, groundY, 0, h);
  groundGrad.addColorStop(0, `rgba(100,150,200,${smokeIntensity*0.3})`);
  groundGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, groundY, w, h - groundY);

  // 火光
  for (let i=0;i<5;i++) {
    const fx = cx + Math.sin(i*1.7) * w * 0.2;
    const fireGrad = ctx.createRadialGradient(fx, groundY, 0, fx, groundY, 100);
    fireGrad.addColorStop(0, `rgba(255,150,50,${smokeIntensity*0.3})`);
    fireGrad.addColorStop(0.5, `rgba(255,100,30,${smokeIntensity*0.1})`);
    fireGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = fireGrad;
    ctx.beginPath();
    ctx.arc(fx, groundY, 100, 0, Math.PI*2);
    ctx.fill();
  }

  const fadeIn = Math.min(1, frame/30);
  const fadeOut = Math.max(0, 1-(frame-200)/40);
  const a = Math.min(fadeIn, fadeOut);
  if (a > 0) {
    drawTitle(ctx, 'SMOKE RISE', frame, cx, h * 0.35, a);
    ctx.globalAlpha = a * 0.6;
    ctx.font = '32px sans-serif'; ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(180,200,220,0.7)';
    ctx.fillText('烟雾升腾', cx, h * 0.35 + 80);
    ctx.globalAlpha = 1;
  }
};

export const SmokeRise = () => <CanvasScene draw={draw} background="#0a0a15" />;
