import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';

const Tunnel: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: '#0a0e27', justifyContent: 'center', alignItems: 'center'}}>
      <div style={{color: 'white', fontSize: 60, fontFamily: 'sans-serif'}}>
        Frame {frame}
      </div>
    </AbsoluteFill>
  );
};

export { Tunnel };
