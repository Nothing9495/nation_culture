#!/bin/sh
set -eu

REPO_DIR="$(CDPATH= cd "$(dirname "$0")/.." && pwd)"
PM2_PROC_NAME="nextjs_app"
new_head=""

on_exit() {
	status=$?
	if [ "$status" -ne 0 ]; then
		echo "Error: update failed (exit $status)." >&2
		exit "$status"
	fi
	echo "Update complete. Current HEAD: $new_head"
}

trap on_exit EXIT

if ! git -C "$REPO_DIR" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
	echo "Not a git repository: $REPO_DIR" >&2
	exit 1
fi

if [ -z "${PM2_PROC_NAME-}" ]; then
	echo "PM2_PROC_NAME is not set." >&2
	exit 1
fi

old_head="$(git -C "$REPO_DIR" rev-parse HEAD)"
echo
git -C "$REPO_DIR" pull --ff-only
echo
new_head="$(git -C "$REPO_DIR" rev-parse HEAD)"

if [ "$old_head" = "$new_head" ]; then
	echo "No updates detected. Finishing update progress..."
	exit 0
fi

echo "Updates detected. Running build..."
(
	cd "$REPO_DIR"
    echo 
	npm run build
    echo
)

echo "Build succeeded. Restarting pm2 process: $PM2_PROC_NAME"
echo
pm2 restart "$PM2_PROC_NAME"
echo

