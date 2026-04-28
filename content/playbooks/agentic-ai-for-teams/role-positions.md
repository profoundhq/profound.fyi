---
title: "Role Positions"
order: 50
tags:
  - agentic-ai-for-teams
---


Agentic AI does not just change how developers write code. It changes how every role on the team operates. The pattern across all roles is consistent: execution gets agent-assisted or agent-performed, while judgment, taste, and direction-setting remain irreducibly human.

For each role, three categories of work:

- **Amplified by AI:** work the human still does, but faster and with better inputs because agents assist.
- **Automated by AI:** work the human should let go of, because agents can do it adequately, and the human's time is better spent elsewhere.
- **Irreducibly human:** work that requires judgment under ambiguity, ethical reasoning, political navigation, or taste. This is where the role's value concentrates.

## The specification lifecycle as a role model

The specification hierarchy described in Part [SDD] gives the team its primary artefact. But an artefact without clear ownership is an artefact that drifts. Each role has a named responsibility in the specification lifecycle:

|Stage|Activity|Primary responsibility|Supporting|
|---|---|---|---|
|**Surface**|Structured conversations (Example Mapping or equivalent) that surface assumptions through concrete examples|Product Manager initiates and facilitates|Engineering, quality coach, design|
|**Specify**|Translate shared understanding into executable BDD scenarios and architectural contracts|Senior engineer (contracts), Product Manager + engineering collaboratively (BDD)|Quality coach reviews for edge-case coverage|
|**Implement**|Agent generates code and TDD-level tests against the spec hierarchy|Agent, supervised by engineer|-|
|**Verify**|Confirm agent output satisfies specs; mutation testing; independent oracle tests on critical paths|Engineer (routine), quality coach (oracle tests, mutation gates)|-|
|**Evolve**|Update specs when test failures, production incidents, or user research reveal gaps|Whoever identifies the gap initiates; spec layer owner approves|Retrospective standing question: has the spec drifted from current understanding?|

This lifecycle is the connective tissue between roles. A team where the Product Manager writes acceptance criteria in isolation, the engineering team writes contracts in isolation, and nobody reviews the joins between them is a team whose spec hierarchy will contradict itself within weeks.

## Product management

**Amplified:** Research synthesis, competitor analysis, option generation, metric tracking, experiment design. Agents can process more user research, generate more strategic options, and monitor more signals than a human Product Manager alone.

**Automated:** Routine prioritisation, status communication, requirement documentation, backlog grooming. These are necessary activities that consume Product Manager time without requiring Product Manager judgment. Agents can handle them.

**Irreducibly human:** Stakeholder negotiation, ethical judgment, strategic framing, saying no, navigating ambiguity when the data is inconclusive, deciding between competing goods when there is no objectively correct answer. An agent can synthesise user research brilliantly. It cannot decide whether to prioritise the feature that retains existing customers or the one that opens a new market segment when the CEO wants both, and the board wants neither.

**The specification responsibility.** The Product Manager's primary contribution to the specification lifecycle is at the Surface stage. They initiate and facilitate Example Mapping sessions (or equivalent structured conversations) that turn vague requirements into concrete examples, rules, and open questions. This is the XP on-site customer role, operating at agent speed. Their output is not a requirements document - it is a set of behavioural constraints precise enough that an agent can implement against them without asking clarifying questions mid-session.

This is a meaningful redefinition of the Product Manager role. Not every Product Manager can do this today. The skill is closer to test-thinking than to traditional product management: expressing intent as falsifiable behavioural statements rather than aspirational narratives. PMs who can do it become the highest-leverage role on an agentic team. PMs who cannot become a bottleneck at the specification stage, and the team compensates by having engineers write specs the Product Manager should own - which produces technically precise but domain-impoverished specifications.

## Engineering: senior

**Amplified:** Architecture exploration, trade-off analysis, system design, cross-team coordination. Agents can generate more options, model more scenarios, and surface more consequences than a senior engineer working alone.

**Automated:** Routine implementation, boilerplate, standard pattern application, documentation generation. These follow established patterns that agents can apply reliably.

**Irreducibly human:** Architectural judgment - knowing which patterns fit which contexts, when to deviate from convention, when a technically elegant solution is organisationally wrong. Evaluating agent output against intent rather than correctness: code can be correct and still be the wrong solution.

**The specification responsibility.** Senior engineers author and maintain the top layer of the spec hierarchy: architectural contracts, OpenAPI definitions, system-level invariants, and integration boundaries. These change infrequently and carry the highest consequence when wrong. The senior also coaches specification quality across the team - reviewing BDD scenarios not just for correctness but for precision, completeness, and appropriate granularity.

**The review shift.** If an agent writes 80% of the code, line-by-line review is neither feasible nor useful at volume. Review shifts from "is this code correct?" to "does this code express the right intent correctly?" The senior reviews specs (do they specify the right behaviour?), contracts (do they express the right boundaries?), and observable behaviour (does the system do what it should?). In a spec-driven workflow, the most important review is spec review, not code review. Getting the spec right means the generated code is right. Getting the spec wrong means no amount of code review will fix the fundamental problem.

## Engineering: junior

**Amplified:** Access to explanations, code review feedback, pattern recognition, exposure to more codebases and approaches. Juniors paired with agents can encounter a wider range of problems and solutions than traditional apprenticeship provides.

**Automated:** Boilerplate writing, routine debugging, syntax lookup, documentation reading. These are activities that juniors traditionally learned through but that are also time-consuming and often frustrating.

**Irreducibly human:** Judgment, taste, systems thinking, understanding _why_ things are the way they are rather than just _what_ they are. Knowing when to override the agent. Knowing when the agent's suggestion is technically correct but architecturally wrong. Knowing when to push back on a product decision. These develop through experience, mentorship, and reflection, not through faster code production.

**The apprenticeship redesign.** Juniors learn through doing the work that agents now handle. Writing boilerplate teaches you what the boilerplate is for. Debugging teaches you how systems fail. If agents handle all of that, juniors skip the apprenticeship and arrive at senior responsibilities without the tacit knowledge that makes senior judgment possible.

This is not an argument against agents for juniors. It is an argument for redesigning the apprenticeship. The XP-aligned response is pairing: the junior pairs with the agent while a senior observes and coaches. The senior's job is not to write code or even to review code. It is to help the junior understand why the agent made the choices it did, when to override the agent, and how to evaluate agent output critically.

**The specification responsibility.** The junior's learning pathway runs through the specification lifecycle. They participate in Example Mapping sessions - not as observers, but as contributors learning to surface assumptions, think in edge cases, and express intent precisely. This is the highest-value human skill in an agentic context, and it is learned through participating in structured specification conversations, not through pairing with an agent alone. The agent teaches implementation patterns. The specification session teaches domain thinking. Both are necessary; the second is harder to acquire and easier to neglect.

**The career ladder question.** If agents compress the time between "cannot code" and "can produce working software," but do not compress the time needed to develop judgment, taste, and systems thinking, then the junior-to-senior pipeline gets longer in terms of what matters (judgment) while looking shorter in terms of output (code). Organisations must resist the temptation to treat someone who produces senior-level output with agent assistance as actually senior. The output is a product of the agent's capability, not the developer's judgment. Seniority is about judgment, not output.

## Quality coach

**The role transformation.** QA as a separate verification function existed because of a handoff model - developers write, testers verify. If specifications are precise enough to constrain agents, and agents generate both implementation and tests from those specs, then the verification function is embedded in the process. The standalone QA role dissolves. The quality _function_ does not - it moves.

In Team Topologies terms, this is a shift from being embedded in a stream-aligned team to operating as an enabling team function. The quality coach is not doing the work. They are building the capability for others to do it.

**The three coaching domains:**

_Specification quality._ The quality coach teaches teams to write specs that actually constrain agent output. They facilitate edge-case thinking, challenge assumptions in Example Mapping sessions, and review BDD scenarios for gaps. This maps directly to skills QA professionals already have - they think in failure modes, boundary conditions, and adversarial inputs. The difference is that they are teaching teams to express these as specs upfront rather than catching them as defects afterwards.

_Eval design._ For systems with non-deterministic components, someone needs to design evaluation criteria - relevance thresholds, safety constraints, consistency measures, regression baselines. This is adjacent to traditional test design but conceptually different: "Is this output acceptable?" rather than "Does this output match?" QA professionals are well-positioned for this but need upskilling in statistical evaluation methods and LLM-specific quality dimensions.

_Production observability._ Quality does not end at deployment. The quality coach helps teams define what to monitor and how to detect quality failures that specs did not anticipate. This is the "catching what wasn't specified" function, relocated from pre-deployment testing to production monitoring. It connects directly to the sensing framework (DORA metrics, cognitive load, eNPS, CSAT) and to the spec evolution practice: production quality signals feed back into spec updates.

**The honest trajectory.** At low maturity, teams desperately need this coaching. The quality coach is the most valuable enabling function on an agentic team that is learning to specify rather than implement. At high maturity, teams have internalised specification thinking, edge-case discipline, and eval design as standing capabilities. The coaching function has succeeded itself out of existence - or, more precisely, it has been absorbed into how the team works. This is the natural arc of any enabling team function, and it is more respectful to QA professionals to say this honestly than to offer "coach" as a permanent landing pad. The skills remain valuable; the dedicated role is transitional.

**The specification responsibility.** In the verification stage, the quality coach owns independent oracle tests on critical paths and maintains mutation testing as a standing quality gate. These checks ensure the agent's self-authored tests have not drifted toward confirming its own output. In the evolve stage, the quality coach is often the person who notices that the spec hierarchy has drifted from the team's actual understanding, because noticing that gap is precisely what QA professionals have always done, just against code rather than specs.

## Design

**Amplified:** Prototyping, design system application, responsive layout generation, accessibility checking, and visual asset production. Agents can produce more design artefacts faster and with greater consistency.

**Automated:** Production design within established systems, icon generation, spacing and alignment work, design documentation, and component library maintenance. These follow the rules that agents can apply reliably.

**Irreducibly human:** Defining what "right" looks like. Evaluating whether a system holds together at a level above individual artefacts. Making aesthetic judgments that balance user needs, brand identity, and emotional resonance. Understanding what a user needs versus what they say they want.

An agent can design a good screen. It may even maintain design system coherence better than a human across hundreds of screens, because it does not get tired or inconsistent. The designer's contribution shifts from making things look right to defining what right looks like and evaluating system-level coherence.

**The specification responsibility.** Design specifies _experience_ intent, distinct from the behavioural intent that Product Manager and engineering specify. A BDD scenario says "when the user submits the form, the system confirms the booking." It says nothing about whether the confirmation feels reassuring, whether the error state is recoverable without anxiety, or whether the flow respects the user's mental model of the process. Design specifications - whether expressed as interaction patterns, design tokens, accessibility constraints, or annotated prototypes - are a parallel layer in the spec hierarchy that agents need just as much as they need behavioural specs. Teams that specify behaviour without specifying experience get functionally correct software that nobody wants to use.

**The service design exception.** Service design is closer to organisational design than visual design. It involves understanding systems of human behaviour, institutional constraints, and cross-channel journeys. This gets more human with Agentic AI, not less. The tools can help map and visualise services, but the judgment about how services should work for people in complex institutional contexts remains deeply human.
