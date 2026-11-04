import React from 'react';
import {CanvasScene, drawTitle} from './shared';

const draw = (ctx, frame, w, h, fps, p) => {
  const cx=w/2, cy=h/2;
  ctx.fillStyle = '#050510'; ctx.fillRect(0,0,w,h);
  const ease = t => t<0.5 ? 2*t*t : 1-Math.pow(-2*t+2,2)/2;
  const pp = ease(Math.min(1, Math.max(0, p)));
  const intensity = pp < 0.5 ? pp*2 : (1-pp)*2;
  const spiral = frame * 0.05;
  const arms = 6;
  const maxR = Math.min(w,h) * 0.45;
  for (let i=0;i<arms;i++) {
    for (let j=0;j<80;j++) {
      const t = j/80;
      const ang = spiral + i/arms*Math.PI*2 + t*Math.PI*4;
      const r = t * maxR * (0.5 + intensity*1.5);
      const x = cx + Math.cos(ang)*r;
      const y = cy + Math.sin(ang)*r;
      const sz = (1-t) * 6 * (0.5+intensity*0.5);
      const alpha = t * (0.3 + intensity*0.5);
      const hue = (i*60 + j*3 + frame*5) % 360;
      ctx.fillStyle = `hsla(${hue},70%,60%,${alpha})`;
      ctx.beginPath(); ctx.arc(x,y,sz,0,Math.PI*2); ctx.fill();
    }
  }
  // 中心黑洞
  const holeR = maxR * 0.15 * (1 + intensity * 3);
  const hg = ctx.createRadialGradient(cx,cy,0,cx,cy,holeR*2);
  hg.addColorStop(0, 'rgba(0,0,0,0.9)');
  hg.addColorStop(0.7, 'rgba(20,0,40,0.5)');
  hg.addColorStop(1, 'transparent');
  ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(cx,cy,holeR*2,0,Math.PI*2); ctx.fill();

  const fadeIn = Math.min(1, frame/20);
  const fadeOut = Math.max(0, 1-(frame-200)/40);
  const a = Math.min(fadeIn, fadeOut);
  if (a > 0) {
    drawTitle(ctx, 'VORTEX', frame, cx, cy - 80, a);
    ctx.globalAlpha = a * 0.6;
    ctx.font = '32px sans-serif'; ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(180,200,220,0.7)';
    ctx.fillText('漩涡吸入', cx, cy + 50);
    ctx.globalAlpha = 1;
  }
};

export const Vortex = () => <CanvasScene draw={draw} background="#050510" />;
