import React from 'react';
import {Composition} from 'remotion';
import {Tunnel} from './transitions/Tunnel';

const DURATION = 60; // 2 seconds at 30fps
const WIDTH = 1920;
const HEIGHT = 1080;
const FPS = 30;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Tunnel"
        component={Tunnel}
        durationInFrames={DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{
          duration: DURATION,
        }}
      />
    </>
  );
};
