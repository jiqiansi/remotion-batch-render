import React from 'react';
import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SampleShot} from '../SampleShot';
import {sentenceShot} from '../timing';
const shot = (kind: Parameters<typeof SampleShot>[0]['kind']) => React.createElement(SampleShot, {kind});
export const SHOTS_G6: ShotDef[] = [
  {id:'SC21', ...sentenceShot(20), Comp:() => shot('najia')},
  {id:'SC22', ...sentenceShot(21), Comp:() => shot('cegui')},
  {id:'SC23', ...sentenceShot(22), Comp:() => shot('cegui_rule')},
  {id:'SC24', ...sentenceShot(23), Comp:() => shot('sixxiang')},
];
export const BG_G6: BgSpec[] = [];
export const FOOTAGE_G6: FootageSpec[] = [];
