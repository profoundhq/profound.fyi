---
layout: layouts/laws-entry.njk
title: Hexagonal Architecture (Ports and Adapters)
tier: Pattern
slug: hexagonal-architecture
related: [bounded-contexts, solid]
---

Put the domain at the centre. Surround it with ports (the contracts the domain offers) and adapters (the code that connects ports to the outside world).

**How to use it.** When the domain logic keeps getting tangled with database, UI, or framework concerns, the architecture is leaking. Push everything outward into adapters. The domain should be testable without any of them.

**How it gets misused.** Treated as an excuse for ceremony. Five adapters and three ports for a simple CRUD service is theatre. The architecture pays off where the domain is genuinely complex and the surrounding tech changes faster than the rules.
