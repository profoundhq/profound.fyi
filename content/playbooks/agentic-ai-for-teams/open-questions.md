---
title: "Open Questions"
order: 80
updated: 2026-04-21
tags:
  - agentic-ai-for-teams
---


# Open Questions

A credible framework acknowledges what it does not yet know. The following questions are genuinely open. They represent areas where the framework has positions but those positions are hypotheses, not conclusions.

## Does Agentic AI change team topology?

Team Topologies provides a structural framework for organising teams: stream-aligned, platform, enabling, and complicated-subsystem. The question is whether Agentic AI changes the optimal topology.

One hypothesis: if agents can do the work of a platform team's API, platform teams shrink or change focus. If a stream-aligned team's cognitive load drops because agents handle boilerplate, the team can own a broader domain. If agents reduce the need for enabling teams to teach practices (because the agent embodies the practice), enabling teams shift from teaching to coaching.

The counter-hypothesis: agents add cognitive load (learning to work with agents, reviewing agent output, managing agent configuration) that offsets any reduction. Team boundaries should be drawn around human cognitive load, and agents change what that load consists of but not necessarily how much of it there is.

Part 3's team-level framing adds a further complication: the team agentic modes (solo-mediated, shared-context, pair-with-agent, orchestrated multi-agent) cut across the Team Topologies team types. A stream-aligned team and a complicated-subsystem team might both operate in pair-with-agent mode, but for different reasons and with different practices. The question is whether team mode is an independent design variable alongside team type, or whether the two interact in ways that constrain each other. Orchestrated multi-agent mode may not be viable for complicated-subsystem teams, for instance, because the coordination cost against specialist knowledge outweighs the parallelism benefit.

This needs empirical investigation through real engagements.

## Does Agentic AI change cognitive load boundaries?

Cognitive load theory (as applied in Team Topologies) says teams should own domains small enough for the team to hold in their heads. If agents can hold more context than humans, do the boundaries change?

Possibly. But the relevant cognitive load may not be "understanding the code." It may be "understanding the domain, the users, the stakeholders, and the constraints." Agents help with the first but not with the second. If the binding constraint on team scope is domain complexity rather than code complexity, agents do not change the boundaries.

## Does Agentic AI change interaction modes?

Team Topologies defines three interaction modes: collaboration, X-as-a-service, and facilitating. If agents mediate interactions between teams (one team's agent communicates with another team's API), does the interaction mode change?

This connects to the contract-driven design principle. If interactions are mediated by explicit, versioned contracts, agents can handle the X-as-a-service interactions autonomously. The collaboration and facilitating modes, which require human judgment about context, politics, and relationships, likely remain human-to-human.

## What happens to the junior developer pipeline at industry scale?

The apprenticeship question is explored in Part 6, but at the level of a single team or organisation. The industry-level question is larger: if every organisation simultaneously reduces the learning opportunities available to junior developers, where does the next generation of senior engineers come from? This is a collective action problem that no single organisation can solve, but that every organisation should be aware of.

## Can spec evolution capture tacit knowledge?

The spec-evolution practices in Part 5 position the specification hierarchy as the team's memory: the durable store of domain understanding that survives individual agent sessions. But specifications capture explicit knowledge. Tacit knowledge - the intuition that comes from lived experience, the felt sense that something is about to go wrong, the judgment that cannot be reduced to rules - is by definition not captured in specs.

The open question is whether spec evolution can progressively encode tacit knowledge by surfacing the implicit assumptions behind decisions when they are made, or whether there is an irreducible residue that lives only in human judgment and cannot be transferred to a specification hierarchy at all. The answer matters most in high-stakes domains - healthcare, finance, safety-critical systems - where the difference between explicit and tacit is the difference between a safe decision and a catastrophic one.

## How do you measure whether Agentic AI adoption is actually working?

This is a harder question than it appears, because the available evidence base is weak and the intuitive metrics are misleading.

### The evidence problem

Most published studies on AI-assisted development productivity come from two sources: LLM providers measuring the impact of their own products, and early adopters self-reporting on their own adoption decisions. Both have obvious incentive problems. Provider-funded studies consistently report productivity gains. Independent studies and practitioner reports are more mixed - some show marginal improvement, some show no change, and some show degradation in code quality that offsets speed gains.

The framework does not take a position on whether Agentic AI improves delivery speed in general. That question is too broad to have a useful answer. The useful question is narrower: _is it improving delivery outcomes for this team, in this context, with these engineering foundations?_ That question requires local measurement, not industry benchmarks.

### What to measure

**DORA metrics remain the starting point** - deployment frequency, lead time for changes, change failure rate, and time to restore service. These are team-level, outcome-oriented, and well-validated. But Agentic AI may change what they mean: deployment frequency may increase dramatically while change failure rate also increases, because more experiments are being run, or because agent-generated code introduces subtle defects at a rate that exceeds the team's review capacity. Whether that trade-off is acceptable depends on the organisation's risk appetite and feedback loop speed. DORA metrics should be read as a system, not as individual numbers.

**Cognitive load** (is it shifting, not just falling?). Agents may reduce implementation load while increasing review load, specification load, or coordination load. A team that reports lower cognitive load overall but cannot explain what the agent is doing has traded visible load for invisible risk.

**Specification health.** Are specs accumulating knowledge or decaying? Are production incidents producing spec updates? Is the specification lifecycle actually operating, or has it atrophied because agents work well enough without precise specs most of the time? Specification health is a leading indicator of whether the team is building durable capability or accruing hidden debt.

**Psychological safety around agent failures.** Can the team surface problems with agent output without blame? If agent-generated defects are attributed to the developer who invoked the agent, the team will suppress failure reports, and the organisation will lose its learning signal.

### What not to measure

**Lines of code, number of commits, or any volume-based metric.** These are vanity metrics in any context and become actively misleading when an agent can produce thousands of lines in minutes. Volume is not value.

**Token consumption as a productivity metric.** Token cost is a cost-management concern, not a performance indicator. High token consumption might indicate waste (poor specifications requiring many iterations) or investment (thorough exploration of a complex problem). Low token consumption might indicate efficiency or underuse. The metric tells you about cost, not about whether adoption is working. Track it for budgeting; do not use it to evaluate team performance.

**Agent-provenance percentage of commits.** This metric - what proportion of commits were authored or substantially generated by agents - is superficially appealing but conceptually contested. One view is that it provides transparency into how the codebase is being produced, enabling better risk assessment and review prioritisation. The counter-view is that a developer is ultimately responsible for every commit regardless of how it was produced - agent-assisted code is autocomplete at a different scale, and tracking its provenance creates a false distinction that undermines developer accountability.

Both positions have merit. The framework's current stance is that provenance tracking is useful as a _diagnostic input_ (understanding how the codebase is being produced) but misleading as a _performance metric_ (implying that more or fewer agent-authored commits is inherently better or worse). If an organisation tracks provenance, it should do so for risk assessment purposes - directing review effort toward agent-authored code in critical paths - not as a productivity dashboard number.

### The measurement meta-question

The deeper measurement question remains: are you measuring agent productivity or team capability? These are different things. A team that produces more code with agents but understands less of their system is less capable, even if the output metrics look good. The sensing framework should track both - output metrics (DORA) and capability indicators (specification quality, cognitive load distribution, apprenticeship health, feedback loop integrity).

Team-level measurement is where the framework's diagnostic value is strongest, because most dysfunction presents at the team level first. An individual developer's agent productivity can look excellent while the team's integration quality degrades, review queues lengthen, and specification debt accumulates. Measuring only at the individual level misses the system dynamics that determine whether adoption is actually working.

## What does board-level communication of AI-delivery risk look like?

This is the most consequential gap in the framework's current form. The readiness diagnostic, the maturity model, and the adoption sequence all produce outputs that are legible to engineering leaders. They do not produce outputs that are legible to boards, audit committees, or investors. In regulated sectors and in any organisation where AI adoption has become a board-reported strategic initiative, this gap is not tolerable.

The missing artefact is an underwriting pack: a short, standardised document that expresses AI-delivery risk in the language that governance functions already use. The working hypothesis is that such a document comprises five elements. First, a statement of the organisation's current position on the two-axis maturity model, with evidence. Second, an explicit inventory of the engineering controls in place at the relevant maturity stage and a gap analysis against the controls required for the next stage. Third, a risk register expressed in familiar categories - operational, financial, reputational, regulatory - translated from the engineering-specific failure modes the framework identifies. Fourth, an escalation policy specifying which categories of agent activity require which level of human approval, modelled on the change-approval escalation matrices that boards already understand. Fifth, a measurement commitment: which delivery metrics will be reported to the board quarterly, and which thresholds constitute a trigger for review.

The design question is whether this artefact can be produced as an output of the readiness diagnostic itself, so that engaging with the framework produces board-ready communication as a by-product, or whether it requires a separate board-communication engagement after the diagnostic. The working answer is the former: the underwriting pack is a view over the same evidence base that drives the diagnostic, reformatted for a different audience. Producing it as a first-class output is the next development priority for the framework.

The [Underwriting Pack](https://profound.fyi/playbooks/agentic-ai-for-teams/playbooks/agentic-ai-for-teams/artefacts/underwriting-pack/) drafts a first operational version of this artefact - template, worked example, and usage notes. Whether the specific shape it takes holds up across multiple engagements in different regulatory contexts remains genuinely open pending field validation.

A related question, raised by the second wave of agentic tooling, is what remains uncommoditised. The framework's earlier position was that tooling commoditises the technical execution layer and that differentiation lives in the organisational layer. That position needs sharpening. Platforms such as re:cinq's Lore are now shipping primitive forms of governance directly: per-repo approval gates that allow teams to refuse agent activity, per-call cost attribution broken down by task type and repository, audit trails written to durable storage, and bounded-iteration escalation loops that route to humans when agent self-correction fails. These are not nothing. They are governance fragments encoded as infrastructure, and any framing that treats governance as wholly outside the tooling layer is now inaccurate.

What remains uncommoditised is governance as a coherent system: the connection between engineering controls and DORA-grounded delivery metrics, the apprenticeship redesign that preserves judgment as agents absorb execution, the Theory X/Y diagnosis that determines whether an organisation can use its own audit trails for learning rather than surveillance, and the board-facing translation that the underwriting pack provides. A platform can ship an approval gate. It cannot ship the conversation that produces the policy the gate enforces, the readiness assessment that makes the policy appropriate to the organisation's actual maturity, or the board-level framing that allows the policy to be reported as risk management rather than as engineering minutiae. The framework's positioning, accordingly, should not be that tooling is a separate concern from governance, but that tooling now provides governance primitives which require an organisational scaffold to be coherent. Building that scaffold is the organisational-layer work this framework is concerned with, and the underwriting pack is one of the artefacts through which it becomes legible to people outside engineering.

Until this artefact exists in operational form at the scale needed, engineering leaders using the framework will continue to face a translation problem when they take its findings to their boards. Solving the translation problem is not optional for frameworks that aspire to operate at organisational scope.
