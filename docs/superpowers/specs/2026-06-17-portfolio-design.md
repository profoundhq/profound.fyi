# Profound as a portfolio site — design

Date: 2026-06-17

## Purpose

Evolve profound.fyi from a product-shaped site ("a collection of playbooks and instruments") into a portfolio site that showcases Benedict Steele's thinking, works as a calling card for opportunities (speaking, advisory, board roles), and continues to host the playbooks and instruments as real artefacts.

Profound remains the brand. Benedict is the named author and the site says so. The home page stays restrained: a single statement, no feeds, no cards.

## Audience and jobs

- Readers who arrive via a talk, post, or recommendation and want to understand the body of work
- Conference organisers, podcast hosts, and others looking for context before reaching out
- Returning visitors checking on new writing, talks, or tools

Not in scope: procurement-style consulting pages, lead capture, mailing lists, dashboards.

## Information architecture

```
/                    Home — restrained single statement (unchanged)
/writing/            Essays index (renamed from /posts/)
/writing/<slug>/     Individual essay
/playbooks/          Playbooks landing (unchanged)
/playbooks/<slug>/   Individual playbook (unchanged)
/tools/              Tools index (unchanged)
/tools/<slug>/       Individual tool (unchanged)
/talks/              Talks index (new)
/talks/<slug>/       Individual talk page (new, only when a talk has body content)
/about/              Rewritten — explains Profound and Benedict's relationship to it
/bio/                Personal, CV-shaped page (new, top-level URL)
/reading/            Reading and influences (new, top-level URL)
```

Top navigation: `Writing · Playbooks · Tools · Talks · About`.

Bio and Reading are reached from the About page, not from the top nav. Their URLs stay top-level so they are short and shareable, but they live conceptually under About.

`/posts/` becomes `/writing/`. The only content currently under `/posts/` is a placeholder, so no redirects are required.

## Section index designs

Every section index uses the same skeleton: a page title, a `.section-intro` paragraph (1–2 sentences of framing), then a list or grid appropriate to the content shape. Section indexes do not get hero images, accent treatments, or headline pull-quotes.

**Writing.** Reverse-chronological list, grouped by year. Each row: date, title, optional one-line summary (new `summary` frontmatter field).

**Talks.** Reverse-chronological list (grouped by year if it helps). Each row: title, venue, date, optional links (slides, video, recording). Talks with body content link through to their own page; talks without don't.

**Playbooks.** Keeps today's landing — one block per playbook with title and one-line description. No changes.

**Tools.** Two-column responsive card grid. Each card: name, one-line description, link. Collapses to one column on narrow viewports.

**About** (rewritten). Prose explaining what Profound is, why it exists, and Benedict's relationship to it as author and curator. Ends with two clear pointers: "More about me" → `/bio/`, "What I'm reading" → `/reading/`.

**Bio.** Long-form personal page. Suggested structure (movable when content is written):

- Short opening: who, what now (CDO at Armakuni)
- Past: career arc in prose or a dated list
- Speaking and advising: short note
- Elsewhere: LinkedIn, contact, other links

**Reading.** Loosely categorised list (e.g. systems thinking, software delivery, sociotechnical). Each item: title, author, one-line note on why it matters. A map of intellectual lineage, not a review site.

## Visual treatment

Stays inside the current visual system: IBM Plex Sans, the existing `tokens.css` → `base.css` → `layout.css` → `components.css` pipeline, the existing palette and rhythm. No new fonts, no new colour ramp, no hero imagery. Portfolio character comes from the IA and the content, not from a styling reskin.

New components added to `components.css`:

- `.section-intro` — framing paragraph used on every section landing
- `.writing-list` — definition-list pattern: year as `<dt>`, then `<dd>` rows of date · title · summary
- `.talks-list` — definition-list pattern with venue inline and link affordances for slides, video, recording
- `.tools-grid` — two-column responsive card grid collapsing to one column on narrow viewports
- `.about-pointers` — the pair of pointers ("More about me", "What I'm reading") at the foot of the About page

## Eleventy implementation

### File moves and renames

- `content/posts/` → `content/writing/`
- `content/posts/posts.11tydata.js` → `content/writing/writing.11tydata.js`, updating tag and any layout reference
- `content/posts/index.njk` → `content/writing/index.njk`, rewriting headings and any "posts" wording
- `content/posts/welcome.md` is kept as a placeholder in the new location

### New files

- `content/talks/talks.11tydata.js` — sets `tags: ["talks"]` and `layout: "layouts/talk.njk"`
- `content/talks/index.njk` — reads `collections.talks`, renders the talks list
- At least one placeholder talk Markdown file so the collection isn't empty at build time
- `content/bio.md` — uses `layouts/page.njk`, stub content
- `content/reading.md` — uses `layouts/page.njk`, stub content
- `_includes/layouts/talk.njk` — mirrors `post.njk`, adds slots for venue, date, and links from frontmatter

### Updates

- `content/about.md` — rewritten copy with the new framing and pointers
- `_includes/partials/site-header.njk` — nav updated to `Writing · Playbooks · Tools · Talks · About`
- `css/components.css` — adds the five new classes listed above

### Talk frontmatter

```yaml
---
title: "Talk title"
date: 2025-06-12
venue: "Conference name, City"
slides: "https://..."        # optional
video: "https://..."         # optional
recording: "https://..."     # optional
summary: "One-line summary used on the talks index."
---
```

Talks with body content render an individual page at `/talks/<slug>/`. Talks without body content appear on the index (with their links) and don't get their own page. Implementation will pick the cleaner of two patterns: the `talk.njk` layout returning empty for bodyless talks, or a flag in frontmatter that suppresses the per-talk page.

### Writing frontmatter addition

A new optional `summary` field for the one-line index summary. Existing posts do not need to backfill.

### Collections

`writing` and `talks` are tag-based collections auto-collected by Eleventy. The existing `playbooks` collection is unchanged.

## Content strategy

Benedict will bring material into each section as work progresses, rather than batching content authoring upfront. Initial commits create the scaffolding with brief placeholder copy where needed (a one-line "this page is coming together" line is fine — empty `<main>` blocks are not).

## Writing constraints (apply throughout)

British English, Oxford comma, no semicolons, no emojis in titles, active voice, plain language. These apply to any rendered prose including stubs and placeholders.

## Out of scope

- Mailing list, RSS-to-email, or any signup flow
- Search across the site
- Tags or category pages for writing or talks (year grouping is enough at this stage)
- A redesign of `/playbooks/` or `/tools/` beyond the small `tools-grid` addition for the tools index
- Any change to the home page layout, content, or wording

## Open implementation choices (defer to plan)

- Exact mechanism for "talks without body content don't get their own page" (layout-level check vs. frontmatter flag)
- Whether year grouping on `/writing/` and `/talks/` is rendered as `<h2>` headings, definition-list `<dt>`, or a small inline label
- Final About page copy (Benedict to author or approve before publish)
