---
layout: layouts/laws-entry.njk
title: Hyrum's Law
tier: Principle
slug: hyrums-law
related: [postels-law, idempotency]
front: "If your software has enough users, every behaviour they can observe will become something they depend on, even if you never promised it."
---

**How to use it.** Write down what you actually promise. Deliberately vary the things you do not promise, such as the order of results, the exact wording of error messages, and the timing. Make the rules explicit before users invent their own.

**How it gets misused.** Used to refuse all change. The point is to plan for the problem.
