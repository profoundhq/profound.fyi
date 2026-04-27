# Eleventy Migration — Design

**Date:** 2026-04-27
**Status:** Approved (pending user review)

## Purpose

Replace the freshly scaffolded Hugo setup at `profound.fyi` with Eleventy. The triggers were the templating language (Go templates, unfamiliar) and Hugo's Go-based asset pipeline. The site keeps the same domain, the same Netlify host, and the same intent — but expands its content shape from "home + posts" to a versatile structure that supports **standalone pages**, **multiple multi-page playbooks**, and **a blog** under one design system.

This spec covers the structural scaffold and v1 design system. Real content is out of scope.

## Constraints

- Node 20 LTS, npm. No yarn, pnpm, or bun.
- British English (`en-GB`).
- Domain: `profound.fyi`. GitHub org: `profoundhq` (repo not yet created).
- Eleventy v3.x, Nunjucks templates, Markdown for content.
- No preemptive plugins. Add `@11ty/eleventy-plugin-rss`, `@11ty/eleventy-img`, syntax highlighting, etc., only when content demands them.

## Architecture

Eleventy reads `content/` and `_includes/`, applies layouts and collections, and writes a static site to `_site/`. Netlify runs `npm run build` on every push to `main` and serves `_site/`. There is no server, no database, no JS framework.

The build is plain: `eleventy --serve` for local development, `eleventy` for production. Asset processing is also plain — CSS is hand-authored and copied through; fonts are loaded from Google Fonts (self-hosting can come later if it matters).

## Content structure

### URL layout

```
/                           home — orient + link to sections
/posts/                     blog index
/posts/<slug>/              post page
/playbooks/                 hub — list of playbooks
/playbooks/<slug>/          playbook landing (intro + TOC)
/playbooks/<slug>/<page>/   playbook page (with sidebar nav, prev/next)
/<slug>/                    standalone pages (e.g. /about/)
```

### Source layout

```
content/
  index.md                  # home
  about.md                  # example standalone page
  posts/
    posts.11tydata.js       # collection metadata (layout, permalink, tags)
    welcome.md              # example post
  playbooks/
    playbooks.11tydata.js   # collection metadata
    advice-process/
      index.md              # playbook landing
      what-is-it.md
      when-to-use.md
_includes/
  layouts/
    base.njk                # <html>, <head>, font preload, footer
    page.njk                # standalone page
    post.njk                # blog post (date, prev/next)
    playbook-page.njk       # two-column with sidebar TOC + prev/next
  partials/
    site-header.njk
    site-footer.njk
    playbook-sidebar.njk
public/
  fonts/                    # only if we self-host later
  favicon.svg
css/
  tokens.css                # design tokens
  base.css                  # element resets + typography
  layout.css                # page/playbook/post layout
  components.css            # sidebar, prev/next, etc.
eleventy.config.js          # ~50 lines; collections, filters, passthrough
package.json
netlify.toml
README.md
.gitignore
.nvmrc                      # 20
```

### Collections (in `eleventy.config.js`)

- `posts` — everything under `content/posts/`, sorted by `date` descending.
- `playbooks` — each top-level `<slug>/index.md` under `content/playbooks/`. Used to build the `/playbooks/` hub.
- Per-playbook collections — pages within a playbook, ordered by frontmatter `order`. Used to render the sidebar TOC and prev/next links on each playbook page. Built dynamically from the parent directory of each `playbook-page` entry.

### v1 example content

- One home page (placeholder copy).
- One standalone page at `/about/` (placeholder).
- One blog post at `/posts/welcome/`.
- One playbook at `/playbooks/advice-process/` with two internal pages.

This proves all four URL patterns and both nav styles (post prev/next, playbook sidebar + prev/next) end-to-end. Real content arrives later; no v1 work depends on knowing what gets written.

## Design system

### Visual direction

EE-Playbooks-flavoured: pragmatic, professional, prose-first, light background, generous whitespace, minimal chrome. Confirmed via side-by-side mockups in the brainstorming session.

### Typography

- **Body and headings: IBM Plex Sans.** Loaded via Google Fonts CDN initially. Self-hosting (`@fontsource/ibm-plex-sans`) is a v2 consideration, not a v1 requirement.
- **Type scale (rem-based):** body 1rem (~17.5px), small 0.875rem, large 1.125rem, h3 1.25rem, h2 1.5rem, h1 2rem on mobile / 2.5rem on desktop.
- **Line height:** 1.6-1.7 for body, 1.2-1.3 for headings.
- **Measure:** `max-width: 65ch` for prose, narrower for narrow columns.

### Colour

Light theme only in v1.
- `--colour-bg: #fff`
- `--colour-fg: #1a1a1a`
- `--colour-muted: #555`
- `--colour-rule: #e5e5e5`
- `--colour-link-underline: currentColor` (underlined, low decoration thickness)

Dark mode is a v2 consideration.

### Spacing & layout

- Spacing scale via custom properties: `--space-1` through `--space-8`, geometric.
- Single content column for pages and posts.
- Two-column for playbook pages: left sidebar (~16rem) with TOC, right column with content (`max-width: 65ch`).
- Mobile: sidebar collapses to a top-of-page list.

### CSS organisation

- `tokens.css` — design tokens as `:root` custom properties.
- `base.css` — element resets, typography for `h1..h6`, `p`, `blockquote`, `ul`, `ol`, `code`, `pre`.
- `layout.css` — page, post, and playbook layouts; sidebar; footer.
- `components.css` — small things (prev/next, breadcrumb if needed later, link styles).

Total expected: ~300-400 lines of hand-authored CSS for v1. No build step beyond Eleventy's own.

### What's NOT in v1

- Tailwind or any CSS framework.
- Dark mode.
- Image optimisation pipeline.
- RSS, sitemap, search, syntax highlighting.
- Self-hosted fonts.
- JS interactivity beyond what HTML offers natively.

## Migration from Hugo

### Removed

- `hugo.toml`, `go.mod`, `go.sum`.
- `archetypes/`, `assets/`, `data/`, `i18n/`, `layouts/`, `themes/` — Hugo's scaffold dirs.
- `content/_index.md`, `content/posts/_index.md` — replaced by the Eleventy structure.

### Modified

- `.gitignore` — drop `/public/`, `/resources/`, `.hugo_build.lock`. Add `/_site/`, `/node_modules/`, `.cache/`, `.superpowers/`. Keep `.DS_Store`.
- `netlify.toml` — replace Hugo build command with `npm run build`. Drop `HUGO_VERSION`, `HUGO_VERSION_EXTENDED`, `GO_VERSION`. Add `NODE_VERSION = "20"`.
- `README.md` — rewrite for Eleventy commands.

### Preserved

- `docs/superpowers/` entirely. The Hugo spec, Hugo plan, and this Eleventy spec all live here as project history.

### Git history

Keep all nine existing commits. Nothing's pushed; resetting would be a destructive operation with no benefit. Migration is additive: a sequence of new commits on top of `main` that delete Hugo, scaffold Eleventy, and rewrite shared files.

## Build and deploy

### Local development

```sh
npm install
npm run dev      # eleventy --serve at http://localhost:8080/
```

### Production build

```sh
npm run build    # eleventy → _site/
```

### Netlify

```toml
[build]
  publish = "_site"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "20"
```

Netlify auto-detects `netlify.toml` on first deploy. The Hugo build pin (`HUGO_VERSION` etc.) is removed in the same commit.

### Manual steps (user-driven, post-scaffold)

These don't change from the Hugo plan:

1. Create `profoundhq/profound.fyi` repo on GitHub.
2. `git remote add origin` and push `main`.
3. In Netlify: New site → import from GitHub → pick the repo (auto-detects `netlify.toml`).
4. Add custom domain `profound.fyi` and update DNS.

## Verification

The scaffold is complete when:

- `npm install` runs cleanly with no peer-dep warnings.
- `npm run dev` serves the site at `http://localhost:8080/` with no errors.
- Each of the four URL patterns renders:
  - `/` shows the home content with site chrome.
  - `/about/` renders as a standalone page.
  - `/posts/welcome/` renders as a post with date and prev/next (latter empty if only one post).
  - `/playbooks/advice-process/` renders as a playbook landing with TOC.
  - `/playbooks/advice-process/what-is-it/` renders as a playbook page with sidebar and prev/next.
- IBM Plex Sans is visibly loaded (no system-stack fallback).
- A clean `npm run build` produces `_site/` containing each of the above as `index.html` files.
- No console errors when navigating in the browser.

## Out of scope

- Real content beyond placeholders.
- Custom design polish beyond the v1 design system.
- Image optimisation, RSS, sitemap, search, comments, analytics.
- Dark mode, theme switcher.
- Authentication or any dynamic feature.
- CI beyond Netlify's own build pipeline.
- Self-hosted fonts.

## Risks and notes

- **Eleventy v3 is ESM-first.** `eleventy.config.js` will use `export default`. `package.json` needs `"type": "module"`. Some older plugins assume CommonJS; we don't pull in any in v1, so no issue, but it's a thing to keep in mind when adding plugins later.
- **Google Fonts external dependency.** v1 loads IBM Plex Sans from `fonts.googleapis.com`. If Google Fonts has an outage, the site falls back to system sans. If privacy or performance demands self-hosting, swap to `@fontsource/ibm-plex-sans` later — small change.
- **Netlify Node version drift.** The `NODE_VERSION` pin protects us. Bump when local Node moves on.
- **Module path consistency.** No Go module to track — drop entirely. Repo URL becomes the only canonical project location.
