#!/usr/bin/env bash
# 整片渲染：VER=v1 [SHARDS=2] scripts/render.sh
# 速度策略（实测）：先 --sequence 出 jpeg 序列，再 ffmpeg 编码（比 Remotion 内联 mp4 快 ~1.7×）；
# SHARDS>1 时把帧区间切给多个进程并发渲（实测在负载 <2 时接近线性，负载高时收益 ~30%）。
# bundle、帧序列、MP4、contact sheet 全部走 /mnt/linux-data，避免根分区被 18,000 帧打满。
set -e
ROOT=$(cd "$(dirname "$0")/.." && pwd); cd "$ROOT"
V=${VER:-v1}
SLUG=$(python3 -c "import re;print(re.search(r\"slug:\s*'([^']+)'\", open('src/config.ts').read()).group(1))")
RENDER_ROOT=${RENDER_ROOT:-/mnt/linux-data/shushu-render-tmp}
OUT_DIR=${RENDER_OUT:-/mnt/linux-data/shushu-renders/${SLUG}}
MIN_FREE_MB=${MIN_FREE_MB:-1024}
SHARDS=${SHARDS:-1}
BUNDLE_DIR=${BUNDLE_DIR:-${RENDER_ROOT}/${SLUG}/build_full_${V}}
VIDEO_OUT=${VIDEO_OUT:-${OUT_DIR}/${SLUG}_${V}.mp4}
FRAME_DIR=${FRAME_DIR:-${OUT_DIR}/fin_frames_${V}}
SEQ_DIR=${SEQ_DIR:-${RENDER_ROOT}/${SLUG}/seq_${V}}
SHEET_OUT=${SHEET_OUT:-${OUT_DIR}/sheet_${V}.html}
mkdir -p "$RENDER_ROOT" "$OUT_DIR"
FREE_KB=$(df -Pk "$RENDER_ROOT" | awk 'NR==2 {print $4}')
[ -n "$FREE_KB" ] && [ "$FREE_KB" -ge $((MIN_FREE_MB * 1024)) ] || {
  echo "RENDER BLOCKED: ${RENDER_ROOT} has less than ${MIN_FREE_MB} MiB free" >&2
  exit 2
}
if [ "${SKIP_BUNDLE:-0}" = 1 ] && [ -d "$BUNDLE_DIR" ]; then
  :
else
  rm -rf "$BUNDLE_DIR"
  ./node_modules/.bin/remotion bundle src/index.ts --out-dir "$BUNDLE_DIR" --log=error
fi
TOTAL=$(python3 -c "import re;print(re.search(r'TOTAL_FRAMES\s*=\s*(\d+)', open('src/common/timeline.ts').read()).group(1))")
RANGE=${RANGE:-0-$((TOTAL - 1))}   # 仅供小样测试，如 RANGE=0-59
RS=${RANGE%%-*}; RE=${RANGE##*-}; SPAN=$((RE - RS + 1))
rm -rf "$SEQ_DIR"; mkdir -p "$SEQ_DIR"
CONC_ONE=${CONC:-1}
if [ "$SHARDS" -le 1 ]; then
  ./node_modules/.bin/remotion render "$BUNDLE_DIR" Video "$SEQ_DIR" --sequence --image-format=jpeg \
    --frames="$RANGE" --concurrency="$CONC_ONE" --log=error
else
  PIDS=()
  for ((s=0; s<SHARDS; s++)); do
    A=$((RS + SPAN * s / SHARDS)); B=$((RS + SPAN * (s + 1) / SHARDS - 1))
    [ "$A" -gt "$B" ] && continue
    OUT_S="$SEQ_DIR/s$s"; mkdir -p "$OUT_S"
    ./node_modules/.bin/remotion render "$BUNDLE_DIR" Video "$OUT_S" --sequence --image-format=jpeg \
      --frames=$A-$B --concurrency="$CONC_ONE" --log=error &
    PIDS+=($!)
  done
  for p in "${PIDS[@]}"; do wait "$p"; done
  # 各分片并成一条连续序列（按分片顺序搬回主目录）
  n=$RS
  for ((s=0; s<SHARDS; s++)); do
    [ -d "$SEQ_DIR/s$s" ] || continue
    for f in "$SEQ_DIR/s$s"/element-*.jpeg; do
      [ -e "$f" ] || continue
      mv "$f" "$SEQ_DIR/$(printf 'element-%05d.jpeg' "$n")"; n=$((n + 1))
    done
    rm -rf "$SEQ_DIR/s$s"
  done
fi
ACTUAL=$(ls "$SEQ_DIR"/element-*.jpeg 2>/dev/null | wc -l)
EXP=$(( ${RANGE##*-} - ${RANGE%%-*} + 1 ))
[ "$ACTUAL" -eq "$EXP" ] || { echo "expected $EXP frames; got $ACTUAL" >&2; exit 1; }
ffmpeg -y -v error -framerate 30 -start_number "$RS" -i "$SEQ_DIR/element-%05d.jpeg" \
  -c:v libx264 -preset fast -crf 16 -pix_fmt yuv420p "$VIDEO_OUT"
[ -s "$VIDEO_OUT" ] || { echo "RENDER FAILED: $VIDEO_OUT"; exit 1; }
rm -rf "$FRAME_DIR" && mkdir -p "$FRAME_DIR"
ffmpeg -v error -y -i "$VIDEO_OUT" -q:v 4 "$FRAME_DIR/f_%04d.jpg"
ls "$FRAME_DIR" | wc -l > "${OUT_DIR}/fin_count_${V}.txt"
python3 scripts/sheet.py "$FRAME_DIR" "$SHEET_OUT" 60 || true
[ "${KEEP_BUNDLE:-0}" = 1 ] || rm -rf "$BUNDLE_DIR"
[ "${KEEP_SEQ:-1}" = 1 ] || rm -rf "$SEQ_DIR"
echo done > "${OUT_DIR}/render_${V}.done"
printf 'rendered=%s\nframes=%s\nsheet=%s\nshards=%s\n' "$VIDEO_OUT" "$FRAME_DIR" "$SHEET_OUT" "$SHARDS"
