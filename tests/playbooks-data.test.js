import { test } from "node:test";
import assert from "node:assert/strict";
import matter from "gray-matter";
import { parseFields, extractPlays, buildPlaybooks, pageMarkdown, playbooksJson, playbooksSkill } from "../lib/playbooks-data.js";

const site = { url: "https://x.test", license: "https://creativecommons.org/licenses/by-sa/4.0/", author: "A. Author" };

const pagePlay = `
**When:** A team has asked for help. Nobody can say what done looks like.

**The action:** Agree one sign the team will see when they no longer need you.

**Forces:** Teams want help now.

**Signals:** The team refers to the exit signal unprompted.

**When not to:** The team is firefighting.

**Instance:** At a retailer, the team named the signal in the first session.
`;

const sectionPlays = `Intro prose about codifying.

## Play: situate every play

**When:** drafting any play.

**The move:** state the entry conditions first.
Then the move, then the signals.

**Signals:** a reader can decide within a minute.

**When not to:** never.

## Play: write for two readers *(candidate)*

**When:** a play will be read by people new to the practice.

**The action:** write the When for the newcomer.

## Antipattern: the container

Not a play.
`;

test("parseFields reads labelled paragraphs, including ones that run over several lines", () => {
  const fields = parseFields(sectionPlays.split("## Play: write")[0].split("## Play: situate every play")[1]);
  assert.equal(fields.when, "drafting any play.");
  assert.equal(fields.action, "state the entry conditions first.\nThen the move, then the signals.");
  assert.equal(fields.whenNot, "never.");
  assert.equal(fields.instance, undefined);
});

test("'The move' and 'The action' both fill the action, so the data survives a rename", () => {
  assert.equal(parseFields("**The move:** do it.").action, "do it.");
  assert.equal(parseFields("**The action:** do it.").action, "do it.");
});

test("a page that is itself a play gives one play named after the page", () => {
  const [play] = extractPlays({ title: "Agree the exit signal first", body: pagePlay, url: "https://x.test/p/a/" });
  assert.equal(play.name, "Agree the exit signal first");
  assert.equal(play.url, "https://x.test/p/a/");
  assert.equal(play.evidence, "instance");
  assert.match(play.instance, /retailer/);
});

test("plays inside a page come from their headings, with candidate status and no evidence where none is recorded", () => {
  const plays = extractPlays({ title: "Codify", body: sectionPlays, url: "https://x.test/p/codify/" });
  assert.deepEqual(plays.map((p) => p.name), ["Situate every play", "Write for two readers"]);
  assert.equal(plays[0].evidence, "none");
  assert.equal(plays[0].status, undefined);
  assert.equal(plays[1].status, "candidate");
});

test("the template's placeholder play is not published as a play", () => {
  const body = "## Play: [name the action, as a verb phrase]\n\n**When:** [the situation]\n\n**The action:** [what to do]\n";
  assert.deepEqual(extractPlays({ title: "Play Template", body, url: "https://x.test/t/" }), []);
});

test("an explicit Status field wins over the heading marker", () => {
  const [play] = extractPlays({ title: "T", body: "**Status:** tested\n\n**When:** w\n\n**The action:** a\n", url: "u" });
  assert.equal(play.status, "tested");
});

const items = [
  { url: "/playbooks/enabling-teams/agree-the-exit/", inputPath: "x", data: { title: "Agree the exit signal first", order: 100, playbook: "enabling-teams", playbookTitle: "Enabling Teams", license: { name: "CC BY-SA 4.0", url: site.license } }, body: pagePlay },
  { url: "/playbooks/okrs/two-functions/", inputPath: "y", data: { title: "Two functions", order: 40, playbook: "okrs", playbookTitle: "OKRs", license: { name: "CC BY-SA 4.0", url: site.license } }, body: "Objectives radiate intent. See [the thesis](/playbooks/okrs/the-core-thesis/).\n\n![diagram](/images/okrs/x.svg)\n" },
  { url: "/playbooks/okrs/the-core-thesis/", inputPath: "z", data: { title: "The core thesis", order: 20, playbook: "okrs", playbookTitle: "OKRs", license: { name: "CC BY-SA 4.0", url: site.license } }, body: "OKRs do two jobs.\n" },
];

test("buildPlaybooks groups pages by playbook in order and calls a playbook without plays a framework", () => {
  const books = buildPlaybooks(items, site.url);
  const okrs = books.find((b) => b.slug === "okrs");
  assert.equal(okrs.kind, "framework");
  assert.deepEqual(okrs.pages.map((p) => p.title), ["The core thesis", "Two functions"]);
  assert.equal(okrs.pages[1].markdownUrl, "https://x.test/playbooks/okrs/two-functions.md");
  assert.equal(okrs.url, "https://x.test/playbooks/okrs/");
  const enabling = books.find((b) => b.slug === "enabling-teams");
  assert.equal(enabling.kind, "plays");
  assert.equal(enabling.plays[0].playbook, "enabling-teams");
});

test("pageMarkdown has frontmatter and makes site links absolute, so it works away from the site", () => {
  const [, okrs] = buildPlaybooks(items, site.url);
  const md = pageMarkdown(okrs.pages[1], okrs, site);
  const { data, content } = matter(md);
  assert.equal(data.title, "Two functions");
  assert.equal(data.playbook, "OKRs");
  assert.match(content, /\[the thesis\]\(https:\/\/x\.test\/playbooks\/okrs\/the-core-thesis\/\)/);
  assert.match(content, /!\[diagram\]\(https:\/\/x\.test\/images\/okrs\/x\.svg\)/);
});

test("playbooksJson counts plays and how many have evidence", () => {
  const doc = JSON.parse(playbooksJson(buildPlaybooks(items, site.url), site));
  assert.equal(doc.playbooks.length, 2);
  assert.deepEqual(doc.plays, { total: 1, withInstance: 1 });
});

test("playbooksSkill parses as YAML, lists every play with its evidence, and lists frameworks apart", () => {
  const md = playbooksSkill(buildPlaybooks(items, site.url), site);
  const { data, content } = matter(md);
  assert.equal(data.name, "profound-playbooks");
  assert.ok(data.description.length <= 1024);
  assert.match(content, /\[Agree the exit signal first\]\(https:\/\/x\.test\/playbooks\/enabling-teams\/agree-the-exit\.md\) \(instance recorded\)/);
  assert.match(content, /## Frameworks[\s\S]*OKRs/);
  assert.doesNotMatch(md, /;/, "house style: no semicolons");
});
