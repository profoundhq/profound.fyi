---
title: "Writing Beats"
order: 20
updated: 2026-10-12
tags:
  - beat-network
---

## Beats

1. Each beat is a complete sentence. No noun phrases, no bullet fragments, no hiding in abstraction.
2. One job per beat. If a beat is trying to do two things, split it.
3. Each beat must earn the next. It forms a bridge from the previous beat to the next one. That is its only job.
4. The position test: could you move this beat elsewhere in the changes without breaking the logic? If yes, the bridge is not built yet.
5. If two beats are doing the same thing, merge them.
6. Every beat must have at least one signal. If you cannot say how you would know the beat has landed, the beat is not concrete enough.

## Changes

1. A set of changes has a name, a scope, and an owner.
2. Start by writing the first beat and the last beat. These form the container. The first beat grabs attention and establishes the current problem or opportunity. The last beat describes the state the changes are trying to reach.
3. Fill in the middle. Each intermediate beat bridges from the one before to the one after.
4. Read the changes straight through. Does the argument hold? Does each beat earn the next? Does it land?
5. A set of changes should be legible to the people living through it. If they cannot read it end-to-end and see themselves in it, it is too abstract.

## Connections

1. Gates are explicit and named. If changes A depends on changes B at this point, write it down: the gate name, the source beat, the target beat, and the reason.
2. Gates are directional. Changes A waiting on changes B does not imply changes B is waiting on changes A.
3. Every set of changes must be dissolvable without breaking surviving changes, unless the dependency is a named gate. If dissolving changes C would silently break changes D, there is an unnamed gate.
4. Minimise gates. Each gate is a coordination cost. If two sets of changes have more than three gates between them, consider whether they are really one set of changes.
