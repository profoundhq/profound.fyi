---
layout: layouts/laws-entry.njk
title: Amdahl's Law
tier: Law
slug: amdahls-law
related: [gustafsons-law, littles-law]
front: "Adding more processors only helps with the parts of the work that can run in parallel."
---

**How to use it.** Find the part of the work that has to run in order. That part sets your speed limit. If 20% of the work is sequential, you cannot go faster than 5x, however many processors you add.

**How it gets misused.** People quote it to argue against parallel work entirely. The law sets a limit on the gain. It does not say the gain is worthless.
