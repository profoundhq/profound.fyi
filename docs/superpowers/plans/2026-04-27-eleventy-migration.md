# Eleventy Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Hugo scaffold at `/Users/benedictsteele/Development/profound.fyi` with an Eleventy site that supports standalone pages, multiple multi-page playbooks, and a blog under one EE-Playbooks-flavoured design system.

**Architecture:** Eleventy v3 (ESM), Nunjucks templates, hand-authored CSS with custom properties (no Tailwind), Google Fonts loading IBM Plex Sans, Netlify build via `npm run build`. v1 ships scaffold + design system + one example of each content type.

**Tech Stack:** Eleventy v3.x, Nunjucks, plain CSS, npm, Node 20, Netlify.

**Spec:** `docs/superpowers/specs/2026-04-27-eleventy-migration-design.md`

**Working directory:** `/Users/benedictsteele/Development/profound.fyi`

**Pre-existing state on `main` (10 commits):**
- 9 Hugo commits (`e1a76b9` through `fc0b5e9`) — being torn down by this plan.
- 1 Eleventy spec commit (`00417ca`) — referenced throughout.

**Git config:** Local repo author is `Benedict Steele <ben@hyperdimensional.net>` (set during the Hugo work; remains for this work). Every commit must include the trailer `Co-Authored-By: Benedict Steele <ben@hyperdimensional.net>`.

---

## File structure (end state)

```
profound.fyi/
├── .gitignore                                 # Task 1 (rewrite)
├── .nvmrc                                     # Task 2
├── eleventy.config.js                         # Task 2 (created), grown in Tasks 5-6
├── netlify.toml                               # Task 7 (rewrite)
├── package.json                               # Task 2
├── package-lock.json                          # Task 2 (npm install)
├── README.md                                  # Task 8 (rewrite)
├── content/
│   ├── about.md                               # Task 4
│   ├── index.md                               # Task 2
│   ├── posts/
│   │   ├── posts.11tydata.js                  # Task 5
│   │   ├── index.njk                          # Task 5 (posts hub)
│   │   └── welcome.md                         # Task 5
│   └── playbooks/
│       ├── playbooks.11tydata.js              # Task 6
│       ├── index.njk                          # Task 6 (playbooks hub)
│       └── advice-process/
│           ├── advice-process.11tydata.js     # Task 6
│           ├── index.njk                      # Task 6 (playbook landing)
│           ├── what-is-it.md                  # Task 6
│           └── when-to-use.md                 # Task 6
├── _includes/
│   ├── layouts/
│   │   ├── base.njk                           # Task 2 (created), Task 3 (CSS), Task 6 (no further)
│   │   ├── page.njk                           # Task 2
│   │   ├── post.njk                           # Task 5
│   │   └── playbook-page.njk                  # Task 6
│   └── partials/
│       ├── playbook-sidebar.njk               # Task 6
│       ├── site-footer.njk                    # Task 3
│       └── site-header.njk                    # Task 3
├── css/
│   ├── tokens.css                             # Task 3
│   ├── base.css                               # Task 3
│   ├── layout.css                             # Task 3
│   └── components.css                         # Task 3
├── docs/superpowers/                          # preserved entirely
└── _site/                                     # build output, gitignored
```

Hugo files (`hugo.toml`, `go.mod`, `go.sum`, `archetypes/`, `assets/`, `data/`, `i18n/`, `layouts/`, `themes/`, `content/_index.md`, `content/posts/_index.md`) are removed in Task 1.

---

## Task 1: Remove Hugo files and rewrite `.gitignore`

**Files:**
- Delete: `hugo.toml`, `go.mod`, `go.sum`, `content/_index.md`, `content/posts/_index.md`
- Delete (if empty): `archetypes/`, `assets/`, `data/`, `i18n/`, `layouts/`, `themes/`, `content/posts/`, `content/`
- Modify: `.gitignore`

- [ ] **Step 1: Confirm working directory and clean baseline**

```bash
cd /Users/benedictsteele/Development/profound.fyi && git status
```

Expected: `On branch main`, working tree clean (or only `.nwave/` and `.superpowers/` untracked, which are external — leave alone).

- [ ] **Step 2: Remove tracked Hugo files**

```bash
git rm hugo.toml go.mod go.sum content/_index.md content/posts/_index.md
git rm -r archetypes
```

Expected output: each file marked `rm`. `archetypes/default.md` was the only tracked file inside scaffold dirs; the rest of the scaffolded directories (`assets/`, `data/`, `i18n/`, `layouts/`, `static/`, `themes/`) were all empty and never tracked.

- [ ] **Step 3: Remove the now-empty scaffold directories from disk**

```bash
rm -rf assets data i18n layouts static themes content/posts content
```

(These are not tracked by git, so this only affects the working tree. `content/` is removed entirely; we'll recreate it in later tasks.)

- [ ] **Step 4: Verify Hugo is gone**

```bash
ls -1
```

Expected output should NOT include any of: `hugo.toml`, `go.mod`, `go.sum`, `archetypes`, `assets`, `data`, `i18n`, `layouts`, `static`, `themes`, `content`. Should still include `.gitignore`, `docs/`, `README.md`, `netlify.toml`, `.nwave` (out of scope), `.superpowers` (out of scope).

- [ ] **Step 5: Rewrite `.gitignore`**

Use the Write tool to set the full contents of `.gitignore` to:

```
/_site/
/node_modules/
.cache/
.superpowers/
.nwave/
.DS_Store
```

(Note: `.nwave/` is the user's external hook system. `.superpowers/` is the brainstorming session output. Both belong in `.gitignore`.)

- [ ] **Step 6: Verify clean working tree apart from staged Hugo deletions**

```bash
git status
```

Expected: `Changes to be committed:` lists `.gitignore` (modified), `archetypes/default.md` (deleted), `content/_index.md` (deleted), `content/posts/_index.md` (deleted), `go.mod` (deleted), `go.sum` (deleted), `hugo.toml` (deleted). No untracked items beyond `.nwave/` and `.superpowers/`.

- [ ] **Step 7: Commit**

```bash
git add .gitignore
git commit -m "$(cat <<'EOF'
chore: remove Hugo, prepare for Eleventy

Delete Hugo config and scaffold (hugo.toml, go.mod, go.sum,
archetypes, content). Rewrite .gitignore for the Eleventy build
output (_site, node_modules) and current external tooling
(.nwave, .superpowers).

netlify.toml and README.md still describe Hugo; they're rewritten
in later commits to keep each commit's blast radius small.

Co-Authored-By: Benedict Steele <ben@hyperdimensional.net>
Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Eleventy scaffold + minimal home page

**Files:**
- Create: `package.json`, `.nvmrc`, `eleventy.config.js`, `_includes/layouts/base.njk`, `_includes/layouts/page.njk`, `content/index.md`
- Generated by `npm install`: `package-lock.json`, `node_modules/` (gitignored)

- [ ] **Step 1: Create `.nvmrc`**

Use the Write tool to set `/Users/benedictsteele/Development/profound.fyi/.nvmrc` content to:

```
20
```

- [ ] **Step 2: Create `package.json`**

Use the Write tool to set `/Users/benedictsteele/Development/profound.fyi/package.json` content to:

```json
{
  "name": "profound-fyi",
  "version": "1.0.0",
  "description": "Static site for profound.fyi",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "eleventy --serve",
    "build": "eleventy",
    "clean": "rm -rf _site"
  },
  "devDependencies": {
    "@11ty/eleventy": "^3.0.0"
  }
}
```

- [ ] **Step 3: Install dependencies**

```bash
npm install
```

Expected: prints something like `added 100+ packages in Xs`. Creates `node_modules/` and `package-lock.json`. No high-severity vulnerabilities.

- [ ] **Step 4: Verify Eleventy is installed**

```bash
npx eleventy --version
```

Expected: prints a version number starting with `3.` (e.g. `3.0.0`).

- [ ] **Step 5: Create `eleventy.config.js`**

Use the Write tool to set `/Users/benedictsteele/Development/profound.fyi/eleventy.config.js` content to:

```js
export default function (eleventyConfig) {
  return {
    dir: {
      input: "content",
      includes: "../_includes",
      output: "_site",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["md", "njk", "html"],
  };
}
```

(Note: `dir.includes` is relative to `dir.input`, so `"../_includes"` resolves to project-root `_includes/`.)

- [ ] **Step 6: Create `_includes/layouts/base.njk`**

Use the Write tool to set `/Users/benedictsteele/Development/profound.fyi/_includes/layouts/base.njk` content to:

```njk
<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{{ title or "profound.fyi" }}</title>
</head>
<body>
  <header><a href="/">profound.fyi</a></header>
  <main>{{ content | safe }}</main>
  <footer>© 2026 Benedict Steele.</footer>
</body>
</html>
```

(Bare bones — no CSS yet. Task 3 wires it up.)

- [ ] **Step 7: Create `_includes/layouts/page.njk`**

Use the Write tool to set `/Users/benedictsteele/Development/profound.fyi/_includes/layouts/page.njk` content to:

```njk
---
layout: layouts/base.njk
---
<article class="page">
  <h1>{{ title }}</h1>
  {{ content | safe }}
</article>
```

(The `class="page"` hooks into the width-constraint rule in `layout.css` added in Task 3.)

- [ ] **Step 8: Create `content/index.md`**

Use the Write tool to set `/Users/benedictsteele/Development/profound.fyi/content/index.md` content to:

```markdown
---
layout: layouts/page.njk
title: profound.fyi
---

Placeholder home page. Real content later.
```

- [ ] **Step 9: Smoke build**

```bash
npm run build
```

Expected: prints something like `Wrote 1 file in Xs (vX.X.X)` with no errors. Creates `_site/index.html`.

- [ ] **Step 10: Verify built home**

```bash
test -f _site/index.html && grep -q 'profound.fyi' _site/index.html && grep -q '<h1>profound.fyi</h1>' _site/index.html && echo OK
```

Expected: `OK`.

- [ ] **Step 11: Commit**

```bash
git add .nvmrc package.json package-lock.json eleventy.config.js _includes/ content/
git commit -m "$(cat <<'EOF'
feat: scaffold Eleventy site with minimal home page

Add package.json (Eleventy v3, ESM, npm scripts), .nvmrc pinning
Node 20, eleventy.config.js wiring content/ -> _site/, and the two
layout templates (base.njk and page.njk) needed to render the home
page. No CSS yet -- design system arrives in the next commit.

Co-Authored-By: Benedict Steele <ben@hyperdimensional.net>
Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Design system (CSS + partials + base layout updates)

**Files:**
- Create: `css/tokens.css`, `css/base.css`, `css/layout.css`, `css/components.css`
- Create: `_includes/partials/site-header.njk`, `_includes/partials/site-footer.njk`
- Modify: `_includes/layouts/base.njk` (add CSS links + font preconnect, switch to partials)
- Modify: `eleventy.config.js` (add passthrough copy for `css/`)

- [ ] **Step 1: Create `css/tokens.css`**

Use the Write tool to set `/Users/benedictsteele/Development/profound.fyi/css/tokens.css` content to:

```css
:root {
  /* Colours */
  --colour-bg: #fff;
  --colour-fg: #1a1a1a;
  --colour-muted: #555;
  --colour-rule: #e5e5e5;
  --colour-code-bg: #f6f6f3;

  /* Type scale (rem-based) */
  --type-base: 1.0625rem;
  --type-small: 0.875rem;
  --type-large: 1.125rem;
  --type-h3: 1.25rem;
  --type-h2: 1.5rem;
  --type-h1: 2rem;
  --type-h1-desktop: 2.5rem;

  /* Line heights */
  --lh-body: 1.65;
  --lh-heading: 1.25;

  /* Measure */
  --measure: 65ch;

  /* Spacing scale */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.5rem;
  --space-6: 2rem;
  --space-7: 3rem;
  --space-8: 4rem;

  /* Typeface */
  --font-sans: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
```

- [ ] **Step 2: Create `css/base.css`**

Use the Write tool to set `/Users/benedictsteele/Development/profound.fyi/css/base.css` content to:

```css
*, *::before, *::after { box-sizing: border-box; }

html { font-size: 16px; }

body {
  font-family: var(--font-sans);
  font-size: var(--type-base);
  line-height: var(--lh-body);
  color: var(--colour-fg);
  background: var(--colour-bg);
  margin: 0;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4, h5, h6 {
  font-weight: 600;
  line-height: var(--lh-heading);
  letter-spacing: -0.01em;
  margin: var(--space-6) 0 var(--space-3);
}

h1 { font-size: var(--type-h1); }
@media (min-width: 48em) {
  h1 { font-size: var(--type-h1-desktop); }
}
h2 { font-size: var(--type-h2); }
h3 { font-size: var(--type-h3); }

p, ul, ol, blockquote, pre {
  margin: 0 0 var(--space-4);
}

a {
  color: inherit;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}

blockquote {
  border-left: 3px solid var(--colour-rule);
  padding-left: var(--space-4);
  color: var(--colour-muted);
}

code, pre {
  font-family: var(--font-mono);
  font-size: 0.95em;
}

pre {
  background: var(--colour-code-bg);
  padding: var(--space-3) var(--space-4);
  overflow-x: auto;
}

hr {
  border: 0;
  border-top: 1px solid var(--colour-rule);
  margin: var(--space-7) 0;
}

img { max-width: 100%; height: auto; }
```

- [ ] **Step 3: Create `css/layout.css`**

Use the Write tool to set `/Users/benedictsteele/Development/profound.fyi/css/layout.css` content to:

```css
.site-header {
  border-bottom: 1px solid var(--colour-rule);
  padding: var(--space-4) var(--space-5);
}

.site-nav {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-5);
  align-items: baseline;
}

.site-nav a {
  text-decoration: none;
}

.site-nav a:first-child {
  font-weight: 600;
}

.site-footer {
  border-top: 1px solid var(--colour-rule);
  padding: var(--space-5);
  color: var(--colour-muted);
  font-size: var(--type-small);
}

main {
  padding: var(--space-6) var(--space-5) var(--space-7);
}

.page, .post {
  max-width: var(--measure);
  margin: 0 auto;
}

.playbook-layout {
  display: grid;
  grid-template-columns: 16rem 1fr;
  gap: var(--space-7);
  max-width: calc(16rem + 65ch + var(--space-7));
  margin: 0 auto;
}

@media (max-width: 60em) {
  .playbook-layout {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 4: Create `css/components.css`**

Use the Write tool to set `/Users/benedictsteele/Development/profound.fyi/css/components.css` content to:

```css
.playbook-sidebar {
  font-size: var(--type-small);
}

.playbook-sidebar h3 {
  font-size: var(--type-base);
  margin-top: 0;
}

.playbook-sidebar ol {
  list-style: none;
  padding: 0;
  margin: 0;
}

.playbook-sidebar li { margin-bottom: var(--space-2); }

.playbook-sidebar a[aria-current="page"] {
  font-weight: 600;
}

.prev-next {
  display: flex;
  justify-content: space-between;
  gap: var(--space-4);
  margin-top: var(--space-7);
  padding-top: var(--space-5);
  border-top: 1px solid var(--colour-rule);
  font-size: var(--type-small);
}

.prev-next .prev,
.prev-next .next { flex: 1; }
.prev-next .next { text-align: right; }
.prev-next a { display: block; text-decoration: none; }
.prev-next a:hover { text-decoration: underline; }

.prev-next .label {
  display: block;
  color: var(--colour-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.75rem;
  margin-bottom: var(--space-1);
}

.collection-list {
  list-style: none;
  padding: 0;
  max-width: var(--measure);
  margin: 0 auto;
}

.collection-list li {
  border-bottom: 1px solid var(--colour-rule);
  padding: var(--space-4) 0;
}

.collection-list h2 {
  margin: 0;
  font-size: var(--type-large);
}

.collection-list .meta {
  color: var(--colour-muted);
  font-size: var(--type-small);
  margin-top: var(--space-1);
}

.post .meta {
  color: var(--colour-muted);
  font-size: var(--type-small);
  margin-top: calc(-1 * var(--space-3));
  margin-bottom: var(--space-5);
}
```

- [ ] **Step 5: Create `_includes/partials/site-header.njk`**

Use the Write tool to set `/Users/benedictsteele/Development/profound.fyi/_includes/partials/site-header.njk` content to:

```njk
<header class="site-header">
  <nav class="site-nav">
    <a href="/">profound.fyi</a>
    <a href="/posts/">Posts</a>
    <a href="/playbooks/">Playbooks</a>
    <a href="/about/">About</a>
  </nav>
</header>
```

- [ ] **Step 6: Create `_includes/partials/site-footer.njk`**

Use the Write tool to set `/Users/benedictsteele/Development/profound.fyi/_includes/partials/site-footer.njk` content to:

```njk
<footer class="site-footer">
  © 2026 Benedict Steele.
</footer>
```

- [ ] **Step 7: Update `_includes/layouts/base.njk` to load CSS, fonts, and use partials**

Use the Write tool to REPLACE the full contents of `/Users/benedictsteele/Development/profound.fyi/_includes/layouts/base.njk` with:

```njk
<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{{ title or "profound.fyi" }}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap">
  <link rel="stylesheet" href="/css/tokens.css">
  <link rel="stylesheet" href="/css/base.css">
  <link rel="stylesheet" href="/css/layout.css">
  <link rel="stylesheet" href="/css/components.css">
</head>
<body>
  {% include "partials/site-header.njk" %}
  <main>{{ content | safe }}</main>
  {% include "partials/site-footer.njk" %}
</body>
</html>
```

- [ ] **Step 8: Update `eleventy.config.js` to copy `css/` into the build output**

Use the Edit tool. Find:

```js
export default function (eleventyConfig) {
  return {
```

Replace with:

```js
export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "css": "css" });

  return {
```

- [ ] **Step 9: Smoke build**

```bash
rm -rf _site && npm run build
```

Expected: prints `Wrote 1 file` (or similar) and `Copied X files` for the CSS. No errors. `_site/css/` exists with all four CSS files; `_site/index.html` exists.

- [ ] **Step 10: Verify built home references the CSS**

```bash
ls -1 _site/css/ && grep -c 'tokens.css\|base.css\|layout.css\|components.css' _site/index.html
```

Expected: `ls` lists `tokens.css`, `base.css`, `layout.css`, `components.css`. `grep -c` prints `4`.

- [ ] **Step 11: Verify in dev server (optional smoke test)**

Start the dev server in the background:

```bash
npm run dev
```

(Run with `run_in_background: true` and capture the shell ID.)

Wait ~3 seconds, then:

```bash
curl -sf http://localhost:8080/ | grep -o 'IBM Plex Sans' | head -1
```

Expected: prints `IBM Plex Sans`.

Stop the dev server with KillShell on the captured shell ID. Confirm port 8080 is free with `lsof -i :8080` (no output expected).

- [ ] **Step 12: Commit**

```bash
git add css/ _includes/ eleventy.config.js
git commit -m "$(cat <<'EOF'
feat: design system (tokens, base, layout, components)

Add four CSS files (tokens, base, layout, components) totalling
roughly 200 lines, plus site-header and site-footer partials.
Wire IBM Plex Sans via Google Fonts (preconnect + stylesheet) and
extend base.njk to load the CSS and partials. Configure passthrough
copy so /css/* lands in the build output.

Visual direction: EE-Playbooks-flavoured -- typographic, prose-first,
light background, generous whitespace, minimal chrome. Custom
properties expose the design tokens for reuse and override.

Co-Authored-By: Benedict Steele <ben@hyperdimensional.net>
Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Standalone About page

**Files:**
- Create: `content/about.md`

- [ ] **Step 1: Create `content/about.md`**

Use the Write tool to set `/Users/benedictsteele/Development/profound.fyi/content/about.md` content to:

```markdown
---
layout: layouts/page.njk
title: About
---

Placeholder for the about page. Real content later.
```

- [ ] **Step 2: Build and verify**

```bash
rm -rf _site && npm run build && test -f _site/about/index.html && grep -q '<h1>About</h1>' _site/about/index.html && echo OK
```

Expected: `OK`.

- [ ] **Step 3: Commit**

```bash
git add content/about.md
git commit -m "$(cat <<'EOF'
feat: add /about/ as the standalone-page example

Proves the standalone-page URL pattern (any /<slug>/ off the root).
Inherits layouts/page.njk; nothing about the routing or layout is
new. Real content later.

Co-Authored-By: Benedict Steele <ben@hyperdimensional.net>
Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Posts (post layout, posts collection, posts hub)

**Files:**
- Create: `_includes/layouts/post.njk`, `content/posts/posts.11tydata.js`, `content/posts/welcome.md`, `content/posts/index.njk`
- Modify: `eleventy.config.js` (add `readableDate` filter)

- [ ] **Step 1: Add `readableDate` filter to `eleventy.config.js`**

Use the Edit tool. Find:

```js
  eleventyConfig.addPassthroughCopy({ "css": "css" });

  return {
```

Replace with:

```js
  eleventyConfig.addPassthroughCopy({ "css": "css" });

  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(dateObj);
  });

  return {
```

- [ ] **Step 2: Create `_includes/layouts/post.njk`**

Use the Write tool to set `/Users/benedictsteele/Development/profound.fyi/_includes/layouts/post.njk` content to:

```njk
---
layout: layouts/base.njk
---
<article class="post">
  <h1>{{ title }}</h1>
  <p class="meta">{{ date | readableDate }}</p>
  {{ content | safe }}

  {% set previousPost = collections.posts | getPreviousCollectionItem %}
  {% set nextPost = collections.posts | getNextCollectionItem %}
  {% if previousPost or nextPost %}
  <nav class="prev-next" aria-label="Posts">
    {% if previousPost %}
      <a class="prev" href="{{ previousPost.url }}"><span class="label">Newer</span>{{ previousPost.data.title }}</a>
    {% else %}<span class="prev"></span>{% endif %}
    {% if nextPost %}
      <a class="next" href="{{ nextPost.url }}"><span class="label">Older</span>{{ nextPost.data.title }}</a>
    {% else %}<span class="next"></span>{% endif %}
  </nav>
  {% endif %}
</article>
```

(Note on labelling: posts collection is sorted ascending by date by default, so `getPreviousCollectionItem` is the older post and `getNextCollectionItem` is the newer post. With one example post in v1, both are empty and the `<nav>` is suppressed entirely. Re-check labels once a second post exists.)

- [ ] **Step 3: Create `content/posts/posts.11tydata.js`**

Use the Write tool to set `/Users/benedictsteele/Development/profound.fyi/content/posts/posts.11tydata.js` content to:

```js
export default {
  layout: "layouts/post.njk",
  tags: ["posts"],
};
```

(Eleventy directory data convention: `<dirname>/<dirname>.11tydata.js` provides defaults for everything in that directory. The `tags: ["posts"]` line auto-populates `collections.posts`.)

- [ ] **Step 4: Create `content/posts/welcome.md`**

Use the Write tool to set `/Users/benedictsteele/Development/profound.fyi/content/posts/welcome.md` content to:

```markdown
---
title: Welcome
date: 2026-04-27
---

Placeholder post. Real writing later.
```

- [ ] **Step 5: Create `content/posts/index.njk`**

Use the Write tool to set `/Users/benedictsteele/Development/profound.fyi/content/posts/index.njk` content to:

```njk
---
layout: layouts/page.njk
title: Posts
tags: []
permalink: /posts/
---
<ul class="collection-list">
{% for post in collections.posts | reverse %}
  <li>
    <h2><a href="{{ post.url }}">{{ post.data.title }}</a></h2>
    <p class="meta">{{ post.data.date | readableDate }}</p>
  </li>
{% endfor %}
</ul>
```

(The `tags: []` override removes the `posts` tag inherited from `posts.11tydata.js`, so the index doesn't appear in its own collection. `permalink: /posts/` is needed because the directory data does not set a permalink, but explicit clarity helps.)

- [ ] **Step 6: Build and verify all post URLs**

```bash
rm -rf _site && npm run build
```

Then:

```bash
test -f _site/posts/index.html && \
test -f _site/posts/welcome/index.html && \
grep -q 'Welcome' _site/posts/index.html && \
grep -q '27 April 2026' _site/posts/welcome/index.html && \
echo OK
```

Expected: `OK`.

- [ ] **Step 7: Commit**

```bash
git add eleventy.config.js _includes/layouts/post.njk content/posts/
git commit -m "$(cat <<'EOF'
feat: posts collection, layout, and hub

Add the post layout (with date and conditional Newer/Older
prev/next nav), the posts directory data setting layout and the
posts tag, one example post (welcome.md), and the /posts/ hub
listing posts in reverse-chronological order.

Add a readableDate filter (Intl.DateTimeFormat, en-GB) used for
post dates.

With one post the prev/next nav is suppressed; revisit labelling
when a second post exists.

Co-Authored-By: Benedict Steele <ben@hyperdimensional.net>
Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Playbooks (layout, sidebar, collections, hub, one example playbook)

**Files:**
- Create: `_includes/layouts/playbook-page.njk`, `_includes/partials/playbook-sidebar.njk`
- Create: `content/playbooks/playbooks.11tydata.js`, `content/playbooks/index.njk`
- Create: `content/playbooks/advice-process/advice-process.11tydata.js`, `content/playbooks/advice-process/index.njk`, `content/playbooks/advice-process/what-is-it.md`, `content/playbooks/advice-process/when-to-use.md`
- Modify: `eleventy.config.js` (add `sortByOrder` filter and `playbooks` collection)

- [ ] **Step 1: Add `sortByOrder` filter and `playbooks` collection to `eleventy.config.js`**

Use the Edit tool. Find:

```js
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(dateObj);
  });

  return {
```

Replace with:

```js
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(dateObj);
  });

  eleventyConfig.addFilter("sortByOrder", (collection) => {
    return [...collection].sort((a, b) => (a.data.order || 0) - (b.data.order || 0));
  });

  eleventyConfig.addCollection("playbooks", (collectionApi) => {
    return collectionApi
      .getFilteredByGlob("content/playbooks/*/index.*")
      .sort((a, b) => (a.data.order || 0) - (b.data.order || 0));
  });

  return {
```

- [ ] **Step 2: Create `_includes/partials/playbook-sidebar.njk`**

Use the Write tool to set `/Users/benedictsteele/Development/profound.fyi/_includes/partials/playbook-sidebar.njk` content to:

```njk
<aside class="playbook-sidebar">
  <h3><a href="/playbooks/{{ playbook }}/">{{ playbookTitle }}</a></h3>
  <ol>
    {% for sibling in siblings %}
      <li>
        <a href="{{ sibling.url }}"
           {% if sibling.url == page.url %}aria-current="page"{% endif %}>
          {{ sibling.data.title }}
        </a>
      </li>
    {% endfor %}
  </ol>
</aside>
```

(Reads `playbook`, `playbookTitle`, and `siblings` from the parent template's scope. Sets `aria-current="page"` on the current playbook page.)

- [ ] **Step 3: Create `_includes/layouts/playbook-page.njk`**

Use the Write tool to set `/Users/benedictsteele/Development/profound.fyi/_includes/layouts/playbook-page.njk` content to:

```njk
---
layout: layouts/base.njk
---
{% set siblings = collections[playbook] | sortByOrder %}
<div class="playbook-layout">
  {% include "partials/playbook-sidebar.njk" %}
  <article class="playbook-page">
    <h1>{{ title }}</h1>
    {{ content | safe }}

    {% set previousPage = siblings | getPreviousCollectionItem %}
    {% set nextPage = siblings | getNextCollectionItem %}
    {% if previousPage or nextPage %}
    <nav class="prev-next" aria-label="Playbook pages">
      {% if previousPage %}
        <a class="prev" href="{{ previousPage.url }}"><span class="label">Previous</span>{{ previousPage.data.title }}</a>
      {% else %}<span class="prev"></span>{% endif %}
      {% if nextPage %}
        <a class="next" href="{{ nextPage.url }}"><span class="label">Next</span>{{ nextPage.data.title }}</a>
      {% else %}<span class="next"></span>{% endif %}
    </nav>
    {% endif %}
  </article>
</div>
```

- [ ] **Step 4: Create `content/playbooks/playbooks.11tydata.js`**

Use the Write tool to set `/Users/benedictsteele/Development/profound.fyi/content/playbooks/playbooks.11tydata.js` content to:

```js
export default {
  layout: "layouts/playbook-page.njk",
};
```

(Cascades to all subdirectories. Per-playbook 11tydata adds tags and metadata.)

- [ ] **Step 5: Create `content/playbooks/advice-process/advice-process.11tydata.js`**

Use the Write tool to set `/Users/benedictsteele/Development/profound.fyi/content/playbooks/advice-process/advice-process.11tydata.js` content to:

```js
export default {
  playbook: "advice-process",
  playbookTitle: "The Advice Process",
};
```

(Inherits `layout` from the parent `playbooks.11tydata.js`. Sets the per-playbook slug and display title.

**Why no `tags` here?** Eleventy v3's default deep-merge concatenates array values across the cascade. If 11tydata declared `tags: ["advice-process"]`, the landing page's `tags: []` override would NOT win — they'd merge to `["advice-process"]` and the landing would end up listed as a sibling of itself in the sidebar. Tagging each content file individually is more verbose but transparent.)

- [ ] **Step 6: Create `content/playbooks/advice-process/what-is-it.md`**

Use the Write tool to set `/Users/benedictsteele/Development/profound.fyi/content/playbooks/advice-process/what-is-it.md` content to:

```markdown
---
title: What is it?
order: 1
tags:
  - advice-process
---

Placeholder. Real content later.
```

- [ ] **Step 7: Create `content/playbooks/advice-process/when-to-use.md`**

Use the Write tool to set `/Users/benedictsteele/Development/profound.fyi/content/playbooks/advice-process/when-to-use.md` content to:

```markdown
---
title: When to use it
order: 2
tags:
  - advice-process
---

Placeholder. Real content later.
```

(Each playbook page tags itself with the playbook slug, which auto-creates `collections["advice-process"]`. Adding a new page to a playbook means adding the `tags` line — small price for the simpler data flow.)

- [ ] **Step 8: Create `content/playbooks/advice-process/index.njk`**

Use the Write tool to set `/Users/benedictsteele/Development/profound.fyi/content/playbooks/advice-process/index.njk` content to:

```njk
---
layout: layouts/page.njk
title: The Advice Process
tags: []
permalink: /playbooks/advice-process/
playbook: advice-process
---
<p>Placeholder landing page for The Advice Process playbook. Real content later.</p>

<ul class="collection-list">
{% for entry in collections["advice-process"] | sortByOrder %}
  <li><h2><a href="{{ entry.url }}">{{ entry.data.title }}</a></h2></li>
{% endfor %}
</ul>
```

(Overrides `layout` to `page.njk` and `tags` to `[]` so this file isn't in the `advice-process` collection itself. The custom `playbooks` collection in `eleventy.config.js` picks it up via the `*/index.*` glob.)

- [ ] **Step 9: Create `content/playbooks/index.njk`**

Use the Write tool to set `/Users/benedictsteele/Development/profound.fyi/content/playbooks/index.njk` content to:

```njk
---
layout: layouts/page.njk
title: Playbooks
tags: []
permalink: /playbooks/
---
<p>A collection of playbooks. Real content later.</p>

<ul class="collection-list">
{% for entry in collections.playbooks %}
  <li>
    <h2><a href="{{ entry.url }}">{{ entry.data.title }}</a></h2>
  </li>
{% endfor %}
</ul>
```

- [ ] **Step 10: Build and verify all playbook URLs**

```bash
rm -rf _site && npm run build
```

Then:

```bash
test -f _site/playbooks/index.html && \
test -f _site/playbooks/advice-process/index.html && \
test -f _site/playbooks/advice-process/what-is-it/index.html && \
test -f _site/playbooks/advice-process/when-to-use/index.html && \
grep -q 'The Advice Process' _site/playbooks/index.html && \
grep -q 'aria-current="page"' _site/playbooks/advice-process/what-is-it/index.html && \
grep -q 'When to use it' _site/playbooks/advice-process/what-is-it/index.html && \
echo OK
```

Expected: `OK`. (The third `grep` confirms the sidebar lists the sibling page; `aria-current="page"` confirms the current page is marked.)

- [ ] **Step 11: Commit**

```bash
git add eleventy.config.js _includes/ content/playbooks/
git commit -m "$(cat <<'EOF'
feat: playbooks collection, hub, and one example playbook

Add the playbook-page layout (two-column with sidebar TOC and
prev/next), the playbook-sidebar partial, the /playbooks/ hub, and
one example playbook ('The Advice Process') with a landing page and
two internal pages.

Eleventy config grows: a sortByOrder filter for ordering pages
within a playbook by frontmatter `order`, and a custom 'playbooks'
collection for the hub (picks up each playbook's index.* via glob).

Per-playbook tags auto-create per-playbook collections used by the
sidebar and prev/next nav. Adding a new playbook is: new directory
+ new 11tydata file + content. No code change.

Co-Authored-By: Benedict Steele <ben@hyperdimensional.net>
Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Netlify config

**Files:**
- Modify: `netlify.toml` (full rewrite)

- [ ] **Step 1: Rewrite `netlify.toml`**

Use the Write tool to REPLACE the full contents of `/Users/benedictsteele/Development/profound.fyi/netlify.toml` with:

```toml
[build]
  publish = "_site"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "20"
```

- [ ] **Step 2: Verify the build command works locally**

```bash
rm -rf _site && npm run build && test -f _site/index.html && echo OK
```

Expected: `OK`.

- [ ] **Step 3: Commit**

```bash
git add netlify.toml
git commit -m "$(cat <<'EOF'
build: switch Netlify config from Hugo to Eleventy

Build command becomes 'npm run build' (Eleventy), publish dir
becomes _site. Drop HUGO_VERSION, HUGO_VERSION_EXTENDED, and
GO_VERSION; pin NODE_VERSION = "20" for reproducibility against
Netlify default drift.

Co-Authored-By: Benedict Steele <ben@hyperdimensional.net>
Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: README rewrite

**Files:**
- Modify: `README.md` (full rewrite)

- [ ] **Step 1: Rewrite `README.md`**

Use the Write tool to REPLACE the full contents of `/Users/benedictsteele/Development/profound.fyi/README.md` with:

````markdown
# profound.fyi

Static site built with [Eleventy](https://www.11ty.dev/) and IBM Plex Sans. Deployed on Netlify.

Three content shapes:

- **Standalone pages** (e.g. `/about/`)
- **Posts** under `/posts/` — a blog
- **Playbooks** under `/playbooks/<slug>/<page>/` — multi-page guides with sidebar navigation

## Local development

Requires Node 20 (use [nvm](https://github.com/nvm-sh/nvm) — `.nvmrc` pins the version).

```sh
npm install
npm run dev
```

The site renders at `http://localhost:8080/` with live reload.

## Building

```sh
npm run build
```

Output goes to `_site/`.

## Adding content

| Where | What |
| --- | --- |
| `content/<slug>.md` | Standalone page at `/<slug>/` |
| `content/posts/<slug>.md` | Blog post at `/posts/<slug>/` (needs `title` and `date`) |
| `content/playbooks/<slug>/index.njk` | Playbook landing at `/playbooks/<slug>/` |
| `content/playbooks/<slug>/<page>.md` | Playbook page at `/playbooks/<slug>/<page>/` (needs `title` and `order`) |

A new playbook needs its own `<slug>.11tydata.js` setting `tags: ["<slug>"]`, `playbook: "<slug>"`, and `playbookTitle: "..."`.

## Deployment

Netlify builds on every push to `main`. Configuration is in `netlify.toml`.
````

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "$(cat <<'EOF'
docs: rewrite README for Eleventy

Cover Node version requirement, the npm scripts (dev, build), the
three content shapes (pages, posts, playbooks) with where to add
each, and how Netlify deployment works.

Co-Authored-By: Benedict Steele <ben@hyperdimensional.net>
Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: Final verification + commit plan

No new files. Confirms end-to-end and commits this plan.

- [ ] **Step 1: Clean build**

```bash
rm -rf _site node_modules && npm install && npm run build
```

Expected: `npm install` completes; `npm run build` exits 0 and prints something like `Wrote N files in Xs`. No errors.

- [ ] **Step 2: Verify all v1 URLs render**

```bash
for path in \
  "_site/index.html" \
  "_site/about/index.html" \
  "_site/posts/index.html" \
  "_site/posts/welcome/index.html" \
  "_site/playbooks/index.html" \
  "_site/playbooks/advice-process/index.html" \
  "_site/playbooks/advice-process/what-is-it/index.html" \
  "_site/playbooks/advice-process/when-to-use/index.html"; do
  test -f "$path" && echo "OK $path" || echo "MISSING $path"
done
```

Expected: 8 lines of `OK ...`.

- [ ] **Step 3: Verify CSS is in the build output**

```bash
ls _site/css/
```

Expected: `base.css`, `components.css`, `layout.css`, `tokens.css`.

- [ ] **Step 4: Verify IBM Plex Sans is referenced**

```bash
grep -l 'IBM+Plex+Sans' _site/index.html _site/about/index.html _site/playbooks/advice-process/what-is-it/index.html
```

Expected: all three paths printed (each contains the Google Fonts link).

- [ ] **Step 5: Verify dev server starts cleanly**

Start in background:

```bash
npm run dev
```

(Run with `run_in_background: true`, capture shell ID.)

Wait ~3 seconds, then verify the home page loads:

```bash
curl -sf -o /dev/null -w "%{http_code}\n" http://localhost:8080/
```

Expected: `200`.

Stop the dev server with KillShell on the captured shell ID. Verify port is free:

```bash
lsof -i :8080 || echo "port free"
```

Expected: prints `port free` (the `lsof` exits non-zero when nothing is listening).

- [ ] **Step 6: Confirm clean working tree**

```bash
git status
```

Expected: untracked items are only `.nwave/`, `.superpowers/`, `node_modules/`, `_site/`, and `docs/superpowers/plans/2026-04-27-eleventy-migration.md` (the plan, about to be committed). No other modified or untracked items.

- [ ] **Step 7: Commit the plan document**

```bash
git add docs/superpowers/plans/2026-04-27-eleventy-migration.md
git commit -m "$(cat <<'EOF'
docs: add implementation plan for Eleventy migration

Plan was followed across tasks 1-8 to remove Hugo, scaffold
Eleventy, build the design system, and prove all four URL patterns
(home, standalone, post, playbook). Captured here for traceability.

Co-Authored-By: Benedict Steele <ben@hyperdimensional.net>
Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 8: Show full commit history**

```bash
git log --oneline
```

Expected: 19 commits — the original 9 Hugo commits, the Eleventy spec commit (`00417ca`), 8 implementation commits from Tasks 1-8, and this plan commit.

---

## What's deliberately NOT in this plan

- Pushing to GitHub (Benedict performs manually after the scaffold lands).
- Creating the Netlify site (manual, post-push).
- Real content beyond the placeholder home, About, one post, and one playbook with two pages.
- RSS, sitemap, image optimisation, syntax highlighting, search, comments, analytics.
- Dark mode.
- Self-hosting IBM Plex Sans.
- Per-playbook prev/next label refinement (will need a second post and second playbook to validate the labelling).
