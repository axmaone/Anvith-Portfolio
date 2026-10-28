#!/bin/sh
# One-command rebuild: events → picture → score + foley → subtitles → master.
set -e
LIB=${LIB:-$HOME/lemo-opuscar}
HERE=$(cd "$(dirname "$0")" && (pwd -W 2>/dev/null || pwd))
export LIB
[ -f "$LIB/core/render/video.mjs" ] || { echo "set LIB to the library folder"; exit 1; }
PY="$LIB/.venv/bin/python"
cd "$LIB"
node core/render/events.mjs "$HERE"
node core/render/video.mjs "$HERE" --fps 24 --workers 4 --out "$HERE/out/video.mp4"
"$PY" "$HERE/mix.py"
"$PY" core/render/srt.py "$HERE/cues.json" "$HERE/gold-ltv.srt"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/gold-ltv.mp4" 24 0
