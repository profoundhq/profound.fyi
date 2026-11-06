// Loads key pages in Chromium and fails on any Content Security Policy
// violation, including from Google Analytics after consent and the Speaker
// Deck embed. Needs network access and Playwright, which is not a project
// dependency (CI installs it for the run).
//
//   node scripts/check-csp.mjs              serve _site with the netlify.toml headers
//   node scripts/check-csp.mjs <site-url>   check a deployed site, such as a preview
//
// Build with GA_ID set for the local mode, or the analytics step has nothing
// to check.
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { createRequire } from "node:module";
import { parseHeaders, headersFor } from "../lib/netlify-headers.js";

const PAGES = [
  ["talk", "/talks/fast-flow-conf-2026/", "frame"],
  ["analytics", "/", "consent"],
  ["deck", "/playbooks/beat-network/overview/"],
  ["tool", "/tools/communication-styles/"],
  ["survey tool", "/tools/learning-culture/?a=44444444444444444444444444444444444444444444444"],
  ["law", "/laws/solid/"],
];

// Netlify adds its review toolbar to deploy previews only. The CSP blocks
// it, which is harmless and never happens on the live site.
const IGNORED = [/'https:\/\/app\.netlify\.com\//];

function serveSite(root) {
  const rules = parseHeaders(fs.readFileSync("netlify.toml", "utf8"));
  const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2", ".json": "application/json", ".ico": "image/x-icon", ".txt": "text/plain" };
  const server = http.createServer((req, res) => {
    const url = decodeURI(req.url.split("?")[0]);
    let file = path.join(root, url);
    if (!file.startsWith(root)) return res.writeHead(403).end();
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
    const found = fs.existsSync(file);
    if (!found) file = path.join(root, "404.html");
    const headers = { "Content-Type": types[path.extname(file)] ?? "application/octet-stream", ...headersFor(rules, url) };
    delete headers["Strict-Transport-Security"];
    res.writeHead(found ? 200 : 404, headers).end(fs.readFileSync(file));
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server)));
}

const target = process.argv[2];
const server = target ? null : await serveSite(path.resolve("_site"));
const base = target ? target.replace(/\/$/, "") : `http://127.0.0.1:${server.address().port}`;

const { chromium } = createRequire(import.meta.url)("playwright");
const browser = await chromium.launch();
const problems = [];

async function visit(label, url, kind) {
  const page = await browser.newPage();
  page.on("console", (m) => {
    const text = m.text();
    if (/Content Security Policy/.test(text) && !IGNORED.some((re) => re.test(text))) problems.push(`${label}: ${text}`);
  });
  // The analytics hit is answered here instead of reaching Google, so checks
  // never count as visits. The CSP acts before the request leaves the page,
  // so a request that arrives here was allowed.
  let hits = 0;
  await page.route(/google-analytics\.com\/g\/collect/, (route) => {
    hits++;
    return route.fulfill({ status: 204 });
  });
  const response = await page.goto(base + url, { waitUntil: "load" });
  if (!response?.ok()) problems.push(`${label}: ${url} returned ${response?.status()}`);

  if (kind === "frame") {
    await page.locator("iframe").first().scrollIntoViewIfNeeded();
    await page.frameLocator("iframe").first().locator("body").waitFor({ timeout: 20000 });
  }
  if (kind === "consent") {
    if (await page.locator("#consent-banner").count()) {
      await page.click('[data-consent="granted"]');
      const deadline = Date.now() + 20000;
      while (!hits && Date.now() < deadline) await page.waitForTimeout(250);
      if (!hits) problems.push(`${label}: no analytics request after accepting consent`);
    } else {
      problems.push(`${label}: no consent banner, so analytics was not checked (build with GA_ID set)`);
    }
  }
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.close();
}

try {
  for (const [label, url, kind] of PAGES) await visit(label, url, kind);
} finally {
  await browser.close();
  server?.close();
}

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`No CSP violations on ${PAGES.length} pages of ${base}, including with analytics accepted.`);
