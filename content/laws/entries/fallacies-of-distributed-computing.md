---
layout: layouts/laws-entry.njk
title: Fallacies of Distributed Computing
tier: Principle
slug: fallacies-of-distributed-computing
related: [cap-theorem, two-generals-problem, idempotency]
front: "Eight things people wrongly assume about networked systems: the network is reliable, there is no delay, bandwidth is unlimited, the network is secure, the topology never changes, there is one administrator, moving data is free, the network is uniform."
---

**How to use it.** Use it as a checklist on every design that crosses a network. Every production incident is one of the eight showing up.

**How it gets misused.** Teams acknowledge them in design documents and ignore them in code. The fallacies bite when you build.
