# Communication Styles mini app

**Status:** design

**Date:** 2026-05-12

A self-assessment tool that scores a user against the Platinum Rule communication-styles model (Tony Alessandra), places them on the Open/Guarded × Direct/Indirect quadrant, and offers guidance for flexing toward other styles.

## Purpose

Serve two audiences from one page:

- **Public visitors** — a short self-assessment with a memorable, shareable result.
- **Workshop participants** — a quick way to take the inventory during a session, surface the result, and use the style cards as a reference for the debrief.

Both audiences want the same thing: take it, see your style, learn how to flex.

## Placement

A new top-level `/tools/` section, with `/tools/communication-styles/` as its first occupant. No `/tools/` index page yet — link directly from the site nav. Promote to an index when a second tool exists.

Site nav gains a "Tools" link between Playbooks and About.

## Page structure

Three regions on one page, rendered through `layouts/page.njk`:

1. **Intro.** What this is, ~3 minutes to complete, what you'll get, credit line: "Adapted from the Platinum Rule by Tony Alessandra" with a link to the UNC mentoring PDF.
2. **Inventory.** 18 paired-statement items. Each item is a `<fieldset>` with a `<legend>` (left and right statements) and four radio inputs in a horizontal scale. A live "X of 18 answered" counter. A "See your style" button, disabled until all 18 are answered.
3. **Results.** Appears after submit (`aria-live="polite"`, scrolled into view). Contains the quadrant chart, the four sub-scores, the user's named style, and four style cards.

## Inventory mechanics

### Input primitive

Four radio inputs per row, not range sliders. Reasons:

- Forces an explicit one-of-four choice; no ambiguous default position.
- Better screen-reader and keyboard behaviour out of the box.
- Renders reliably without custom slider CSS.

The visual treatment is still a horizontal scale: left statement, four boxes, right statement.

### Scoring

Each radio position carries an integer 0–3 (0 = strongly agrees with left statement, 3 = strongly agrees with right).

For each row, derive two sub-scores:

- `A = 3 - position` (left-statement weight)
- `B = position` (right-statement weight)

The 18 rows map to four dimensions per the existing prototype mapping:

| Dimension | Sum of |
| --- | --- |
| **Open** | 1A, 3B, 5A, 7B, 9A, 11B, 13A, 15B, 17A |
| **Guarded** | 1B, 3A, 5B, 7A, 9B, 11A, 13B, 15A, 17B |
| **Direct** | 2B, 4A, 6B, 8A, 10B, 12A, 14B, 16A, 18B |
| **Indirect** | 2A, 4B, 6A, 8B, 10A, 12B, 14A, 16B, 18A |

Invariants: `Open + Guarded == 27` and `Direct + Indirect == 27` for any completed inventory. These are used as test assertions.

### Style assignment

The two axes (Open vs Guarded, Direct vs Indirect) determine the named style:

| | Direct | Indirect |
| --- | --- | --- |
| **Open** | Socialiser | Relater |
| **Guarded** | Director | Thinker |

### Ties

If `Open == Guarded` or `Direct == Indirect`, do not pick arbitrarily. The result names the boundary explicitly, e.g. "You sit on the line between Director and Socialiser", and shows both adjacent style cards as primary. This reads as honest and is useful in workshop debriefs.

## Result visualisation

### Quadrant chart

Inline SVG, 2×2 grid. Roughly 400×400 logical pixels, scales fluidly.

- **X axis:** Indirect (left) ↔ Direct (right). Position = `(Direct - Indirect) / 27`, mapped to −1..+1.
- **Y axis:** Guarded (bottom) ↔ Open (top). Position = `(Open - Guarded) / 27`, mapped to −1..+1.
- Four corner labels: Relater (top-left), Socialiser (top-right), Thinker (bottom-left), Director (bottom-right).
- Faint cross-hair through the origin.
- A single dot placed at the user's coordinates.

### Sub-scores

Below the chart, four small horizontal bars showing the raw sub-scores: "Open 14 / Guarded 13", etc. The dot alone hides how close to the centre someone sits; these bars provide magnitude.

### Style cards

Four cards, one per style. The user's own style (or both adjacent styles in the tie case) is visually highlighted. Each card has three lines:

- A one-sentence portrait.
- "At their best".
- "How to flex toward this style when you're not one."

Copy drafted in plain British English; Benedict to review and rewrite in his voice before merge.

### Why SVG, not Canvas

Scales cleanly across viewports, keyboard-inspectable, screenshot-friendly for sharing.

## Persistence

### localStorage

Key: `profound-comm-styles-v1`

Value (JSON):

```
{
  "answers": [0..3, 0..3, ...18 entries...],
  "computedAt": "2026-05-12T10:00:00Z"
}
```

On page load with no URL params: if a stored value exists, do not auto-render results. Show a small "Restore your last answers" link above the form; clicking it populates the radios silently.

The `-v1` suffix lets us bump the key if the scoring scheme changes.

### URL encoding

After submit, replace the URL using `history.replaceState` with `?a=<digits>`, where `<digits>` is the 18-character string of positions, e.g. `?a=012301230123012301`.

On load: if `?a=...` matches `^[0-3]{18}$`, populate the radios and auto-render results. Invalid or missing → fall through to the localStorage restore prompt.

Plain digits over base32: 18 characters is short enough, and the URL is human-debuggable.

### Clearing

A small "Start over" link in the results region clears the URL params, clears localStorage, resets the form, and scrolls back to the top.

## Files

### Create

- `content/tools/communication-styles.njk` — page template. Sets `permalink: /tools/communication-styles/`. Renders the intro, 18-row form, results container, credit footer. Uses `layouts/page.njk`. Includes a one-off `<script src="/js/communication-styles.js" defer>` at the bottom.
- `js/communication-styles.js` — all behaviour: counter, validation, scoring, URL encode/decode, localStorage read/write, results render. Vanilla JS, no framework.

### Modify

- `_includes/partials/site-header.njk` — add `<a href="/tools/communication-styles/">Tools</a>` between Playbooks and About.
- `css/components.css` — append component blocks scoped under `.cs-scale`, `.cs-counter`, `.cs-quadrant`, `.cs-subscores`, `.cs-style-cards`, `.cs-style-card`. New classes only; no impact on existing components.

### Delete

- `docs/communicationstyles.html` — its job is done; replaced by the live page.

## Accessibility

- Each item is a `<fieldset>` with `<legend>` containing both statements. Radio inputs grouped by `name`. Each radio carries a visually-hidden `<label>` of the form "Strongly agrees with: <left statement>", "Leans toward: <left statement>", "Leans toward: <right statement>", "Strongly agrees with: <right statement>". Visible labels on the scale are decorative dots only.
- Counter and results region use `aria-live="polite"`.
- Submit button disabled and `aria-disabled` while the form is incomplete; states an explicit reason in `aria-describedby`.
- Quadrant SVG has a `<title>` and `<desc>`; the dot has a `<title>` with the user's coordinates and style.
- Verified by tab traversal and VoiceOver pass on macOS during the build.

## Verification

This is static + vanilla JS, so verification is:

- **Scoring sanity (manual JS console or tiny test file):**
  - All-zero input → Open + Guarded == 27, Direct + Indirect == 27.
  - All-three input → same invariant.
  - One hand-computed example to confirm the dimension mapping matches the prototype.
- **Browser walkthrough on `npm run dev`:**
  - Golden path: complete form, submit, results render and scroll into view.
  - Refresh: localStorage restore link appears; clicking it repopulates radios.
  - URL share: copy URL with `?a=...` into a new tab; results auto-render with same dot.
  - Tie case: hand-construct answers that tie an axis; results name the boundary.
  - "Start over" clears state and returns to a blank form.
- **Accessibility:** tab through all 18 fieldsets; confirm radios announce in VoiceOver; confirm submit-button state changes and results announce on submit.

## Out of scope

- A `/tools/` index page (defer until there's a second tool).
- Server-side persistence, user accounts, or analytics events for the inventory itself.
- Translating the inventory into multiple languages.
- Exporting results as PDF or image.

## Attribution

Visible credit line on both the intro and the results region:

> Adapted from the Platinum Rule communication-styles model by Tony Alessandra. Source: [UNC OGE Faculty Mentoring handout](https://ogefacultymentoring.web.unc.edu/wp-content/uploads/sites/11490/2016/09/Communucation-Styles-Inventory.pdf).
