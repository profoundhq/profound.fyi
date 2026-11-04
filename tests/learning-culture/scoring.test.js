import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  QUESTIONS,
  DIMENSIONS,
  effectiveScore,
  scoreSurvey,
  lowestStatements,
  weakestDimensions,
  encodeAnswers,
  decodeAnswers,
} from "../../js/learning-culture/scoring.js";

const count = (dim) => QUESTIONS.filter((q) => q.dim === dim).length;

test("the survey has 47 statements across four dimensions", () => {
  assert.equal(QUESTIONS.length, 47);
  assert.deepEqual(DIMENSIONS.map((d) => d.id), ["task", "support", "relationships", "efficacy"]);
  assert.deepEqual(DIMENSIONS.map((d) => count(d.id)), [10, 12, 10, 15]);
});

test("statement ids are 1 to 47 in order", () => {
  assert.deepEqual(QUESTIONS.map((q) => q.id), Array.from({ length: 47 }, (_, i) => i + 1));
});

test("only the task-switching statement is reverse-scored", () => {
  const reversed = QUESTIONS.filter((q) => q.reverse);
  assert.equal(reversed.length, 1);
  assert.match(reversed[0].text, /switch between topics and tasks/);
});

test("a reverse-scored answer of 1 counts as 5", () => {
  const q = QUESTIONS.find((item) => item.reverse);
  assert.equal(effectiveScore(q, 1), 5);
  assert.equal(effectiveScore(q, 5), 1);
  assert.equal(effectiveScore(QUESTIONS[0], 4), 4);
});

test("all neutral answers score 3 on every dimension", () => {
  const scores = scoreSurvey(Array(47).fill(3));
  for (const d of DIMENSIONS) assert.equal(scores[d.id], 3);
});

test("all strongly agree scores 5, except quality of task, pulled down by the reversed statement", () => {
  const scores = scoreSurvey(Array(47).fill(5));
  assert.equal(scores.task, 4.6);
  assert.equal(scores.support, 5);
  assert.equal(scores.relationships, 5);
  assert.equal(scores.efficacy, 5);
});

test("dimension scores are rounded to one decimal place", () => {
  const answers = Array(47).fill(3);
  answers[10] = 4; // first support statement
  assert.equal(scoreSurvey(answers).support, 3.1);
});

test("lowest statements are ordered by score, then by position", () => {
  const answers = Array(47).fill(3); // neutral, so the reversed statement also scores 3
  answers[20] = 1;
  answers[5] = 2;
  answers[30] = 2;
  const lowest = lowestStatements(answers, 3);
  assert.deepEqual(lowest.map((q) => q.id), [21, 6, 31]);
});

test("lowest statements use the reversed score", () => {
  const answers = Array(47).fill(3);
  const reversed = QUESTIONS.findIndex((q) => q.reverse);
  answers[reversed] = 5;
  assert.equal(lowestStatements(answers, 1)[0].id, QUESTIONS[reversed].id);
});

test("weakest dimensions include every dimension tied for lowest", () => {
  assert.deepEqual(weakestDimensions({ task: 3, support: 2.5, relationships: 4, efficacy: 2.5 }), ["support", "efficacy"]);
  assert.deepEqual(weakestDimensions({ task: 1, support: 2, relationships: 3, efficacy: 4 }), ["task"]);
});

test("answers round-trip through the URL encoding", () => {
  const answers = QUESTIONS.map((_, i) => (i % 5) + 1);
  assert.deepEqual(decodeAnswers(encodeAnswers(answers)), answers);
});

test("decoding rejects the wrong length or values outside 1 to 5", () => {
  assert.equal(decodeAnswers("3".repeat(46)), null);
  assert.equal(decodeAnswers("0" + "3".repeat(46)), null);
  assert.equal(decodeAnswers("6" + "3".repeat(46)), null);
  assert.equal(decodeAnswers(null), null);
});

test("every suggested practice is a page in the Continuous Learning Catalogue", () => {
  const dir = join(import.meta.dirname, "..", "..", "content", "continuous-learning");
  const missing = DIMENSIONS.flatMap((d) => d.practices.filter((slug) => !existsSync(join(dir, `${slug}.md`))));
  assert.deepEqual(missing, []);
});
