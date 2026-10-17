#!/usr/bin/env bash
# 两遍跳静止帧快速渲染：scripts/render_fast.sh
# 实测基线：本机空闲单进程 6.9 帧/秒（全片 45 分钟）；静止帧占 82%，
# 本脚本抽样+补渲只渲约 30–50% 的帧，目标把 10 分钟片子压到 10 分钟级。
# 环境变量：
#   STRIDE=6        抽样步长（实测 0.6 阈值下全片渲 ~4800 帧 ≈ 11 分钟）（越小越保守越慢；动画被抽中的最小周期 = STRIDE 帧）
#   RANGE_TOTAL=N   只渲前 N 帧（小样测试用）
#   CONC=1          每个渲染进程的并发（4 核机器别超过 2）
#   KEEP_SEQ=0      成功后删除中间帧目录（默认保留，方便排查）
set -e
ROOT=$(cd "$(dirname "$0")/.." && pwd); cd "$ROOT"
SLUG=$(python3 -c "import re;print(re.search(r\"slug:\s*'([^']+)'\", open('src/config.ts').read()).group(1))")
TOTAL=$(python3 -c "import re;print(re.search(r'TOTAL_FRAMES\s*=\s*(\d+)', open('src/common/timeline.ts').read()).group(1))")
[ -n "${RANGE_TOTAL:-}" ] && TOTAL=$RANGE_TOTAL
RENDER_ROOT=${RENDER_ROOT:-/mnt/linux-data/shushu-render-tmp}
OUT_DIR=${RENDER_OUT:-/mnt/linux-data/shushu-renders/${SLUG}}
BUNDLE_DIR=${BUNDLE_DIR:-${RENDER_ROOT}/${SLUG}/build_fast}
OUT_MP4=${VIDEO_OUT:-${OUT_DIR}/${SLUG}_fast.mp4}
WORK=${WORKDIR:-$ROOT}
MIN_FREE_MB=${MIN_FREE_MB:-1024}
mkdir -p "$RENDER_ROOT" "$OUT_DIR"
FREE_KB=$(df -Pk "$RENDER_ROOT" | awk 'NR==2 {print $4}')
[ -n "$FREE_KB" ] && [ "$FREE_KB" -ge $((MIN_FREE_MB * 1024)) ] || {
  echo "BLOCKED: ${RENDER_ROOT} free ${FREE_KB}KB < ${MIN_FREE_MB}MB" >&2; exit 2; }
LOAD=$(cut -d' ' -f1 /proc/loadavg)
python3 -c "import sys;sys.exit(0 if float('$LOAD') < ${MAX_LOAD:-3} else 1)" || {
  echo "WARN: load=$LOAD（>3 会显著拖慢；空闲时再跑更快，可用 MAX_LOAD=99 强制）"; }
# **按源文件时间戳判断要不要重打包**，不能只看目录在不在。
# 踩过的坑（2026-10-03）：`[ ! -d "$BUNDLE_DIR" ]` 让 build_fast 一旦存在就永远跳过打包，
# 于是改了 spec.ts / plate.tsx / shots.tsx 之后渲出来的还是**旧代码 + 旧镜头表**——
# 表现为「改了没效果」「片头还是白纸」「要点屏还是旧文案」，极难定位。
# 现在只要 src/ 或 src/qianfa/spec.ts 比 bundle 新就重打包（多花约 1–2 分钟，换来不会渲错）。
NEED_BUNDLE=1
if [ -d "$BUNDLE_DIR" ]; then
  NEWEST=$(find src -type f \( -name '*.ts' -o -name '*.tsx' \) -newer "$BUNDLE_DIR" -print -quit 2>/dev/null)
  [ -z "$NEWEST" ] && NEED_BUNDLE=0
fi
if [ "$NEED_BUNDLE" = 1 ]; then
  rm -rf "$BUNDLE_DIR"
  ./node_modules/.bin/remotion bundle src/index.ts --out-dir "$BUNDLE_DIR" --log=error
fi
REMO_CMD="./node_modules/.bin/remotion render $BUNDLE_DIR Video {out}"
export REMOTION_BROWSER_EXECUTABLE=${REMOTION_BROWSER_EXECUTABLE:-/usr/bin/chromium}
export REMOTION_GL=${REMOTION_GL:-swiftshader}
export TMPDIR=${TMPDIR:-$RENDER_ROOT/tmp}; mkdir -p "$TMPDIR"
export REMOTION_CMD="$REMO_CMD" WORKDIR="$WORK" SLUG="$SLUG" TOTAL_FRAMES="$TOTAL"
export DIR_A="$RENDER_ROOT/${SLUG}/fa_samples" DIR_B="$RENDER_ROOT/${SLUG}/fa_fills"
export DIR_OUT="$RENDER_ROOT/${SLUG}/fa_seq" OUT_MP4="$OUT_MP4" STRIDE=${STRIDE:-6}
PYTHON=${PYTHON:-}
if [ -z "$PYTHON" ]; then
  if [ -x /mnt/linux-data/shushu-venv/bin/python ]; then PYTHON=/mnt/linux-data/shushu-venv/bin/python
  else PYTHON=python3; fi
fi
"$PYTHON" -c "import numpy" 2>/dev/null || { echo "缺 numpy：python3 -m venv /mnt/linux-data/shushu-venv && venv/bin/pip install numpy"; exit 1; }
S=$(date +%s)
"$PYTHON" scripts/render_fast.py
E=$(date +%s)
ffprobe -v error -show_entries format=duration,size -show_entries stream=codec_type -of default=noprint_wrappers=1 "$OUT_MP4"
printf 'frames=%s\nstride=%s\nwall_sec=%s\nout=%s\n' "$TOTAL" "$STRIDE" "$((E - S))" "$OUT_MP4"
[ "${KEEP_SEQ:-1}" = 1 ] || rm -rf "$DIR_A" "$DIR_B" "$DIR_OUT"
