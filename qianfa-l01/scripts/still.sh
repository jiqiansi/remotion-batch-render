#!/usr/bin/env bash
# 出 still：still.sh <Comp: Video|Overlay|G1..G8> <帧号列表 1 起,逗号分隔> <输出目录(绝对路径)> [tag]
set -e
ROOT=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT"
COMP=${1:-}
FRAMES=${2:-}
OUT=${3:-}
TAG=${4:-$COMP}
[ -n "$COMP" ] && [ -n "$FRAMES" ] && [ -n "$OUT" ] || { echo "usage: still.sh <Comp> <frames> <out_dir_abs> [tag]"; exit 1; }
RENDER_ROOT=${RENDER_ROOT:-/mnt/linux-data/shushu-render-tmp}
B=${BUNDLE_DIR:-${RENDER_ROOT}/${TAG}/build_still}
mkdir -p "$RENDER_ROOT" "$OUT"
[ -d "$B" ] || npx remotion bundle src/index.ts --out-dir "$B" --log=error
IFS=',' read -r -a FRAME_LIST <<< "$FRAMES"
for N in "${FRAME_LIST[@]}"; do
  npx remotion still "$B" "$COMP" "$OUT/f_$(printf '%04d' "$N").png" --frame=$((N - 1)) --log=error
done
[ "${KEEP_BUNDLE:-0}" = 1 ] || rm -rf "$B"
printf '%s\n' "$(find "$OUT" -maxdepth 1 -type f | wc -l)"
