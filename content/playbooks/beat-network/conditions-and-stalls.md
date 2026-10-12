---
title: "Conditions and Stalls"
order: 30
updated: 2026-10-12
tags:
  - beat-network
---

## Conditions

1. Before attempting a beat, articulate the current condition. What is actually true on the ground right now?
2. A condition is not the same as a gate. A gate is a dependency on another set of changes. A condition is the state of the ground this beat needs to work on, which may have nothing to do with other changes.
3. If the condition is not met, the beat cannot fire regardless of gate status. This prevents the most common failure in change work: executing a structurally sound plan on ground that is not ready.

## Stalls

1. A stall is when a signal does not arrive. It is not a failure. It is information.
2. A stall forces one of four responses: wait (the signal may still arrive), re-sequence (this beat belongs later), rework (the beat itself is wrong), or dissolve (this set of changes or this beat is not viable).
3. Stalls propagate through gates. If beat 4 in changes A stalls, and beat 6 in changes B has a gate on it, changes B now has a downstream stall. Making this visible is one of the primary functions of the network.
