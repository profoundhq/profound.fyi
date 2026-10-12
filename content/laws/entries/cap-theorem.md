---
layout: layouts/laws-entry.njk
title: CAP Theorem
tier: Law
slug: cap-theorem
related: [two-generals-problem, flp-impossibility, fallacies-of-distributed-computing]
---

When part of a distributed system is cut off, you must choose between consistent data and available service.

**How to use it.** The trade-off only matters when the connection between your machines breaks. Decide what your system should do *during* a break. Normal running does not force the choice.

**How it gets misused.** "Pick two of three." You cannot choose whether breaks happen. They happen anyway. You only choose what to give up when they do.
