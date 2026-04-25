# profound.fyi

Static site built with [Hugo](https://gohugo.io/) and the [hugo-paper](https://github.com/nanxiaobei/hugo-paper) theme. Deployed on Netlify.

## Local development

Requires Hugo (extended) and Go.

```sh
hugo server
```

Site renders at `http://localhost:1313/`. Live reload is on by default.

## Building

```sh
hugo --gc --minify
```

Output goes to `public/`.

## Updating the theme

```sh
hugo mod get -u github.com/nanxiaobei/hugo-paper
hugo mod tidy
```

Commit the resulting `go.mod`/`go.sum` changes.

## Deployment

Netlify builds on every push to `main`. Configuration is in `netlify.toml`.
