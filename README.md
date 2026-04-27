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
