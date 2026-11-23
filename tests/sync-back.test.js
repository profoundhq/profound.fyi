import { test } from "node:test";
import assert from "node:assert/strict";
import { editHunks, replayHunks, noteFor, frontmatterChanges, wholeNote } from "../scripts/sync-back.mjs";

const replay = (base, ours, vault) => replayHunks(vault, editHunks(base, ours));

test("an edited sentence replays into the vault note", () => {
  const base = "Intro.\n\nRetirement is a first-class outcome, not a failure. A retired play teaches.\n";
  const ours = "Intro.\n\nRetirement is a first-class outcome. A retired play teaches.\n";
  const vault = "# Govern\n\nIntro.\n\nRetirement is a first-class outcome, not a failure. A retired play teaches.\n";
  const { text, results } = replay(base, ours, vault);
  assert.equal(text, "# Govern\n\nIntro.\n\nRetirement is a first-class outcome. A retired play teaches.\n");
  assert.deepEqual(results.map((r) => r.status), ["applied"]);
});

test("the vault's em dashes, which the forward sync turns into hyphens, still match", () => {
  const base = "Name the forces - cost first. The tell: nobody is embarrassed.\n";
  const ours = "Name the forces - cost first. You can see it when nobody is embarrassed.\n";
  const vault = "Name the forces — cost first. The tell: nobody is embarrassed.\n";
  const { text, results } = replay(base, ours, vault);
  assert.equal(text, "Name the forces — cost first. You can see it when nobody is embarrassed.\n");
  assert.equal(results[0].status, "applied");
});

test("removing bold from an opening line replays as small edits", () => {
  const base = "**Most candidates should never become plays. Notice repetition.**\n\n## Play\n";
  const ours = "Most candidates should never become plays. Notice repetition.\n\n## Play\n";
  const { text, results } = replay(base, ours, base);
  assert.equal(text, ours);
  assert.ok(results.every((r) => r.status === "applied"));
});

test("an edit already in the vault is skipped, not applied twice", () => {
  const base = "The point is not to score points. It is to earn trust.\n";
  const ours = "The test earns trust.\n";
  const { text, results } = replay(base, ours, ours);
  assert.equal(text, ours);
  assert.deepEqual(results.map((r) => r.status), ["already"]);
});

test("a sentence edited differently in the vault is a conflict, and the note is left alone", () => {
  const base = "Access is not a detail. It decides everything.\n";
  const ours = "Access decides everything.\n";
  const vault = "Access is not a detail, and Benedict rewrote this since.\n";
  const { text, results } = replay(base, ours, vault);
  assert.equal(text, vault);
  assert.equal(results[0].status, "conflict");
  assert.match(results[0].old, /is not a detail\. It/);
});

test("a phrase that appears twice gets enough context to be unique", () => {
  const base = "Plays have grain. First section ends.\n\nPlays have grain. Second section ends.\n";
  const ours = "Plays have grain. First section ends.\n\nReal plays have grain. Second section ends.\n";
  const { text, results } = replay(base, ours, base);
  assert.equal(text, ours);
  assert.equal(results[0].status, "applied");
});

test("an added sentence and a removed sentence both replay", () => {
  const base = "One. Two. Three.\n\nKeep this paragraph.\n\nDrop the last sentence here. Gone soon.\n";
  const ours = "One. Two and a half. Three.\n\nKeep this paragraph.\n\nDrop the last sentence here.\n";
  const { text, results } = replay(base, ours, base);
  assert.equal(text, ours);
  assert.ok(results.every((r) => r.status === "applied"), JSON.stringify(results));
});

test("noteFor finds the vault note behind a repo page, through number prefixes and artefacts", () => {
  const notes = ["30-sense.md", "02 The Core Thesis.md", "_index.md", "artefacts/10-is-it-a-playbook.md", "artefacts/play-template.md"];
  assert.equal(noteFor("sense.md", notes), "30-sense.md");
  assert.equal(noteFor("the-core-thesis.md", notes), "02 The Core Thesis.md");
  assert.equal(noteFor("artefacts/is-it-a-playbook.md", notes), "artefacts/10-is-it-a-playbook.md");
  assert.equal(noteFor("artefacts/play-template.md", notes), "artefacts/play-template.md");
  assert.equal(noteFor("missing.md", notes), undefined);
});

test("noteFor refuses to guess between two notes with the same slug", () => {
  assert.throws(() => noteFor("sense.md", ["30-sense.md", "Sense.md"]), /more than one/);
});

test("frontmatter changes are reported, not replayed", () => {
  const base = '---\ntitle: "Sense"\norder: 30\n---\nBody.\n';
  const ours = '---\ntitle: "Sensing"\norder: 30\n---\nBody.\n';
  assert.deepEqual(frontmatterChanges(base, ours), ["title"]);
  assert.deepEqual(frontmatterChanges(base, base), []);
});

test("wholeNote keeps the note's frontmatter and H1, and links back to the vault's own files", () => {
  const page = '---\ntitle: "Codify"\norder: 50\nupdated: 2026-10-12\ntags:\n  - demo\n---\n\nUse the [Play Template](/playbooks/demo/artefacts/play-template/) and see [Govern](/playbooks/demo/govern/#loop).\n';
  const note = "---\ntitle: Codify\norder: 50\npermalink: /playbooks/demo/codify/\n---\n\n# Codify\n\nOld rewrite text.\n";
  const notes = ["50-codify.md", "80-govern.md", "artefacts/20-play-template.md"];
  assert.equal(
    wholeNote(page, note, { slug: "demo", note: "50-codify.md", notes }),
    "---\ntitle: Codify\norder: 50\npermalink: /playbooks/demo/codify/\n---\n\n# Codify\n\nUse the [Play Template](artefacts/20-play-template.md) and see [Govern](80-govern.md#loop).\n",
  );
});

test("wholeNote links from an artefact up to a top-level note and to attachments", () => {
  const page = '---\ntitle: "Training"\norder: 140\n---\n\nSee [the test](/playbooks/demo/artefacts/is-it-a-playbook/), [Govern](/playbooks/demo/govern/), and [the deck](/images/playbooks/demo/intro.pptx).\n';
  const note = "# Training\n\nOld.\n";
  const notes = ["80-govern.md", "artefacts/10-is-it-a-playbook.md", "artefacts/40-training.md"];
  assert.equal(
    wholeNote(page, note, { slug: "demo", note: "artefacts/40-training.md", notes }),
    "# Training\n\nSee [the test](10-is-it-a-playbook.md), [Govern](../80-govern.md), and [the deck](intro.pptx).\n",
  );
});
