---
layout: layouts/laws-entry.njk
title: Continuous Integration
tier: Practice
slug: continuous-integration
related: [trunk-based-development, continuous-delivery, test-driven-development]
---

Every change is merged to a shared trunk at least daily, with automated verification.

**How to use it.** The discipline is the daily merge. The build server only supports it. Long-lived branches are the problem CI was invented to solve. If changes take a day to integrate, you are doing scheduled integration with a CI server attached.

**How it gets misused.** "We have CI" used to mean "we have Jenkins". You need the tool, but it is not enough. Without the daily merge, the tool runs and the practice does not exist.
