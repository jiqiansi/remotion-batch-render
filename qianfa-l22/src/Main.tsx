import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {Fonts} from './common';
import {PaperBg} from './shushu/paperbg';
import {PaperTitle, PaperChapterCards, PaperHeader, PaperProgress, PaperSubtitles} from './shushu/PaperChrome';
import {VIDEO} from './config';

export const AUDIO_EXT = (process.env.AUDIO_EXT || 'mp3') as 'wav' | 'mp3';
import {SHOTS} from './qianfa/assemble';

// 1280×720@30fps。层序：纸底 < 片头/章节/页眉 < 镜头 < 进度线 < 字幕。
export const Video: React.FC = () => (
  <AbsoluteFill style={{background: '#F6F0DF'}}>
    <Fonts />
    {/* 音频扩展名可配。**默认 mp3**：原来的 48kHz 立体声 WAV 每期 91.8MB，
        21 期 1.9GB；转成 64kbps 单声道 MP3 后每期约 4MB、合计 87MB，
        而最终编码本来就是 `-c:a aac -b:a 160k` 重编码，源精度才是上限。
        Remotion 打包时静态替换 process.env.*，有 WAV 时设 AUDIO_EXT=wav 即可。 */}
    {VIDEO.audio ? <Audio src={staticFile(`assets/${VIDEO.slug}/audio.${AUDIO_EXT}`)} /> : null}
    <PaperBg />
    <PaperTitle />
    <PaperChapterCards />
    <PaperHeader />
    {SHOTS.map((s) => (
      <Sequence key={s.id} from={s.from - 1} durationInFrames={s.to - s.from + 1}>
        <s.Comp />
      </Sequence>
    ))}
    <PaperProgress />
    <PaperSubtitles />
  </AbsoluteFill>
);

export const Stage: React.FC = () => <Video />;
// 兼容模板里 overlay/Preview 的旧签名（该预览合成本项目不再使用）
export const PaperStage: React.FC<Record<string, unknown>> = () => <Video />;
