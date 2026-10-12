---
title: "Primitives"
order: 10
updated: 2026-10-12
tags:
  - beat-network
---

The method uses six primitives. No more, no fewer.

**Beat** - A single change move, expressed as one complete sentence. One job per beat. If it does two things, split it. If you can move it elsewhere in the changes without breaking the logic, the bridge is not built.

**Changes** - An ordered sequence of beats representing one coherent line of change. A set of changes has a name, a clear scope, and an owner. It should be legible end-to-end by the people living through it. Like a chord progression in jazz, the changes provide structure without prescribing execution. Everyone follows the same changes but interprets them in context.

**Gate** - A named synchronisation point where a beat in one set of changes depends on a beat in another set having landed. Gates are explicit and directional. If changes A depends on changes B at this point, name the gate, name both beats, and say why.

**Condition** - The current observable state of the ground that makes a beat possible, independent of other changes. Before attempting a beat, articulate the current condition. If the ground is not ready, no amount of upstream completion helps.

**Signal** - The observable evidence that a beat has landed. Without a signal, you are guessing. Signals are drawn from an agreed sensing framework appropriate to the domain.

**Stall** - A signal does not arrive within the expected window. A stall forces a decision: wait, re-sequence, rework the beat, or dissolve the changes. Stalls are not failures. They are the method working correctly.

## How the primitives relate

A gate asks: what cross-cutting dependency must be satisfied before this beat can fire? A condition asks: what is the state of the ground right now, regardless of other changes? A signal asks: how will we know this beat has landed? These are three different questions. A beat can have a gate, a condition, both, or neither, but it must always have a signal.

Gates create the network topology. Conditions ground the network in reality. Signals validate progress. Stalls trigger adaptation. Together they prevent the two most common failure modes in change programmes: the fantasy plan (all gates, no conditions) and the drift plan (no gates, no signals, movement without direction).

## Intellectual lineage

The beat sheet structure comes from screenwriting, where studios needed a way to verify that a story worked before committing to production. The flat sequential discipline and the position test (can you move this beat elsewhere without breaking logic?) are directly borrowed.

The condition primitive draws on improvement kata, specifically the practice of understanding the current condition before establishing a target condition. The signal primitive draws on sensing practices developed for sociotechnical organisation design. The stall response pattern draws on improvement science: stalls are not failures but feedback.

The naming of "changes" draws on jazz, where "the changes" are the chord progression that musicians improvise over. The changes provide structure without prescribing execution. Unlike a classical score, the changes are revised through performance, not fixed before it. The network structure itself is closest to the dependency graphs found in game design, adapted for contexts where the graph is being designed and revised concurrently with execution.
