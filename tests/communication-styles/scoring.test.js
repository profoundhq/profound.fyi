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
