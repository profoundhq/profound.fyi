---
title: "The Adoption Sequence"
order: 40
updated: 2026-05-02
tags:
  - agentic-ai-for-teams
---


# The Adoption Sequence

Adoption should be sequenced deliberately, not left to emerge organically. The following sequence is adapted from Bryan Finster's work on delivery improvement and applied to the specific context of Agentic AI adoption.

## Step 1: Clarify the work

Before introducing any agentic tooling, clarify what the team actually does and how work flows through their system. Use value stream mapping to expose handoffs, unclear ownership, missing tests, undocumented contracts, and invisible dependencies.

This step serves two purposes. First, it creates the baseline against which you measure whether Agentic AI is actually helping. Without it, you cannot distinguish "we feel faster" from "we are delivering more value." Second, it surfaces the delivery discipline gaps that must be addressed before agents can be safely trusted with autonomy.

This is not a heavyweight assessment. A single value stream mapping session with the team, focused on a representative piece of work from idea to production, will surface enough. The output is a shared understanding of where work gets stuck, where quality is at risk, and where the team's practices have gaps.

**At the team level:** the clarify step also names the team's current mode (solo-mediated, shared-context, pair-with-agent, or orchestrated multi-agent) and the practices it has or lacks. This is not a separate assessment; it emerges from the same value stream conversation. If work stalls in code review because agent-authored pull requests are being reviewed line-by-line, the team lacks the agent-aware code review practice. If each developer is running their own agent with no shared context, the team is in solo-mediated mode by default rather than by choice. Naming these is the first step toward deciding whether the current mode and practices are adequate for the work the team is actually doing.

## Step 2: Harden the guardrails

Address the gaps surfaced in step 1 before introducing agentic tooling at scale. The specific investments depend on what the value stream mapping revealed, but typically span two categories: engineering foundations and agentic safety.

### Engineering foundations

**Test coverage.** Not 100% coverage for its own sake, but sufficient coverage of critical paths that an agent producing incorrect code will be caught before it reaches production. The tests become the safety net that makes agent autonomy possible.

**CI/CD maturity.** Continuous integration that actually runs on every change. Deployment pipelines that gate on test results. The ability to deploy frequently and roll back quickly. Without this, agent-produced code has no safe path to production.

**Observability.** The ability to see what is happening in production, detect anomalies, and trace problems to their source. When agents produce code at volume, some of it will have subtle problems that tests miss. Observability is the second safety net.

**API contracts.** Clear, documented, versioned interfaces between services. When agents operate across service boundaries, they need explicit contracts to work from. Undocumented APIs become fragile points of failure at agent speed.

### Agentic safety

When agents operate with increasing autonomy, a second category of guardrails becomes essential. These are organisational decisions, not implementation details - someone in the organisation must own the policy, not just the tooling.

**Sandboxing.** Agents that execute code, run tests, or interact with infrastructure should operate in sandboxed environments with bounded permissions. Products like Daytona, Runloop, and similar provide container-based isolation for agent workloads. The organisational question is: what can an agent touch, and what is the blast radius if it acts incorrectly? Without explicit sandboxing decisions, the blast radius defaults to whatever permissions the developer has - which, for agents running with skipped permissions, is everything the developer can access.

**Data leak prevention.** Code sent to inference providers leaves the organisation's control boundary. Managed enterprise tiers typically offer data handling agreements; free tiers and personal accounts may not, and some providers use free-tier inputs for model training. The organisational guardrail is: which data is permitted to leave the boundary, via which providers, under which contractual terms? This is a security and compliance decision, not a developer convenience decision.

**Inference provider resilience.** Your inference provider is a single point of failure. If the provider goes down, agent-assisted workflows stop. At the try stage this is an inconvenience. At the scale and optimise stages it is a delivery risk. Organisations should decide whether they need automated failover between providers, and if so, how that interacts with their data handling and contract constraints. The twelve-factor principle (backing services as attached resources) applies directly: if your agent workflow is coupled to a single provider, you have a reliability problem.

**Prompt injection and adversarial inputs.** Agents that process external inputs - user data, uploaded files, third-party API responses - are vulnerable to prompt injection: inputs crafted to override the agent's instructions. This is not a theoretical risk. The organisational guardrail is: which agents process untrusted inputs, and what validation or sanitisation exists between the input and the agent's context? Policy enforcement frameworks (such as AWS Bedrock Agent Core policies or equivalent) provide runtime guardrails that constrain agent behaviour regardless of input.

**Shadow IT.** If the organisation does not provide managed agentic tooling, developers will find their own. Free-tier and personal-account agent use introduces three specific risks: data leak risk (code sent to third-party inference providers without organisational data handling agreements), training data risk (some providers use free-tier inputs for model training), and governance blindness (the organisation cannot audit or manage what it does not know about). Providing managed access is partly a security measure. The guardrail is not "prevent all use" - that is unenforceable - but "provide a managed alternative that is good enough that unsanctioned use is unnecessary." This risk becomes acute during the scale phase of organisational rollout, when broad access decisions are being made.

**Audit and provenance.** Agent actions should produce durable audit trails: what was invoked, what inputs it received, what outputs it produced, and what it modified. This is the prerequisite for any governance, incident investigation, or compliance reporting. Without it, the organisation is operating agents in a logging vacuum. The level of audit granularity required depends on the organisation's regulatory context and risk appetite - not every team needs the same level of tracing - but the decision should be explicit rather than defaulting to "no tracing."

### The guardrail investment as trust infrastructure

These guardrails - both engineering foundations and agentic safety - are not obstacles to adoption. They are the infrastructure that makes trust possible. The stage 2-to-3 transition in the maturity model (supervised to trusted) depends on exactly this investment. An organisation that cannot articulate its sandboxing policy, data handling boundaries, and provider resilience posture is an organisation that should not be granting agents unsupervised autonomy, regardless of how capable the individual developers are.

This step often feels like a delay. Teams want the new tools now. But hardening guardrails is the work that makes everything after it safe. Without it, you are amplifying whatever is already broken - and now you are also amplifying it with network access, code execution permissions, and external API calls.

**At the team level:** while the organisation hardens its guardrails, the team should establish the practices that depend on team-level agreement rather than on organisational infrastructure. Shared spec authorship, agent-aware code review, and retrospectives covering agent-authored work are all accessible regardless of organisational stage and build the team capability that step 3 will begin to exercise. Treating these as a parallel workstream rather than a sequential one to organisational hardening typically halves the elapsed time to useful adoption.

## Step 3: Ease delivery

Introduce agentic tooling in bounded, low-risk contexts with clear success criteria. Start with the least consequential code in the most well-tested part of the system. Let the team build experience and confidence with agent collaboration before expanding the scope.

Measure whether the introduction actually shifts flow metrics: cycle time, deployment frequency, change failure rate, and time to restore. If it does, expand. If it does not, investigate why before expanding.

This step is explicitly experimental. Each expansion of agent scope is a hypothesis: "giving agents autonomy over X will improve Y without degrading Z." Treat it as such. Measure. Learn. Adjust.

**At the team level:** This is where the team moves deliberately out of solo-mediated mode. The choice between shared-context, pair-with-agent, and early-orchestrated multi-agent depends on the work, the team's experience mix, and the organisational infrastructure now available. The bounded, low-risk contexts introduced in this step are also where team practices are first exercised under real conditions. A team that has agreed in principle to shared spec authorship now finds out whether it can actually do so under deadline pressure.

## Step 4: Accelerate

As confidence in guardrails grows and the team develops fluency with agent collaboration, progressively expand agent autonomy. The progression follows the individual adoption stages: from manual approvals to skipped permissions, from single agent to multiple agents, and from IDE-based to terminal-based.

Simultaneously, begin adapting roles and practices to match the new pace. This is where the forces acting on roles described in Part 6 become practically relevant. The key principle throughout: use AI to get to good before using AI to go fast. Speed without discipline is just faster failure.

**At the team level:** acceleration is where orchestrated multi-agent mode becomes viable, provided the team has the practices and the organisation has the infrastructure. If either is missing, the team will either fall back to less demanding modes or fail visibly under the load. This is where the bounding relationship from Part 3 matters most: a team attempting to orchestrate multi-agent in an organisation that has not reached stage 3 will produce coordination failures that look like team dysfunction but are in fact infrastructure shortfalls.

## The organisational rollout: try, scale, optimise

The adoption sequence above (clarify, harden, ease, accelerate) describes the _engineering readiness_ pathway - the technical and practice investments that make Agentic AI safe and productive. But organisations also follow an _organisational rollout_ pathway that runs in parallel and is driven by different forces: procurement, cost, governance, and political will.

These are distinct dimensions. An organisation can be well advanced on the rollout pathway (everyone has agentic subscriptions) while stalled on the readiness pathway (nobody has test coverage). The interaction between them is where most adoption dysfunction lives.

### Try: one team, bounded scope

The organisation selects a single team - ideally one with strong engineering foundations already - and provides agentic tooling. The purpose is learning, not productivity. The questions at this stage are organisational, not technical: What policies do we need? What does the procurement look like? What happens to our security posture? How do we account for the cost?

This corresponds to the clarify and harden steps in the readiness sequence. The try phase should not end until the team has established the engineering guardrails (tests, CI/CD, observability) that make agent autonomy safe. Organisations that rush past try because one team's output looked impressive are skipping the readiness sequence and will pay for it during scale.

**Exit criteria:** The team can articulate what worked, what didn't, and what the organisation needs to invest in before more teams adopt. The engineering guardrails are evidenced, not assumed. Cost per unit of work is understood, not projected.

### Scale: broad access, managed expansion

The organisation provides agentic subscriptions broadly - every developer, every team. This is a procurement and infrastructure decision, not an engineering one. The cost dynamics become real: inference costs at scale are material, and services are currently increasing prices to cover inference provider expenditure. Cost is presently the primary adoption bottleneck for many organisations, and ignoring it during planning produces budget surprises that stall adoption politically even when it is working technically.

The risk at this stage is that broad access outpaces readiness. Teams that did not go through the try phase receive the same tooling as teams that did, without the learning or the guardrails. The adoption sequence's step 2 (harden the guardrails) should be a gate for each team, not a one-time organisational exercise. Otherwise, scale creates a bimodal organisation: a few teams operating safely and productively, and many teams generating agent-authored code without the engineering controls to catch problems.

**Shadow IT risk.** The scale stage is where shadow IT risk becomes acute. If the organisation does not provide managed agentic access, developers will source their own - with data leak, training data, and governance consequences described in step 2's agentic safety guardrails. Managed provisioning is partly a security decision, not just a productivity one.

**Exit criteria:** Every team using agents has completed the guardrail requirements. Cost is tracked per team and per workstream. Shadow IT risk has been addressed through managed provisioning. Teams that are not ready have access to enablement, not just tooling.

### Optimise: precision, cost control, safety

Once broad adoption is established and guardrails are in place, the focus shifts to optimisation: reducing token costs, improving agent precision through better specifications and context management, hardening safety and governance, and building the organisation-specific tooling that makes agents effective for this particular codebase and domain. This tooling layer - agents.md files, composable skills frameworks (Jesse Vincent's Superpowers is the most widely adopted example), custom agents, and shared prompt libraries - encodes the team's engineering standards and domain knowledge into the agent's operating context. Without it, every agent session starts from zero.

This is where the specification-driven development practices from Part 5 pay off most directly. Better specs mean fewer wasted tokens, fewer iterations, and more predictable agent output. Organisations that skipped specification investment during try and scale find optimisation inaccessible - they are optimising the wrong layer.

This is also where agentic safety concerns become operationally pressing. During try, the blast radius of a safety failure is bounded by the single team. During scale, it is bounded by organisational governance controls. During optimise, the organisation is making deliberate decisions about how much autonomy to grant, to which agents, in which contexts - and those decisions require policy frameworks, not just engineering controls.

**The cost-quality relationship.** Token cost is not a metric to minimise blindly. Reducing context window size reduces cost but also reduces agent output quality. The optimisation question is finding the cost-quality frontier for your specific work: the point at which additional token expenditure stops producing meaningfully better output. This requires measurement, not intuition. Teams should track token cost alongside delivery metrics (DORA) to understand the relationship empirically.

### How the two pathways interact

|Rollout stage|Readiness requirement|Failure mode if readiness is missing|
|---|---|---|
|**Try**|Clarify + harden for one team|The try phase produces impressive demos but no reusable learning. The organisation scales based on enthusiasm rather than evidence.|
|**Scale**|Harden for every team, not just the pilot|Bimodal adoption: some teams safe and productive, others generating unguarded agent-authored code. Incidents from unprepared teams erode organisational confidence in the approach.|
|**Optimise**|Specification-driven practices, sensing framework, governance operationalisation|Optimisation addresses cost (fewer tokens) rather than value (better outcomes). Safety hardening is reactive (responding to incidents) rather than proactive (policy-driven).|

The most common organisational failure is to treat the rollout as the adoption strategy and to assume readiness will follow. It does not. Readiness requires deliberate investment at every rollout stage. The adoption sequence (clarify, harden, ease, accelerate) describes that investment. The rollout sequence (try, scale, optimise) describes the organisational context within which that investment occurs.

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

The operational expansion of this sequence - with decision trees, named interventions, time-boxes, entry and exit criteria, and specific resistance patterns - is available as the [Recovery Playbook](https://profound.fyi/playbooks/agentic-ai-for-teams/playbooks/agentic-ai-for-teams/artefacts/recovery-playbook/).
