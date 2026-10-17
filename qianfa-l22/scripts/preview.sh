#!/usr/bin/env bash
# 前 N 秒样片：preview.sh [秒数=30] [起始秒=0]
# bundle 与 MP4 默认走 /mnt/linux-data，避免根分区积累渲染产物。
set -e
ROOT=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT"
SEC=${1:-30}
FROM=${2:-0}
SLUG=$(python3 -c "import re;print(re.search(r\"slug:\\s*'([^']+)'\", open('src/config.ts').read()).group(1))")
TOTAL=$(python3 -c "import re;print(re.search(r'TOTAL_FRAMES\\s*=\\s*(\\d+)', open('src/common/timeline.ts').read()).group(1))")
A=$((FROM * 30))
B=$((A + SEC * 30 - 1))
[ "$B" -gt $((TOTAL - 1)) ] && B=$((TOTAL - 1))
RENDER_ROOT=${RENDER_ROOT:-/mnt/linux-data/shushu-render-tmp}
OUT_DIR=${RENDER_OUT:-/mnt/linux-data/shushu-renders/${SLUG}}
MIN_FREE_MB=${MIN_FREE_MB:-512}
BUNDLE_DIR=${BUNDLE_DIR:-${RENDER_ROOT}/${SLUG}/build_prev}
mkdir -p "$RENDER_ROOT" "$OUT_DIR"
FREE_KB=$(df -Pk "$RENDER_ROOT" | awk 'NR==2 {print $4}')
[ -n "$FREE_KB" ] && [ "$FREE_KB" -ge $((MIN_FREE_MB * 1024)) ] || {
  echo "PREVIEW BLOCKED: ${RENDER_ROOT} has less than ${MIN_FREE_MB} MiB free" >&2
  exit 2
}
OUTF="${OUT_DIR}/${SLUG}_preview_${FROM}-$((FROM + SEC))s.mp4"
if [ "${SKIP_BUNDLE:-0}" = 1 ] && [ -d "$BUNDLE_DIR" ]; then
  :
else
  rm -rf "$BUNDLE_DIR"
  npx remotion bundle src/index.ts --out-dir "$BUNDLE_DIR" --log=error
fi
npx remotion render "$BUNDLE_DIR" Video "$OUTF" --codec=h264 --crf=18 --frames=$A-$B --concurrency=${CONC:-6} --timeout=${RTIMEOUT:-300000} --log=error
[ -s "$OUTF" ] || { echo "PREVIEW FAILED: $OUTF"; exit 1; }
[ "${KEEP_BUNDLE:-0}" = 1 ] || rm -rf "$BUNDLE_DIR"
printf '%s\n' "$OUTF"
