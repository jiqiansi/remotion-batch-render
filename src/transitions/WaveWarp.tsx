import React from 'react';
import {CanvasScene, drawTitle} from './shared';

const draw = (ctx, frame, w, h, fps, p) => {
  ctx.fillStyle = '#0a0a20'; ctx.fillRect(0,0,w,h);
  const ease = t => t<0.5 ? 2*t*t : 1-Math.pow(-2*t+2,2)/2;
  const pp = ease(Math.min(1, Math.max(0, p)));
  const waveIntensity = Math.sin(pp * Math.PI);

  // 多层波浪网格
  const layers = 6;
  for (let layer=0; layer<layers; layer++) {
    const layerOffset = layer / layers;
    const hue = (layer*40 + frame*3) % 360;
    ctx.strokeStyle = `hsla(${hue},60%,50%,${0.3 + layerOffset*0.2})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let x=0; x<=w; x+=10) {
      const waveAmp = waveIntensity * (50 + layer*20);
      const waveFreq = 0.005 + layer*0.002;
      const y = h * (0.3 + layer*0.1) + Math.sin(x*waveFreq + frame*0.05 + layer) * waveAmp;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // 垂直波浪线
  for (let layer=0; layer<4; layer++) {
    const hue = (layer*60 + frame*4 + 180) % 360;
    ctx.strokeStyle = `hsla(${hue},70%,55%,${0.2 + waveIntensity*0.3})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let y=0; y<=h; y+=10) {
      const waveAmp = waveIntensity * (40 + layer*15);
      const waveFreq = 0.004 + layer*0.001;
      const x = w * (0.3 + layer*0.1) + Math.sin(y*waveFreq + frame*0.04 + layer*2) * waveAmp;
      if (y === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // 中心文字
  const fadeIn = Math.min(1, frame/30);
  const fadeOut = Math.max(0, 1-(frame-200)/40);
  const a = Math.min(fadeIn, fadeOut) * (0.5 + waveIntensity*0.5);
  if (a > 0) {
    drawTitle(ctx, 'WAVE WARP', frame, w/2, h/2, a);
    ctx.globalAlpha = a * 0.6;
    ctx.font = '32px sans-serif'; ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(180,200,220,0.7)';
    ctx.fillText('波纹扭曲', w/2, h/2 + 80);
    ctx.globalAlpha = 1;
  }
};

export const WaveWarp = () => <CanvasScene draw={draw} background="#0a0a20" />;
