import { test } from "node:test";
import assert from "node:assert/strict";
import { parseHeaders, headersFor, parseCsp, cspAllows } from "../lib/netlify-headers.js";

const toml = `
[build]
  publish = "_site"

[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    Link = "</a>; rel=\\"x\\""

[[headers]]
  for = "/fonts/*"
  [headers.values]
    Cache-Control = "immutable"
`;

test("parseHeaders reads each [[headers]] block and unescapes quotes", () => {
  const rules = parseHeaders(toml);
  assert.equal(rules.length, 2);
  assert.deepEqual(rules[0], { for: "/*", values: { "X-Content-Type-Options": "nosniff", Link: '</a>; rel="x"' } });
});

test("headersFor merges every rule whose path matches", () => {
  const rules = parseHeaders(toml);
  assert.equal(headersFor(rules, "/fonts/a.woff2")["Cache-Control"], "immutable");
  assert.equal(headersFor(rules, "/fonts/a.woff2")["X-Content-Type-Options"], "nosniff");
  assert.equal(headersFor(rules, "/about/")["Cache-Control"], undefined);
});

const csp = parseCsp("default-src 'self'; script-src 'self' https://www.googletagmanager.com; img-src 'self' https://*.google-analytics.com; frame-src https://speakerdeck.com");

test("cspAllows matches exact hosts, wildcard subdomains, and 'self'", () => {
  assert.ok(cspAllows(csp, "script-src", "https://www.googletagmanager.com/gtag/js?id=G-1"));
  assert.ok(!cspAllows(csp, "script-src", "https://evil.example/x.js"));
  assert.ok(cspAllows(csp, "img-src", "https://region1.google-analytics.com/g/collect"));
  assert.ok(!cspAllows(csp, "img-src", "https://google-analytics.com.evil.example/x"));
  assert.ok(cspAllows(csp, "frame-src", "https://speakerdeck.com/player/abc"));
  assert.ok(!cspAllows(csp, "frame-src", "http://speakerdeck.com/player/abc"));
});

test("cspAllows falls back to default-src for directives that are not set", () => {
  assert.ok(!cspAllows(csp, "font-src", "https://fonts.gstatic.com/a.woff2"));
});

// Third-party loads written into the source. A new embed or script host
// fails here until netlify.toml allows it, instead of failing silently in
// the browser after deploy.
test("the site's CSP allows every third-party script and frame in the source", async () => {
  const fs = await import("node:fs");
  const policy = headersFor(parseHeaders(fs.readFileSync("netlify.toml", "utf8")), "/")["Content-Security-Policy"];
  const live = parseCsp(policy);
  const files = ["_includes", "content", "js"].flatMap((dir) =>
    fs.readdirSync(dir, { recursive: true }).map((f) => `${dir}/${f}`).filter((f) => /\.(njk|md|html|js)$/.test(f)),
  );
  const patterns = [
    [/<iframe\b[^>]*\bsrc="(https?:\/\/[^"{]+)/g, "frame-src"],
    [/<script\b[^>]*\bsrc="(https?:\/\/[^"{]+)/g, "script-src"],
    [/\.src\s*=\s*["'](https?:\/\/[^"']+)/g, "script-src"],
  ];
  const blocked = [];
  let found = 0;
  for (const file of files) {
    const source = fs.readFileSync(file, "utf8");
    for (const [re, directive] of patterns) {
      for (const [, url] of source.matchAll(re)) {
        found++;
        if (!cspAllows(live, directive, url)) blocked.push(`${file}: ${directive} blocks ${url}`);
      }
    }
  }
  assert.ok(found >= 2, "expected to find the Speaker Deck frame and the GA script");
  assert.deepEqual(blocked, []);
});

// Netlify serves unknown extensions as application/octet-stream, and with
// nosniff the browser has no reason to treat the manifest as one
test("the web app manifest is served with its own media type", async () => {
  const fs = await import("node:fs");
  const rules = parseHeaders(fs.readFileSync("netlify.toml", "utf8"));
  assert.equal(headersFor(rules, "/site.webmanifest")["Content-Type"], "application/manifest+json");
});
