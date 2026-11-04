import React from 'react';
import {CanvasScene, drawTitle, DURATION} from './shared';

const draw = (ctx, frame, w, h, fps, p) => {
  const cx = w/2, cy = h/2;
  const maxR = Math.max(w,h) * 0.85;
  const ease = (t) => t < 0.5 ? 2*t*t : 1-Math.pow(-2*t+2,2)/2;
  const pp = ease(Math.max(0, Math.min(1, p)));
  const phase = pp < 0.5 ? pp*2 : (1-pp)*2;
  const speed = phase < 0.5 ? phase*2 : 2-phase*2;
  const zoom = 1 + speed * 4;

  const bg = ctx.createRadialGradient(cx,cy,0,cx,cy,maxR);
  bg.addColorStop(0, '#1a0a3e'); bg.addColorStop(0.5, '#0a0e27'); bg.addColorStop(1, '#000');
  ctx.fillStyle = bg; ctx.fillRect(0,0,w,h);

  for (let i=0;i<40;i++) {
    const depth = (i/40 + frame/(fps*3)) % 1;
    const r = depth * maxR * 0.9 * zoom;
    if (r < 2) continue;
    const alpha = depth * 0.85 * (0.5+speed*0.5);
    const hue = (i*15 + frame*2) % 360;
    ctx.strokeStyle = `hsla(${hue},70%,55%,${alpha})`;
    ctx.lineWidth = 1.5 + depth*3;
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.stroke();
    if (i%3===0 && depth>0.3) {
      ctx.strokeStyle = `hsla(${hue},60%,50%,${alpha*0.3})`;
      for (let a=0;a<12;a++) {
        const ang = a/12*Math.PI*2 + frame*0.01;
        ctx.beginPath(); ctx.moveTo(cx,cy);
        ctx.lineTo(cx+Math.cos(ang)*r, cy+Math.sin(ang)*r); ctx.stroke();
      }
    }
  }
  const coreR = maxR*0.12*(1+speed*3);
  const cg = ctx.createRadialGradient(cx,cy,0,cx,cy,coreR*2);
  cg.addColorStop(0, `hsla(${(frame*3)%360},80%,75%,0.95)`);
  cg.addColorStop(0.5, `hsla(${(frame*3+60)%360},70%,50%,0.4)`);
  cg.addColorStop(1, 'transparent');
  ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(cx,cy,coreR*2,0,Math.PI*2); ctx.fill();

  for (let i=0;i<60;i++) {
    const seed = i*137.5+frame*0.1;
    const ang = (seed*0.618)%(Math.PI*2);
    const dist = ((seed*0.7)%1)*maxR*zoom;
    const px = cx+Math.cos(ang)*dist, py = cy+Math.sin(ang)*dist;
    const sz = (dist/maxR)*4+1;
    const pa = (1-dist/maxR)*0.8*(0.4+speed*0.6);
    ctx.fillStyle = `hsla(${(i*20+frame*4)%360},70%,60%,${pa})`;
    ctx.beginPath(); ctx.arc(px,py,sz,0,Math.PI*2); ctx.fill();
  }
  if (p > 0.45 && p < 0.6) {
    const flash = interpolate2(p, 0.45, 0.5, 0.6);
    ctx.fillStyle = `rgba(255,255,255,${flash*0.85})`; ctx.fillRect(0,0,w,h);
  }
  const labelAlpha = pp > 0.2 && pp < 0.4 ? interpolate2(pp, 0.2, 0.3, 0.4) : (pp > 0.6 ? interpolate2(pp, 0.6, 0.65, 0.5) : 0);
  if (labelAlpha > 0) drawTitle(ctx, 'TUNNEL', frame, cx, cy, labelAlpha);
};
function interpolate2(v,a,b,c){return v<a?0:v>c?0:v<b?(v-a)/(b-a):1-(v-b)/(c-b);}

export const Tunnel = () => <CanvasScene draw={draw} background="#0a0e27" />;
