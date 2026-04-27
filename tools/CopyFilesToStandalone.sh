#!/usr/bin/env sh
set -eu

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
cd "$SCRIPT_DIR/.."

mkdir -p .next/standalone/public
mkdir -p .next/standalone/.next/static

if [ -d "public" ]; then
	cp -R public/. .next/standalone/public/
fi

if [ -d ".next/static" ]; then
	cp -R .next/static/. .next/standalone/.next/static/
fi
