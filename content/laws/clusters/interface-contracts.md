---
layout: layouts/laws-page.njk
title: The Interface Contracts cluster
slug: interface-contracts
tagline: "What you promise, what you accept, what your users come to depend on."
entries: [postels-law, hyrums-law, idempotency, bounded-contexts, ubiquitous-language]
---

*What you promise, what you accept, what your users come to depend on.*

- [Postel's Law](/laws/postels-law/)
- [Hyrum's Law](/laws/hyrums-law/)
- [Idempotency](/laws/idempotency/)
- [Bounded Contexts](/laws/bounded-contexts/)
- [Ubiquitous Language](/laws/ubiquitous-language/)


### Why these together

Postel and Hyrum together describe the contract problem. Be liberal in what you accept, and your users will find every quirk and depend on it. Idempotency makes the contract survive retries. Bounded Contexts and Ubiquitous Language take the same problem upstream, into how the model itself names and shapes its promises.
