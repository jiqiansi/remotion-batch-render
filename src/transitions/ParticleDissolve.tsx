import React from 'react';
import {CanvasScene, drawTitle} from './shared';

const draw = (ctx, frame, w, h, fps, p) => {
  ctx.fillStyle = '#050515'; ctx.fillRect(0,0,w,h);
  const ease = t => t<0.5 ? 2*t*t : 1-Math.pow(-2*t+2,2)/2;
  const pp = ease(Math.min(1, Math.max(0, p)));
  const dissolve = pp;

  const cx = w/2, cy = h/2;
  const cols = 40, rows = 22;
  const cellW = w / cols;
  const cellH = h / rows;
  const particleSize = Math.min(cellW, cellH) * 0.6;

  for (let i=0;i<cols;i++) {
    for (let j=0;j<rows;j++) {
      const seed = i*73.3 + j*131.7;
      const delay = (seed % 10) / 10;
      const localDissolve = Math.max(0, Math.min(1, (dissolve - delay*0.5) / 0.5));
      const offset = localDissolve * (Math.sin(seed)*50 + Math.cos(seed*0.7)*30);
      const ox = i*cellW + cellW/2 + offset;
      const oy = j*cellH + cellH/2 + offset * 0.5;
      const sz = particleSize * (1 - localDissolve * 0.8);
      if (sz < 0.5) continue;
      const alpha = 1 - localDissolve;
      const hue = (i*8 + j*12 + frame*2) % 360;
      ctx.fillStyle = `hsla(${hue},60%,50%,${alpha})`;
      ctx.beginPath();
      ctx.arc(ox, oy, sz, 0, Math.PI*2);
      ctx.fill();
    }
  }

  const fadeIn = Math.min(1, frame/30);
  const fadeOut = Math.max(0, 1-(frame-200)/40);
  const a = Math.min(fadeIn, fadeOut);
  if (a > 0) {
    drawTitle(ctx, 'PARTICLE DISSOLVE', frame, cx, cy - 80, a);
    ctx.globalAlpha = a * 0.6;
    ctx.font = '32px sans-serif'; ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(180,200,220,0.7)';
    ctx.fillText('粒子消散', cx, cy + 50);
    ctx.globalAlpha = 1;
  }
};

export const ParticleDissolve = () => <CanvasScene draw={draw} background="#050515" />;
