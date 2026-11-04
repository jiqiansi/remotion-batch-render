import React from 'react';
import {CanvasScene, drawTitle} from './shared';

const draw = (ctx, frame, w, h, fps, p) => {
  ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0,0,w,h);
  const ease = t => t<0.5 ? 2*t*t : 1-Math.pow(-2*t+2,2)/2;
  const pp = ease(Math.min(1, Math.max(0, p)));
  const fold = pp * Math.PI;

  const cx = w/2, cy = h/2;
  const panelW = w * 0.4;
  const panelH = h * 0.6;

  // 左半面
  ctx.save();
  ctx.translate(cx, cy);
  ctx.transform(Math.cos(fold), 0, 0, 1, -panelW*Math.sin(fold)/2, 0);
  const leftGrad = ctx.createLinearGradient(-panelW, 0, 0, 0);
  leftGrad.addColorStop(0, '#1a1a2e');
  leftGrad.addColorStop(1, '#2a2a4e');
  ctx.fillStyle = leftGrad;
  ctx.fillRect(-panelW, -panelH/2, panelW, panelH);
  ctx.strokeStyle = 'rgba(100,150,200,0.3)';
  ctx.lineWidth = 1;
  for (let i=0;i<10;i++) {
    ctx.beginPath();
    ctx.moveTo(-panelW+i*panelW/10, -panelH/2);
    ctx.lineTo(-panelW+i*panelW/10, panelH/2);
    ctx.stroke();
  }
  ctx.restore();

  // 右半面
  ctx.save();
  ctx.translate(cx, cy);
  ctx.transform(Math.cos(fold), 0, 0, 1, panelW*Math.sin(fold)/2, 0);
  const rightGrad = ctx.createLinearGradient(0, 0, panelW, 0);
  rightGrad.addColorStop(0, '#2a2a4e');
  rightGrad.addColorStop(1, '#1a1a2e');
  ctx.fillStyle = rightGrad;
  ctx.fillRect(0, -panelH/2, panelW, panelH);
  ctx.restore();

  // 折痕高光
  if (fold > 0.1) {
    ctx.strokeStyle = `rgba(255,255,255,${fold*0.3})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy - panelH/2);
    ctx.lineTo(cx, cy + panelH/2);
    ctx.stroke();
  }

  const fadeIn = Math.min(1, frame/30);
  const fadeOut = Math.max(0, 1-(frame-200)/40);
  const a = Math.min(fadeIn, fadeOut);
  if (a > 0) {
    drawTitle(ctx, 'PAPER FOLD', frame, cx, cy - panelH/2 - 80, a);
    ctx.globalAlpha = a * 0.6;
    ctx.font = '32px sans-serif'; ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(180,200,220,0.7)';
    ctx.fillText('纸张折叠', cx, cy + panelH/2 + 80);
    ctx.globalAlpha = 1;
  }
};

export const PaperFold = () => <CanvasScene draw={draw} background="#0a0a1a" />;
