---
title: "Worked Example"
order: 60
updated: 2026-10-12
tags:
  - beat-network
---

A Beat Network for an organisation adopting a product operating model might contain three sets of changes: Topology (how teams are shaped and bounded), Sensing (how the organisation knows what is happening), and Capability (how people develop the skills the new model requires). Below is a sketch of how the first few beats and gates might look.

![Three lines of change, Topology, Sensing, and Capability, with gates where T4 and C3 wait on S3 and C2 waits on T3](/images/playbooks/beat-network/beat-network-worked-example.svg)

*Dots are beats, in order along each line. Dashed arrows are gates. Position shows order and dependency. It never shows dates.*

## Changes: Topology

1. **T1.** Leadership agrees that the current project-based team structure creates handoffs that slow delivery and fragment ownership.
2. **T2.** A topology catalogue identifies which current teams map to recognised team patterns and interaction modes.
3. **T3.** One value stream is selected as a pilot, and its teams are re-bounded around a single product with clear ownership.
4. **T4.** The pilot team demonstrates reduced handoffs and faster cycle time, creating evidence for the next re-bounding. *[Gate: requires S3]*

## Changes: Sensing

1. **S1.** The organisation acknowledges that it currently has no consistent way to measure team health, flow, or cognitive load.
2. **S2.** A sensing framework is agreed, defining six signals and the cadence at which each is collected.
3. **S3.** The pilot team from the Topology changes has baseline measurements for all six signals, establishing the condition from which improvement can be observed.

## Changes: Capability

1. **C1.** Teams identify the skills gap between their current ways of working and what the product model requires.
2. **C2.** An enabling team is formed to coach the pilot team through the transition, providing hands-on pairing rather than training courses. *[Gate: requires T3]*
3. **C3.** The pilot team reports reduced cognitive load from the new structure, validating that the capability investment is landing. *[Gate: requires S3]*

## Reading the gates

T4 cannot claim success without the sensing baseline from S3. C2 cannot start coaching until a pilot team exists (T3). C3 cannot validate its own impact without sensing data (S3). These dependencies are not scheduling constraints. They are logical necessities. Getting them wrong is how change programmes produce activity without progress.
