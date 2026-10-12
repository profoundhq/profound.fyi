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
#   - Points layouts at the laws-* layouts: entry -> laws-entry, tier,
#     cluster, and page -> laws-page. laws-home is kept.
#   - Drops a leading heading that repeats the title, and the "## Front" and
#     "## Back" card headings in entries (the front becomes the lead paragraph).
#   - Em dash -> hyphen, as in sync-playbook.sh.

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

transform() {
  awk '
    BEGIN { n = 0 }
    /^---[[:space:]]*$/ && n < 2 { n++; print; next }
    n < 2 {
      if ($0 ~ /^title:/) { title = $0; sub(/^title:[[:space:]]*/, "", title); gsub(/^["'\'']|["'\'']$/, "", title) }
      sub(/^layout: layouts\/entry\.njk/, "layout: layouts/laws-entry.njk")
      sub(/^layout: layouts\/(tier|cluster|page)\.njk/, "layout: layouts/laws-page.njk")
      print; next
    }
    /^## (Front|Back)[[:space:]]*$/ { skipblank = 1; next }
    !seen && NF {
      seen = 1
      line = $0; sub(/^#+[[:space:]]+/, "", line)
      if ($0 ~ /^#/ && line == title) { skipblank = 1; next }
    }
    skipblank && !NF { next }
    { skipblank = 0; print }
  ' "$1" | sed -e 's/ — / - /g' -e 's/—/-/g'
}

count=0
for f in "$SRC"/index.md "$SRC"/fallen.md "$SRC"/entries/*.md "$SRC"/tiers/*.md "$SRC"/clusters/*.md; do
  [ -f "$f" ] || continue
  rel="${f#"$SRC"/}"
  transform "$f" > "$DST/$rel"
  count=$((count + 1))
done

echo "  wrote $count files"
echo
echo "Review with: git status -- $DST && git diff -- $DST"
