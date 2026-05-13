import { test } from "node:test";
import assert from "node:assert/strict";
import { scoreInventory } from "../../js/communication-styles/scoring.js";

test("all-zero answers sum to 27 on each axis", () => {
  const answers = Array(18).fill(0);
  const result = scoreInventory(answers);
  assert.equal(result.open + result.guarded, 27);
  assert.equal(result.direct + result.indirect, 27);
});
