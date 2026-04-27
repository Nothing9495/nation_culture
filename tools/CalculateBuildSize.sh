#!/bin/sh

set -eu

SCRIPT_DIR="$(CDPATH= cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(CDPATH= cd "$SCRIPT_DIR/.." && pwd)"
NEXT_DIR="$PROJECT_ROOT/.next"
STANDALONE_DIR="$NEXT_DIR/standalone"

if [ ! -d "$NEXT_DIR" ]; then
	echo "Error: $NEXT_DIR does not exist" >&2
	exit 1
fi

next_size=$(du -sb "$NEXT_DIR" | awk '{print $1}')
standalone_size=0

if [ -d "$STANDALONE_DIR" ]; then
	standalone_size=$(du -sb "$STANDALONE_DIR" | awk '{print $1}')
fi

build_size=$((next_size - standalone_size))

bytes_to_mb() {
	awk -v bytes="$1" 'BEGIN { printf "%.2f", bytes / 1024 / 1024 }'
}

next_size_mb=$(bytes_to_mb "$next_size")
standalone_size_mb=$(bytes_to_mb "$standalone_size")
build_size_mb=$(bytes_to_mb "$build_size")

# echo ".next=${next_size_mb}MB"
# echo ".next/standalone=${standalone_size_mb}MB"
echo "build: ${build_size_mb}MB"
echo "standalone build: ${standalone_size_mb}MB"
