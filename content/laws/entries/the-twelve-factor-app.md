---
layout: layouts/laws-entry.njk
title: The Twelve-Factor App
tier: Principle
slug: the-twelve-factor-app
related: [continuous-delivery, observability]
front: "Twelve practices for building software-as-a-service applications that are portable, scalable, and operable. Codebase, dependencies, config, backing services, build/release/run, processes, port binding, concurrency, disposability, dev/prod parity, logs, and admin processes."
---

**How to use it.** Use it as a diagnostic for legacy systems being modernised. The factor that is most violated is usually the largest pain point. Config in code, processes that store state, and dev environments that diverge from prod are each a 12-factor failure. They create the problems teams keep trying to solve with tooling.

**How it gets misused.** Treated as a Kubernetes prerequisite. The factors apply to any deployable software. Most of them are about operability rather than container orchestration. You can run a 12-factor app on bare metal. You can run a non-12-factor app on Kubernetes and suffer.
