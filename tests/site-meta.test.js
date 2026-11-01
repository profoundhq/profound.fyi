import { test } from "node:test";
import assert from "node:assert/strict";
import markdownIt from "markdown-it";
import { excerpt, breadcrumbs, visibleBreadcrumbs, structuredData, lawSummary } from "../lib/site-meta.js";
import { accessibleTables } from "../lib/markdown-tables.js";

const site = { title: "Profound", author: "A", license: "https://l", url: "https://x.test" };

test("excerpt takes the first prose paragraph and strips Markdown", () => {
  const source = "# Heading\n\n> A quote that should not be used as the page summary.\n\nThis is the **first** real [paragraph](/x/) of the page, long enough to use.\n";
  assert.equal(excerpt(source), "This is the first real paragraph of the page, long enough to use.");
});

test("excerpt skips Nunjucks and cuts at a word boundary", () => {
  const source = `{% set x = 1 %}\n\n<p>${"word ".repeat(60)}</p>`;
  const out = excerpt(source);
  assert.ok(out.length <= 155);
  assert.ok(out.endsWith("word..."));
});

test("excerpt returns nothing when there is no prose", () => {
  assert.equal(excerpt("## Only a heading\n"), "");
  assert.equal(excerpt(undefined), "");
});

test("breadcrumbs include the playbook between section and page", () => {
  const crumbs = breadcrumbs({ url: "/playbooks/okrs/overview/", title: "Overview", playbook: "okrs", playbookTitle: "OKRs", siteUrl: "https://x.test" });
  assert.deepEqual(crumbs.map((c) => c.name), ["Home", "Playbooks", "OKRs", "Overview"]);
});

test("breadcrumbs do not repeat a landing or section page", () => {
  assert.equal(breadcrumbs({ url: "/playbooks/okrs/", title: "OKRs", playbook: "okrs", playbookTitle: "OKRs", siteUrl: "https://x.test" }).length, 3);
  assert.equal(breadcrumbs({ url: "/laws/", title: "Laws", siteUrl: "https://x.test" }).length, 2);
});

test("structured data is a WebSite on the home page and an Article elsewhere", () => {
  assert.equal(JSON.parse(structuredData({ url: "/", site })) ["@graph"][0]["@type"], "WebSite");
  const types = JSON.parse(structuredData({ url: "/about/", title: "About", site }))["@graph"].map((n) => n["@type"]);
  assert.deepEqual(types, ["Article"]);
});

test("only nested pages carry a breadcrumb trail, so it matches what the page shows", () => {
  const top = JSON.parse(structuredData({ url: "/about/", title: "About", site }))["@graph"].map((n) => n["@type"]);
  assert.deepEqual(top, ["Article"]);
  const nested = JSON.parse(structuredData({ url: "/laws/solid/", title: "SOLID", site }))["@graph"].map((n) => n["@type"]);
  assert.deepEqual(nested, ["Article", "BreadcrumbList"]);
});

test("visibleBreadcrumbs returns the trail only when it has more than two steps", () => {
  assert.deepEqual(visibleBreadcrumbs({ url: "/about/", title: "About", siteUrl: "https://x.test" }), []);
  const trail = visibleBreadcrumbs({ url: "/laws/solid/", title: "SOLID", siteUrl: "https://x.test" });
  assert.deepEqual(trail.map((c) => [c.name, c.url]), [["Home", "/"], ["Laws", "/laws/"], ["SOLID", "/laws/solid/"]]);
});

test("a parent step sits between the section and the page", () => {
  const parent = { name: "Principles", url: "/laws/tiers/principles/" };
  const trail = visibleBreadcrumbs({ url: "/laws/solid/", title: "SOLID", parent, siteUrl: "https://x.test" });
  assert.deepEqual(trail.map((c) => c.url), ["/", "/laws/", "/laws/tiers/principles/", "/laws/solid/"]);
  const graph = JSON.parse(structuredData({ url: "/laws/solid/", title: "SOLID", parent, site }))["@graph"];
  assert.equal(graph[1].itemListElement[2].item, "https://x.test/laws/tiers/principles/");
});

test("a noindex page gets no structured data", () => {
  assert.equal(structuredData({ url: "/404.html", title: "Page not found", robots: "noindex", site }), "");
});

test("structured data cannot close its script element", () => {
  assert.ok(!structuredData({ url: "/a/", title: "</script><b>", site }).includes("<"));
});

test("tables get column scopes, a hidden caption, and a scrollable region", () => {
  const html = markdownIt().use(accessibleTables).render("## Costs & risks\n\n| A | B |\n| --- | --- |\n| 1 | 2 |\n");
  assert.match(html, /<th scope="col">A<\/th>/);
  assert.match(html, /<caption class="visually-hidden">Costs &amp; risks<\/caption>\n<thead>/);
  assert.match(html, /<div class="table-scroll" role="region" aria-label="Costs &amp; risks" tabindex="0">\n<table>/);
  assert.match(html, /<\/table>\n<\/div>/);
});

const howTo = (text) => `**How to use it.** ${text}\n\n**How it gets misused.** Something else.\n`;

test("lawSummary adds the first 'How to use it' sentence to a short front", () => {
  assert.equal(
    lawSummary({ front: "Visible mess invites more mess.", body: howTo("Fix small things visibly. Tolerated mess teaches the next person what is acceptable.") }),
    "Visible mess invites more mess. Fix small things visibly.",
  );
});

test("lawSummary keeps a short front alone when the addition would run long", () => {
  const front = "Work expands to fill the time you give it.";
  assert.equal(lawSummary({ front, body: howTo(`${"Very ".repeat(30)}long.`) }), front);
  assert.equal(lawSummary({ front, body: "No usage note here." }), front);
});

test("lawSummary cuts a long front at its first colon or full stop", () => {
  assert.equal(
    lawSummary({ front: "Five rules for designing object-oriented code: each class does one thing, code should be open to extension but closed to modification, subclasses should be substitutable, interfaces should be small, and code should depend on abstractions rather than specifics." }),
    "Five rules for designing object-oriented code.",
  );
  assert.equal(
    lawSummary({ front: "Twelve practices for building software-as-a-service applications that are portable, scalable, and operable. Codebase, dependencies, config, backing services, build/release/run, processes, port binding, concurrency, disposability, dev/prod parity, logs, and admin processes." }),
    "Twelve practices for building software-as-a-service applications that are portable, scalable, and operable.",
  );
});

test("lawSummary leaves a front of reasonable length as it is", () => {
  const front = "A front that is already a comfortable length for a search result snippet, so nothing changes.";
  assert.equal(lawSummary({ front, body: howTo("Do a thing.") }), front);
});

test("lawSummary falls back to a word-boundary cut when there is no clean break", () => {
  const out = lawSummary({ front: "word ".repeat(60).trim() });
  assert.ok(out.length <= 160);
  assert.ok(out.endsWith("word..."));
});

test("lawSummary keeps as many whole sentences as fit", () => {
  assert.equal(
    lawSummary({ front: "A way of seeing DevOps as a whole. Optimise flow from idea to production. Amplify feedback from production back to development. Build a culture of continuous experimentation and learning." }),
    "A way of seeing DevOps as a whole. Optimise flow from idea to production. Amplify feedback from production back to development.",
  );
});
