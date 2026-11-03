import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";

// The Continuous Learning Catalogue: one page per practice, linked by
// `related` slugs. A broken or one-way link fails here, not on the site.

const dir = join(import.meta.dirname, "..", "content", "continuous-learning");
const entries = new Map(
  readdirSync(dir)
    .filter((file) => file.endsWith(".md") && file !== "index.md")
    .map((file) => [file.replace(/\.md$/, ""), matter(readFileSync(join(dir, file), "utf8")).data]),
);

test("every practice has at least one related practice", () => {
  const without = [...entries].filter(([, data]) => !data.related?.length).map(([slug]) => slug);
  assert.deepEqual(without, []);
});

test("every related slug names a practice in the catalogue", () => {
  const broken = [...entries].flatMap(([slug, data]) =>
    (data.related ?? []).filter((other) => !entries.has(other)).map((other) => `${slug} -> ${other}`),
  );
  assert.deepEqual(broken, []);
});

test("no practice is related to itself", () => {
  const selfLinks = [...entries].filter(([slug, data]) => (data.related ?? []).includes(slug)).map(([slug]) => slug);
  assert.deepEqual(selfLinks, []);
});

test("related links go both ways", () => {
  const oneWay = [...entries].flatMap(([slug, data]) =>
    (data.related ?? [])
      .filter((other) => entries.has(other) && !(entries.get(other).related ?? []).includes(slug))
      .map((other) => `${slug} -> ${other}`),
  );
  assert.deepEqual(oneWay, []);
});

test("the catalogue credits both authors", () => {
  const index = readFileSync(join(dir, "index.md"), "utf8");
  assert.match(index, /Sorrel Harriet and Benedict Steele/);
  assert.doesNotMatch(index, /not been reviewed/);
});
