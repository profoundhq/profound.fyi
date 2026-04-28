---
title: "The Adoption Sequence"
order: 40
tags:
  - agentic-ai-for-teams
---


Adoption should be sequenced deliberately, not left to emerge organically. The following sequence is adapted from Bryan Finster's work on delivery improvement and applied to the specific context of Agentic AI adoption.

## Step 1: Clarify the work

Before introducing any agentic tooling, clarify what the team actually does and how work flows through their system. Use value stream mapping to expose handoffs, unclear ownership, missing tests, undocumented contracts, and invisible dependencies.

This step serves two purposes. First, it creates the baseline against which you measure whether Agentic AI is actually helping. Without it, you cannot distinguish "we feel faster" from "we are delivering more value." Second, it surfaces the delivery discipline gaps that must be addressed before agents can be safely trusted with autonomy.

This is not a heavyweight assessment. A single value stream mapping session with the team, focused on a representative piece of work from idea to production, will surface enough. The output is a shared understanding of where work gets stuck, where quality is at risk, and where the team's practices have gaps.

**At the team level:** the clarify step also names the team's current mode (solo-mediated, shared-context, pair-with-agent, or orchestrated multi-agent) and the practices it has or lacks. This is not a separate assessment; it emerges from the same value stream conversation. If work stalls in code review because agent-authored pull requests are being reviewed line-by-line, the team lacks the agent-aware code review practice. If each developer is running their own agent with no shared context, the team is in solo-mediated mode by default rather than by choice. Naming these is the first step toward deciding whether the current mode and practices are adequate for the work the team is actually doing.

## Step 2: Harden the guardrails

Address the gaps surfaced in step 1 before introducing agentic tooling at scale. The specific investments depend on what the value stream mapping revealed, but typically include:

**Test coverage.** Not 100% coverage for its own sake, but sufficient coverage of critical paths that an agent producing incorrect code will be caught before it reaches production. The tests become the safety net that makes agent autonomy possible.

**CI/CD maturity.** Continuous integration that actually runs on every change. Deployment pipelines that gate on test results. The ability to deploy frequently and roll back quickly. Without this, agent-produced code has no safe path to production.

**Observability.** The ability to see what is happening in production, detect anomalies, and trace problems to their source. When agents produce code at volume, some of it will have subtle problems that tests miss. Observability is the second safety net.

**API contracts.** Clear, documented, versioned interfaces between services. When agents operate across service boundaries, they need explicit contracts to work from. Undocumented APIs become fragile points of failure at agent speed.

This step often feels like a delay. Teams want the new tools now. But hardening guardrails is the work that makes everything after it safe. Without it, you are amplifying whatever is already broken.

**At the team level:** while the organisation hardens its guardrails, the team should establish the practices that depend on team-level agreement rather than on organisational infrastructure. Shared spec authorship, agent-aware code review, and retrospectives covering agent-authored work are all accessible regardless of organisational stage and build the team capability that step 3 will begin to exercise. Treating these as a parallel workstream rather than a sequential one to organisational hardening typically halves the elapsed time to useful adoption.

## Step 3: Ease delivery

Introduce agentic tooling in bounded, low-risk contexts with clear success criteria. Start with the least consequential code in the most well-tested part of the system. Let the team build experience and confidence with agent collaboration before expanding the scope.

Measure whether the introduction actually shifts flow metrics: cycle time, deployment frequency, change failure rate, and time to restore. If it does, expand. If it does not, investigate why before expanding.

This step is explicitly experimental. Each expansion of agent scope is a hypothesis: "giving agents autonomy over X will improve Y without degrading Z." Treat it as such. Measure. Learn. Adjust.

**At the team level:** This is where the team moves deliberately out of solo-mediated mode. The choice between shared-context, pair-with-agent, and early-orchestrated multi-agent depends on the work, the team's experience mix, and the organisational infrastructure now available. The bounded, low-risk contexts introduced in this step are also where team practices are first exercised under real conditions. A team that has agreed in principle to shared spec authorship now finds out whether it can actually do so under deadline pressure.

## Step 4: Accelerate

As confidence in guardrails grows and the team develops fluency with agent collaboration, progressively expand agent autonomy. The progression follows the individual adoption stages: from manual approvals to skipped permissions, from single agent to multiple agents, and from IDE-based to terminal-based.

Simultaneously, begin adapting roles and practices to match the new pace. This is where the role transitions described in Part 5 become practically relevant. The PM must be present in the flow, not reviewing sprint outputs. Testing must shift from line-level review to intent verification. Design must operate as direction, not production.

The key principle throughout: use AI to get to good before using AI to go fast. Speed without discipline is just faster failure.

**At the team level:** acceleration is where orchestrated multi-agent mode becomes viable, provided the team has the practices and the organisation has the infrastructure. If either is missing, the team will either fall back to less demanding modes or fail visibly under the load. This is where the bounding relationship from Part 3 matters most: a team attempting to orchestrate multi-agent in an organisation that has not reached stage 3 will produce coordination failures that look like team dysfunction but are in fact infrastructure shortfalls.

## When adoption has already gone wrong: the remediation sequence

The adoption sequence above assumes an organisation that has not yet introduced Agentic AI at scale. Increasingly, engagements begin with organisations that already have. The firehose has been attached, the downstream chaos predicted by DORA has materialised, and leadership is looking for a way out that does not involve admitting the original adoption was premature.

The remediation sequence inverts the adoption sequence and addresses four distinct stalls. It should be read as provisional, pending field validation across multiple engagements.

### Stabilise before you diagnose

Teams in a post-adoption chaos state are usually reacting to incidents rather than delivering features. The first move is not to measure or reorganise; it is to reduce the rate of agent-generated change entering production until the existing backlog of quality problems can be worked down. This is a WIP-limit intervention at the agent level, not at the team level. It will be resisted on productivity grounds - "we need to ship faster, not slower" - but throughput through a constrained system is maximised by reducing arrival rate, not by increasing it. The organisation is already paying the cost of the constraint; the question is whether it pays that cost as a visible slowdown or as invisible quality debt.

### Diagnose what broke, not what is missing

The standard readiness diagnostic identifies what an organisation lacks before adoption. The remediation diagnostic identifies what broke during adoption. These are different questions with different outputs. The remediation diagnostic examines: which delivery metrics have degraded and when; which team practices have been displaced by agent workflows; what organisational learning has been lost because the agent, not a human, performed the work; and where the organisation has accumulated specification debt (agent-authored code without corresponding human-authored specifications).

### Restore the feedback loops before restoring the tooling

In a post-adoption mess, the strongest move is usually to reduce agent autonomy, not to add more guardrails around it. Move from autonomous operation back to supervised assistance temporarily. This is stage 3 → stage 2 in the organisational maturity model, and it is not a failure. It is the engineering equivalent of rolling back a bad deployment: revert first, diagnose second, redeploy third. Once the feedback loops that AI acceleration severed have been restored - humans seeing agent output, incidents producing learning, specifications accumulating - selective re-acceleration becomes possible.

At the team level, the parallel move is usually from orchestrated multi-agent or pair-with-agent back to shared-context or even solo-mediated mode for a period. This is not a regression; it is how a team re-establishes the shared understanding that has been eroded by acceleration. Teams that try to restore feedback loops without also stepping back to a simpler mode typically cannot, because the volume of agent-authored work continues to overwhelm the repair effort.

### Re-adopt selectively, on evidence

The final step is the reintroduction of agent autonomy, but now on the evidence-gated basis prescribed by the standard sequence. The difference is psychological and political: the organisation has lived through the failure mode, and the case for evidence-gating no longer requires abstract persuasion. This is the one advantage of engaging after a failed adoption, rather than before.

The remediation sequence is not a retreat from Agentic AI. It is a route back to the readiness state from which productive adoption becomes possible. Organisations that attempt to fix a failed adoption by adding more sophisticated tooling typically compound the problem. Organisations that temporarily reduce agent autonomy, restore their feedback loops, and re-adopt on evidence recover both capability and confidence.

The operational expansion of this sequence - with decision trees, named interventions, time-boxes, entry and exit criteria, and specific resistance patterns - is available as the [Recovery Playbook](/playbooks/agentic-ai-for-teams/artefacts/recovery-playbook/).
