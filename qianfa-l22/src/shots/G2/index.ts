import React from 'react';
import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SampleShot} from '../SampleShot';
import {sentenceShot} from '../timing';
const shot = (kind: Parameters<typeof SampleShot>[0]['kind']) => React.createElement(SampleShot, {kind});
export const SHOTS_G2: ShotDef[] = [
  {id:'SC05', ...sentenceShot(4), Comp:() => shot('gua')},
  {id:'SC06', ...sentenceShot(5), Comp:() => shot('gua_detail')},
  {id:'SC07', ...sentenceShot(6), Comp:() => shot('split')},
  {id:'SC08', ...sentenceShot(7), Comp:() => shot('hex')},
];
export const BG_G2: BgSpec[] = [];
export const FOOTAGE_G2: FootageSpec[] = [];
