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

A new playbook needs its own `<slug>.11tydata.js` setting `playbook: "<slug>"` and `playbookTitle: "..."`. Tag each playbook page individually (`tags: ["<slug>"]` in each Markdown file's frontmatter) — *not* in `11tydata.js`, because Eleventy's default array deep-merge would prevent the landing page from opting out of the sibling collection.

## Syncing a playbook from Obsidian

Playbook content is authored in a separate Obsidian vault and synced into the repo with:

```sh
scripts/sync-playbook.sh <slug> <source-path>
```

Example:

```sh
scripts/sync-playbook.sh agentic-ai-for-teams \
  "$HOME/Library/Mobile Documents/iCloud~md~obsidian/Documents/Steeley/Blogs/Agentic AI for Teams"
```

The script wipes existing `.md` files under `content/playbooks/<slug>/`, copies each source `.md` with frontmatter rewritten to our schema, applies text transforms (em-dash → hyphen, "agentic AI" → "Agentic AI"), and rewrites cross-reference URLs. It preserves `11tydata.js` and the hand-authored `index.njk` landings, and skips utility files (`README.md`, `CHANGELOG.md`, etc.) at the top level. After running, review the diff with `git status` / `git diff` before committing.

The sync is one-way: edits made directly in the repo will be overwritten on the next sync, so author in Obsidian.

## Deployment

Netlify builds on every push to `main`. Configuration is in `netlify.toml`.
