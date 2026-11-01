// Loads built pages in Chromium with the headers from netlify.toml and fails
// on any Content Security Policy violation, including from Google Analytics
// after consent and the Speaker Deck embed. Needs network access and
// Playwright, which is not a project dependency.
//
//   GA_ID=G-TEST npm run build && node scripts/check-csp.mjs
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { createRequire } from "node:module";
import { parseHeaders, headersFor } from "../lib/netlify-headers.js";

const root = path.resolve("_site");
const rules = parseHeaders(fs.readFileSync("netlify.toml", "utf8"));
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2", ".json": "application/json", ".ico": "image/x-icon", ".webmanifest": "application/manifest+json" };

const server = http.createServer((req, res) => {
  const url = decodeURI(req.url.split("?")[0]);
  let file = path.join(root, url);
  if (!file.startsWith(root)) return res.writeHead(403).end();
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
  const found = fs.existsSync(file);
  if (!found) file = path.join(root, "404.html");
  const headers = { ...headersFor(rules, url), "Content-Type": types[path.extname(file)] ?? "application/octet-stream" };
  delete headers["Strict-Transport-Security"];
  res.writeHead(found ? 200 : 404, headers).end(fs.readFileSync(file));
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${server.address().port}`;

const { chromium } = createRequire(import.meta.url)("playwright");
const browser = await chromium.launch();
const violations = [];

async function visit(label, url, act) {
  const page = await browser.newPage();
  page.on("console", (m) => /Content Security Policy/.test(m.text()) && violations.push(`${label}: ${m.text()}`));
  await page.goto(base + url, { waitUntil: "load" });
  if (act) await act(page);
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.close();
}

await visit("talk", "/talks/fast-flow-conf-2026/", async (page) => {
  await page.locator("iframe").first().scrollIntoViewIfNeeded();
  await page.frameLocator("iframe").first().locator("body").waitFor({ timeout: 15000 });
});

const gaId = fs.readFileSync(path.join(root, "index.html"), "utf8").match(/data-ga-id="([^"]+)"/)?.[1];
if (gaId) {
  await visit("analytics", "/", async (page) => {
    const sent = page.waitForRequest(/google-analytics\.com\/g\/collect/, { timeout: 15000 });
    await page.click('[data-consent="granted"]');
    await sent;
  });
} else {
  violations.push("analytics: not checked, build with GA_ID set to include the consent banner");
}

await browser.close();
server.close();
if (violations.length) {
  console.error(violations.join("\n"));
  process.exit(1);
}
console.log("No CSP violations on the talk page or with analytics accepted.");
