---
layout: layouts/laws-entry.njk
title: Law of Demeter
tier: Principle
slug: law-of-demeter
related: [solid, hexagonal-architecture]
front: "A piece of code should only talk to its immediate neighbours. It should not reach through them to talk to strangers."
---

**How to use it.** Count the dots. `a.b.c.d()` is a smell. If testing one thing means setting up seven others, you have probably broken this rule.

**How it gets misused.** Applied to data structures. The rule covers behaviour between objects. Reading values from a record is fine.
