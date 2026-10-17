import React from 'react';
import {Freeze} from 'remotion';
import {Video} from './Main';
import {SHEET} from './sheet';

/**
 * 接触印相：把一期里的所有关键帧拼成一张图，**一次浏览器启动出全部**。
 *
 * 为什么非要有它（2026-10-03 用户叫停过一次抽帧）：
 * `keyframes.sh` 早先对每一帧单独跑一次 `remotion still`，
 * 130 帧 = 130 次 Chromium 冷启动，把 4 核机器的 CPU 吃满、
 * 影响了同机其他 agent。现在一期一次启动，CPU 占用降一个数量级。
 *
 * 原理：`Video` 用 `useCurrentFrame()` 驱动一切时间，
 * `<Freeze frame={f}>` 把它钉在第 f 帧，于是同一份组件树能画出任意一帧。
 */
const COLS = 4, ROWS = 2, CW = 320, CH = 180, S = 0.25;   // 1280×720 缩到 320×180

export const Sheet: React.FC = () => {
  const cells = SHEET.slice(0, COLS * ROWS);
  return (
    // ⚠ **不能用 AbsoluteFill**：它带 `right: 0; bottom: 0`，
    // 会把我设的 width/height 覆盖掉，格子被拉伸/裁切，QC 图就失真了
    // （2026-10-03 印相看出来的：格子变成竖条、右侧内容被裁）。
    <div style={{position: 'absolute', left: 0, top: 0, width: COLS * CW, height: ROWS * CH,
                 background: '#1c1c1c', display: 'flex', flexWrap: 'wrap',
                 overflow: 'hidden'}}>
      {cells.map((c, i) => (
        <div key={c.f + '_' + i}
             style={{width: CW, height: CH, overflow: 'hidden', position: 'relative',
                     border: '1px solid #333'}}>
          <div style={{width: 1280, height: 720, transform: `scale(${S})`, transformOrigin: 'top left'}}>
            <Freeze frame={c.f}>
              <Video />
            </Freeze>
          </div>
          <div style={{position: 'absolute', left: 0, bottom: 0, padding: '1px 5px',
                       background: 'rgba(0,0,0,.72)', color: '#ffd9a0', fontSize: 13,
                       fontFamily: 'monospace', whiteSpace: 'nowrap'}}>
            {c.label}
          </div>
        </div>
      ))}
    </div>
  );
};
