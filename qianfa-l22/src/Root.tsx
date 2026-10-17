import React from 'react';
import {Composition} from 'remotion';
import {W, H, FPS, TOTAL_FRAMES} from './common';
import {Video} from './Main';
import {Sheet} from './Sheet';

export const Root: React.FC = () => (
  <>
    <Composition id="Video" component={Video} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
    {/* 接触印相：一次启动出一期的全部关键帧，别再一帧一次浏览器（2026-10-03） */}
    <Composition id="Sheet" component={Sheet} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1280} height={360} />
  </>
);
