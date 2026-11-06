import { test } from "node:test";
import assert from "node:assert/strict";
import { editHunks, replayHunks, noteFor, frontmatterChanges } from "../scripts/sync-back.mjs";

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
