---
layout: layouts/laws-entry.njk
title: Fail-Safe Defaults
tier: Principle
slug: fail-safe-defaults
related: [least-privilege, defence-in-depth]
---

When something goes wrong or is unspecified, the system should refuse access.

**How to use it.** Default to deny, and grant access only by explicit rule. The opposite (default allow with an explicit deny list) is how forgotten endpoints leak data.

**How it gets misused.** Confused with "secure by default". Fail-safe covers what happens during failure or ambiguity. A system can have safe defaults at startup and still fail open when something breaks.
