---
title: "Role Positions"
order: 50
updated: 2026-05-02
tags:
  - agentic-ai-for-teams
---


# Role Positions

Agentic AI changes how every role on the team operates. But the practice is emergent. Nobody has yet produced the definitive account of how roles reshape around agentic workflows - the equivalent of Kniberg and Ivarsson's description of Spotify's squad model, derived from observation of what actually works at scale.

What we can identify are the **forces** acting on each role: durable pressures that every team will face regardless of tooling, industry, or organisational context. What we cannot yet prescribe are the structural answers. Those will emerge differently in every organisation, and teams that adopt someone else's role template without running their own experiments will repeat the cargo-culting pattern that made "the Spotify Model" a cautionary tale.

This section describes forces, poses diagnostic questions, and flags anti-patterns that are already visible. It does not prescribe target-state role definitions.

## A thinking tool: amplified, automated, irreducibly human

For any role, three categories of work shift under Agentic AI:

- **Amplified by AI:** work the human still does, but faster and with better inputs because agents assist.
- **Automated by AI:** work the human should let go of, because agents can do it adequately, and the human's time is better spent elsewhere.
- **Automated but load-bearing for learning:** work the agent handles well, but that previously served a developmental function. Losing it is an efficiency gain and a capability risk simultaneously.

Teams should map their own roles through this lens rather than adopting a generic classification. The third category - automated but load-bearing for learning - is the one most teams miss, and where the most damage accumulates silently.

## The specification lifecycle as connective tissue

However roles evolve, the specification hierarchy described in the Specification-Driven Development section gives the team its primary shared artefact. An artefact without clear ownership drifts. As roles change, teams should ensure every stage of this lifecycle has a named owner:

|Stage|Activity|Questions to ask|
|---|---|---|
|**Surface**|Structured conversations (Example Mapping or equivalent) that surface assumptions through concrete examples|Who initiates these? Who has the domain knowledge to challenge assumptions? Is this happening at the right cadence for your agent-assisted delivery speed?|
|**Specify**|Translate shared understanding into executable BDD scenarios and architectural contracts|Who authors each spec layer? Are the people writing specs the ones who understand the domain, or the ones who understand the tooling? What happens when those are different people?|
|**Implement**|Agent generates code and TDD-level tests against the spec hierarchy|What level of supervision does your team's current capability require? How do you know?|
|**Verify**|Confirm agent output satisfies specs; mutation testing; independent oracle tests on critical paths|Who verifies that agent-generated tests aren't simply confirming the agent's own assumptions? Is anyone checking for what the spec didn't anticipate?|
|**Evolve**|Update specs when test failures, production incidents, or user research reveal gaps|Who owns this? Does it actually happen, or do specs rot? Is there a standing retrospective question about spec drift?|

## Forces acting on product management

**The core pressure:** When development speed is no longer the constraint, specification quality becomes the bottleneck. The product manager's ability to express intent as precise, falsifiable behavioural statements - rather than aspirational narratives - determines how effectively agents can work.

**The XP analogy:** This resembles the XP on-site customer role, but operating at a cadence that may exceed what any individual can sustain. Whether this is the right framing, or whether the specification responsibility distributes differently in practice, is an open question.

**Diagnostic questions for your team:**

- Can your product manager express acceptance criteria as concrete examples with rules and edge cases, or do they write narrative requirements that engineers must interpret?
- When the agent asks no clarifying questions mid-session (because it cannot), does the specification contain enough information for the output to be correct? If not, where does the gap sit?
- Is specification work consuming more PM time than your current capacity allows? If so, does that mean you need more PMs, or that the specification responsibility needs to be shared differently?
- Are your product managers bottlenecking delivery at the specification stage? How would you know?

**Anti-patterns already visible:**

- Engineers writing specs the product manager should own, producing technically precise but domain-impoverished specifications.
- Product managers continuing to write aspirational user stories while agents need falsifiable behavioural constraints, creating a translation layer that adds latency and loses fidelity.
- Treating specification writing as a one-time activity rather than a continuous practice that evolves with production feedback.

## Forces acting on senior engineers

**The core pressure:** If agents write most of the code, the senior engineer's value shifts from implementation skill to architectural judgment and specification quality. Review shifts from "is this code correct line by line?" to "does this system express the right intent, at the right boundaries, with the right constraints?"

**The review question:** At volume, line-by-line code review of agent output is neither feasible nor useful. But what replaces it? Spec review is a candidate - get the spec right and the generated code follows. Contract review is another - ensure boundaries and invariants hold. Observable behaviour verification is a third. Your team needs to discover which combination works for your context, codebase, and risk profile.

**Diagnostic questions for your team:**

- What percentage of your senior engineers' time is spent on implementation versus architectural judgment and specification work? How is that ratio changing?
- When you review agent-generated code, what are you actually checking? Is that the most valuable use of review time?
- Can your seniors articulate system-level invariants and architectural contracts precisely enough for agents to respect them? Or are these implicit knowledge that agents cannot access?
- Are your seniors coaching specification quality across the team, or is that assumed to happen?

**Anti-patterns already visible:**

- Seniors spending review time on generated code style rather than structural correctness and intent alignment.
- Architectural decisions remaining implicit in seniors' heads rather than being expressed as contracts that constrain agent output.
- Treating agent-generated code as equivalent to human-authored code for review purposes, rather than developing review practices appropriate to machine-generated output at scale.

## Forces acting on junior engineers

**The core pressure:** Juniors traditionally learned through doing the work that agents now handle. Writing boilerplate teaches what the boilerplate is for. Debugging teaches how systems fail. Manual testing teaches how users interact with software. If agents handle all of that, the apprenticeship pathway breaks.

This is not an argument against agents for juniors. It is a recognition that the learning pathway needs deliberate redesign.

**The apprenticeship hypothesis:** One candidate model is XP-style pairing: the junior pairs with the agent while a senior observes and coaches. The senior's job is to help the junior understand why the agent made the choices it did, when to override it, and how to evaluate output critically. This is theoretically grounded in XP pairing practices, but whether it works at the pace and scale of agentic development is unproven. Teams adopting this pattern should treat it as an experiment with explicit success criteria.

**Diagnostic questions for your team:**

- How do your junior engineers currently learn? Map the specific activities. Which ones are being displaced by agents?
- What compensating practices have you introduced? If the answer is "none," you have a capability pipeline problem that will manifest in 18–24 months.
- Can your juniors articulate _why_ agent-generated code is structured the way it is, or do they only know _that_ it works?
- Are your juniors participating in specification conversations (Example Mapping, edge-case analysis), or are they only interacting with agents at the implementation layer?

**Anti-patterns already visible:**

- Treating someone who produces senior-level output with agent assistance as actually senior. The output reflects the agent's capability, not the developer's judgment. Seniority is about judgment, not output.
- Juniors accepting agent output uncritically because they lack the experience to evaluate it.
- Eliminating "junior work" without replacing the learning function that work served.

**The career ladder question:** If agents compress the time between "cannot code" and "can produce working software," but do not compress the time needed to develop judgment, taste, and systems thinking, then the junior-to-senior pipeline gets longer in terms of what matters while looking shorter in terms of output. Organisations must build career progression around judgment development, not output volume.

## Forces acting on quality

**The core pressure:** QA as a separate verification function existed because of a handoff model - developers write, testers verify. If specifications are precise enough to constrain agents, and agents generate both implementation and tests from those specs, then the standalone verification role dissolves. The quality _function_ does not. It relocates.

**Three domains where quality expertise remains essential:**

_Specification quality._ Someone needs to teach teams to write specs that actually constrain agent output - to think in failure modes, boundary conditions, and adversarial inputs. QA professionals already have these skills. The shift is applying them to specs upfront rather than catching defects afterwards.

_Eval design._ For non-deterministic systems, someone designs evaluation criteria - relevance thresholds, safety constraints, consistency measures, regression baselines. This is adjacent to traditional test design but conceptually different: "Is this output acceptable?" rather than "Does this output match?"

_Production observability._ Catching what the spec didn't anticipate, relocated from pre-deployment testing to production monitoring. This connects to spec evolution: production quality signals feed back into spec updates.

**The honest trajectory.** In Team Topologies terms, this is a shift from embedded stream-aligned function to enabling function. The enabling function's natural arc is to succeed itself out of existence as teams internalise the capability. Acknowledging this openly is more respectful to QA professionals than offering "coach" as a permanent landing pad while privately knowing the role is transitional.

**Diagnostic questions for your team:**

- Who currently owns edge-case thinking on your team? Is it a named responsibility or assumed?
- Are agent-generated tests being independently validated, or are they confirming the agent's own assumptions?
- Do you have evaluation criteria for non-deterministic agent outputs? Who designed them?
- Where does production quality feedback enter your specification lifecycle? If it doesn't, your specs are decaying.

## Forces acting on design

**The core pressure:** Agents can produce design artefacts at volume and maintain design system coherence better than humans across hundreds of screens. The designer's contribution shifts from making things look right to defining what right looks like.

**The specification gap:** A BDD scenario says "when the user submits the form, the system confirms the booking." It says nothing about whether the confirmation feels reassuring, whether the error state is recoverable without anxiety, or whether the flow respects the user's mental model. Design specifications - interaction patterns, design tokens, accessibility constraints, annotated prototypes - are a parallel layer in the spec hierarchy that agents need just as much as behavioural specs. Teams that specify behaviour without specifying experience get functionally correct software that nobody wants to use.

**Service design as a distinct force:** Service design is closer to organisational design than to visual design. It involves understanding systems of human behaviour, institutional constraints, and cross-channel journeys. This work gets more human with Agentic AI, not less.

**Diagnostic questions for your team:**

- Do your agents receive design specifications alongside behavioural specifications? If not, what governs the experience quality of agent-generated interfaces?
- Is your design system expressed in tokens and constraints that agents can consume, or in guidelines that require human interpretation?
- Who evaluates system-level design coherence across agent-generated artefacts?

## Using this section

This section is a diagnostic tool, not a blueprint. The recommended approach:

1. **Map forces to your context.** Which pressures are you already feeling? Which haven't arrived yet?
2. **Run the diagnostic questions.** Identify where your team has gaps, implicit ownership, or missing compensating practices.
3. **Design experiments.** Use the Improvement Kata pattern: define a target condition for role capability, understand the current condition, identify obstacles, run small experiments, measure results.
4. **Share what you learn.** The descriptive case studies that will eventually define how roles work in agentic teams will come from practitioners documenting their experiments, not from consultants prescribing answers.

The forces described here are durable. The structural answers are not yet known. Teams that acknowledge this distinction will adapt faster than teams that adopt a template.
