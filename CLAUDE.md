# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Eleventy dev server with live reload at `http://localhost:8080/`
- `npm run build` — produces static output in `_site/`
- `npm run clean` — removes `_site/`
- `scripts/sync-playbook.sh <slug> <source-path> [attachments-path]` — sync a playbook from an external Obsidian vault (`~/Obsidian/Steeley`) into `content/playbooks/<slug>/` (one-way; in-repo edits are overwritten on next sync). Converts `[[wikilinks]]` and copies image embeds into `images/playbooks/<slug>/` via `scripts/obsidian-links.mjs`. Leaves `*.marp.md` decks alone
- `node scripts/sync-back.mjs <slug> <source-path> --since <git-ref> [--apply]` — the way back: replays edits made to a synced playbook in this repo into its vault notes. The forward sync is lossy (em dashes, wikilinks, file names, H1s), so it does not copy files. It diffs each changed page against `--since` word by word, finds each edit's old text in the matching note (allowing for the em dash and "agentic AI" rewrites), and replaces it only where it matches exactly once. Edits the vault already has are skipped. Conflicts (the vault changed the same text), ambiguous matches, frontmatter changes, and new or deleted pages are reported and left alone, and the exit code is 1. Dry run by default. `--apply` backs each note up to `.sync-back-backups/` next to the source folder first. It never creates, deletes, or renames notes. Afterwards the forward sync should produce no diff for those pages
- `scripts/sync-laws.sh [source-path]` — sync Software Laws from the vault (`Projects/Profound/Software Laws`) into `content/laws/` (one-way). Each note goes through `scripts/laws-transform.mjs`: layouts map to `laws-*`, the card's `## Front` moves into a `front:` field, and tier link lists become an ordered `entries:` field. Icons are `images/laws/<slug>.svg` (extracted from the printed deck; entries without one show a lettered disc)
- `npm test` — Node test runner over `tests/`. Netlify runs it before every build (`npm test && npm run build && npm run check:built`), so a failing test blocks the deploy. The script lists files with shell globs because Node 20 (what Netlify uses) does not expand `**` in `node --test`
- `npm run check:built` — after a build, checks the machine-readable files: every law and playbook page's Markdown parses, `/laws.json` and `/playbooks.json` are complete, and each agent skill's digest in the index matches its served `SKILL.md`. Netlify and CI both run it
- `GA_ID=G-91HQ81WR67 npm run build && npm run check:csp` — loads five key pages (talk, home with analytics accepted, deck, tool, law) in Chromium with the headers from `netlify.toml`, and fails on any CSP violation. `npm run check:csp -- <url>` checks a deployed site instead, such as a deploy preview. The analytics hit is intercepted, so checks never count as visits. Needs network access and Playwright (not a dependency, CI installs it). `npm test` also fails if a template adds a third-party `<script>` or `<iframe>` host the CSP does not allow

## CI and deploys

Netlify builds and deploys `main` on its own. GitHub Actions only checks, it never deploys and holds no Netlify credentials:

- `.github/workflows/ci.yml` — on every PR and on `main`: `npm test` on Node 20 and 22, then a build and `check:csp`
- `.github/workflows/preview.yml` — when Netlify reports a deploy preview ready, runs `check:csp` against the preview URL and reports `browser-check/preview` as a status on the PR's commit. It runs from `main`, so changes to it only take effect after merging
- `.github/workflows/production.yml` — after a push to `main`, waits until `/version.json` shows that commit (Netlify sets `COMMIT_REF`), then runs `check:csp` against profound.fyi
- `.github/actions/browser-check-setup` — shared setup: Node from `.nvmrc`, `npm ci`, and a pinned Playwright with Chromium

Actions are pinned to commit SHAs. Branch protection on `main` is what makes the checks a merge gate.

Node 20 is required (`.nvmrc`, and `NODE_VERSION` in `netlify.toml`). Test changes to the test script on Node 20, since newer Node accepts patterns that Node 20 rejects. Netlify builds on push to `main` (`netlify.toml`).

## Architecture

Eleventy 3 (ESM, Nunjucks) static site. Layout in `eleventy.config.js`:

- Input: `content/`
- Includes: `_includes/` (layouts in `_includes/layouts/`, partials in `_includes/partials/`)
- Data: `_data/` (e.g. `site.js` exposes `site.*` to templates; `URL` and `GA_ID` env vars override at build time)
- Output: `_site/`
- Passthrough copies: `css/`, `js/`, `images/`

### Content shapes

| Shape | Path pattern | Layout | Notes |
| --- | --- | --- | --- |
| Standalone page | `content/<slug>.md` → `/<slug>/` | `layouts/page.njk` | e.g. `content/about.md`, `content/bio.md`, `content/reading.md` |
| Writing | `content/writing/<slug>.md` → `/writing/<slug>/` | `layouts/writing.njk` (via `writing.11tydata.js`) | needs `title` + `date`; optional `summary` |
| Talk | `content/talks/<slug>.md` → `/talks/<slug>/` | `layouts/talk.njk` (via `talks.11tydata.js`) | needs `title` + `date`; optional `venue`, `summary`, `slides`, `video`, `recording`, `speakerdeck` (embed ID, renders the player), `speakers` (list of `name` + optional `url`, shown above the deck); set `permalink: false` to appear only on the index without its own page |
| Playbook page | `content/playbooks/<slug>/<page>.md` → `/playbooks/<slug>/<page>/` | `layouts/playbook-page.njk` (via `playbooks.11tydata.js`) | needs `title` + `order`; tag each page individually with `tags: ["<slug>"]` |
| Law entry | `content/laws/entries/<slug>.md` → `/laws/<slug>/` | `layouts/laws-entry.njk` | synced, not hand-edited; needs `title`, `slug`, `tier` (Law, Principle, Pattern, Practice, Saying, Framework); optional `related: [slugs]`. Tier pages (`content/laws/tiers/`) and cluster pages (`content/laws/clusters/`, with `entries: [slugs]`) use `layouts/laws-page.njk` |
| Slide deck | `content/playbooks/<slug>/<name>.marp.md` → set `permalink` | `layouts/deck.njk` (set in frontmatter) | Marp Markdown, `---` between slides; needs `title`, `marp: true`, `templateEngineOverride: md`, and `tags: []` to stay out of the sidebar; optional `paginate`, `size`, `header`, `footer`, `math` |

`content/playbooks/<slug>/index.njk` is the hand-authored landing page (not a Markdown page) and sets `permalink: /playbooks/<slug>/`.

### Playbook conventions (the gotcha)

Each playbook needs a per-slug data file `content/playbooks/<slug>/<slug>.11tydata.js` setting:

```js
export default {
  playbook: "<slug>",
  playbookTitle: "...",
  license: { name: "...", url: "..." },
};
```

**Tags must be set in each Markdown file's frontmatter, not in `11tydata.js`.** Eleventy deep-merges arrays, so a directory-data tag would prevent the landing page from opting out of the sibling collection.

`layouts/playbook-page.njk` reads `collections[playbook]`, sorts by `order` (via the custom `sortByOrder` filter), and renders prev/next via Eleventy's built-in `getPreviousCollectionItem`/`getNextCollectionItem`. The sidebar (`_includes/partials/playbook-sidebar.njk`) consumes the same collection.

### Custom Eleventy bits (in `eleventy.config.js`)

- Filters: `readableDate`, `htmlDateString`, `toRoman`, `sortByOrder`, `filterBySection`, `groupByYear` (returns `[[year, entries], ...]` sorted year-descending; used by the writing and talks indexes)
- `marp` filter: renders a deck's raw Markdown (`page.rawInput`) with `@marp-team/marp-core` and the `profound` theme in `_includes/marp/profound.css`. It is a filter rather than a template format because Eleventy's built-in `md` claims `*.marp.md` first. Present mode is `js/deck.js`
- `marpDeck` shortcode: `{% marpDeck "content/playbooks/<slug>/<name>.marp.md", "/playbooks/<slug>/<name>/" %}` embeds a deck inline on another Nunjucks page as a slide viewer (scrolls and swipes without JS, `js/deck.js` adds buttons, counter, and present mode). Print styles apply only on a deck's own page
- Collections: `sitemapPages` (everything with a URL except `sitemap.xml`/`robots.txt`), `playbooks` (sorted by `order` from each `index.*`), `tools` (sorted by `order` from each `.njk`)
- Tag-based collections (auto-built from `tags: [...]` in 11tydata files): `writing`, `talks`

### Laws as data and the agent skill (`lib/laws-data.js`)

`_data/lawRecords.js` reads every synced law entry and cluster once per build into records (front, how to use it, how it gets misused, tier and its definition, related, clusters, URLs). It throws if an entry lacks either note or has an unknown tier, so a bad sync fails the build. From those records:

- `/laws.json` — every law (`content/laws-json.njk`)
- `/laws/<slug>.md` — each law as Markdown with frontmatter (`content/laws-markdown.njk`), linked from the law page head with `rel="alternate"` via `markdownUrl` in `entries.11tydata.js`
- `/.well-known/agent-skills/profound-software-laws/SKILL.md` and `/.well-known/agent-skills/index.json` — the skill and its discovery index with a sha256 digest of the exact `SKILL.md` bytes. The `SKILL.md` template trims whitespace so the bytes match. The description is quoted YAML because it contains `: `
- `/downloads/profound-software-laws-skill.zip` — `SKILL.md` plus `references/laws.md` (every law in full), written by an `eleventy.after` hook with `lib/zip.js` (no archive dependency), for installing in Claude

The Laws home page links these from `layouts/laws-home.njk`, not `content/laws/index.md`, which the vault sync overwrites. CORS and Markdown content types for these files are in `netlify.toml`.

### Playbooks as data and the agent skills (`lib/playbooks-data.js`)

The `playbookRecords` collection (in `eleventy.config.js`) reads every playbook Markdown page, not decks or landing pages, using Eleventy's real URLs. Plays come from two places: a page that is itself a play (Enabling Teams, Jobs to Be Done) and `## Play:` sections (Creating Playbooks). Fields are the labelled paragraphs **When**, **The action** (or the older **The move**), **Forces**, **Signals**, **When not to**, **Instance**, and **Status**. A play with an Instance is `evidence: "instance"`, otherwise `"none"`. Template placeholders such as `[name the action]` are skipped. A playbook with no plays is a `framework`.

- `/playbooks/<slug>/<page>.md` (and `/artefacts/` pages) — each page as Markdown with absolute links (`content/playbooks-markdown.njk`), linked from the page head via `markdownUrl` in `playbooks.11tydata.js`
- `/playbooks.json` — every playbook, page, and play, with evidence counts
- `/.well-known/agent-skills/profound-<playbook>/SKILL.md` — one skill per playbook, named `profound-<playbook>` (`content/agent-skill-playbooks.njk`), all listed in the same discovery index as the laws skill (`lib/agent-skills.js`). The description opens with the playbook's `description` from its landing `index.njk`. A playbook of plays gets steps that check When not to and present a play with no instance as untested. A framework gets steps for reading a situation through it
- `/downloads/profound-<playbook>-skill.zip` — the skill plus one reference file per page, named as the skill's index says

The Playbooks home page (`content/playbooks/index.njk`) links each playbook's skill and these files.

Every skill name carries the `profound-` prefix so it does not clash with other skills an assistant has installed. The name appears in the skill's frontmatter, its URL folder, its ZIP folder, and the page links. `check:built` fails if a skill is not served under its own name.

### Page metadata (`lib/site-meta.js`, used by `layouts/base.njk`)

- `description` falls back to `summary`, then `front`, then the first prose paragraph (`excerpt` filter), then `site.description`
- `robots` in frontmatter emits `<meta name="robots">` (e.g. `robots: noindex` on `404.md`). A `noindex` page gets no JSON-LD
- Breadcrumbs: `partials/breadcrumbs.njk` shows the trail, and the JSON-LD `BreadcrumbList` repeats it, only on pages at least two levels below home, so the two always match. Set `crumbParent: { name, url }` (site-relative) to add a step between section and page, as `content/laws/entries/entries.11tydata.js` does for tiers
- Root files: `robots.txt` (with `Content-Signal`), `llms.txt`, `/.well-known/security.txt` (renews `Expires` each build), and `/.well-known/gpc.json` are Nunjucks templates in `content/`. Static files in `public/` copy to the site root. Security headers and the CSP live in `netlify.toml`, so any new third-party script, frame, or font origin needs adding there. `lib/netlify-headers.js` reads them for the tests and `check:csp`

### CSS / JS

- CSS is hand-authored, split into `tokens.css` → `base.css` → `layout.css` → `components.css` (loaded in that order from `layouts/base.njk`). No build step.
- `js/consent.js` runs the GA consent banner; only loaded when `site.gaId` is set. Default Google Consent Mode v2 state is `denied`; granted state is read from `localStorage['profound-consent']`.

### Writing constraints (apply to all rendered prose)

British English, Oxford comma, no semicolons, no emojis in titles, active voice, plain language.
