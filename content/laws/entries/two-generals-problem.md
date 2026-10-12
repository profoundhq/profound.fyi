---
layout: layouts/laws-entry.njk
title: Two Generals' Problem
tier: Law
slug: two-generals-problem
related: [cap-theorem, flp-impossibility, idempotency]
front: "Two parties communicating over an unreliable channel cannot guarantee they have agreed on anything."
---

**How to use it.** Stop trying to design protocols where both sides know for certain that the other has received the message. The guarantee is impossible. Pick a side that bears the risk, or accept "good enough" agreement.

**How it gets misused.** Treated as an abstract puzzle. Every payment system, every distributed lock, every "did the message get through" question hits this. It is the reason exactly-once delivery is a lie.
