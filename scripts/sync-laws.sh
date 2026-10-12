#!/usr/bin/env bash
# Sync Software Laws from the Obsidian vault into content/laws/.
# Run from the project root. One-way: in-repo edits are overwritten.
#
# Usage:
#   scripts/sync-laws.sh [source-path]
#
# Default source: "$HOME/Obsidian/Steeley/Projects/Profound/Software Laws"
#
# What it does:
#   - Replaces content/laws/{index,fallen}.md and content/laws/{entries,tiers,clusters}/*.md
#     (directory data files are kept). Skips _manifest.md.
#   - Transforms each note with scripts/laws-transform.mjs (layouts, card
#     fronts into `front:`, tier link lists into `entries:`).

set -euo pipefail

SRC="${1:-$HOME/Obsidian/Steeley/Projects/Profound/Software Laws}"
DST="content/laws"

if [ ! -d "$SRC/entries" ]; then
  echo "Source not found or has no entries/: $SRC" >&2
  exit 1
fi

echo "Syncing laws"
echo "  source: $SRC"
echo "  target: $DST"

mkdir -p "$DST/entries" "$DST/tiers" "$DST/clusters"
rm -f "$DST"/index.md "$DST"/fallen.md "$DST"/entries/*.md "$DST"/tiers/*.md "$DST"/clusters/*.md

count=0
for f in "$SRC"/index.md "$SRC"/fallen.md "$SRC"/entries/*.md "$SRC"/tiers/*.md "$SRC"/clusters/*.md; do
  [ -f "$f" ] || continue
  rel="${f#"$SRC"/}"
  node scripts/laws-transform.mjs "$f" "$DST/$rel"
  count=$((count + 1))
done

echo "  wrote $count files"
echo
echo "Review with: git status -- $DST && git diff -- $DST"
