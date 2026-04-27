#!/usr/bin/env sh
# usage: BackupProject.sh --description "Description of the backup" (or --D "Description")
#        BackupProject.sh --calc
set -eu

SCRIPT_DIR="$(cd "$(dirname -- "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_BASE="$PROJECT_ROOT/@ProjectBackups"
START_EPOCH="$(date +%s)"

DESCRIPTION=""
CALC_ONLY=0

print_progress() {
	label="$1"
	current="$2"
	total="$3"
	bar_width=30

	if [ "$total" -le 0 ]; then
		pct=100
	else
		pct=$((current * 100 / total))
	fi

	filled=$((pct * bar_width / 100))
	if [ "$filled" -gt "$bar_width" ]; then
		filled="$bar_width"
	fi
	empty=$((bar_width - filled))

	filled_bar="$(printf '%*s' "$filled" '' | tr ' ' '#')"
	empty_bar="$(printf '%*s' "$empty" '' | tr ' ' '-')"

	printf '\r%s [%s%s] %3s%% (%s/%s)' "$label" "$filled_bar" "$empty_bar" "$pct" "$current" "$total" >&2
	if [ "$current" -ge "$total" ] && [ "$total" -gt 0 ]; then
		printf '\n' >&2
	fi
}

truncate_text() {
	text="$1"
	max_length="$2"
	if [ "$(printf '%s' "$text" | awk -v max="$max_length" 'length($0) > max { print 1; next } { print 0 }')" -eq 1 ]; then
		printf '%s' "$text" | awk -v max="$max_length" '{ print substr($0, 1, max - 3) "..." }'
	else
		printf '%s' "$text"
	fi
}

print_backup_stats() {
	if [ ! -d "$BACKUP_BASE" ]; then
		echo "No backup directory found: $BACKUP_BASE"
		return 0
	fi

	root_size="$(du -sh "$BACKUP_BASE" | awk '{print $1}')"
	echo "Calculating backup statistics for: $BACKUP_BASE"
	echo "Backup root size: $root_size"
	echo
	printf '%-21s | %-32s | %s\n' "Backup Time" "Backup Note" "Size"
	printf '%-21s-+-%-32s-+-%-12s\n' "---------------------" "--------------------------------" "------------"

	found_backup=0
	for backup_dir in "$BACKUP_BASE"/*; do
		[ -d "$backup_dir" ] || continue
		found_backup=1
		backup_time="$(basename "$backup_dir")"
		backup_size="$(du -sh "$backup_dir" | awk '{print $1}')"
		note=""
		if [ -f "$backup_dir/BackupDescription.md" ]; then
			note="$(sed -n '1p' "$backup_dir/BackupDescription.md" | tr -d '\r')"
		fi
		if [ -z "$note" ]; then
			note="-"
		fi
		note="$(truncate_text "$note" 30)"
		printf '%-19s | %-28s | %s\n' "$backup_time" "$note" "$backup_size"
	done

	if [ "$found_backup" -eq 0 ]; then
		echo "(no backups found)"
	fi
}

while [ "$#" -gt 0 ]; do
	case "$1" in
		--calc)
			CALC_ONLY=1
			shift
			;;
		--description)
			if [ "$#" -lt 2 ]; then
				echo "Missing value for --description" >&2
				exit 1
			fi
			DESCRIPTION="$2"
			shift 2
			;;
		--description=*)
			DESCRIPTION="${1#*=}"
			shift
			;;
		--D)
			if [ "$#" -lt 2 ]; then
				echo "Missing value for --D" >&2
				exit 1
			fi
			DESCRIPTION="$2"
			shift 2
			;;
		--D=*)
			DESCRIPTION="${1#*=}"
			shift
			;;
		*)
			echo "Unknown argument: $1" >&2
			exit 1
			;;
	esac
done

if [ "$CALC_ONLY" -eq 1 ]; then
	print_backup_stats
	exit 0
fi

if [ -z "$DESCRIPTION" ]; then
	echo "Missing required parameter \"--description\" or \"--D\"" >&2
	exit 1
fi

mkdir -p "$BACKUP_BASE"

TIMESTAMP="$(date +"%Y-%m-%d - %H:%M:%S")"
BACKUP_DIR="$BACKUP_BASE/$TIMESTAMP"
PROJECT_BACKUP_DIR="$BACKUP_DIR/ProjectRoot"

mkdir -p "$PROJECT_BACKUP_DIR"

ITEMS="
app
public
tools/CalculateBuildSize.sh
tools/CopyFilesToStandalone.sh
tools/InstallDependencies.sh
.gitignore
eslint.config.mjs
jsconfig.json
next.config.mjs
package-lock.json
package.json
postcss.config.mjs
README.md
AGENTS.md
CLAUDE.md
"

echo "Creating backup with description: $DESCRIPTION"
echo "Backing up project files..."

total_backup_items=0
for item in $ITEMS; do
	src="$PROJECT_ROOT/$item"
	if [ -f "$src" ] || [ -d "$src" ]; then
		total_backup_items=$((total_backup_items + 1))
	fi
done

processed_backup_items=0

for item in $ITEMS; do
	src="$PROJECT_ROOT/$item"
	if [ -f "$src" ] || [ -d "$src" ]; then
		dest="$PROJECT_BACKUP_DIR/$item"
		mkdir -p "$(dirname -- "$dest")"
		cp -a "$src" "$dest"
		processed_backup_items=$((processed_backup_items + 1))
		print_progress "Backup  " "$processed_backup_items" "$total_backup_items"
	fi
done

if [ "$total_backup_items" -eq 0 ]; then
	echo "No matching project items found to back up." >&2
fi

printf '%s\n' "$DESCRIPTION" > "$BACKUP_DIR/BackupDescription.md"
echo "Backup created after $(($(date +%s) - START_EPOCH)) seconds"

echo "Calculating checksums..."

checksum_tmp="$BACKUP_DIR/checksum.md5.tmp"

total_checksum_files="$(
	cd "$BACKUP_DIR"
	find . -type f ! -name 'checksum.md5' ! -name 'checksum.md5.tmp' | wc -l | awk '{print $1}'
)"

: > "$checksum_tmp"

(
	cd "$BACKUP_DIR"
	processed_checksum_files=0
	find . -type f ! -name 'checksum.md5' ! -name 'checksum.md5.tmp' | LC_ALL=C sort | while IFS= read -r file; do
		md5sum "$file" >> "$checksum_tmp"
		processed_checksum_files=$((processed_checksum_files + 1))
		print_progress "Checksum" "$processed_checksum_files" "$total_checksum_files"
	done
) 

mv "$checksum_tmp" "$BACKUP_DIR/checksum.md5"

if [ "$total_checksum_files" -eq 0 ]; then
	echo "No files found for checksum generation." >&2
fi

echo "Checksums calculated after $(($(date +%s) - START_EPOCH)) seconds"

echo "Backup created: $BACKUP_DIR"
