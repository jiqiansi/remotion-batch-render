import React from 'react';
import {CanvasScene, drawTitle} from './shared';

const draw = (ctx, frame, w, h, fps, p) => {
  const cx=w/2, cy=h/2;
  ctx.fillStyle = '#0a0a15'; ctx.fillRect(0,0,w,h);
  const n = 60;
  const ease = t => t<0.5 ? 2*t*t : 1-Math.pow(-2*t+2,2)/2;
  const pp = ease(Math.min(1, Math.max(0, p)));
  const explode = pp * 3;
  for (let i=0;i<n;i++) {
    const seed = i * 73.3;
    const baseAng = (seed % Math.PI*2);
    const baseR = (seed % 1) * Math.min(w,h) * 0.3;
    const bx = cx + Math.cos(baseAng)*baseR;
    const by = cy + Math.sin(baseAng)*baseR;
    const speed = 2 + (seed % 5);
    const vx = Math.cos(baseAng) * speed * explode * 80;
    const vy = Math.sin(baseAng) * speed * explode * 80 - explode * 30;
    const x = bx + vx;
    const y = by + vy + explode * 100;
    const rot = explode * (seed % 7) * 0.1;
    const sz = (40 - explode*15) * (0.5 + (seed%3)/3);
    const alpha = Math.max(0, 1 - explode * 0.8);
    if (alpha <= 0) continue;
    ctx.save();
    ctx.translate(x, y); ctx.rotate(rot);
    ctx.globalAlpha = alpha;
    const hue = (i*20 + frame*3) % 360;
    ctx.fillStyle = `hsla(${hue},60%,50%,1)`;
    ctx.strokeStyle = `hsla(${hue},70%,60%,0.8)`;
    ctx.lineWidth = 2;
    ctx.fillRect(-sz/2, -sz/2, sz, sz);
    ctx.strokeRect(-sz/2, -sz/2, sz, sz);
    ctx.restore();
  }
  const fadeIn = Math.min(1, frame/30);
  const fadeOut = Math.max(0, 1-(frame-180)/60);
  const labelA = Math.min(fadeIn, fadeOut);
  if (labelA > 0) {
    drawTitle(ctx, 'SHATTER', frame, cx, cy - 120, labelA);
    ctx.globalAlpha = labelA * 0.6;
    ctx.font = '32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(180,200,220,0.7)';
    ctx.fillText('碎片爆炸消散', cx, cy + 40);
    ctx.globalAlpha = 1;
  }
  if (p > 0.3 && p < 0.5) {
    const fl = interpolate3(p, 0.3, 0.4, 0.5);
    ctx.fillStyle = `rgba(255,100,50,${fl*0.3})`; ctx.fillRect(0,0,w,h);
  }
};
function interpolate3(v,a,b,c){return v<a?0:v>c?0:v<b?(v-a)/(b-a):1-(v-b)/(c-b);}

export const Shatter = () => <CanvasScene draw={draw} background="#0a0a15" />;
