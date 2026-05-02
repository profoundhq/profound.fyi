#!/usr/bin/env bash
# Sync a playbook from an Obsidian vault into content/playbooks/<slug>/.
# Run from the project root.
#
# Usage:
#   scripts/sync-playbook.sh <slug> <source-path>
#
# Example:
#   scripts/sync-playbook.sh agentic-ai-for-teams \
#     "$HOME/Library/Mobile Documents/iCloud~md~obsidian/Documents/Steeley/Blogs/Agentic AI for Teams"
#
# What it does:
#   - Wipes existing .md files under content/playbooks/<slug>/ (preserves
#     11tydata.js files and hand-authored .njk landings).
#   - For each source .md (skipping _index.md), writes a transformed copy:
#       slug   - derived from filename, NN- prefix stripped
#       title  - read from source frontmatter
#       order  - read from source frontmatter `order:`, or derived from the
#                NN- prefix * 10 if absent. Artefacts get +100 offset.
#       tags   - [<playbook-slug>]
#       section - "artefacts" for files inside artefacts/, otherwise omitted
#   - Body transforms: em-dash -> hyphen, "agentic AI" -> "Agentic AI".
#   - URL rewrites: /framework/NN-slug/ -> /playbooks/<slug>/slug/,
#     /artefacts/x/ -> /playbooks/<slug>/artefacts/x/.
#   - Prints git status afterwards so you can review the diff.
#
# What it does NOT do:
#   - Touch 11tydata.js, .njk landings, or anything outside content/playbooks/<slug>/.
#   - Sync _index.md files. Landings are hand-managed (curated HTML lists).

set -euo pipefail

if [ "$#" -lt 2 ]; then
  cat <<USAGE >&2
Usage: $0 <slug> <source-path>
USAGE
  exit 1
fi

SLUG="$1"
SRC="$2"
DST="content/playbooks/$SLUG"

if [ ! -d "$SRC" ]; then
  echo "Source not found: $SRC" >&2
  exit 1
fi

if [ ! -d "$DST" ]; then
  echo "Destination not found: $DST. Create the playbook directory + 11tydata.js first." >&2
  exit 1
fi

# Read a top-level frontmatter scalar (handles "key: value" and 'key: "value"')
extract_field() {
  local field="$1"
  local file="$2"
  awk -v field="$field" '
    BEGIN { n = 0; in_fm = 0 }
    /^---[[:space:]]*$/ { n++; in_fm = (n == 1); next }
    n >= 2 { exit }
    in_fm {
      if (match($0, "^[[:space:]]*#*[[:space:]]*" field ":[[:space:]]*")) {
        val = substr($0, RSTART + RLENGTH)
        # Trim trailing spaces
        sub(/[[:space:]]+$/, "", val)
        # If the line has another key: glued on (file 05/10 style), cut there
        if (match(val, /[[:space:]]+[a-zA-Z_]+:[[:space:]]/)) {
          val = substr(val, 1, RSTART - 1)
        }
        # Strip surrounding quotes
        sub(/^"/, "", val)
        sub(/"$/, "", val)
        sub(/^'\''/, "", val)
        sub(/'\''$/, "", val)
        print val
        exit
      }
    }
  ' "$file"
}

# Extract leading digits from a frontmatter `order:` field
extract_order() {
  local raw
  raw=$(extract_field "order" "$1")
  if [[ "$raw" =~ ^([0-9]+) ]]; then
    echo "${BASH_REMATCH[1]}"
  fi
}

write_file() {
  local src="$1"
  local dst="$2"
  local section="${3:-}"
  local order_offset="${4:-0}"

  local title
  title=$(extract_field "title" "$src")
  if [ -z "$title" ]; then
    title=$(basename "$src" .md | sed -E 's/^[0-9]+-//; s/-/ /g')
    title="$(printf '%s' "$title" | awk '{print toupper(substr($0,1,1)) substr($0,2)}')"
    echo "  [warn] no title in $(basename "$src"); using \"$title\"" >&2
  fi

  local order_from_fm
  order_from_fm=$(extract_order "$src")
  local order
  if [ -n "$order_from_fm" ]; then
    order=$((10#$order_from_fm + order_offset))
  else
    local base
    base=$(basename "$src" .md)
    if [[ "$base" =~ ^([0-9]+)- ]]; then
      order=$((10#${BASH_REMATCH[1]} * 10 + order_offset))
    else
      order=$((order_offset))
    fi
  fi

  {
    echo "---"
    echo "title: \"$title\""
    echo "order: $order"
    [ -n "$section" ] && echo "section: $section"
    echo "tags:"
    echo "  - $SLUG"
    echo "---"
    echo ""
    awk 'BEGIN{n=0} /^---[[:space:]]*$/{n++; next} n>=2{print}' "$src" \
      | sed -e 's/—/-/g' -e 's/agentic AI/Agentic AI/g'
  } > "$dst"

  sed -i.bak -E \
    -e "s|/framework/[0-9]+-([a-z-]+)/|/playbooks/$SLUG/\\1/|g" \
    -e "s|/artefacts/([a-z-]+)/|/playbooks/$SLUG/artefacts/\\1/|g" \
    "$dst"
  rm -f "$dst.bak"
}

echo "Syncing $SLUG"
echo "  source: $SRC"
echo "  target: $DST"

# Wipe existing .md files (preserve .njk and 11tydata.js)
find "$DST" -name "*.md" -delete

# Process framework chapters at the top level of the source
shopt -s nullglob
for src in "$SRC"/*.md; do
  base=$(basename "$src" .md)
  [ "$base" = "_index" ] && continue
  # Skip vault utility files (case-insensitive match)
  lowered=$(printf '%s' "$base" | tr '[:upper:]' '[:lower:]')
  case "$lowered" in
    readme|changelog|notes|todo|license)
      echo "  [skip] $base.md (utility file)"
      continue
      ;;
  esac

  if [[ "$base" =~ ^([0-9]+)-(.+)$ ]]; then
    slug_part="${BASH_REMATCH[2]}"
  else
    slug_part="$base"
  fi

  write_file "$src" "$DST/$slug_part.md" "" 0
done

# Process artefacts (offset of 100 keeps them after the framework in sortByOrder)
if [ -d "$SRC/artefacts" ]; then
  mkdir -p "$DST/artefacts"
  for src in "$SRC/artefacts"/*.md; do
    base=$(basename "$src" .md)
    [ "$base" = "_index" ] && continue

    if [[ "$base" =~ ^([0-9]+)-(.+)$ ]]; then
      slug_part="${BASH_REMATCH[2]}"
    else
      slug_part="$base"
    fi

    write_file "$src" "$DST/artefacts/$slug_part.md" "artefacts" 100
  done
fi

echo
echo "Sync complete. Run:"
echo "  git status -- $DST"
echo "  git diff -- $DST"
echo "to review changes."
