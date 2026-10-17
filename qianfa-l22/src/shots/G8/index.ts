import React from 'react';
import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SampleShot} from '../SampleShot';
import {sentenceShot} from '../timing';
const shot = (kind: Parameters<typeof SampleShot>[0]['kind']) => React.createElement(SampleShot, {kind});
export const SHOTS_G8: ShotDef[] = [
  {id:'SC29', ...sentenceShot(28), Comp:() => shot('summary_hex')},
  {id:'SC30', ...sentenceShot(29), Comp:() => shot('summary_rules')},
  {id:'SC31', ...sentenceShot(30), Comp:() => shot('next')},
  {id:'SC32', ...sentenceShot(31), Comp:() => shot('closing')},
];
export const BG_G8: BgSpec[] = [];
export const FOOTAGE_G8: FootageSpec[] = [];
