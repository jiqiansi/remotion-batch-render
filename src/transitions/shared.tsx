import React, {useRef, useEffect} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing} from 'remotion';

/** 共享：8秒（240帧）转场，原生 Canvas + ref */

export const DURATION = 240;
export const FPS = 30;
export const W = 1920;
export const H = 1080;

/** 通用 Canvas 组件，传入 draw 回调 */
export const CanvasScene: React.FC<{
  draw: (ctx: CanvasRenderingContext2D, frame: number, w: number, h: number, fps: number, progress: number) => void;
  background?: string;
}> = ({draw, background = '#000'}) => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = width;
    canvas.height = height;
    const progress = frame / DURATION;
    draw(ctx, frame, width, height, fps, progress);
  }, [frame, width, height, fps, draw]);

  return (
    <AbsoluteFill style={{background, overflow: 'hidden'}}>
      <canvas ref={canvasRef} style={{width: '100%', height: '100%'}} />
    </AbsoluteFill>
  );
};

/** 画标题文字 */
export function drawTitle(ctx: CanvasRenderingContext2D, text: string, frame: number, cx: number, cy: number, alpha: number = 1) {
  const scale = interpolate(frame, [0, 20], [0.8, 1.0], {extrapolateLeft: 'clamp'});
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = `bold ${Math.round(80 * scale)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.shadowColor = 'rgba(100,200,255,0.5)';
  ctx.shadowBlur = 30;
  ctx.fillText(text, cx, cy);
  ctx.restore();
}

