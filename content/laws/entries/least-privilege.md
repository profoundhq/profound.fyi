---
layout: layouts/laws-entry.njk
title: Least Privilege
tier: Principle
slug: least-privilege
related: [defence-in-depth]
front: "Give every part of the system the smallest set of permissions it needs to do its job, and no more."
---

**How to use it.** Start with no permissions. Add what is needed. Audit what is granted. Most production breaches are made worse by accounts and services that had powers they did not need.

**How it gets misused.** Applied at setup and never revisited. Permissions accrete. The system you run today probably has accounts with powers nobody remembers granting and nobody dares to remove.
