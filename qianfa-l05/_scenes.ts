import {SHOTS} from './src/qianfa/assemble';
const rows = SHOTS.map((s) => [s.id, s.from + '-' + s.to, (((s.to - s.from + 1) / 30)).toFixed(1) + 's'].join('\t'));
console.log(rows.join('\n'));
console.log('SCENES=' + SHOTS.length);
