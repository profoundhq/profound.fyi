import { test } from "node:test";
import assert from "node:assert/strict";
import markdownIt from "markdown-it";
import { excerpt, breadcrumbs, structuredData } from "../lib/site-meta.js";
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
  assert.deepEqual(types, ["Article", "BreadcrumbList"]);
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
