# Profound portfolio site implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Evolve profound.fyi from a product-shaped site into a portfolio that showcases thinking, works as a calling card, and continues to host the playbooks and instruments. The home page stays restrained; the changes happen in the new and existing section indexes.

**Architecture:** Eleventy 3 static site with Nunjucks layouts. Each new section follows the existing tag-based collection pattern used by `posts` and the existing playbook/tool structures. CSS additions go into the existing `components.css`. No new build steps, no new dependencies.

**Tech Stack:** Eleventy 3 (ESM), Nunjucks, hand-authored CSS, IBM Plex Sans. Node 20.

**Spec:** `docs/superpowers/specs/2026-06-17-portfolio-design.md`

**Verification approach:** This codebase has no unit-test suite (the `npm test` script targets `tests/**/*.test.js`, which does not exist). Every task's verification step is therefore `npm run build` plus a targeted page check via the dev server or the generated `_site/` output. Do not invent unit tests; do not modify `package.json`'s test script.

**Writing constraints applied to all rendered copy:** British English, Oxford comma, no semicolons, no emojis in titles, active voice, plain language.

---

## Pre-flight

- [ ] **Step 0: Verify clean working tree and Node version**

Run:
```bash
git status
node --version
```
Expected: clean working tree on `main` (or current feature branch); Node 20.x.

If there are uncommitted changes, stop and tell the user before continuing.

---

## Task 1: Add `.section-intro` shared component

Establishes the shared component used by every section index in later tasks. Doing this first means later tasks don't have to fold CSS additions into otherwise-content commits.

**Files:**
- Modify: `css/components.css` (append a new block)

- [ ] **Step 1: Append the `.section-intro` rule**

Open `css/components.css` and append (after the last existing rule, before the communication-styles section comment if you prefer logical grouping; the precise position is not load-bearing):

```css
/* Section index intro paragraph -------------------------------------------- */

.section-intro {
  max-width: var(--measure);
  margin: 0 0 var(--space-6);
  color: var(--colour-fg);
}
```

- [ ] **Step 2: Build and verify CSS loads**

Run:
```bash
npm run build
```
Expected: build succeeds with no errors. Open `_site/css/components.css` and confirm the new rule is present.

- [ ] **Step 3: Commit**

```bash
git add css/components.css
git commit -m "feat(css): add .section-intro for section landing pages"
```

---

## Task 2: Rename `/posts/` to `/writing/`

Renames the folder and tag. Updates the layout to reference the new collection name. Updates the top nav so the link works.

**Files:**
- Move: `content/posts/` → `content/writing/`
- Rename inside the new folder: `posts.11tydata.js` → `writing.11tydata.js`
- Modify: `content/writing/writing.11tydata.js` (new tag, new layout name)
- Rename: `_includes/layouts/post.njk` → `_includes/layouts/writing.njk`
- Modify: `_includes/layouts/writing.njk` (collection reference)
- Modify: `content/writing/index.njk` (title, intro, collection reference)
- Modify: `_includes/partials/site-header.njk` (nav links)

- [ ] **Step 1: Move the folder and rename the data file**

Run:
```bash
git mv content/posts content/writing
git mv content/writing/posts.11tydata.js content/writing/writing.11tydata.js
git mv _includes/layouts/post.njk _includes/layouts/writing.njk
```

- [ ] **Step 2: Update the data file's tag and layout reference**

Replace the entire contents of `content/writing/writing.11tydata.js` with:

```js
export default {
  layout: "layouts/writing.njk",
  tags: ["writing"],
};
```

- [ ] **Step 3: Update the layout to reference `collections.writing`**

In `_includes/layouts/writing.njk`, change every occurrence of `collections.posts` to `collections.writing`. The two occurrences are:

```nunjucks
{% set previousPost = collections.writing | getPreviousCollectionItem %}
{% set nextPost = collections.writing | getNextCollectionItem %}
```

Leave the rest of the file unchanged (the `prev-next` markup, `Newer` / `Older` labels, and the `aria-label="Posts"` should all stay — readers don't see "Posts" anywhere visible; if you want, change the `aria-label` to `aria-label="Writing"`).

- [ ] **Step 4: Rewrite `content/writing/index.njk`**

Replace the entire file with:

```nunjucks
---
layout: layouts/page.njk
title: Writing
tags: []
eleventyExcludeFromCollections: true
permalink: /writing/
---
<p class="section-intro">Essays on systems of work, organisational design, and the practices that travel.</p>

<ul class="collection-list">
{% for entry in collections.writing | reverse %}
  <li>
    <h2><a href="{{ entry.url }}">{{ entry.data.title }}</a></h2>
    <p class="meta">{{ entry.data.date | readableDate }}</p>
  </li>
{% endfor %}
</ul>
```

- [ ] **Step 5: Update the top navigation**

In `_includes/partials/site-header.njk`, replace the `site-nav-links` block so that the order becomes Writing · Playbooks · Tools · About (Talks is added in Task 4):

```nunjucks
<div class="site-nav-links">
  <a href="/writing/">Writing</a>
  <a href="/playbooks/">Playbooks</a>
  <a href="/tools/">Tools</a>
  <a href="/about/">About</a>
</div>
```

- [ ] **Step 6: Build and verify**

Run:
```bash
npm run build
```
Expected: build succeeds. Then check the generated output:

```bash
ls _site/writing/
ls _site/writing/welcome/
test ! -d _site/posts/ && echo "old /posts/ is gone"
```
Expected: `_site/writing/index.html` exists; `_site/writing/welcome/index.html` exists; `_site/posts/` does not exist.

- [ ] **Step 7: Visual check via dev server**

Run:
```bash
npm run dev
```
Open `http://localhost:8080/writing/` and confirm: page title is "Writing", the intro paragraph is visible, the welcome placeholder shows in the list with its date, the top nav shows Writing · Playbooks · Tools · About, and clicking through to the welcome entry renders correctly. Stop the dev server.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(site): rename /posts/ to /writing/ and add to nav"
```

---

## Task 3: Add `summary` field and year-grouped writing index

Adds the optional one-line summary to the writing list. Groups entries by year so the list stays scannable as it grows. Adds `.writing-list` CSS for the dated definition-list pattern.

**Files:**
- Modify: `content/writing/index.njk` (regroup + add summary)
- Modify: `content/writing/welcome.md` (add a summary so the rendered list shows the new shape with real data)
- Modify: `css/components.css` (append `.writing-list` rules)

- [ ] **Step 1: Append `.writing-list` CSS**

Append to `css/components.css`:

```css
/* Writing index list ------------------------------------------------------- */

.writing-list {
  max-width: var(--measure);
  margin: 0 auto;
}

.writing-list-year {
  font-size: var(--type-base);
  color: var(--colour-muted);
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin: var(--space-6) 0 var(--space-3);
}

.writing-list-year:first-of-type {
  margin-top: 0;
}

.writing-list-entry {
  border-bottom: 1px solid var(--colour-rule);
  padding: var(--space-4) 0;
}

.writing-list-entry h2 {
  margin: 0;
  font-size: var(--type-large);
}

.writing-list-entry .meta {
  color: var(--colour-muted);
  font-size: var(--type-small);
  margin-top: var(--space-1);
}

.writing-list-entry .summary {
  margin: var(--space-2) 0 0;
  color: var(--colour-fg);
}
```

- [ ] **Step 2: Add `summary` to the welcome placeholder**

Edit `content/writing/welcome.md`. Replace the frontmatter so it reads:

```yaml
---
title: Welcome
date: 2026-04-27
summary: Placeholder entry while the writing section finds its feet.
---
```

Leave the body line ("Placeholder post. Real writing later.") unchanged.

- [ ] **Step 3: Replace the writing index template with the grouped version**

Replace the body of `content/writing/index.njk` (everything below the frontmatter) with:

```nunjucks
<p class="section-intro">Essays on systems of work, organisational design, and the practices that travel.</p>

{% set entries = collections.writing | reverse %}
{% set currentYear = "" %}
<div class="writing-list">
{% for entry in entries %}
  {% set entryYear = entry.data.date | htmlDateString | slice(0, 4) %}
  {% if entryYear != currentYear %}
    {% if not loop.first %}</ul>{% endif %}
    <h2 class="writing-list-year">{{ entryYear }}</h2>
    <ul class="collection-list-reset">
    {% set currentYear = entryYear %}
  {% endif %}
  <li class="writing-list-entry">
    <h3><a href="{{ entry.url }}">{{ entry.data.title }}</a></h3>
    <p class="meta">{{ entry.data.date | readableDate }}</p>
    {% if entry.data.summary %}<p class="summary">{{ entry.data.summary }}</p>{% endif %}
  </li>
  {% if loop.last %}</ul>{% endif %}
{% endfor %}
</div>
```

Note: Nunjucks `slice` exists; if it errors during build, swap the year extraction line for `{% set entryYear = (entry.data.date | htmlDateString).substr(0, 4) %}`.

Also append a small reset rule for the inner `<ul>` to `css/components.css`:

```css
.collection-list-reset {
  list-style: none;
  padding: 0;
  margin: 0;
}
```

- [ ] **Step 4: Build and verify**

Run:
```bash
npm run build
```
Expected: build succeeds.

```bash
grep -c "writing-list-year" _site/writing/index.html
grep -c "Placeholder entry while the writing section finds its feet" _site/writing/index.html
```
Expected: both counts are at least 1.

- [ ] **Step 5: Visual check**

Run `npm run dev`, open `http://localhost:8080/writing/`, confirm: a "2026" year heading appears above the welcome entry, the summary line "Placeholder entry while…" renders under the date, and the layout still feels calm (no obvious overlap or runaway type). Stop the dev server.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(writing): year-grouped list with summary field"
```

---

## Task 4: Talks scaffolding

Adds the data file, the per-talk layout, and one placeholder talk so the collection exists at build time. No index page yet — that comes in Task 5.

**Files:**
- Create: `content/talks/talks.11tydata.js`
- Create: `_includes/layouts/talk.njk`
- Create: `content/talks/placeholder.md`

- [ ] **Step 1: Create `content/talks/talks.11tydata.js`**

```js
export default {
  layout: "layouts/talk.njk",
  tags: ["talks"],
};
```

- [ ] **Step 2: Create `_includes/layouts/talk.njk`**

```nunjucks
---
layout: layouts/base.njk
---
<article class="talk">
  <h1>{{ title }}</h1>
  <p class="meta">
    {% if venue %}{{ venue }} · {% endif %}{{ date | readableDate }}
  </p>
  {% if slides or video or recording %}
  <ul class="talk-links">
    {% if slides %}<li><a href="{{ slides }}">Slides</a></li>{% endif %}
    {% if video %}<li><a href="{{ video }}">Video</a></li>{% endif %}
    {% if recording %}<li><a href="{{ recording }}">Recording</a></li>{% endif %}
  </ul>
  {% endif %}
  {{ content | safe }}
  <p class="entry-meta"><a href="/talks/">All talks</a></p>
</article>
```

Note on prev/next: the talks layout intentionally does not include prev/next navigation. Talks may have `permalink: false` for bodyless entries (see Task 5), which would produce broken prev/next links. The "All talks" footer link is sufficient.

- [ ] **Step 3: Create one placeholder talk**

Create `content/talks/placeholder.md`:

```markdown
---
title: A placeholder talk
date: 2026-04-01
venue: Somewhere, Sometime
summary: Placeholder so the talks collection isn't empty during scaffolding.
permalink: false
---
```

Note: `permalink: false` keeps this entry in `collections.talks` but suppresses the standalone `/talks/placeholder/` page. This is the convention for talks that only need to appear inline on the index. Remove `permalink: false` (or omit it) once a talk has body content worth its own page.

- [ ] **Step 4: Build and verify the collection exists**

Run:
```bash
npm run build
```
Expected: build succeeds. The placeholder should not produce a standalone page:

```bash
test ! -d _site/talks/placeholder/ && echo "no standalone page (expected)"
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(talks): add talks collection scaffolding"
```

---

## Task 5: Talks index page and styling

Builds the talks index and the `.talks-list` styling. Renders entries with and without URLs in the same shape; the "→" affordance only appears for entries that have their own page.

**Files:**
- Create: `content/talks/index.njk`
- Modify: `css/components.css` (append `.talks-list` rules)
- Modify: `_includes/partials/site-header.njk` (add Talks to nav)

- [ ] **Step 1: Append `.talks-list` CSS**

Append to `css/components.css`:

```css
/* Talks index list --------------------------------------------------------- */

.talks-list {
  max-width: var(--measure);
  margin: 0 auto;
}

.talks-list-year {
  font-size: var(--type-base);
  color: var(--colour-muted);
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin: var(--space-6) 0 var(--space-3);
}

.talks-list-year:first-of-type {
  margin-top: 0;
}

.talks-list-entry {
  border-bottom: 1px solid var(--colour-rule);
  padding: var(--space-4) 0;
}

.talks-list-entry h3 {
  margin: 0;
  font-size: var(--type-large);
}

.talks-list-entry h3 a::after {
  content: " \2192";
  color: var(--colour-muted);
}

.talks-list-entry .meta {
  color: var(--colour-muted);
  font-size: var(--type-small);
  margin-top: var(--space-1);
}

.talks-list-entry .summary {
  margin: var(--space-2) 0 0;
  color: var(--colour-fg);
}

.talks-list-entry-links {
  list-style: none;
  padding: 0;
  margin: var(--space-2) 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  font-size: var(--type-small);
}
```

- [ ] **Step 2: Create `content/talks/index.njk`**

```nunjucks
---
layout: layouts/page.njk
title: Talks
tags: []
eleventyExcludeFromCollections: true
permalink: /talks/
---
<p class="section-intro">Talks given at conferences, meetups, and inside organisations. Slides and recordings where available.</p>

{% set entries = collections.talks | reverse %}
{% set currentYear = "" %}
<div class="talks-list">
{% for entry in entries %}
  {% set entryYear = entry.data.date | htmlDateString | slice(0, 4) %}
  {% if entryYear != currentYear %}
    {% if not loop.first %}</ul>{% endif %}
    <h2 class="talks-list-year">{{ entryYear }}</h2>
    <ul class="collection-list-reset">
    {% set currentYear = entryYear %}
  {% endif %}
  <li class="talks-list-entry">
    <h3>
      {% if entry.url %}<a href="{{ entry.url }}">{{ entry.data.title }}</a>
      {% else %}{{ entry.data.title }}{% endif %}
    </h3>
    <p class="meta">
      {% if entry.data.venue %}{{ entry.data.venue }} · {% endif %}{{ entry.data.date | readableDate }}
    </p>
    {% if entry.data.summary %}<p class="summary">{{ entry.data.summary }}</p>{% endif %}
    {% if entry.data.slides or entry.data.video or entry.data.recording %}
    <ul class="talks-list-entry-links">
      {% if entry.data.slides %}<li><a href="{{ entry.data.slides }}">Slides</a></li>{% endif %}
      {% if entry.data.video %}<li><a href="{{ entry.data.video }}">Video</a></li>{% endif %}
      {% if entry.data.recording %}<li><a href="{{ entry.data.recording }}">Recording</a></li>{% endif %}
    </ul>
    {% endif %}
  </li>
  {% if loop.last %}</ul>{% endif %}
{% endfor %}
</div>
```

- [ ] **Step 3: Add Talks to the top nav**

In `_includes/partials/site-header.njk`, update the `site-nav-links` block so the order becomes Writing · Playbooks · Tools · Talks · About:

```nunjucks
<div class="site-nav-links">
  <a href="/writing/">Writing</a>
  <a href="/playbooks/">Playbooks</a>
  <a href="/tools/">Tools</a>
  <a href="/talks/">Talks</a>
  <a href="/about/">About</a>
</div>
```

- [ ] **Step 4: Build and verify**

```bash
npm run build
test -f _site/talks/index.html && echo "talks index built"
grep -c "A placeholder talk" _site/talks/index.html
grep -c "Talks" _site/writing/index.html
```
Expected: the talks index exists; the placeholder talk renders on it; the writing page now shows "Talks" in its top nav.

- [ ] **Step 5: Visual check**

Run `npm run dev`, open `http://localhost:8080/talks/`, confirm: page title "Talks", intro paragraph, a "2026" year heading, the placeholder talk entry (no `→` after the title because it has no URL), venue "Somewhere, Sometime · 1 April 2026", and the summary line. Open another section's page and confirm Talks now appears in the nav. Stop the dev server.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(talks): add talks index page and nav entry"
```

---

## Task 6: Polish the tools index

Reshapes the tools index from the current list pattern into the `.tools-grid` two-column responsive card grid called out in the spec. The existing tool (communication-styles) already provides a `description` frontmatter field, so no per-tool changes are needed.

**Files:**
- Modify: `content/tools/index.njk`
- Modify: `css/components.css` (append `.tools-grid` rules)

- [ ] **Step 1: Append `.tools-grid` CSS**

Append to `css/components.css`:

```css
/* Tools index grid --------------------------------------------------------- */

.tools-grid {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: 1fr;
  margin: var(--space-4) 0 0;
  max-width: var(--measure);
  list-style: none;
  padding: 0;
}

@media (min-width: 720px) {
  .tools-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.tools-grid-card {
  border: 1px solid var(--colour-rule);
  border-radius: 4px;
  padding: var(--space-4);
}

.tools-grid-card h2 {
  margin: 0 0 var(--space-2);
  font-size: var(--type-large);
}

.tools-grid-card h2 a {
  text-decoration: none;
}

.tools-grid-card h2 a:hover {
  text-decoration: underline;
}

.tools-grid-card p {
  margin: 0;
  color: var(--colour-fg);
}
```

- [ ] **Step 2: Replace `content/tools/index.njk` body**

Replace the body (below the frontmatter) of `content/tools/index.njk` with:

```nunjucks
<p class="section-intro">Small, focused tools you can take in a few minutes. Useful for solo reflection or as a starting point for workshop conversations.</p>

<ul class="tools-grid">
{% for entry in collections.tools %}
  <li class="tools-grid-card">
    <h2><a href="{{ entry.url }}">{{ entry.data.title }}</a></h2>
    {% if entry.data.description %}<p>{{ entry.data.description }}</p>{% endif %}
  </li>
{% endfor %}
</ul>
```

- [ ] **Step 3: Build and verify**

```bash
npm run build
grep -c "tools-grid-card" _site/tools/index.html
```
Expected: at least 1.

- [ ] **Step 4: Visual check**

Run `npm run dev`, open `http://localhost:8080/tools/`. Confirm: communication-styles renders as a bordered card with its title (linked) and description. Resize the window narrow: confirm the grid collapses to one column at 720px. Stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(tools): two-column grid for tools index"
```

---

## Task 7: Bio and Reading page stubs

Creates the two new top-level pages. Both use the existing `layouts/page.njk`. Both have minimal placeholder copy so they don't read as broken; Benedict will replace the copy later.

**Files:**
- Create: `content/bio.md`
- Create: `content/reading.md`

- [ ] **Step 1: Create `content/bio.md`**

```markdown
---
layout: layouts/page.njk
title: Bio
permalink: /bio/
---

Benedict Steele is Chief Delivery Officer at Armakuni. He works on software delivery, organisational design, platform thinking, and sociotechnical systems.

This page is finding its shape. A fuller version is on the way.

In the meantime, find him on [LinkedIn](https://www.linkedin.com/in/benedictsteele/).
```

- [ ] **Step 2: Create `content/reading.md`**

```markdown
---
layout: layouts/page.njk
title: Reading
permalink: /reading/
---

A loosely categorised map of the books, papers, and thinkers that shape the work collected here. Not a review list — a lineage.

This page is finding its shape. A fuller version is on the way.
```

- [ ] **Step 3: Build and verify**

```bash
npm run build
test -f _site/bio/index.html && echo "bio built"
test -f _site/reading/index.html && echo "reading built"
```
Expected: both files exist.

- [ ] **Step 4: Visual check**

Run `npm run dev`, open `http://localhost:8080/bio/` and `http://localhost:8080/reading/`. Confirm: both render with the page layout, titles show, the placeholder copy reads cleanly. Stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add content/bio.md content/reading.md
git commit -m "feat(site): add /bio/ and /reading/ page stubs"
```

---

## Task 8: Rewrite About and add pointers

Rewrites the About page so it explains Profound and Benedict's relationship to it, then ends with the two-pointer block linking to `/bio/` and `/reading/`. Adds the `.about-pointers` CSS.

**Files:**
- Modify: `content/about.md`
- Modify: `css/components.css` (append `.about-pointers` rules)

- [ ] **Step 1: Append `.about-pointers` CSS**

Append to `css/components.css`:

```css
/* About page pointers ------------------------------------------------------ */

.about-pointers {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: 1fr;
  margin: var(--space-7) 0 0;
  padding-top: var(--space-5);
  border-top: 1px solid var(--colour-rule);
  max-width: var(--measure);
}

@media (min-width: 720px) {
  .about-pointers {
    grid-template-columns: repeat(2, 1fr);
  }
}

.about-pointer h2 {
  margin: 0 0 var(--space-2);
  font-size: var(--type-large);
}

.about-pointer h2 a {
  text-decoration: none;
}

.about-pointer h2 a:hover {
  text-decoration: underline;
}

.about-pointer p {
  margin: 0;
  color: var(--colour-fg);
}
```

- [ ] **Step 2: Rewrite `content/about.md`**

Replace the entire file with:

```markdown
---
layout: layouts/page.njk
title: About
updated: 2026-06-17
---

Profound is a collection of playbooks, instruments, talks, and writing on systems of work. The aim is practical: tools that help people see how their organisation is actually delivering value, and a body of thinking that informs how to change it.

Playbooks describe practices that have travelled well across contexts. Instruments are sensemaking tools that produce conversations, not scores. The writing is where the underlying ideas — drawn from Deming, Team Topologies, DORA, the Improvement Kata, and the wider sociotechnical tradition — get worked through in the open. Talks are where some of those ideas are first tested in front of an audience.

It is opinionated. New material is added when it has proven itself in practice.

Profound is maintained and authored by [Benedict Steele](https://www.linkedin.com/in/benedictsteele/), Chief Delivery Officer at Armakuni.

<div class="about-pointers">
  <div class="about-pointer">
    <h2><a href="/bio/">More about me</a></h2>
    <p>A longer take on what I do, what I've done, and what I'm working on now.</p>
  </div>
  <div class="about-pointer">
    <h2><a href="/reading/">What I'm reading</a></h2>
    <p>A map of the books, papers, and thinkers behind the work collected here.</p>
  </div>
</div>
```

- [ ] **Step 3: Build and verify**

```bash
npm run build
grep -c "about-pointer" _site/about/index.html
grep -c "More about me" _site/about/index.html
grep -c "What I&#39;m reading" _site/about/index.html
```
Expected: each count is at least 1. (The `What I'm reading` grep uses the HTML-encoded apostrophe Eleventy emits via markdown-it — if it returns 0, also try `grep -c "What I.m reading"`.)

- [ ] **Step 4: Visual check**

Run `npm run dev`, open `http://localhost:8080/about/`. Confirm: the body explains Profound and names Benedict, the two-pointer block sits below the prose with a rule above it, both pointers link to their pages, the grid collapses to one column on narrow viewports. Click both pointer links and confirm they resolve. Stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(about): rewrite with pointers to bio and reading"
```

---

## Final verification

- [ ] **Step 1: Full build**

```bash
npm run build
```
Expected: clean build with no warnings or errors. (Eleventy 3 prints a per-template count and a wall-clock time — both should be present.)

- [ ] **Step 2: Top-nav reach check**

Open the dev server and from the home page click each of the five nav links in turn: Writing, Playbooks, Tools, Talks, About. Confirm each lands on a page that renders without errors and that the page title in the header tab and the visible H1 both look right.

- [ ] **Step 3: About page reach check**

From the About page, click both "More about me" and "What I'm reading" pointers; confirm they reach `/bio/` and `/reading/` and that both pages render cleanly.

- [ ] **Step 4: Sitemap sanity**

```bash
grep -E "(writing|talks|bio|reading)" _site/sitemap.xml | head -20
```
Expected: at least one URL per new top-level page is present in the sitemap.

- [ ] **Step 5: No leftover `/posts/` references**

```bash
grep -rn "/posts/" content/ _includes/ css/ js/ 2>/dev/null || echo "no /posts/ references in source"
grep -rn "collections.posts" content/ _includes/ 2>/dev/null || echo "no collections.posts references in source"
```
Expected: no matches in either grep, or `echo` lines printed.

If any references remain, fix them and re-run the full build before considering the plan complete.

---

## Notes for future content authoring

These are not implementation steps — they are conventions to follow when adding content later.

**Adding an essay.** Drop a Markdown file into `content/writing/` with `title`, `date`, and optional `summary` frontmatter. It is auto-collected via the `writing` tag.

**Adding a talk with a write-up.** Drop a Markdown file into `content/talks/` with `title`, `date`, `venue`, and any of `summary`, `slides`, `video`, `recording`. Omit `permalink: false`. The talk gets a page at `/talks/<slug>/` and appears on the talks index with a `→` affordance.

**Adding a talk without a write-up.** Same as above but include `permalink: false`. The talk appears on the talks index inline (with its links) and does not generate a standalone page.

**Updating Bio or Reading.** Edit the Markdown files at `content/bio.md` and `content/reading.md` directly. The `layouts/page.njk` layout handles both.
