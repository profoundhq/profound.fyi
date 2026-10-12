---
layout: layouts/laws-entry.njk
title: FLP Impossibility
tier: Law
slug: flp-impossibility
related: [cap-theorem, two-generals-problem]
---

In a distributed system where any one node might fail, you cannot guarantee that all working nodes will agree on a value within a fixed time.

**How to use it.** Every consensus system (Raft, Paxos, blockchains) makes a trade. Usually it gives up the time guarantee. Know which one your tools have given up before you build on them.

**How it gets misused.** Used to argue that distributed consensus is impossible. The result rules out one specific combination of guarantees. Consensus itself remains possible.
