---
layout: layouts/laws-entry.njk
title: Defence in Depth
tier: Principle
slug: defence-in-depth
related: [least-privilege]
front: "Build several independent layers of protection. Assume any single layer will fail."
---

**How to use it.** For anything that matters, ask "what protects this if the firewall is wrong, the auth is bypassed, or the input was crafted to slip past the filter?". No layer should depend on the others working.

**How it gets misused.** Treated as "more security is better security". Layers that share assumptions do not count as separate. Six checks that all trust the same input value will all fail together.
