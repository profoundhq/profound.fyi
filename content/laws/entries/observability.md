---
layout: layouts/laws-entry.njk
title: Observability
tier: Principle
slug: observability
related: [feedback-loops, blameless-retrospectives]
front: "You cannot run, fix, or improve what you cannot see. Build systems that explain themselves."
---

**How to use it.** For every important behaviour, ask "how would I know this is happening". If the answer is "I would not", add logs, metrics, or traces. Treat observability as a feature and build it in from the start.

**How it gets misused.** Confused with monitoring. Monitoring tells you when known things go wrong. Observability lets you ask new questions of the system after the fact, including ones you did not think to ask in advance.
