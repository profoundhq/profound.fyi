---
layout: layouts/laws-entry.njk
title: Idempotency
tier: Principle
slug: idempotency
related: [two-generals-problem, hyrums-law, fallacies-of-distributed-computing]
front: "An operation should produce the same result whether you run it once or run it ten times."
---

**How to use it.** Design every operation that crosses a network this way. Retries become safe. Failure modes shrink. "Did the message arrive" stops being a panic.

**How it gets misused.** Treated as something only relevant to APIs. Idempotency matters for jobs, scripts, deploys, and migrations: anywhere a thing might run twice by accident.
