#!/usr/bin/env bash
# 帧序列 smoke / fps 测试：test_render.sh <Comp> <起始帧 1 起> [tag] [帧数=30]
set -e
ROOT=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT"
COMP=${1:-}
A=${2:-}
TAG=${3:-${COMP:-smoke}}
COUNT=${4:-${FRAME_COUNT:-30}}
[ -n "$COMP" ] && [ -n "$A" ] || { echo "usage: test_render.sh <Comp> <start_frame> [tag] [frame_count=30]"; exit 1; }
[ "$COUNT" -gt 0 ] || { echo 'frame_count must be positive'; exit 1; }
RENDER_ROOT=${RENDER_ROOT:-/mnt/linux-data/shushu-render-tmp}
BUNDLE_DIR=${BUNDLE_DIR:-${RENDER_ROOT}/${TAG}/build_test}
OUT=${TEST_OUT:-${RENDER_ROOT}/${TAG}/frames_$(printf '%05d' "$A")_${COUNT}}
export TMPDIR=${TMPDIR:-${RENDER_ROOT}/tmp}
mkdir -p "$RENDER_ROOT" "$TMPDIR"
if [ ! -d "$BUNDLE_DIR" ]; then
  npx remotion bundle src/index.ts --out-dir "$BUNDLE_DIR" --log=error
fi
rm -rf "$OUT"
mkdir -p "$OUT"
START=$((A - 1))
END=$((START + COUNT - 1))
/usr/bin/time -p npx remotion render "$BUNDLE_DIR" "$COMP" "$OUT" --sequence --image-format=jpeg --frames=${START}-${END} --concurrency=${CONC:-1} --log=error
ACTUAL=$(find "$OUT" -maxdepth 1 -type f | wc -l)
[ "$ACTUAL" -eq "$COUNT" ] || { echo "expected $COUNT frames; got $ACTUAL" >&2; exit 1; }
printf 'frames=%s\npath=%s\n' "$ACTUAL" "$OUT"
