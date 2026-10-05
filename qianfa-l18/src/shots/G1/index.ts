import React from 'react';
import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SampleShot} from '../SampleShot';
import {sentenceShot, titleShot} from '../timing';
const shot = (kind: Parameters<typeof SampleShot>[0]['kind']) => React.createElement(SampleShot, {kind});
export const SHOTS_G1: ShotDef[] = [
  {id:'SC01', ...titleShot(), Comp:() => shot('title')},
  {id:'SC02', ...sentenceShot(1), Comp:() => shot('intro')},
  {id:'SC03', ...sentenceShot(2), Comp:() => shot('question')},
  {id:'SC04', ...sentenceShot(3), Comp:() => shot('chain')},
];
export const BG_G1: BgSpec[] = [];
export const FOOTAGE_G1: FootageSpec[] = [];
