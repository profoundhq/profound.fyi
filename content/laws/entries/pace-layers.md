---
layout: layouts/laws-entry.njk
title: Pace Layers
tier: Pattern
slug: pace-layers
related: [lehmans-laws-of-software-evolution, technical-debt]
front: "Different parts of a system change at different rates. Fast layers innovate. Slow layers stabilise. Each layer constrains and is constrained by its neighbours."
---

**How to use it.** Identify which layer a proposed change belongs in. Fast (UI, features, content) can change weekly. Slow (data model, core domain, integrations) should change quarterly or yearly. Trying to make slow layers move fast breaks things downstream.

**How it gets misused.** Used as an excuse for not changing the slow layers ever. Slow layers *should* change, deliberately and with care, when the time is right. Permanent stasis is a different problem.
