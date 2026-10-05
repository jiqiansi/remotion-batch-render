#!/usr/bin/env python3
"""两遍跳静止帧渲染：抽样 → 找动静区间 → 补渲 → 拼帧 → 编码。

原理（2026-10 实测）：本片 8097 帧中 82% 与上一帧像素级静止，动画只集中在
入场/翻爻/字幕切换的短区间。于是：
  pass A  以 STRIDE 抽样渲一遍（约 T/S 帧）
  分析    相邻样本无变化 → 中间帧直接复制样本；有变化 → 列入补渲清单
  pass B  单进程逗号 --frames 补渲清单（只有一两次启动开销）
  拼帧    硬链接组成连续 element-%05d.jpeg 序列
  编码    ffmpeg 视频 + public/assets/<slug>/audio.wav 音轨

用法： render_fast.sh（见同名 bash 入口读取的环境变量）
"""
import json
import os
import time
import shutil
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W, H = 160, 90
# 只看平均变化：细线/呼吸等低均值微动允许冻结；字幕与入场动画均值远高于此
MEAN_THR = 1.0
COMMA_CHUNK = 800


def sh(cmd, **kw):
    r = subprocess.run(cmd, **kw)
    if r.returncode != 0:
        raise SystemExit('command failed: %s' % ' '.join(map(str, cmd)))


def gray_stream(files_pattern, count):
    """ffmpeg 解码成 160x90 灰度裸流 → numpy 数组（分块返回）。"""
    import numpy as np
    p = subprocess.Popen(
        ['ffmpeg', '-v', 'error', '-framerate', '30', '-i', files_pattern,
         '-vf', f'scale={W}:{H}', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'],
        stdout=subprocess.PIPE)
    size = W * H
    buf = p.stdout.read()
    if p.wait() != 0:
        raise SystemExit('ffmpeg decode failed')
    n = len(buf) // size
    return np.frombuffer(buf[:n * size], dtype=np.uint8).reshape(n, H, W).astype(np.int16), n


def static(a, b):
    return bool(np.abs(a - b).mean() < MEAN_THR)


def main():
    stride = int(os.environ.get('STRIDE', '4'))
    total = int(os.environ['TOTAL_FRAMES'])
    slug = os.environ['SLUG']
    a_dir, b_dir, out_dir = os.environ['DIR_A'], os.environ['DIR_B'], os.environ['DIR_OUT']
    cmd_tpl = os.environ['REMOTION_CMD']  # 含 {out} 占位符
    cwd = os.environ.get('WORKDIR') or None
    def remotion(out):
        return cmd_tpl.replace('{out}', out)
    for d in (a_dir, b_dir, out_dir):
        shutil.rmtree(d, ignore_errors=True)
        os.makedirs(d, exist_ok=True)

    # 浏览器并发数。**原先只在 .sh 的注释里写着 CONC，Python 侧根本没实现**
    # （2026-10-05 补上）。4 核机器填 2，2 核 runner 填 2。
    _conc = os.environ.get('CONC') or str(max(1, (os.cpu_count() or 2)))
    print(f'[并发] CONC={_conc}', flush=True)
    T0 = time.time()
    # ---- pass A：抽样 ----
    print(f'[A] every-nth-frame={stride} frames=0-{total - 1}', flush=True)
    sh(remotion(a_dir).split() + ['--frames', f'0-{total - 1}', '--every-nth-frame', str(stride),
                                  '--sequence', '--image-format=jpeg',
                                  '--concurrency', _conc, '--log=error'], cwd=cwd)
    # Remotion 按位数补零命名（element-00 / element-0000）；解析序号并归一化为 sample-%05d
    idx_files = sorted((int(f.split('-')[1].split('.')[0]), f) for f in os.listdir(a_dir))
    k = len(idx_files)
    if k < 2:
        raise SystemExit(f'pass A 产出 {k} 个样本，太少')
    norm_dir = os.path.join(os.path.dirname(a_dir), 'fa_samples_norm')
    shutil.rmtree(norm_dir, ignore_errors=True); os.makedirs(norm_dir)
    for pos, (_, f) in enumerate(idx_files):
        os.link(os.path.join(a_dir, f), os.path.join(norm_dir, f'sample-{pos:05d}.jpeg'))
    a_dir = norm_dir
    print(f'[A] {k} 样本（帧 0..{(k - 1) * stride}） 用时 {time.time() - T0:.1f}s', flush=True)
    T1 = time.time()

    # ---- 分析 ----
    import numpy as np
    frames, n = gray_stream(os.path.join(a_dir, 'sample-%05d.jpeg'), k)
    if n != k:
        raise SystemExit(f'decode {n} != samples {k}')
    fills = []
    spans_change = 0
    for i in range(k - 1):
        lo, hi = i * stride, (i + 1) * stride   # hi = 下一样本帧，已渲
        if not static(frames[i], frames[i + 1]):
            spans_change += 1
            fills.extend(range(lo + 1, hi))
    # 字幕/镜头切换帧必须精确渲染：抽样复制会让字幕晚 0..stride-1 帧
    for src, pat in ((os.path.join(ROOT, 'src', 'common', 'subs.ts'), r'\{from: (\d+),'),
                     (os.path.join(ROOT, 'src', 'common', 'timeline.ts'), r'\{id: "SC\d+", sentence: "S\d+", from: (\d+),')):
        if os.path.isfile(src):
            import re as _re
            for b in _re.findall(pat, open(src, encoding='utf-8').read()):
                r = int(b) - 1              # SUBS/SHOT_RANGES 为 1 起帧号 → Remotion 0 起
                if 0 < r < total:
                    fills.append(r)
    last = (k - 1) * stride
    if last < total - 1:                        # stride 没覆盖到的尾巴
        fills.extend(range(last + 1, total))
    fills = sorted(set(fills))
    print(f'[分析] 变化跨度 {spans_change}/{k - 1}，需补渲 {len(fills)} 帧 '
          f'({100 * len(fills) / total:.0f}%) 用时 {time.time() - T1:.1f}s', flush=True)
    T2 = time.time()

    # ---- pass B：补渲 ----
    if fills:
        for s in range(0, len(fills), COMMA_CHUNK):
            chunk = fills[s:s + COMMA_CHUNK]
            lst = ','.join(map(str, chunk))
            print(f'[B] 补渲 {len(chunk)} 帧（{chunk[0]}..{chunk[-1]}）', flush=True)
            sh(remotion(b_dir).split() + ['--frames', lst, '--sequence',
                                          '--image-format=jpeg',
                                          '--concurrency', _conc, '--log=error'], cwd=cwd)

    print(f'[B] 合计 {len(fills)} 帧 用时 {time.time() - T2:.1f}s', flush=True)
    T3 = time.time()
    # ---- 拼帧：硬链接到连续序列 ----
    pad = lambda x: f'element-{x:05d}.jpeg'
    fill_set = set(fills)
    linked = dup = miss = 0
    prev_src = None
    for f in range(total):
        dst = os.path.join(out_dir, pad(f))
        if f % stride == 0 and os.path.exists(os.path.join(a_dir, f'sample-{f // stride:05d}.jpeg')):
            src = os.path.join(a_dir, f'sample-{f // stride:05d}.jpeg')
            prev_src = src
        elif f in fill_set and os.path.exists(os.path.join(b_dir, f'element-{f}.jpeg')):
            src = os.path.join(b_dir, f'element-{f}.jpeg')
            prev_src = src
        elif prev_src:
            src = prev_src  # 静止段：复制最近已知帧
        else:
            miss += 1
            continue
        if os.path.lexists(dst):
            os.remove(dst)
        os.link(src, dst)
        linked += 1
    print(f'[拼帧] {linked} 帧（缺失 {miss}） 用时 {time.time() - T3:.1f}s', flush=True)
    T4 = time.time()

    # ---- 编码：视频 + 音轨 ----
    # 音轨扩展名跟着 AUDIO_EXT 走（见 Main.tsx 的同名常量，默认 mp3）。
    # **兜底**：指定的那个不存在就用另一个 —— 免得 WAV/MP3 只有一种时整期渲不出来。
    _want = os.environ.get('AUDIO_EXT', 'mp3')
    _cands = [os.path.join(ROOT, 'public', 'assets', slug, f'audio.{e}')
              for e in (_want, 'wav', 'mp3')]
    wav = next((c for c in _cands if os.path.isfile(c)), _cands[0])
    out_mp4 = os.environ['OUT_MP4']
    cmd = ['ffmpeg', '-y', '-v', 'error', '-framerate', '30', '-start_number', '0',
           '-i', os.path.join(out_dir, 'element-%05d.jpeg')]
    have_audio = os.path.isfile(wav)
    if have_audio:
        cmd += ['-i', wav, '-map', '0:v', '-map', '1:a',
                '-t', f'{total / 30:.3f}', '-c:a', 'aac', '-b:a', '160k']
    cmd += ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', '-pix_fmt', 'yuv420p', out_mp4]
    sh(cmd)
    json.dump({'total_frames': total, 'stride': stride, 'samples': k,
               'fills': len(fills), 'audio': have_audio},
              open(os.path.join(os.path.dirname(out_mp4), 'render_fast.json'), 'w'))
    print(f'[完成] {out_mp4} 编码 {time.time() - T4:.1f}s / 总 {time.time() - T0:.1f}s', flush=True)


if __name__ == '__main__':
    import numpy as np  # noqa: F401  (供 gray_stream/static 使用)
    main()
