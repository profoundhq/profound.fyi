---
layout: layouts/laws-entry.njk
title: Ubiquitous Language
tier: Principle
slug: ubiquitous-language
related: [bounded-contexts, conceptual-integrity]
---

The people who build the software and the people who use it must use the same words to mean the same things. The vocabulary is the design.

**How to use it.** When users and engineers use different words for the same thing, or the same word for different things, the model is wrong. Listen to the domain experts. Use their words in code, schema, conversation, and documentation. Translation costs are usually a sign that the model needs to change.

**How it gets misused.** Treated as a naming exercise. Ubiquitous Language is a discipline of *modelling*. The words reflect the underlying concepts. Renaming variables without rethinking the model is theatre.
