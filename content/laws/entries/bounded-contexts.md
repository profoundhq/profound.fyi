---
layout: layouts/laws-entry.njk
title: Bounded Contexts
tier: Principle
slug: bounded-contexts
related: [ubiquitous-language, hexagonal-architecture]
---

Different parts of a system can use the same word to mean different things. Draw an explicit boundary around each meaning and translate at the seam.

**How to use it.** When a word such as "customer", "order", or "account" means different things to different teams, you have found a boundary. Make it visible. Each context has its own model, vocabulary, and database schema. Translating between contexts is explicit work.

**How it gets misused.** Treated as a microservices technique. Bounded contexts are about meaning. You can have several inside a monolith, or one spread across several microservices. The boundary lives in the language and the model.
