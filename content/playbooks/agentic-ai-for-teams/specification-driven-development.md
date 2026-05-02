---
title: "Specification-Driven Development"
order: 45
updated: 2026-05-02
tags:
  - agentic-ai-for-teams
---

## The unifying frame

The tension between TDD and BDD in agentic contexts dissolves when you recognise that both are instances of a broader pattern: specification-driven development. SDD treats specifications, not code, as the primary artefact of software development. Code becomes a generated output derived from human-authored specifications. The spec defines external behaviour: input/output mappings, preconditions, postconditions, invariants, constraints, interface types, integration contracts, and sequential logic.

This is not a new idea. It is a rediscovery of Specification by Example (Gojko Adzic), BDD (Dan North), and the collaborative specification practices that preceded the current wave of AI tooling. What makes it newly practical is that agents need unambiguous, structured instructions to produce good code. Vague prompts produce code that looks right but misses intent. The cost of imprecise specifications, always real, is now immediate and visible.

The practice worth introducing first is Example Mapping (Matt Wynne). It is a structured conversation that surfaces assumptions through concrete examples. Teams gather around a story, identify rules, surface examples that illustrate each rule, and flag questions where they lack confidence. The artefact that matters is the shared understanding the team builds, not the document that comes out the other end. Whether the implementer is a human or an agent is downstream of this work.

There is, however, a shift in what happens after the conversation. When the implementer was a human in the room, imprecision in the written artefact was tolerable - the developer carried context from the discussion. When the implementer is an agent that was not in the room, the written artefact _is_ the interface. Example Mapping's output must be higher-fidelity than it traditionally has been: precise enough to constrain an agent that cannot ask clarifying questions mid-implementation. The practice is the same. The precision standard for its output is higher.

The failure mode to watch is mistaking the tool for the practice. Teams that adopt Gherkin without the collaborative thinking behind it end up with brittle, slow test suites no one wants to maintain. Spec Kit, Kiro, nWave, and OpenSpec will repeat this pattern if the underlying practice is not in place.

## The three-layer specification hierarchy

The specification has three layers, each authored by different roles at different cadences:

- **Architectural contracts and OpenAPI at the top**, authored by senior engineers and architects, changing infrequently. These are the interface boundaries, integration contracts, and system-level invariants.
- **BDD scenarios in the middle**, authored collaboratively by product and engineering through Example Mapping or equivalent structured conversations, evolving through discovery. These express business behaviour in executable form.
- **TDD tests at the bottom**, often agent-generated and human-reviewed, catching fine-grained implementation errors.

The team's primary output is not code. It is the specification hierarchy. Agents produce code that satisfies the hierarchy. Humans author, own, and evolve the hierarchy itself - though "author" means different things at different layers. Seniors write architectural contracts directly. BDD scenarios emerge from collaborative specification sessions. TDD tests may be agent-suggested, but they are subordinate to the human-authored layers above.

This makes shared spec authorship - named in Part 3 as a team-level practice - the central practical discipline of an agentic team. The spec hierarchy is the team's shared artefact, not the individual's private work. Teams that allow specs to become owned by particular individuals, or that outsource spec authorship to a separate architecture or product function, typically produce spec hierarchies that the team does not fully understand and therefore cannot evolve when the need arises.

**The agile question.** If this sounds like big-design-up-front, it is not. Naive SDD treats specs as complete upfront definitions. This framework treats specs as the most precise expression of current understanding, continuously refined through feedback. That is agile in practice, not just in name.

## Spec evolution: closing the broken feedback loop

Saying "specs are hypotheses refined through feedback" is necessary but insufficient without an explicit mechanism for _how_ specs evolve. Pre-AI, the feedback loop from testing to implementation was carried by human learning: a developer who caused a production incident in the payment flow carried that experience into every subsequent decision. With agents, this loop is severed. The agent has no persistent model to update. A failing test tells the human something, but the agent starts roughly fresh next session. The same class of bug can recur indefinitely.

This means spec evolution must become a deliberate practice, not a byproduct of human memory. When a test failure, production incident, or user research insight reveals that a specification was wrong or incomplete, the team's first response is to update the specification, not just regenerate the code. The spec change is the durable learning. The code change is the disposable consequence.

In practice, this looks like three things. First, test failures trigger spec review before re-generation: the question is not "why did the code fail?" but "what did the spec fail to express?" Second, production incidents produce specification patches - updates to BDD scenarios, tightened architectural contracts, new invariants - that prevent the same class of failure from recurring regardless of which agent (or human) next touches the code. Third, the specification hierarchy accumulates the team's domain understanding over time, serving as the persistent knowledge base that individual agent sessions lack. The spec becomes the team's memory.

That practitioner-builders are independently reinventing mechanisms for durable state outside the agent - Bryan Finster's persistent task memory in his agentic-dev-team implementation, Steve Yegge's MEOW stack and Beads in Gas Town, re:cinq's temporal knowledge graph in Lore - is a useful triangulation. Three practitioners, three different vocabularies, the same underlying observation: an agent without persistent state is a session without memory, and the team's accumulated learning has to live somewhere that survives the session. The framework's position is that the specification hierarchy is the right place for that learning to live; the practitioner systems converge on the necessity without yet converging on the form.

## Automated extraction: useful substrate, not replacement

A second wave of tooling now automates parts of this loop directly. Platforms such as re:cinq's Lore extract facts from PR feedback and session summaries, store them in a temporal knowledge graph, and invalidate older facts when new ones contradict them - typically by embedding similarity above a fixed threshold. This is mechanised spec evolution, and it is genuinely useful: it captures the passive learning that would otherwise be lost between sessions, and it does so without depending on human discipline to "write the lesson down."

It is also insufficient as a substitute for deliberate practice, for three reasons. First, automated extraction has no model of authority. A senior engineer's considered architectural decision and an agent's hasty PR comment look the same to a fact extractor; both become facts, and the most recent one tends to win. Deliberate spec evolution preserves the authorship hierarchy: architectural contracts and BDD scenarios are human-authored, and only those layers are the authoritative spec. Second, embedding-based invalidation is a similarity heuristic, not a semantic one. Two facts that read similarly may apply to different contexts - "we use UUIDs for new tables" in one service, "we use auto-incrementing integers in legacy tables" in another - and a similarity-threshold invalidator will silently collapse them. Third, automated extraction captures _what was decided_ but not _why_, and the why is usually where tacit knowledge lives.

The framework's position is that automated extraction is a useful substrate but not a replacement. Teams should use it where available, and layer deliberate spec evolution practices on top: scheduled spec review, explicit human-authored decision records for the architectural and BDD layers, and a standing question in retrospectives about whether the spec hierarchy has drifted from the team's actual current understanding. The tooling commoditises capture; it does not commoditise judgment about what is worth capturing or why.

## Verifying the verifier

Spec evolution presumes that the specifications themselves are trustworthy. In an agentic workflow this cannot be taken for granted. When agents author both the implementation and the tests that constrain it, there is a circularity that classical TDD does not face. A human writing a failing test first is a human holding a model of correctness against the agent's implementation. When the agent writes the test, the test may encode the agent's misunderstanding rather than correct it. The verifier requires verification.

Three practices address this. First, specification authorship boundaries. Architectural contracts and acceptance-level BDD scenarios are authored by humans and treated as the authoritative constraint; agents can generate and suggest TDD-level tests but these are subordinate to the human-authored layers above. The authorship hierarchy matches the specification hierarchy. Second, mutation testing as a routine quality gate. If an agent's tests pass against a deliberately mutated implementation, the tests are not constraining what they claim to constrain. Mutation scores move from a periodic audit practice to a standing condition of trust in AI-generated test suites. Third, independent oracle tests. For critical paths, some tests are authored and maintained outside the agent's loop - often by a different role (quality coach, security, platform) - to provide an independent judgement that the agent's self-authored tests have not drifted toward confirming its own output.

The deeper point is that "tests as specification" requires specification-level accountability. Tests authored in the same loop they verify are not specifications; they are implementation notes dressed as assertions. Distinguishing the two is a standing organisational capability, not a tooling problem.

## Emerging tooling

The specification hierarchy described above is not theoretical. Tools are beginning to operationalise it. nWave, an open-source Claude Code agent framework by Brix Consulting, implements a six-wave workflow (Discover, Discuss, Design, DevOps, Distill, Deliver) that maps closely onto the three layers. Its Discuss wave produces requirements (the PM layer). Its Design wave produces architecture and ADRs (the contracts layer). Its Distill wave produces Given-When-Then acceptance tests (the BDD layer). Its Deliver wave implements via TDD against those specs (the implementation layer). Each wave has a human checkpoint: the agent generates artefacts, the human reviews and approves before the next wave begins. GitHub's Spec Kit provides similar scaffolding at a lighter weight.

A second category of tooling is shaped differently. Platforms such as re:cinq's Lore are not scaffolding for a single project's spec hierarchy; they are infrastructure for an organisation's agent fleet. They sit alongside the spec hierarchy rather than instantiating it: an MCP server that exposes shared context, a temporal knowledge graph for accumulated facts, a pipeline that dispatches tasks to ephemeral workers, per-repo approval gates, and per-call cost attribution. The two categories are complementary rather than competing - a team can adopt nWave for its workflow shape and Lore for its cross-repo memory and governance - but they imply different organisational commitments. Scaffolding-shaped tools are adoptable team-by-team. Platform-shaped tools require the organisational infrastructure described in Part 3 to be in place before adoption is coherent; they are stage-3-and-above interventions.

These tools validate the pattern but also illustrate a tension. nWave uses 22 specialised agents including 11 peer reviewers. That is substantial orchestration complexity, and it sits at stage 10 of the individual adoption model (using a software factory). Teams adopting tools like this need the governance, observability, and coordination capabilities described in Part 6. They also need to resist coupling their workflow to a specific tool or agent platform. The specification hierarchy - the contracts, BDD scenarios, and architectural decisions - should be tool-agnostic. The specs should outlast whichever agent framework executes against them. Own your interfaces, not your implementations.

## Eval-driven development: the non-deterministic frontier

For deterministic code generation, BDD works. Given-When-Then assumes knowable expected outcomes. But agentic systems increasingly include non-deterministic components - LLM-based features, recommendation engines, generative outputs - where the same input does not produce the same output. BDD's contract breaks.

Eval-driven development is not BDD adapted. It is a different paradigm with different feedback loops. Instead of asserting specific outputs, evals define quality boundaries: relevance thresholds, safety constraints, consistency measures, regression baselines. The shift is from "does this output match?" to "is this output acceptable?" This requires different specification skills, different tooling, and a different mental model of correctness.

Teams need to distinguish between agentic _coding_ (where BDD still works because the output is deterministic code) and agentic _behaviour_ (where eval-driven approaches are necessary). The TDAD framework provides rigorous grounding for this distinction. DeepEval offers accessible tooling to start. Both are early but directionally sound.
