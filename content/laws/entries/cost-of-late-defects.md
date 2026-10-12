---
layout: layouts/laws-entry.njk
title: Cost of Late Defects (Boehm's 1:10:100)
tier: Pattern
slug: cost-of-late-defects
related: [feedback-loops, test-driven-development]
front: "A defect found during design costs roughly 1 unit to fix. Found during testing it costs 10. Found in production it costs 100."
---

**How to use it.** Use it to argue for moving checks earlier: automated tests, code review, contract tests, and design review. The earlier you catch a defect, the cheaper it is.

**How it gets misused.** The exact multipliers are disputed and depend heavily on context. Use the shape of the curve and ignore the specific numbers. Quoting "100x" as fact overclaims.
