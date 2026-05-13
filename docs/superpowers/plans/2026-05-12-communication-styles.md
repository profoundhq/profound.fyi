# Communication Styles Mini App — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a self-assessment mini app at `/tools/communication-styles/` that scores 18 paired statements and shows the user's communication style on the Open/Guarded × Direct/Indirect quadrant, with shareable URL state and localStorage persistence.

**Architecture:** Static Eleventy page + vanilla ESM JavaScript split into a pure `scoring.js` kernel (Node-testable) and a thin `app.js` DOM-glue layer. Inline SVG quadrant rendered via DOM methods (no innerHTML). No framework, no build step beyond Eleventy. Tests run via `node --test` (built into Node 20), zero new dependencies.

**Tech Stack:** Eleventy 3 (Nunjucks), vanilla ESM, hand-authored CSS, Node 20 `node:test`.

**Spec:** `docs/superpowers/specs/2026-05-12-communication-styles-design.md`

---

## File Structure

### Create

- `content/tools/communication-styles.njk` — page template, renders intro + 18-item form + empty results region + credit. Loads `app.js` as a module.
- `js/communication-styles/scoring.js` — pure ESM module: question metadata, scoring functions, style determination, URL encode/decode.
- `js/communication-styles/app.js` — ESM module: DOM wiring, form state, results render, localStorage glue. Imports from `scoring.js`. Uses DOM methods only (createElement, textContent) — no innerHTML.
- `tests/communication-styles/scoring.test.js` — `node --test` tests for the scoring kernel.

### Modify

- `_includes/partials/site-header.njk` — add "Tools" nav link.
- `css/components.css` — append `.cs-*` component blocks.
- `package.json` — add `"test": "node --test tests/"` script.

### Delete

- `docs/communicationstyles.html` — superseded by the live page.

---

## Question dataset (used in multiple tasks)

The 18 paired statements with their dimension mapping. The prototype mapping (`docs/communicationstyles.html`) tells us which dimension each side of each row contributes to.

```js
// js/communication-styles/scoring.js exports this:
export const QUESTIONS = [
  { id: 1,  left: "I'm usually open to getting to know people personally and establishing relationships with them.", right: "I'm not usually open to getting to know people personally and establishing relationships with them.", aDim: "open",     bDim: "guarded"  },
  { id: 2,  left: "I usually react slowly and deliberately.", right: "I usually react quickly and spontaneously.", aDim: "indirect", bDim: "direct"   },
  { id: 3,  left: "I'm usually guarded about other people's use of my time.", right: "I'm usually open to other people's use of my time.", aDim: "guarded",  bDim: "open"     },
  { id: 4,  left: "I usually introduce myself at social gatherings.", right: "I usually wait for others to introduce themselves to me at social gatherings.", aDim: "direct",   bDim: "indirect" },
  { id: 5,  left: "I usually focus my conversations on the interests of the people involved, even if that means straying from the business or subject at hand.", right: "I usually focus my conversations on the tasks, issues, business, or subject at hand.", aDim: "open",     bDim: "guarded"  },
  { id: 6,  left: "I'm usually not assertive, and I can be patient with a slow pace.", right: "I'm usually assertive, and at times I can be impatient with a slow pace.", aDim: "indirect", bDim: "direct"   },
  { id: 7,  left: "I usually make decisions based on facts or evidence.", right: "I usually make decisions on feelings, experiences, or relationships.", aDim: "guarded",  bDim: "open"     },
  { id: 8,  left: "I usually contribute frequently to group conversations.", right: "I usually contribute infrequently to group conversations.", aDim: "direct",   bDim: "indirect" },
  { id: 9,  left: "I usually prefer to work with and through others, providing support when possible.", right: "I usually prefer to work independently or dictate the conditions in terms of how others are involved.", aDim: "open",     bDim: "guarded"  },
  { id: 10, left: "I usually ask questions or speak tentatively and indirectly.", right: "I usually make emphatic statements or directly express opinions.", aDim: "indirect", bDim: "direct"   },
  { id: 11, left: "I usually focus primarily on ideas, concepts, or results.", right: "I usually focus primarily on persons, interactions, and feelings.", aDim: "guarded",  bDim: "open"     },
  { id: 12, left: "I usually use gestures, facial expression, and voice intonation to emphasise points.", right: "I usually do not use gestures, facial expression, and voice intonation to emphasise points.", aDim: "direct",   bDim: "indirect" },
  { id: 13, left: "I usually accept others' points of view (ideas, feelings, and concerns).", right: "I usually don't accept others' points of view (ideas, feelings, and concerns).", aDim: "open",     bDim: "guarded"  },
  { id: 14, left: "I usually respond to risk and change in a cautious or predictable manner.", right: "I usually respond to risk and change in a dynamic or unpredictable manner.", aDim: "indirect", bDim: "direct"   },
  { id: 15, left: "I usually prefer to keep personal feelings and thoughts private, sharing only when I wish to do so.", right: "I usually find it natural and easy to share and discuss my feelings with others.", aDim: "guarded",  bDim: "open"     },
  { id: 16, left: "I usually seek out new or different experiences and situations.", right: "I usually choose known or similar situations and relationships.", aDim: "direct",   bDim: "indirect" },
  { id: 17, left: "I'm usually responsive to others' agenda, interests, and concerns.", right: "I'm usually directed toward my own agendas, interests, and concerns.", aDim: "open",     bDim: "guarded"  },
  { id: 18, left: "I usually respond to conflict slowly and indirectly.", right: "I usually respond to conflict quickly and directly.", aDim: "indirect", bDim: "direct"   },
];
```

("emphasise" used in item 12 — British spelling change from the source.)

---

## Task 1: Add the test script and create the scoring module skeleton

**Files:**
- Create: `js/communication-styles/scoring.js`
- Create: `tests/communication-styles/scoring.test.js`
- Modify: `package.json`

- [ ] **Step 1.1: Add the test script to package.json**

Edit `package.json`:

```json
{
  "name": "profound-fyi",
  "version": "1.0.0",
  "description": "Static site for profound.fyi",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "eleventy --serve",
    "build": "eleventy",
    "clean": "rm -rf _site",
    "test": "node --test tests/"
  },
  "devDependencies": {
    "@11ty/eleventy": "^3.0.0"
  }
}
```

- [ ] **Step 1.2: Write the first failing test for `scoreInventory`**

Create `tests/communication-styles/scoring.test.js`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { scoreInventory } from "../../js/communication-styles/scoring.js";

test("all-zero answers sum to 27 on each axis", () => {
  const answers = Array(18).fill(0);
  const result = scoreInventory(answers);
  assert.equal(result.open + result.guarded, 27);
  assert.equal(result.direct + result.indirect, 27);
});
```

- [ ] **Step 1.3: Run the test and confirm it fails**

Run: `npm test`
Expected: FAIL with "Cannot find module" or "scoreInventory is not a function".

- [ ] **Step 1.4: Create the scoring module with `QUESTIONS` and `scoreInventory`**

Create `js/communication-styles/scoring.js`. Paste the full `QUESTIONS` array from the "Question dataset" section above, then add:

```js
export function scoreInventory(answers) {
  const totals = { open: 0, guarded: 0, direct: 0, indirect: 0 };
  for (let i = 0; i < QUESTIONS.length; i++) {
    const pos = answers[i];
    const q = QUESTIONS[i];
    const a = 3 - pos;
    const b = pos;
    totals[q.aDim] += a;
    totals[q.bDim] += b;
  }
  return totals;
}
```

- [ ] **Step 1.5: Run the test and confirm it passes**

Run: `npm test`
Expected: PASS (1 test).

- [ ] **Step 1.6: Commit**

```bash
git add package.json js/communication-styles/scoring.js tests/communication-styles/scoring.test.js
git commit -m "feat(comm-styles): scoring kernel with invariant test"
```

---

## Task 2: Add the remaining scoring invariant tests

**Files:**
- Modify: `tests/communication-styles/scoring.test.js`

- [ ] **Step 2.1: Add tests for all-three input and a hand-computed example**

Append to `tests/communication-styles/scoring.test.js`:

```js
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
```

- [ ] **Step 2.2: Run tests**

Run: `npm test`
Expected: PASS (4 tests).

If the hand-computed test fails, the `QUESTIONS` dimension mapping is wrong — recheck it against `docs/communicationstyles.html` before continuing.

- [ ] **Step 2.3: Commit**

```bash
git add tests/communication-styles/scoring.test.js
git commit -m "test(comm-styles): hand-computed scoring assertions"
```

---

## Task 3: Add `determineStyle` with defensive tie branches

**Files:**
- Modify: `tests/communication-styles/scoring.test.js`
- Modify: `js/communication-styles/scoring.js`
- Modify: `docs/superpowers/specs/2026-05-12-communication-styles-design.md`

Note: with 9 items contributing 0–3 each, an axis totals 27, so a true tie at 13.5 / 13.5 is unreachable from real input. The tie branches are defensive; the tests construct ties with non-integer totals to exercise the branches.

- [ ] **Step 3.1: Write failing tests for `determineStyle`**

Append to `tests/communication-styles/scoring.test.js`:

```js
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
```

- [ ] **Step 3.2: Run tests and confirm they fail**

Run: `npm test`
Expected: FAIL with "determineStyle is not a function" (or similar).

- [ ] **Step 3.3: Implement `determineStyle`**

Append to `js/communication-styles/scoring.js`:

```js
const STYLE_MAP = {
  "open|direct":      "Socialiser",
  "open|indirect":    "Relater",
  "guarded|direct":   "Director",
  "guarded|indirect": "Thinker",
};

export function determineStyle(totals) {
  const tieOpenGuarded    = totals.open === totals.guarded;
  const tieDirectIndirect = totals.direct === totals.indirect;
  const openAxis   = totals.open   >= totals.guarded  ? "open"   : "guarded";
  const directAxis = totals.direct >= totals.indirect ? "direct" : "indirect";

  let style;
  if (tieOpenGuarded && tieDirectIndirect) {
    style = "All four styles in balance";
  } else if (tieOpenGuarded) {
    style = `${STYLE_MAP[`guarded|${directAxis}`]} / ${STYLE_MAP[`open|${directAxis}`]}`;
  } else if (tieDirectIndirect) {
    style = `${STYLE_MAP[`${openAxis}|indirect`]} / ${STYLE_MAP[`${openAxis}|direct`]}`;
  } else {
    style = STYLE_MAP[`${openAxis}|${directAxis}`];
  }

  return { style, openAxis, directAxis, tieOpenGuarded, tieDirectIndirect };
}
```

- [ ] **Step 3.4: Run tests and confirm they pass**

Run: `npm test`
Expected: PASS (10 tests so far).

- [ ] **Step 3.5: Update the spec to note ties are mathematically unreachable**

Edit `docs/superpowers/specs/2026-05-12-communication-styles-design.md`. Replace the "Ties" subsection (under "Style assignment") with:

```markdown
### Ties

With 9 items contributing 0–3 each per axis, axis totals always sum to 27. A tie would require both halves at 13.5, which is impossible from integer input. The scoring code includes defensive tie branches (and the result UI is wired to display "X / Y") but those branches are currently unreachable from real input. Kept in case the inventory grows or the scale changes.
```

- [ ] **Step 3.6: Commit**

```bash
git add js/communication-styles/scoring.js tests/communication-styles/scoring.test.js docs/superpowers/specs/2026-05-12-communication-styles-design.md
git commit -m "feat(comm-styles): determineStyle with defensive tie branches"
```

---

## Task 4: Add URL encode/decode

**Files:**
- Modify: `tests/communication-styles/scoring.test.js`
- Modify: `js/communication-styles/scoring.js`

- [ ] **Step 4.1: Write failing tests**

Append to `tests/communication-styles/scoring.test.js`:

```js
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
```

- [ ] **Step 4.2: Run tests and confirm they fail**

Run: `npm test`
Expected: FAIL.

- [ ] **Step 4.3: Implement encode/decode**

Append to `js/communication-styles/scoring.js`:

```js
export function encodeAnswers(answers) {
  return answers.map((n) => String(n)).join("");
}

export function decodeAnswers(str) {
  if (typeof str !== "string") return null;
  if (str.length !== 18) return null;
  if (!/^[0-3]{18}$/.test(str)) return null;
  return str.split("").map(Number);
}
```

- [ ] **Step 4.4: Run tests**

Run: `npm test`
Expected: PASS.

- [ ] **Step 4.5: Commit**

```bash
git add js/communication-styles/scoring.js tests/communication-styles/scoring.test.js
git commit -m "feat(comm-styles): URL encode/decode for answers"
```

---

## Task 5: Add the Tools nav link

**Files:**
- Modify: `_includes/partials/site-header.njk`

- [ ] **Step 5.1: Add the Tools link**

Replace the contents of `_includes/partials/site-header.njk` with:

```njk
<header class="site-header">
  <nav class="site-nav">
    <a class="site-brand" href="/">
      <span class="site-mark" aria-hidden="true">P</span>
      <span class="site-wordmark">Profound</span>
    </a>
    <div class="site-nav-links">
      <a href="/playbooks/">Playbooks</a>
      <a href="/tools/communication-styles/">Tools</a>
      <a href="/about/">About</a>
    </div>
  </nav>
</header>
```

- [ ] **Step 5.2: Commit**

```bash
git add _includes/partials/site-header.njk
git commit -m "feat(nav): add Tools link"
```

---

## Task 6: Build the page template with the 18-item form

**Files:**
- Create: `content/tools/communication-styles.njk`

- [ ] **Step 6.1: Create the template**

Create `content/tools/communication-styles.njk` with this content:

```njk
---
layout: layouts/page.njk
title: "Communication styles"
description: "A short self-assessment for finding your communication style on the Open/Direct quadrant. Adapted from the Platinum Rule by Tony Alessandra."
permalink: /tools/communication-styles/
---

<section class="cs-intro">
  <p>Eighteen pairs of statements. For each pair, choose the position that best describes you. It takes about three minutes. Your result places you on an Open/Guarded by Direct/Indirect quadrant and names your dominant style.</p>
  <p class="cs-credit">Adapted from the Platinum Rule communication-styles model by Tony Alessandra. Source: <a href="https://ogefacultymentoring.web.unc.edu/wp-content/uploads/sites/11490/2016/09/Communucation-Styles-Inventory.pdf">UNC OGE Faculty Mentoring handout</a>.</p>
</section>

<p class="cs-restore-prompt" hidden><a href="#" data-cs-restore>Restore your last answers</a></p>

<form id="cs-form" class="cs-form" novalidate>
  <ol class="cs-items">
    {% set rows = [
      { id: 1,  left: "I'm usually open to getting to know people personally and establishing relationships with them.", right: "I'm not usually open to getting to know people personally and establishing relationships with them." },
      { id: 2,  left: "I usually react slowly and deliberately.", right: "I usually react quickly and spontaneously." },
      { id: 3,  left: "I'm usually guarded about other people's use of my time.", right: "I'm usually open to other people's use of my time." },
      { id: 4,  left: "I usually introduce myself at social gatherings.", right: "I usually wait for others to introduce themselves to me at social gatherings." },
      { id: 5,  left: "I usually focus my conversations on the interests of the people involved, even if that means straying from the business or subject at hand.", right: "I usually focus my conversations on the tasks, issues, business, or subject at hand." },
      { id: 6,  left: "I'm usually not assertive, and I can be patient with a slow pace.", right: "I'm usually assertive, and at times I can be impatient with a slow pace." },
      { id: 7,  left: "I usually make decisions based on facts or evidence.", right: "I usually make decisions on feelings, experiences, or relationships." },
      { id: 8,  left: "I usually contribute frequently to group conversations.", right: "I usually contribute infrequently to group conversations." },
      { id: 9,  left: "I usually prefer to work with and through others, providing support when possible.", right: "I usually prefer to work independently or dictate the conditions in terms of how others are involved." },
      { id: 10, left: "I usually ask questions or speak tentatively and indirectly.", right: "I usually make emphatic statements or directly express opinions." },
      { id: 11, left: "I usually focus primarily on ideas, concepts, or results.", right: "I usually focus primarily on persons, interactions, and feelings." },
      { id: 12, left: "I usually use gestures, facial expression, and voice intonation to emphasise points.", right: "I usually do not use gestures, facial expression, and voice intonation to emphasise points." },
      { id: 13, left: "I usually accept others' points of view (ideas, feelings, and concerns).", right: "I usually don't accept others' points of view (ideas, feelings, and concerns)." },
      { id: 14, left: "I usually respond to risk and change in a cautious or predictable manner.", right: "I usually respond to risk and change in a dynamic or unpredictable manner." },
      { id: 15, left: "I usually prefer to keep personal feelings and thoughts private, sharing only when I wish to do so.", right: "I usually find it natural and easy to share and discuss my feelings with others." },
      { id: 16, left: "I usually seek out new or different experiences and situations.", right: "I usually choose known or similar situations and relationships." },
      { id: 17, left: "I'm usually responsive to others' agenda, interests, and concerns.", right: "I'm usually directed toward my own agendas, interests, and concerns." },
      { id: 18, left: "I usually respond to conflict slowly and indirectly.", right: "I usually respond to conflict quickly and directly." }
    ] %}
    {% for row in rows %}
      <li class="cs-item">
        <fieldset>
          <legend class="visually-hidden">Item {{ row.id }}: {{ row.left }} vs {{ row.right }}</legend>
          <p class="cs-statement cs-statement-left">{{ row.left }}</p>
          <div class="cs-scale" role="radiogroup" aria-label="Item {{ row.id }} scale">
            {% for pos in [0, 1, 2, 3] %}
              <label class="cs-scale-option">
                <input type="radio" name="q{{ row.id }}" value="{{ pos }}">
                <span class="visually-hidden">
                  {%- if pos == 0 %}Strongly agrees with: {{ row.left }}{% endif -%}
                  {%- if pos == 1 %}Leans toward: {{ row.left }}{% endif -%}
                  {%- if pos == 2 %}Leans toward: {{ row.right }}{% endif -%}
                  {%- if pos == 3 %}Strongly agrees with: {{ row.right }}{% endif -%}
                </span>
                <span class="cs-scale-dot" aria-hidden="true"></span>
              </label>
            {% endfor %}
          </div>
          <p class="cs-statement cs-statement-right">{{ row.right }}</p>
        </fieldset>
      </li>
    {% endfor %}
  </ol>

  <div class="cs-form-footer">
    <p class="cs-counter" aria-live="polite"><span data-cs-counter>0</span> of 18 answered</p>
    <button type="submit" class="cs-submit" data-cs-submit disabled aria-describedby="cs-submit-help">See your style</button>
    <p id="cs-submit-help" class="cs-submit-help">Answer all 18 items to see your result.</p>
  </div>
</form>

<section id="cs-results" class="cs-results" aria-live="polite" hidden></section>

<script type="module" src="/js/communication-styles/app.js"></script>
```

- [ ] **Step 6.2: Verify the page renders**

Run: `npm run dev`. Visit `http://localhost:8080/tools/communication-styles/`.
Expected: intro renders, 18 fieldsets with 4 radio options each, counter "0 of 18 answered", submit button disabled. The page is unstyled at this point — that's fine. Stop the server.

- [ ] **Step 6.3: Commit**

```bash
git add content/tools/communication-styles.njk
git commit -m "feat(comm-styles): page template with 18-item form"
```

---

## Task 7: Build app.js — counter and submit enable

**Files:**
- Create: `js/communication-styles/app.js`

- [ ] **Step 7.1: Create app.js**

Create `js/communication-styles/app.js`:

```js
import { QUESTIONS, scoreInventory, determineStyle, encodeAnswers, decodeAnswers } from "./scoring.js";

const STORAGE_KEY = "profound-comm-styles-v1";

function readAnswersFromForm(form) {
  const answers = [];
  for (const q of QUESTIONS) {
    const el = form.querySelector(`input[name="q${q.id}"]:checked`);
    answers.push(el ? Number(el.value) : null);
  }
  return answers;
}

function countAnswered(answers) {
  return answers.filter((a) => a !== null).length;
}

function updateCounter(form) {
  const n = countAnswered(readAnswersFromForm(form));
  form.querySelector("[data-cs-counter]").textContent = String(n);
  form.querySelector("[data-cs-submit]").disabled = n < 18;
}

function init() {
  const form = document.getElementById("cs-form");
  if (!form) return;
  form.addEventListener("change", () => updateCounter(form));
  updateCounter(form);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
```

- [ ] **Step 7.2: Test in the browser**

Run: `npm run dev`. Click radio options across several items.
Expected: counter updates; submit button enables only when all 18 are answered. Stop the server.

- [ ] **Step 7.3: Commit**

```bash
git add js/communication-styles/app.js
git commit -m "feat(comm-styles): live counter and submit enable"
```

---

## Task 8: Render results — quadrant + sub-scores + style cards

All DOM construction uses `document.createElementNS` (for SVG) and `createElement` + `textContent`. No `innerHTML`.

**Files:**
- Modify: `js/communication-styles/app.js`

- [ ] **Step 8.1: Add the result-rendering code**

Replace the contents of `js/communication-styles/app.js` with:

```js
import { QUESTIONS, scoreInventory, determineStyle, encodeAnswers, decodeAnswers } from "./scoring.js";

const STORAGE_KEY = "profound-comm-styles-v1";
const SVG_NS = "http://www.w3.org/2000/svg";

const STYLE_COPY = {
  Socialiser: {
    portrait: "Outgoing, enthusiastic, energised by people and possibilities.",
    bestAt: "Generating excitement, building rapport quickly, painting a vision.",
    flexToward: "When working with a Socialiser, allow time for stories and social warmth before driving to the task. Recognise their contribution out loud."
  },
  Relater: {
    portrait: "Warm, steady, attentive to feelings and group harmony.",
    bestAt: "Listening, supporting others, holding the team together under pressure.",
    flexToward: "When working with a Relater, slow down and signal that you care about the people involved, not just the outcome. Avoid pushing for fast decisions."
  },
  Director: {
    portrait: "Decisive, results-focused, comfortable taking charge.",
    bestAt: "Cutting through ambiguity, holding the line on outcomes, moving fast.",
    flexToward: "When working with a Director, be brief, be clear, and lead with results. Skip the small talk; bring options, not open questions."
  },
  Thinker: {
    portrait: "Analytical, precise, motivated by accuracy and quality.",
    bestAt: "Spotting flaws, structuring complex problems, building things that hold up.",
    flexToward: "When working with a Thinker, bring evidence, give them time to digest, and respect their need for detail. Don't rush them into a decision."
  }
};

// --- Form state -----------------------------------------------------------

function readAnswersFromForm(form) {
  const answers = [];
  for (const q of QUESTIONS) {
    const el = form.querySelector(`input[name="q${q.id}"]:checked`);
    answers.push(el ? Number(el.value) : null);
  }
  return answers;
}

function setAnswersOnForm(form, answers) {
  for (let i = 0; i < QUESTIONS.length; i++) {
    const pos = answers[i];
    if (pos == null) continue;
    const el = form.querySelector(`input[name="q${QUESTIONS[i].id}"][value="${pos}"]`);
    if (el) el.checked = true;
  }
}

function countAnswered(answers) {
  return answers.filter((a) => a !== null).length;
}

function updateCounter(form) {
  const n = countAnswered(readAnswersFromForm(form));
  form.querySelector("[data-cs-counter]").textContent = String(n);
  form.querySelector("[data-cs-submit]").disabled = n < 18;
}

// --- DOM helpers ----------------------------------------------------------

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else if (k === "text") node.textContent = v;
    else node.setAttribute(k, v);
  }
  for (const child of children) if (child) node.appendChild(child);
  return node;
}

function svg(tag, attrs = {}, children = []) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "text") node.textContent = v;
    else node.setAttribute(k, v);
  }
  for (const child of children) if (child) node.appendChild(child);
  return node;
}

// --- Render: quadrant -----------------------------------------------------

function buildQuadrant(totals) {
  const x = (totals.direct - totals.indirect) / 27;
  const y = (totals.open - totals.guarded) / 27;
  const cx = (50 + x * 45).toFixed(2);
  const cy = (50 - y * 45).toFixed(2);

  const root = svg("svg", {
    class: "cs-quadrant",
    viewBox: "0 0 100 100",
    role: "img",
    "aria-labelledby": "cs-quad-title cs-quad-desc"
  });
  root.appendChild(svg("title", { id: "cs-quad-title", text: "Your communication style position" }));
  root.appendChild(svg("desc",  { id: "cs-quad-desc",  text: `Plotted at ${cx} percent across, ${cy} percent down on the Open/Direct quadrant.` }));
  root.appendChild(svg("rect", { x: "0", y: "0", width: "100", height: "100", fill: "none", stroke: "currentColor", "stroke-width": "0.4" }));
  root.appendChild(svg("line", { x1: "50", y1: "0", x2: "50", y2: "100", stroke: "currentColor", "stroke-width": "0.2", opacity: "0.4" }));
  root.appendChild(svg("line", { x1: "0",  y1: "50", x2: "100", y2: "50", stroke: "currentColor", "stroke-width": "0.2", opacity: "0.4" }));
  root.appendChild(svg("text", { x: "4",  y: "8",  class: "cs-quad-label", text: "Relater" }));
  root.appendChild(svg("text", { x: "96", y: "8",  class: "cs-quad-label", "text-anchor": "end", text: "Socialiser" }));
  root.appendChild(svg("text", { x: "4",  y: "96", class: "cs-quad-label", text: "Thinker" }));
  root.appendChild(svg("text", { x: "96", y: "96", class: "cs-quad-label", "text-anchor": "end", text: "Director" }));
  root.appendChild(svg("text", { x: "50", y: "99", class: "cs-quad-axis", "text-anchor": "middle", text: "Direct →" }));
  root.appendChild(svg("text", { x: "50", y: "3",  class: "cs-quad-axis", "text-anchor": "middle", text: "↑ Open" }));
  root.appendChild(svg("circle", { cx, cy, r: "2.2", class: "cs-quad-dot" }));
  return root;
}

// --- Render: sub-scores ---------------------------------------------------

function buildSubscores(totals) {
  const list = el("dl", { class: "cs-subscores" });
  const pairs = [
    ["Open", totals.open, "Guarded", totals.guarded],
    ["Direct", totals.direct, "Indirect", totals.indirect]
  ];
  for (const [a, av, b, bv] of pairs) {
    const row = el("div", { class: "cs-subscore" });
    row.appendChild(el("dt", { text: a }));
    row.appendChild(el("dd", { text: String(av) }));
    row.appendChild(el("dt", { text: b }));
    row.appendChild(el("dd", { text: String(bv) }));
    const bar = el("div", { class: "cs-subscore-bar" });
    const fill = el("span");
    fill.style.width = `${(av / 27 * 100).toFixed(1)}%`;
    bar.appendChild(fill);
    row.appendChild(bar);
    list.appendChild(row);
  }
  return list;
}

// --- Render: style cards --------------------------------------------------

function buildStyleCards(style) {
  const order = ["Socialiser", "Relater", "Director", "Thinker"];
  const userStyles = new Set(style.style.split(" / "));
  const wrap = el("div", { class: "cs-style-cards" });

  for (const name of order) {
    const c = STYLE_COPY[name];
    if (!c) continue;
    const isUser = userStyles.has(name);
    const card = el("article", { class: isUser ? "cs-style-card cs-style-card-mine" : "cs-style-card" });

    const heading = el("h3", { text: name });
    if (isUser) {
      heading.appendChild(document.createTextNode(" "));
      heading.appendChild(el("span", { class: "cs-mine-badge", text: "your style" }));
    }
    card.appendChild(heading);
    card.appendChild(el("p", { class: "cs-portrait", text: c.portrait }));

    const best = el("p");
    best.appendChild(el("strong", { text: "At their best: " }));
    best.appendChild(document.createTextNode(c.bestAt));
    card.appendChild(best);

    const flex = el("p");
    flex.appendChild(el("strong", { text: "How to flex toward this style: " }));
    flex.appendChild(document.createTextNode(c.flexToward));
    card.appendChild(flex);

    wrap.appendChild(card);
  }
  return wrap;
}

// --- Render: full results -------------------------------------------------

function renderResults(target, totals, style) {
  while (target.firstChild) target.removeChild(target.firstChild);

  target.appendChild(el("h2", { text: `Your style: ${style.style}` }));
  target.appendChild(buildQuadrant(totals));
  target.appendChild(buildSubscores(totals));
  target.appendChild(buildStyleCards(style));

  const actions = el("p", { class: "cs-actions" });
  const reset = el("a", { href: "#", "data-cs-reset": "", text: "Start over" });
  actions.appendChild(reset);
  target.appendChild(actions);

  target.hidden = false;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

// --- Submit flow ----------------------------------------------------------

function submitFlow(form, resultsEl) {
  const answers = readAnswersFromForm(form);
  if (countAnswered(answers) < 18) return;
  const totals = scoreInventory(answers);
  const style = determineStyle(totals);
  renderResults(resultsEl, totals, style);
}

// --- Init -----------------------------------------------------------------

function init() {
  const form = document.getElementById("cs-form");
  const resultsEl = document.getElementById("cs-results");
  if (!form || !resultsEl) return;
  form.addEventListener("change", () => updateCounter(form));
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    submitFlow(form, resultsEl);
  });
  updateCounter(form);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
```

- [ ] **Step 8.2: Test in the browser**

Run: `npm run dev`. Answer all 18 questions, click "See your style".
Expected: results section appears with the heading, an inline SVG quadrant with a dot, sub-scores, four style cards (one highlighted as "your style"), and a "Start over" link.
Stop the server.

- [ ] **Step 8.3: Commit**

```bash
git add js/communication-styles/app.js
git commit -m "feat(comm-styles): render quadrant, sub-scores, style cards"
```

---

## Task 9: URL state — write on submit, restore on load

**Files:**
- Modify: `js/communication-styles/app.js`

- [ ] **Step 9.1: Add URL helpers and update `submitFlow`/`init`**

In `js/communication-styles/app.js`, add these helpers just above the `submitFlow` function:

```js
function writeUrl(answers) {
  const url = new URL(window.location.href);
  url.searchParams.set("a", encodeAnswers(answers));
  window.history.replaceState({}, "", url);
}

function clearUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete("a");
  window.history.replaceState({}, "", url);
}
```

Then replace `submitFlow` with:

```js
function submitFlow(form, resultsEl) {
  const answers = readAnswersFromForm(form);
  if (countAnswered(answers) < 18) return;
  const totals = scoreInventory(answers);
  const style = determineStyle(totals);
  writeUrl(answers);
  renderResults(resultsEl, totals, style);
}
```

And replace `init` with:

```js
function init() {
  const form = document.getElementById("cs-form");
  const resultsEl = document.getElementById("cs-results");
  if (!form || !resultsEl) return;

  form.addEventListener("change", () => updateCounter(form));
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    submitFlow(form, resultsEl);
  });

  const urlAnswers = decodeAnswers(new URL(window.location.href).searchParams.get("a"));
  if (urlAnswers) {
    setAnswersOnForm(form, urlAnswers);
    const totals = scoreInventory(urlAnswers);
    const style = determineStyle(totals);
    renderResults(resultsEl, totals, style);
  }

  updateCounter(form);
}
```

- [ ] **Step 9.2: Test URL share flow**

Run: `npm run dev`. Take the inventory, submit. URL now has `?a=...`. Copy and open in a new tab.
Expected: radios pre-populate, results auto-render with the same dot position. Stop the server.

- [ ] **Step 9.3: Commit**

```bash
git add js/communication-styles/app.js
git commit -m "feat(comm-styles): URL state for shareable results"
```

---

## Task 10: localStorage save and restore prompt

**Files:**
- Modify: `js/communication-styles/app.js`

- [ ] **Step 10.1: Add storage helpers**

In `js/communication-styles/app.js`, add just below `STYLE_COPY`:

```js
function storageAvailable() {
  try {
    const k = "__cs_test__";
    window.localStorage.setItem(k, "1");
    window.localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

function saveAnswers(answers) {
  if (!storageAvailable()) return;
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ answers, computedAt: new Date().toISOString() })
  );
}

function loadAnswers() {
  if (!storageAvailable()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.answers) || parsed.answers.length !== 18) return null;
    if (!parsed.answers.every((n) => Number.isInteger(n) && n >= 0 && n <= 3)) return null;
    return parsed.answers;
  } catch {
    return null;
  }
}

function clearStorage() {
  if (!storageAvailable()) return;
  window.localStorage.removeItem(STORAGE_KEY);
}
```

- [ ] **Step 10.2: Update `submitFlow` to save**

Replace `submitFlow` with:

```js
function submitFlow(form, resultsEl) {
  const answers = readAnswersFromForm(form);
  if (countAnswered(answers) < 18) return;
  const totals = scoreInventory(answers);
  const style = determineStyle(totals);
  writeUrl(answers);
  saveAnswers(answers);
  renderResults(resultsEl, totals, style);
}
```

- [ ] **Step 10.3: Update `init` to wire the restore prompt**

Replace `init` with:

```js
function init() {
  const form = document.getElementById("cs-form");
  const resultsEl = document.getElementById("cs-results");
  const restorePrompt = document.querySelector(".cs-restore-prompt");
  if (!form || !resultsEl) return;

  form.addEventListener("change", () => updateCounter(form));
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    submitFlow(form, resultsEl);
  });

  const urlAnswers = decodeAnswers(new URL(window.location.href).searchParams.get("a"));
  if (urlAnswers) {
    setAnswersOnForm(form, urlAnswers);
    const totals = scoreInventory(urlAnswers);
    const style = determineStyle(totals);
    renderResults(resultsEl, totals, style);
  } else if (restorePrompt && loadAnswers()) {
    restorePrompt.hidden = false;
    restorePrompt.querySelector("[data-cs-restore]").addEventListener("click", (e) => {
      e.preventDefault();
      const saved = loadAnswers();
      if (!saved) return;
      setAnswersOnForm(form, saved);
      updateCounter(form);
      restorePrompt.hidden = true;
    });
  }

  updateCounter(form);
}
```

- [ ] **Step 10.4: Test the restore flow**

Run: `npm run dev`. Complete the inventory, submit (writes localStorage). Visit the page directly (no `?a=`).
Expected: "Restore your last answers" link appears. Click it → radios populate, counter shows 18.
Stop the server.

- [ ] **Step 10.5: Commit**

```bash
git add js/communication-styles/app.js
git commit -m "feat(comm-styles): localStorage save with restore prompt"
```

---

## Task 11: "Start over" reset

**Files:**
- Modify: `js/communication-styles/app.js`

- [ ] **Step 11.1: Wire up the reset link inside `renderResults`**

Replace the `renderResults` function in `js/communication-styles/app.js` with:

```js
function renderResults(target, totals, style) {
  while (target.firstChild) target.removeChild(target.firstChild);

  target.appendChild(el("h2", { text: `Your style: ${style.style}` }));
  target.appendChild(buildQuadrant(totals));
  target.appendChild(buildSubscores(totals));
  target.appendChild(buildStyleCards(style));

  const actions = el("p", { class: "cs-actions" });
  const reset = el("a", { href: "#", "data-cs-reset": "", text: "Start over" });
  reset.addEventListener("click", (e) => {
    e.preventDefault();
    const form = document.getElementById("cs-form");
    form.reset();
    clearUrl();
    clearStorage();
    target.hidden = true;
    while (target.firstChild) target.removeChild(target.firstChild);
    const restorePrompt = document.querySelector(".cs-restore-prompt");
    if (restorePrompt) restorePrompt.hidden = true;
    updateCounter(form);
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  actions.appendChild(reset);
  target.appendChild(actions);

  target.hidden = false;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}
```

- [ ] **Step 11.2: Test reset**

Run: `npm run dev`. Complete the inventory, submit, click "Start over".
Expected: form resets, URL clears, results hide, scroll returns to the form.
Stop the server.

- [ ] **Step 11.3: Commit**

```bash
git add js/communication-styles/app.js
git commit -m "feat(comm-styles): start-over reset"
```

---

## Task 12: CSS components

**Files:**
- Modify: `css/components.css`

- [ ] **Step 12.1: Append the styles**

Append to `css/components.css`:

```css
/* Communication styles tool ---------------------------------------------- */

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.cs-intro {
  max-width: var(--measure);
  margin-bottom: var(--space-6);
}

.cs-credit {
  color: var(--colour-muted);
  font-size: var(--type-small);
}

.cs-restore-prompt {
  margin-bottom: var(--space-5);
  font-size: var(--type-small);
}

.cs-form {
  margin: 0 0 var(--space-7);
}

.cs-items {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.cs-item fieldset {
  border: 1px solid var(--colour-rule);
  border-radius: 4px;
  padding: var(--space-4);
  margin: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-3);
}

@media (min-width: 720px) {
  .cs-item fieldset {
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: var(--space-4);
  }
  .cs-statement-right { text-align: right; }
}

.cs-statement {
  margin: 0;
  font-size: var(--type-small);
  color: var(--colour-fg);
}

.cs-scale {
  display: flex;
  gap: var(--space-3);
  justify-content: center;
  padding: var(--space-2) 0;
}

.cs-scale-option {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: var(--space-2);
}

.cs-scale-option input[type="radio"] {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.cs-scale-dot {
  display: block;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  border: 2px solid var(--colour-fg);
  background: var(--colour-bg);
  transition: background-color 120ms ease;
}

.cs-scale-option input[type="radio"]:checked + .cs-scale-dot {
  background: var(--colour-fg);
}

.cs-scale-option input[type="radio"]:focus-visible + .cs-scale-dot {
  outline: 2px solid var(--colour-fg);
  outline-offset: 3px;
}

.cs-form-footer {
  margin-top: var(--space-6);
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--space-4);
}

.cs-counter {
  margin: 0;
  font-size: var(--type-small);
  color: var(--colour-muted);
}

.cs-submit {
  appearance: none;
  background: var(--colour-fg);
  color: var(--colour-bg);
  border: 0;
  padding: var(--space-3) var(--space-5);
  font: inherit;
  font-weight: 600;
  border-radius: 4px;
  cursor: pointer;
}

.cs-submit[disabled] {
  opacity: 0.4;
  cursor: not-allowed;
}

.cs-submit-help {
  margin: 0;
  font-size: var(--type-small);
  color: var(--colour-muted);
}

.cs-results {
  border-top: 1px solid var(--colour-rule);
  padding-top: var(--space-6);
  margin-top: var(--space-7);
}

.cs-quadrant {
  display: block;
  width: 100%;
  max-width: 28rem;
  margin: var(--space-5) 0;
  color: var(--colour-fg);
  aspect-ratio: 1 / 1;
}

.cs-quad-label {
  font-size: 4px;
  font-family: var(--font-sans);
  font-weight: 600;
  fill: currentColor;
}

.cs-quad-axis {
  font-size: 3px;
  font-family: var(--font-sans);
  fill: currentColor;
  opacity: 0.6;
}

.cs-quad-dot {
  fill: var(--colour-fg);
  stroke: var(--colour-bg);
  stroke-width: 0.6;
}

.cs-subscores {
  display: grid;
  gap: var(--space-3);
  margin: var(--space-5) 0;
  max-width: 28rem;
}

.cs-subscore {
  display: grid;
  grid-template-columns: 1fr auto 1fr auto;
  gap: var(--space-2);
  font-size: var(--type-small);
}

.cs-subscore dt { font-weight: 600; }
.cs-subscore dd { margin: 0; }

.cs-subscore-bar {
  grid-column: 1 / -1;
  height: 4px;
  background: var(--colour-rule);
  border-radius: 2px;
  overflow: hidden;
}

.cs-subscore-bar span {
  display: block;
  height: 100%;
  background: var(--colour-fg);
}

.cs-style-cards {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: 1fr;
  margin: var(--space-6) 0;
}

@media (min-width: 720px) {
  .cs-style-cards { grid-template-columns: repeat(2, 1fr); }
}

.cs-style-card {
  border: 1px solid var(--colour-rule);
  border-radius: 4px;
  padding: var(--space-4);
}

.cs-style-card h3 { margin-top: 0; }

.cs-style-card-mine {
  border-color: var(--colour-fg);
  background: var(--colour-code-bg);
}

.cs-mine-badge {
  font-size: var(--type-small);
  font-weight: 400;
  color: var(--colour-muted);
  margin-left: var(--space-2);
}

.cs-portrait {
  font-style: italic;
  color: var(--colour-muted);
}

.cs-actions {
  margin-top: var(--space-5);
}
```

- [ ] **Step 12.2: Browser walkthrough**

Run: `npm run dev`. Visit the tool.
Verify visually:
- On desktop (≥720px): statement left, scale centre, statement right per row.
- On narrow viewports (<720px): rows stack.
- Radio dots hover, click, focus-visible has a visible outline.
- Submit button styles update when enabled.
- After submitting: quadrant is square (`aspect-ratio: 1/1`), dot visible inside, sub-score bars render, four style cards lay out in two columns on desktop, one highlighted.

Stop the server.

- [ ] **Step 12.3: Commit**

```bash
git add css/components.css
git commit -m "feat(comm-styles): styles for inventory and results"
```

---

## Task 13: Delete the prototype HTML

**Files:**
- Delete: `docs/communicationstyles.html`

- [ ] **Step 13.1: Remove the prototype**

Run:

```bash
git rm docs/communicationstyles.html
git commit -m "chore: remove communicationstyles.html prototype"
```

---

## Task 14: Final verification

No code changes — verification only. Each substep is a check; do not commit anything.

- [ ] **Step 14.1: Run the test suite**

Run: `npm test`
Expected: all scoring tests PASS.

- [ ] **Step 14.2: Build the site**

Run: `npm run build`
Expected: clean build. Verify `_site/tools/communication-styles/index.html` exists with `ls _site/tools/communication-styles/index.html`.

- [ ] **Step 14.3: Browser walkthrough on `npm run dev`**

Walk through each scenario; note any failure.

1. **Golden path:** visit `/tools/communication-styles/` via the Tools nav link, answer all 18 items, submit. Results render and scroll into view, naming a style, showing a dot inside the quadrant, sub-scores, four style cards with one highlighted.
2. **URL share:** copy the URL with `?a=...`, open in a new tab. Form pre-fills, results auto-render with the same dot position.
3. **localStorage restore:** clear the URL (visit `/tools/communication-styles/` cleanly after a previous submission). "Restore your last answers" link appears. Click it → radios populate, counter shows 18.
4. **Start over:** from the results, click "Start over" → form resets, URL clears, scroll returns to the form, restore prompt is hidden.
5. **Edge — change after submit:** change one answer after submitting (without re-submitting). URL still reflects the previous result. Submit again → URL updates.
6. **Mobile viewport (~360px wide):** items stack, scale stays touch-friendly, results render readably.
7. **Keyboard:** Tab through the form. Within each fieldset, the 4 radios are reachable via arrow keys (native radiogroup behaviour). The submit button is reachable. Tab through results.
8. **Screen reader (VoiceOver, Cmd+F5 on macOS):** radios announce "Strongly agrees with: …" / "Leans toward: …"; on submit, the results region announces the heading.

If any step fails, stop and report the failure. Do not mark the implementation done.

---

## Self-review against the spec

After this plan is followed, each spec requirement is covered:

- **Placement at `/tools/communication-styles/`** → Tasks 5, 6.
- **Three regions (intro, inventory, results)** → Task 6.
- **18 paired statements, 4-radio scale, counter, disabled submit** → Tasks 6, 7.
- **Scoring per the dimension map; invariants tested** → Tasks 1, 2.
- **Style assignment with defensive ties** → Task 3.
- **Quadrant SVG, sub-scores, style cards, highlighted user style** → Task 8.
- **localStorage save + Restore prompt + versioned key** → Task 10.
- **URL encode/decode + auto-render** → Tasks 4, 9.
- **Start over clears all state** → Task 11.
- **Attribution on the intro** → Task 6.
- **Nav Tools link** → Task 5.
- **Accessibility: fieldset/legend, aria-live, visually-hidden labels, SVG title/desc, focus-visible** → Tasks 6, 8, 12.
- **CSS scoped under `.cs-*`** → Task 12.
- **Delete the prototype HTML** → Task 13.
- **Final build + browser verification** → Task 14.
