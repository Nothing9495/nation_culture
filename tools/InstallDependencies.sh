#!/usr/bin/env sh
# usage: InstallDependencies.sh [--clean]
set -eu

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
PROJECT_ROOT="$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)"

CLEAN_INSTALL=0

while [ "$#" -gt 0 ]; do
	case "$1" in
		--clean)
			CLEAN_INSTALL=1
			shift
			;;
		*)
			echo "Unknown argument: $1" >&2
			exit 1
			;;
	esac
done

if ! command -v npm >/dev/null 2>&1; then
	echo "Error: npm is not installed or not in PATH." >&2
	exit 1
fi

cd "$PROJECT_ROOT"

echo "Project root: $PROJECT_ROOT"

if [ "$CLEAN_INSTALL" -eq 1 ]; then
	echo "Removing existing node_modules and lockfile cache..."
	rm -rf node_modules
	npm cache verify >/dev/null 2>&1 || true
fi

if [ -f package-lock.json ]; then
	echo "Installing dependencies with npm ci..."
	npm ci
else
	echo "package-lock.json not found, installing dependencies with npm install..."
	npm install
fi

echo "Dependencies installation completed."
