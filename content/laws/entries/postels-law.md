---
layout: layouts/laws-entry.njk
title: Postel's Law
tier: Principle
slug: postels-law
related: [hyrums-law, bounded-contexts]
---

Be strict about what you send. Be flexible about what you accept. *This advice is now contested.*

**How to use it.** In modern systems, prefer being strict in both directions. Flexibility was right for the early internet. It is mostly wrong now.

**How it gets misused.** Quoted as timeless wisdom. It has caused real problems: protocols that cannot evolve and errors that pass silently. Read it alongside Hyrum's Law.
