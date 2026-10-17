import React from 'react';
import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SampleShot} from '../SampleShot';
import {sentenceShot} from '../timing';
const shot = (kind: Parameters<typeof SampleShot>[0]['kind']) => React.createElement(SampleShot, {kind});
export const SHOTS_G4: ShotDef[] = [
  {id:'SC13', ...sentenceShot(12), Comp:() => shot('tiyong')},
  {id:'SC14', ...sentenceShot(13), Comp:() => shot('wuxing')},
  {id:'SC15', ...sentenceShot(14), Comp:() => shot('relation')},
  {id:'SC16', ...sentenceShot(15), Comp:() => shot('wang')},
];
export const BG_G4: BgSpec[] = [];
export const FOOTAGE_G4: FootageSpec[] = [];
