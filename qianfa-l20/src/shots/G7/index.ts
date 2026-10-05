import React from 'react';
import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SampleShot} from '../SampleShot';
import {sentenceShot} from '../timing';
const shot = (kind: Parameters<typeof SampleShot>[0]['kind']) => React.createElement(SampleShot, {kind});
export const SHOTS_G7: ShotDef[] = [
  {id:'SC25', ...sentenceShot(24), Comp:() => shot('yingqi')},
  {id:'SC26', ...sentenceShot(25), Comp:() => shot('yingqi_check')},
  {id:'SC27', ...sentenceShot(26), Comp:() => shot('boundary')},
  {id:'SC28', ...sentenceShot(27), Comp:() => shot('review')},
];
export const BG_G7: BgSpec[] = [];
export const FOOTAGE_G7: FootageSpec[] = [];
