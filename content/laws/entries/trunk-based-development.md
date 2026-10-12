---
layout: layouts/laws-entry.njk
title: Trunk-Based Development
tier: Practice
slug: trunk-based-development
related: [continuous-integration, continuous-delivery]
---

Everyone works on a single shared branch. Features ship behind flags until ready. Branches last hours rather than days.

**How to use it.** Use it when you want fast feedback and high deploy frequency. It pairs with CI and Continuous Delivery, and the three reinforce each other. You cannot have long-lived branches and trunk-based development at the same time.

**How it gets misused.** Confused with "no branches at all". Short-lived branches are fine. The thing to avoid is branches that diverge from trunk for days or weeks. The integration cost grows non-linearly with branch age.
