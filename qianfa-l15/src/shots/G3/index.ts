import React from 'react';
import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SampleShot} from '../SampleShot';
import {sentenceShot} from '../timing';
const shot = (kind: Parameters<typeof SampleShot>[0]['kind']) => React.createElement(SampleShot, {kind});
export const SHOTS_G3: ShotDef[] = [
  {id:'SC09', ...sentenceShot(8), Comp:() => shot('hex_check')},
  {id:'SC10', ...sentenceShot(9), Comp:() => shot('mutual')},
  {id:'SC11', ...sentenceShot(10), Comp:() => shot('moving')},
  {id:'SC12', ...sentenceShot(11), Comp:() => shot('change')},
];
export const BG_G3: BgSpec[] = [];
export const FOOTAGE_G3: FootageSpec[] = [];
