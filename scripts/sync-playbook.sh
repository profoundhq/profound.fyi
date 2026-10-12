#!/usr/bin/env bash
# Sync a playbook from an Obsidian vault into content/playbooks/<slug>/.
# Run from the project root.
#
# Usage:
#   scripts/sync-playbook.sh <slug> <source-path> [attachments-path]
#
# attachments-path is where Obsidian keeps images (defaults to source-path).
#
# Example:
#   scripts/sync-playbook.sh agentic-ai-for-teams \
#     "$HOME/Obsidian/Steeley/Blogs/Agentic AI for Teams"
#
# What it does:
#   - Wipes existing .md files under content/playbooks/<slug>/ (preserves
#     11tydata.js files, hand-authored .njk landings and .marp.md decks).
#   - For each source .md (skipping index notes), writes a transformed copy:
#       slug   - derived from filename, "NN-" or "NN " prefix stripped, then
#                lowercased with spaces and punctuation as hyphens
#       title  - read from source frontmatter, else the note's leading H1
#       order  - read from source frontmatter `order:`, else the NN prefix * 10,
#                else the note's position in the index note's links * 10.
#                Artefacts get +100 offset.
#       tags   - [<playbook-slug>]
#       section - "artefacts" for files inside artefacts/, or whose source
#                 permalink contains /artefacts/, otherwise omitted
#   - Drops a leading H1, since the layout renders the title.
#   - Body transforms: em-dash -> hyphen, "agentic AI" -> "Agentic AI".
#   - URL rewrites: /framework/NN-slug/ -> /playbooks/<slug>/slug/,
#     /artefacts/x/ -> /playbooks/<slug>/artefacts/x/.
#   - Obsidian syntax (scripts/obsidian-links.mjs): [[wikilinks]] become
#     site links, and ![[image.png]] embeds and relative Markdown images are
#     copied into images/playbooks/<slug>/. Unresolved links are warned about
#     and left as plain text.
#   - Prints git status afterwards so you can review the diff.
#
# What it does NOT do:
#   - Touch 11tydata.js, .njk landings, or anything outside content/playbooks/<slug>/
#     and images/playbooks/<slug>/.
#   - Sync index notes (_index.md, index.md, 00-index.md, "01 Index.md").
#     Landings are hand-managed (curated HTML lists).

set -euo pipefail

if [ "$#" -lt 2 ]; then
  cat <<USAGE >&2
Usage: $0 <slug> <source-path> [attachments-path]
USAGE
  exit 1
fi

SLUG="$1"
SRC="$2"
ATTACHMENTS="${3:-$SRC}"
DST="content/playbooks/$SLUG"
IMAGES="images/playbooks/$SLUG"

if [ ! -d "$SRC" ]; then
  echo "Source not found: $SRC" >&2
  exit 1
fi

if [ ! -d "$ATTACHMENTS" ]; then
  echo "Attachments not found: $ATTACHMENTS" >&2
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

# Split a basename into its numeric prefix (may be empty) and URL slug.
# "02 The Core Thesis" -> "02" "the-core-thesis"; "primitives" -> "" "primitives"
split_basename() {
  local base="$1" num="" rest="$1"
  if [[ "$base" =~ ^([0-9]+)[-\ ](.+)$ ]]; then
    num="${BASH_REMATCH[1]}"
    rest="${BASH_REMATCH[2]}"
  fi
  rest=$(printf '%s' "$rest" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//')
  printf '%s\n%s\n' "$num" "$rest"
}

is_index_slug() {
  [ "$1" = "index" ] || [ "$1" = "_index" ]
}

# Slugs of the notes the index note links to, in link order. Used to order
# notes that have neither an `order:` field nor a numeric prefix.
INDEX_ORDER=()
load_index_order() {
  local f base slug
  for f in "$SRC"/*.md; do
    base=$(basename "$f" .md)
    slug=$(split_basename "$base" | sed -n 2p)
    is_index_slug "$slug" || [ "$base" = "_index" ] || continue
    while IFS= read -r target; do
      target="${target%/}"
      target="${target##*/}"
      target="${target%.md}"
      INDEX_ORDER+=("$(split_basename "$target" | sed -n 2p)")
    done < <(grep -oE '\]\([^)#]+|\[\[[^]|#]+' "$f" | sed -E 's/^\]\(//; s/^\[\[//')
  done
}

index_position() {
  local i
  for i in "${!INDEX_ORDER[@]}"; do
    if [ "${INDEX_ORDER[$i]}" = "$1" ]; then
      echo $((i + 1))
      return
    fi
  done
}

write_file() {
  local src="$1"
  local dst="$2"
  local section="${3:-}"
  local order_offset="${4:-0}"
  local order_override="${5:-}"
  local title_override="${6:-}"

  # Detect whether the source has frontmatter (first non-empty line is `---`)
  local has_fm
  has_fm=$(awk 'NF{print (/^---[[:space:]]*$/ ? "yes" : "no"); exit}' "$src")

  local title order_from_fm updated
  if [ "$has_fm" = "yes" ]; then
    title=$(extract_field "title" "$src")
    order_from_fm=$(extract_order "$src")
    updated=$(extract_field "date" "$src")
  fi

  if [ -n "$title_override" ]; then
    title="$title_override"
  fi

  if [ -z "$title" ]; then
    title=$(awk 'BEGIN{n=0} /^---[[:space:]]*$/ && fm!="no"{n++; next} {fm="no"} NF{ if (/^# /) { sub(/^# +/, ""); print } exit }' "$src")
  fi

  if [ -z "$title" ]; then
    title=$(basename "$src" .md | sed -E 's/^[0-9]+[- ]//; s/-/ /g')
    title="$(printf '%s' "$title" | awk '{print toupper(substr($0,1,1)) substr($0,2)}')"
    if [ "$has_fm" = "yes" ]; then
      echo "  [warn] no title in $(basename "$src"); using \"$title\"" >&2
    fi
  fi

  local order
  if [ -n "$order_override" ]; then
    order="$order_override"
  elif [ -n "$order_from_fm" ]; then
    order=$((10#$order_from_fm + order_offset))
  else
    local num slug position
    num=$(split_basename "$(basename "$src" .md)" | sed -n 1p)
    slug=$(split_basename "$(basename "$src" .md)" | sed -n 2p)
    position=$(index_position "$slug")
    if [ -n "$num" ]; then
      order=$((10#$num * 10 + order_offset))
    elif [ -n "$position" ]; then
      order=$((position * 10 + order_offset))
    else
      order=$((order_offset))
    fi
  fi

  # Default updated to today if not in source (e.g., CHANGELOG with no frontmatter)
  if [ -z "$updated" ]; then
    updated=$(date +%Y-%m-%d)
  fi

  {
    echo "---"
    echo "title: \"$title\""
    echo "order: $order"
    [ -n "$section" ] && echo "section: $section"
    echo "updated: $updated"
    echo "tags:"
    echo "  - $SLUG"
    echo "---"
    echo ""
    if [ "$has_fm" = "yes" ]; then
      awk 'BEGIN{n=0} /^---[[:space:]]*$/{n++; next} n>=2{print}' "$src"
    else
      cat "$src"
    fi \
      | awk '!started && NF { started = 1; if (/^# /) { dropped = 1; next } }
             dropped == 1 && !NF { next }
             { dropped = 2; print }' \
      | sed -e 's/—/-/g' -e 's/agentic AI/Agentic AI/g'
  } > "$dst"

  sed -i.bak -E \
    -e "s|/framework/[0-9]+-([a-z-]+)/|/playbooks/$SLUG/\\1/|g" \
    -e "s|/artefacts/([a-z-]+)/|/playbooks/$SLUG/artefacts/\\1/|g" \
    "$dst"
  rm -f "$dst.bak"

  # Runs after the URL rewrites so its /playbooks/<slug>/artefacts/ links
  # are not rewritten a second time.
  node scripts/obsidian-links.mjs "$SLUG" "$SRC" "$ATTACHMENTS" "$src" "$dst"
}

echo "Syncing $SLUG"
echo "  source: $SRC"
echo "  target: $DST"

# Wipe existing .md files (preserve .njk, 11tydata.js and .marp.md decks)
# and copied images
find "$DST" -name "*.md" ! -name "*.marp.md" -delete
rm -rf "$IMAGES"

# Process framework chapters at the top level of the source
shopt -s nullglob
load_index_order
for src in "$SRC"/*.md; do
  base=$(basename "$src" .md)
  [ "$base" = "_index" ] && continue
  # Decks are managed by hand, not synced as playbook pages
  [[ "$base" == *.marp ]] && continue
  # Skip vault utility files (case-insensitive match). CHANGELOG is content.
  lowered=$(printf '%s' "$base" | tr '[:upper:]' '[:lower:]')
  case "$lowered" in
    readme|notes|todo|license)
      echo "  [skip] $base.md (utility file)"
      continue
      ;;
  esac

  slug_part=$(split_basename "$base" | sed -n 2p)
  # Index notes become the hand-authored index.njk landing instead
  if is_index_slug "$slug_part"; then
    echo "  [skip] $base.md (index note; landing is hand-authored)"
    continue
  fi

  # A note can declare itself an artefact through its permalink
  if [[ "$(extract_field "permalink" "$src")" == */artefacts/* ]]; then
    mkdir -p "$DST/artefacts"
    write_file "$src" "$DST/artefacts/$slug_part.md" "artefacts" 100
  else
    write_file "$src" "$DST/$slug_part.md" "" 0
  fi
done

# Process artefacts (offset of 100 keeps them after the framework in sortByOrder)
if [ -d "$SRC/artefacts" ]; then
  mkdir -p "$DST/artefacts"
  for src in "$SRC/artefacts"/*.md; do
    base=$(basename "$src" .md)
    [ "$base" = "_index" ] && continue

    slug_part=$(split_basename "$base" | sed -n 2p)
    write_file "$src" "$DST/artefacts/$slug_part.md" "artefacts" 100
  done
fi

echo
echo "Sync complete. Run:"
echo "  git status -- $DST $IMAGES"
echo "  git diff -- $DST $IMAGES"
echo "to review changes."
