#!/usr/bin/env bash
# Convert the original PNGs (kinoka/photos/original) into optimized WebP files in public/images.
# The Figma photo filter (saturation -15%, warmer, highlights -10%) is baked in here, not applied with CSS.
set -euo pipefail
SRC="${1:-/mnt/project-files/kinoka/photos/original}"
OUT="$(cd "$(dirname "$0")/.." && pwd)/public/images"
mkdir -p "$OUT"

grade() { # in out [extra convert args...]
  local in="$1" out="$2"; shift 2
  convert "$in" "$@" -modulate 100,85,100 \
    -channel R -evaluate multiply 1.025 -channel B -evaluate multiply 0.965 +channel \
    -fx 'u - 0.1*pow(u,4)' -strip "$out"
}

webp() { # graded-png name widths...
  local src="$1" name="$2"; shift 2
  local max; max="$(identify -format '%w' "$src")"
  for w in "$@"; do
    (( w > max )) && w="$max" # file names carry the real width so srcset descriptors stay true
    convert "$src" -resize "${w}x>" -quality 78 -define webp:method=6 "$OUT/${name}-${w}.webp"
  done
}

tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT

# MV / hero exterior: PC wide (original size is the maximum available) and SP portrait crop around x=66%
grade "$SRC/P01.png" "$tmp/p01.png"
webp "$tmp/p01.png" p01 800 1376
convert "$tmp/p01.png" -gravity northwest -crop 600x768+608+0 +repage "$tmp/p01-sp.png"
webp "$tmp/p01-sp.png" p01-sp 600

for n in 02 03 04 05 06 07 08 09; do
  grade "$SRC/P$n.png" "$tmp/p$n.png"
  webp "$tmp/p$n.png" "p$n" 480 960
done

for f in "$SRC"/works-hikari/W*.png; do
  base="$(basename "$f" .png)"; id="$(echo "${base%%_*}" | tr 'A-Z' 'a-z')"
  grade "$f" "$tmp/$id.png"
  webp "$tmp/$id.png" "$id" 640 1264
done
