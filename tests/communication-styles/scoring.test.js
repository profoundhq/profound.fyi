import { test } from "node:test";
import assert from "node:assert/strict";
import { scoreInventory } from "../../js/communication-styles/scoring.js";

test("all-zero answers sum to 27 on each axis", () => {
  const answers = Array(18).fill(0);
  const result = scoreInventory(answers);
  assert.equal(result.open + result.guarded, 27);
  assert.equal(result.direct + result.indirect, 27);
});

test("all-three answers also sum to 27 on each axis", () => {
  const answers = Array(18).fill(3);
  const result = scoreInventory(answers);
  assert.equal(result.open + result.guarded, 27);
  assert.equal(result.direct + result.indirect, 27);
});

test("all-zero answers: open=15, guarded=12, direct=12, indirect=15", () => {
  // With pos=0 for all, every A contributes 3, every B contributes 0.
  // Of the 9 odd items: 5 map A->open, 4 map A->guarded. So open=15, guarded=12.
  // Of the 9 even items: 4 map A->direct, 5 map A->indirect. So direct=12, indirect=15.
  const r = scoreInventory(Array(18).fill(0));
  assert.equal(r.open, 15);
  assert.equal(r.guarded, 12);
  assert.equal(r.direct, 12);
  assert.equal(r.indirect, 15);
});

test("all-three answers: open=12, guarded=15, direct=15, indirect=12", () => {
  const r = scoreInventory(Array(18).fill(3));
  assert.equal(r.open, 12);
  assert.equal(r.guarded, 15);
  assert.equal(r.direct, 15);
  assert.equal(r.indirect, 12);
});

import { determineStyle } from "../../js/communication-styles/scoring.js";

test("Open + Direct => Socialiser", () => {
  const s = determineStyle({ open: 20, guarded: 7, direct: 20, indirect: 7 });
  assert.deepEqual(s, { style: "Socialiser", openAxis: "open", directAxis: "direct", tieOpenGuarded: false, tieDirectIndirect: false });
});

test("Guarded + Indirect => Thinker", () => {
  assert.equal(determineStyle({ open: 7, guarded: 20, direct: 7, indirect: 20 }).style, "Thinker");
});

test("Open + Indirect => Relater", () => {
  assert.equal(determineStyle({ open: 20, guarded: 7, direct: 7, indirect: 20 }).style, "Relater");
});

test("Guarded + Direct => Director", () => {
  assert.equal(determineStyle({ open: 7, guarded: 20, direct: 20, indirect: 7 }).style, "Director");
});

test("Open == Guarded tie names both adjacent styles", () => {
  const s = determineStyle({ open: 13.5, guarded: 13.5, direct: 20, indirect: 7 });
  assert.equal(s.tieOpenGuarded, true);
  assert.equal(s.style, "Director / Socialiser");
});

test("Direct == Indirect tie names both adjacent styles", () => {
  const s = determineStyle({ open: 20, guarded: 7, direct: 13.5, indirect: 13.5 });
  assert.equal(s.tieDirectIndirect, true);
  assert.equal(s.style, "Relater / Socialiser");
});

import { encodeAnswers, decodeAnswers } from "../../js/communication-styles/scoring.js";

test("encodeAnswers produces an 18-char digit string", () => {
  const answers = [0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1];
  assert.equal(encodeAnswers(answers), "012301230123012301");
});

test("decodeAnswers parses a valid encoding", () => {
  assert.deepEqual(
    decodeAnswers("012301230123012301"),
    [0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1]
  );
});

test("decodeAnswers returns null for wrong length", () => {
  assert.equal(decodeAnswers("01230"), null);
});

test("decodeAnswers returns null for out-of-range digits", () => {
  assert.equal(decodeAnswers("412301230123012301"), null);
});

test("decodeAnswers returns null for non-digit characters", () => {
  assert.equal(decodeAnswers("a12301230123012301"), null);
});

test("decodeAnswers returns null for null/undefined", () => {
  assert.equal(decodeAnswers(null), null);
  assert.equal(decodeAnswers(undefined), null);
});
