# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Eleventy dev server with live reload at `http://localhost:8080/`
- `npm run build` — produces static output in `_site/`
- `npm run clean` — removes `_site/`
- `scripts/sync-playbook.sh <slug> <source-path>` — sync a playbook from an external Obsidian vault into `content/playbooks/<slug>/` (one-way; in-repo edits are overwritten on next sync)

Node 20 is required (`.nvmrc`). Netlify builds on push to `main` (`netlify.toml`).

## Architecture

Eleventy 3 (ESM, Nunjucks) static site. Layout in `eleventy.config.js`:

- Input: `content/`
- Includes: `_includes/` (layouts in `_includes/layouts/`, partials in `_includes/partials/`)
- Data: `_data/` (e.g. `site.js` exposes `site.*` to templates; `URL` and `GA_ID` env vars override at build time)
- Output: `_site/`
- Passthrough copies: `css/`, `js/`, `images/`

### Three content shapes

| Shape | Path pattern | Layout | Notes |
| --- | --- | --- | --- |
| Standalone page | `content/<slug>.md` → `/<slug>/` | `layouts/page.njk` | e.g. `content/about.md` |
| Post | `content/posts/<slug>.md` → `/posts/<slug>/` | `layouts/post.njk` (via `posts.11tydata.js`) | needs `title` + `date` |
| Playbook page | `content/playbooks/<slug>/<page>.md` → `/playbooks/<slug>/<page>/` | `layouts/playbook-page.njk` (via `playbooks.11tydata.js`) | needs `title` + `order`; tag each page individually with `tags: ["<slug>"]` |

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

- Filters: `readableDate`, `htmlDateString`, `sortByOrder`, `filterBySection`
- Collections: `sitemapPages` (everything with a URL except `sitemap.xml`/`robots.txt`), `playbooks` (sorted by `order` from each `index.*`)

### CSS / JS

- CSS is hand-authored, split into `tokens.css` → `base.css` → `layout.css` → `components.css` (loaded in that order from `layouts/base.njk`). No build step.
- `js/consent.js` runs the GA consent banner; only loaded when `site.gaId` is set. Default Google Consent Mode v2 state is `denied`; granted state is read from `localStorage['profound-consent']`.

### Writing constraints (apply to all rendered prose)

British English, Oxford comma, no semicolons, no emojis in titles, active voice, plain language.
