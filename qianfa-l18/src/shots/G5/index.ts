import React from 'react';
import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SampleShot} from '../SampleShot';
import {sentenceShot} from '../timing';
const shot = (kind: Parameters<typeof SampleShot>[0]['kind']) => React.createElement(SampleShot, {kind});
export const SHOTS_G5: ShotDef[] = [
  {id:'SC17', ...sentenceShot(16), Comp:() => shot('tiyong_relation')},
  {id:'SC18', ...sentenceShot(17), Comp:() => shot('bagua')},
  {id:'SC19', ...sentenceShot(18), Comp:() => shot('bagua_detail')},
  {id:'SC20', ...sentenceShot(19), Comp:() => shot('dizhi')},
];
export const BG_G5: BgSpec[] = [];
export const FOOTAGE_G5: FootageSpec[] = [];
