import React from 'react';
import {Composition} from 'remotion';
import {Tunnel} from './transitions/Tunnel';
import {Shatter} from './transitions/Shatter';
import {Vortex} from './transitions/Vortex';
import {LightLeak} from './transitions/LightLeak';
import {Glitch} from './transitions/Glitch';
import {PaperFold} from './transitions/PaperFold';
import {ParticleDissolve} from './transitions/ParticleDissolve';
import {WaveWarp} from './transitions/WaveWarp';
import {CubeFlip} from './transitions/CubeFlip';
import {SmokeRise} from './transitions/SmokeRise';

const FPS = 30;
const W = 1920;
const H = 1080;
const DUR = 240; // 8 seconds

const comps: [string, React.FC<any>][] = [
  ['Tunnel', Tunnel],
  ['Shatter', Shatter],
  ['Vortex', Vortex],
  ['LightLeak', LightLeak],
  ['Glitch', Glitch],
  ['PaperFold', PaperFold],
  ['ParticleDissolve', ParticleDissolve],
  ['WaveWarp', WaveWarp],
  ['CubeFlip', CubeFlip],
  ['SmokeRise', SmokeRise],
];

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {comps.map(([id, Comp]) => (
        <Composition
          key={id}
          id={id}
          component={Comp}
          durationInFrames={DUR}
          fps={FPS}
          width={W}
          height={H}
          defaultProps={{duration: DUR}}
        />
      ))}
    </>
  );
};
