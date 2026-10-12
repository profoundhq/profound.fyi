---
layout: layouts/laws-entry.njk
title: SOLID
tier: Principle
slug: solid
related: [becks-four-rules-of-simple-design, conceptual-integrity]
---

Five rules for designing object-oriented code: each class does one thing, code should be open to extension but closed to modification, subclasses should be substitutable, interfaces should be small, and code should depend on abstractions rather than specifics.

**How to use it.** The first and last rules carry most of the weight. Apply them at the boundaries between modules. There is no need to apply them inside every class.

**How it gets misused.** Treated as the only valid way to design code. SOLID is one approach. Functional and data-oriented designs reach the same goals by different routes.
