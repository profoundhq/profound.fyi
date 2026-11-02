import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import matter from "gray-matter";
import { listing, splitSections, buildLaws, lawMarkdown, lawsReference, skillMarkdown, lawsJson, SKILL } from "../lib/laws-data.js";

const site = { url: "https://x.test", license: "https://creativecommons.org/licenses/by-sa/4.0/", author: "A. Author" };

const body = (use, misuse) => `\n**How to use it.** ${use}\n\n**How it gets misused.** ${misuse}\n`;

const entries = [
  {
    data: { title: "Brooks's Law", slug: "brookss-law", tier: "Pattern", front: "Adding people to a late project makes it later.", related: ["conways-law"] },
    body: body("It holds when work is tightly connected.", "Used to argue for permanent under-staffing."),
  },
  {
    data: { title: "Conway's Law", slug: "conways-law", tier: "Law", front: "Systems mirror the communication structures that build them." },
    body: body("Design teams and architecture together.", "Treated as destiny."),
  },
];
const clusters = [{ data: { title: "The Brooks cluster", slug: "brooks", entries: ["brookss-law"] } }];

test("splitSections reads both notes from an entry body", () => {
  assert.deepEqual(splitSections(body("Use it **well**.", "Do not.")), { howToUse: "Use it **well**.", misuse: "Do not." });
});

test("splitSections fails loudly when a note is missing, so a sync cannot publish half an entry", () => {
  assert.throws(() => splitSections("**How to use it.** Only this."), /How it gets misused/);
});

test("buildLaws makes one record per entry, sorted by title, with tier meaning, clusters, and URLs", () => {
  const laws = buildLaws({ entries: [...entries].reverse(), clusters, siteUrl: site.url });
  assert.deepEqual(laws.map((l) => l.slug), ["brookss-law", "conways-law"]);
  const brooks = laws[0];
  assert.equal(brooks.tierDefinition, "regularities we keep seeing, useful for spotting problems");
  assert.deepEqual(brooks.clusters, [{ slug: "brooks", title: "The Brooks cluster" }]);
  assert.equal(brooks.url, "https://x.test/laws/brookss-law/");
  assert.equal(brooks.markdownUrl, "https://x.test/laws/brookss-law.md");
  assert.deepEqual(brooks.related, ["conways-law"]);
  assert.deepEqual(laws[1].related, []);
});

test("buildLaws rejects a tier the site does not define", () => {
  assert.throws(() => buildLaws({ entries: [{ ...entries[0], data: { ...entries[0].data, tier: "Hunch" } }], clusters: [], siteUrl: site.url }), /Hunch/);
});

test("lawMarkdown has frontmatter, the same sections as the page, and linked related laws", () => {
  const laws = buildLaws({ entries, clusters, siteUrl: site.url });
  const md = lawMarkdown(laws[0], laws, site);
  assert.match(md, /^---\ntitle: "Brooks's Law"\nslug: brookss-law\ntier: Pattern\n/);
  assert.match(md, /\n# Brooks's Law\n\n> Adding people to a late project makes it later\.\n/);
  assert.match(md, /\*\*How to use it\.\*\* It holds when work is tightly connected\./);
  assert.match(md, /\*\*How it gets misused\.\*\* Used to argue/);
  assert.match(md, /- \[Conway's Law\]\(https:\/\/x\.test\/laws\/conways-law\.md\)/);
});

test("lawsReference holds every law in full, grouped by tier", () => {
  const laws = buildLaws({ entries, clusters, siteUrl: site.url });
  const ref = lawsReference(laws, site);
  assert.ok(ref.indexOf("## Laws") < ref.indexOf("### Conway's Law"));
  assert.ok(ref.indexOf("## Patterns") < ref.indexOf("### Brooks's Law"));
  assert.match(ref, /Used to argue for permanent under-staffing/);
});

test("skillMarkdown has valid frontmatter and an index line for every law", () => {
  const laws = buildLaws({ entries, clusters, siteUrl: site.url });
  const md = skillMarkdown(laws, site);
  // A real YAML parser, as an agent would use. A bare ": " in a value breaks it.
  const { data } = matter(md);
  const { name, description } = data;
  assert.equal(typeof description, "string");
  assert.equal(name, SKILL.name);
  assert.equal(name, "profound-software-laws");
  assert.equal(SKILL.path, "/.well-known/agent-skills/profound-software-laws/SKILL.md");
  assert.equal(SKILL.archive, "/downloads/profound-software-laws-skill.zip");
  assert.match(name, /^[a-z0-9-]{1,64}$/);
  assert.ok(description.length <= 1024, `description is ${description.length} characters`);
  for (const law of laws) assert.ok(md.includes(`[${law.title}](${law.markdownUrl})`), law.slug);
  assert.doesNotMatch(md, /;/, "house style: no semicolons");
});


test("lawsJson describes its source and holds every record", () => {
  const laws = buildLaws({ entries, clusters, siteUrl: site.url });
  const doc = JSON.parse(lawsJson(laws, site));
  assert.equal(doc.count, 2);
  assert.equal(doc.license, site.license);
  assert.equal(doc.source, "https://x.test/laws/");
  assert.deepEqual(doc.tiers.map((t) => t.name), ["Law", "Principle", "Pattern", "Practice", "Saying", "Framework"]);
  assert.equal(doc.laws[0].misuse, "Used to argue for permanent under-staffing.");
});

test("listing joins names in house style, with an Oxford comma", () => {
  assert.equal(listing(["A"]), "A");
  assert.equal(listing(["A", "B"]), "A and B");
  assert.equal(listing(["A", "B", "C"]), "A, B, and C");
});
