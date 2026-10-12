import { test } from "node:test";
import assert from "node:assert/strict";
import { transform, slugifyFilename, slugFromBasename } from "../scripts/obsidian-links.mjs";

const notes = new Map([
  ["core-thesis", "/playbooks/demo/core-thesis/"],
  ["10-core-thesis", "/playbooks/demo/core-thesis/"],
  ["underwriting-pack", "/playbooks/demo/artefacts/underwriting-pack/"],
]);
const run = (body) => {
  const warnings = [];
  const out = transform(body, {
    resolveNote: (name) => notes.get(name.toLowerCase()),
    resolveImage: (ref) => (ref.includes("missing") ? undefined : `/images/playbooks/demo/${slugifyFilename(ref)}`),
    warn: (msg) => warnings.push(msg),
  });
  return { out, warnings };
};

test("plain wikilink uses the note name as text", () => {
  assert.equal(run("See [[core-thesis]].").out, "See [core-thesis](/playbooks/demo/core-thesis/).");
});

test("aliased wikilink uses the alias", () => {
  assert.equal(run("[[Core-Thesis|the thesis]]").out, "[the thesis](/playbooks/demo/core-thesis/)");
});

test("heading fragment is dropped", () => {
  assert.equal(run("[[underwriting-pack#Costs]]").out, "[underwriting-pack](/playbooks/demo/artefacts/underwriting-pack/)");
});

test("unresolved wikilink becomes plain text with a warning", () => {
  const { out, warnings } = run("[[Nowhere|somewhere]]");
  assert.equal(out, "somewhere");
  assert.equal(warnings.length, 1);
});

test("image embed becomes a Markdown image and ignores size hints", () => {
  assert.equal(run("![[My Diagram.PNG|400]]").out, "![](/images/playbooks/demo/my-diagram.png)");
  assert.equal(run("![[chart.png|Adoption curve]]").out, "![Adoption curve](/images/playbooks/demo/chart.png)");
});

test("missing image embed is left alone with a warning", () => {
  const { out, warnings } = run("![[missing.png]]");
  assert.equal(out, "![[missing.png]]");
  assert.equal(warnings.length, 1);
});

test("relative Markdown image is resolved, absolute and remote ones are not", () => {
  assert.equal(run("![x](attachments/a.png)").out, "![x](/images/playbooks/demo/a.png)");
  assert.equal(run("![x](/images/a.png)").out, "![x](/images/a.png)");
  assert.equal(run("![x](https://e.com/a.png)").out, "![x](https://e.com/a.png)");
});

test("note embed becomes a link", () => {
  assert.equal(run("![[core-thesis]]").out, "[core-thesis](/playbooks/demo/core-thesis/)");
});

test("code blocks and inline code are untouched", () => {
  const body = "Use `[[core-thesis]]` here.\n\n```\n[[core-thesis]]\n```\n";
  assert.equal(run(body).out, body);
});

test("relative Markdown links to notes become site links", () => {
  assert.equal(run("[The thesis](10-core-thesis.md)").out, "[The thesis](/playbooks/demo/core-thesis/)");
  assert.equal(run("[Pack](artefacts/underwriting-pack.md#costs)").out, "[Pack](/playbooks/demo/artefacts/underwriting-pack/)");
});

test("unresolved relative note link becomes plain text with a warning", () => {
  const { out, warnings } = run("[Gone](./nowhere.md)");
  assert.equal(out, "Gone");
  assert.equal(warnings.length, 1);
});

test("relative links to attachments are copied, other links are left alone", () => {
  assert.equal(run("[Deck](50-Intro Deck.pptx)").out, "[Deck](50-Intro Deck.pptx)");
  assert.equal(run("[Deck](50-intro.pptx)").out, "[Deck](/images/playbooks/demo/50-intro.pptx)");
  assert.equal(run("[Site](https://example.com/a.md)").out, "[Site](https://example.com/a.md)");
  assert.equal(run("[Home](/playbooks/)").out, "[Home](/playbooks/)");
});

test("slugs strip hyphen or space prefixes and hyphenate spaces", () => {
  assert.equal(slugFromBasename("02 The Core Thesis"), "the-core-thesis");
  assert.equal(slugFromBasename("10-core-thesis"), "core-thesis");
  assert.equal(slugFromBasename("CHANGELOG"), "changelog");
});
