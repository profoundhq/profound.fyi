---
layout: layouts/laws-entry.njk
title: Continuous Delivery
tier: Principle
slug: continuous-delivery
related: [continuous-integration, trunk-based-development, the-three-ways]
---

Keep software in a state where it could be released to users at any moment, by anyone, with confidence.

**How to use it.** Treat every change as if it will ship today. That means automated tests, automated deployment, trunk-based development, and small batches. The pressure of "could ship now" exposes every weakness in the delivery pipeline that batch releases hide.

**How it gets misused.** Confused with continuous deployment, which ships every change automatically. Continuous Delivery means a change could ship, and the business decides whether it does. Mixing them up tangles the argument about pace with the argument about readiness.
