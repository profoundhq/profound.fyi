---
title: "Maturity Models"
order: 30
tags:
  - agentic-ai-for-teams
---


Agentic AI adoption operates at three distinct levels that interact but are not the same thing: individual practitioner adoption, team-level modes and practices, and organisational readiness. A highly capable individual developer using agents in an organisationally immature context is a liability. An organisationally mature context with individually inexperienced developers is an opportunity. And between the two sits the team, where most of the practical work of adoption is actually done, and where many failures that look individual or organisational are, in fact, team-level.

The individual-stage framing is adapted from Steve Yegge's "Evolution of the Programmer" and Daniel Jones's "11 Stages of Agentic Coding," reframed for the organisational-readiness purpose of this framework. The team-level framing follows a descriptive rather than progressive pattern, structurally similar to Team Topologies' use of team types and interaction modes rather than a maturity ladder.

## Individual adoption: eleven stages

Individual developers adopt agentic tooling through a progression of increasing trust and autonomy. This progression is not linear for every person, but the stages are recognisable, and the sequence is broadly consistent.

**Stage 1: Copy/paste from a chat app.** The developer uses ChatGPT, Claude, or similar as an external reference. They copy code snippets into their editor. AI is a search engine replacement, not a collaborator.

**Stage 2: AI code completions.** Tab-completion suggestions from Copilot or similar. The developer accepts or rejects individual line-level suggestions. The AI operates within the editor but has no agency.

**Stage 3: Non-agentic IDE features.** Inline chat, code explanation, refactoring suggestions. The AI can see context beyond the current line but does not take autonomous action. The developer drives every interaction.

**Stage 4: Agentic IDE, narrow pane, manual approvals.** An agent operates in a sidebar or secondary pane. It can propose multi-file changes but requires explicit approval for every action. The developer's code remains the primary focus. The agent is an assistant.

**Stage 5: Agentic IDE, agent as main focus, manual approvals.** The agent occupies the primary working area. The developer reviews and approves agent-proposed changes rather than writing code directly. The human role shifts from author to reviewer, but retains veto over every step.

**Stage 6: Terminal agent, manual approvals.** The developer moves from IDE-based agents to terminal-based agents (Claude Code, similar). The agent operates across the full project, not just open files. Manual approvals still gate every action.

**Stage 7: Terminal agent, skip permissions.** Trust increases to the point where the developer allows the agent to act autonomously within the project scope. The developer reviews output rather than approving each step. This is the first stage where engineering discipline becomes non-negotiable: without strong tests, CI/CD, and observability, this is reckless.

**Stage 8: Multiple terminal agents, skip permissions.** The developer runs several agents concurrently across different parts of the codebase or different tasks. Coordination between agents is the developer's responsibility.

**Stage 9: Background agents with notification.** Agents run independently and notify the developer of results. The developer is no longer continuously monitoring. Trust is high, and guardrails must be robust.

**Stage 10: Using a software factory.** The developer works within a structured multi-agent framework (such as nWave) where specialised agents handle different phases of the development lifecycle. Human checkpoints exist between phases, but execution within phases is autonomous.

**Stage 11: Building software factories.** The developer designs and builds custom agent-orchestration systems (Steve Yegge's Gas Town is a working public example). This is operating-system-level thinking applied to agentic development.

### Tiers

These eleven stages group into five tiers that reflect qualitatively different relationships between the developer and AI:

**Novice (stages 1-4):** AI is a tool on the desk. The developer does the work, with AI providing suggestions. No trust delegation occurs.

**Beginner (stages 5-6):** AI becomes the primary worker in some contexts, but the human approves every action. Trust is growing but bounded by explicit approval gates.

**Competent (stages 7-8):** The developer delegates execution to agents and reviews output rather than approving steps. This requires genuine confidence in guardrails. The transition from beginner to competent is the most consequential shift for most developers and teams.

**Advanced (stages 9-10):** The developer orchestrates multiple agents, either manually or through pre-built tooling. The human role is direction, evaluation, and exception handling.

**Cutting edge (stage 11):** The developer is building the orchestration layer itself, shaping how agents work together for their specific context.

### The critical transition

The most important transition is between beginner and competent: from manual approvals to skipped permissions. This is where most individuals stall, and where most organisations should focus their enablement effort.

Moving to skipped permissions requires three things: test coverage sufficient to catch agent errors before they reach production, CI/CD maturity sufficient to gate deployment on those tests, and observability sufficient to detect problems that tests miss. Without all three, skipping permissions is gambling. With all three, it is a reasonable extension of trust based on engineering evidence.

## Team-level: modes and practices

Teams have properties that neither individuals nor organisations have. A team of individually capable developers can still fail at agentic adoption if the team has not worked out how to coordinate agent use, share context, or hold retrospectives about agent-authored work. Conversely, a team of less-experienced developers with strong team-level practices can outperform individually stronger teams that operate as loosely associated individuals.

The team-level framing here deliberately avoids a stage ladder. Teams do not progress linearly through team maturity in the way individuals progress through adoption stages. A mature team might operate in different modes for different kinds of work. The right frame is descriptive, not progressive.

### Team agentic modes

Four modes describe the qualitative shape of a team's relationship with agents. A team may operate in different modes for different work streams, and moving between modes is a deliberate choice rather than an achievement.

**Solo-mediated.** Each team member operates their own agent independently. Team coordination happens through traditional mechanisms: pull requests, standups, and code review. Agents are private to each developer; there is no shared agent context. This mode is accessible to any team; the coordination overhead is familiar, and the organisational requirements are minimal.

**Shared-context.** The team operates a shared substrate for agents: shared CLAUDE.md or equivalent, shared spec hierarchy, shared prompt library, shared architectural context. Agents are still invoked individually, but they work from a common knowledge base that reflects the team's collective understanding. This mode requires the team to agree on what belongs in the shared context and to maintain it over time.

**Pair-with-agent.** Agents become a third party in pair programming. The pair - two humans and an agent, or a junior with an agent under senior observation - becomes the unit of work. This is the XP-aligned response to the apprenticeship problem described in Part 5, named here as a team mode. It is particularly suited to teams with mixed experience levels.

**Orchestrated multi-agent.** The team runs multiple agents in parallel against a shared spec hierarchy, with explicit coordination mechanisms: work partitioning, merge protocols, shared state management, and review queues. The team's primary activity shifts from authoring code to orchestrating agents and reviewing their output. This mode is where team-level capability most strongly meets its organisational-infrastructure ceiling.

### Team agentic practices

Six practices describe the specific behaviours that constitute good team-level agentic work. These are not exhaustive, and they apply across modes rather than belonging to any single mode.

**Shared spec authorship.** The team's specification hierarchy - OpenAPI contracts, BDD scenarios, TDD tests - is authored collaboratively rather than owned by individuals. The spec hierarchy is the team's primary shared artefact, and its quality reflects team-level agreement rather than individual expertise.

**Agent-aware code review.** Review focuses on spec adherence, architectural coherence, and system-level consequences rather than line-by-line inspection of agent-authored code. Reviewers ask, "Does this express the right intent?" before asking, "Is this code correct?"

**Retrospectives covering agent-authored work.** The team's regular improvement cycle explicitly includes agent-assisted outcomes. Where did agents help? Where did they mislead? What needs to change in the spec hierarchy, prompts, or shared context as a result? This practice turns individual agent interactions into team learning.

**Coordinated agent invocation.** The team has explicit agreements about when and how agents are invoked: who runs what against which part of the codebase, how parallel agents work is merged, and how conflicts are resolved. Without these agreements, orchestrated multi-agent mode devolves into conflicting branches and stepped-on work.

**Shared context stewardship.** Someone - or a rotating role - owns the maintenance of the shared agent context. CLAUDE.md files, prompt libraries, spec fragments, and architectural decision records are maintained as first-class team artefacts rather than left to decay.

**Apprenticeship pairing.** Juniors pair with agents under senior observation. The senior's role is to help the junior understand why the agent made particular choices, when to override them, and how to critically evaluate their output. This is the mechanism by which judgment gets transmitted in an environment where the traditional apprenticeship of writing boilerplate and debugging routine problems has been removed by the agent.

## Organisational maturity: eight stages

While individual adoption tracks how a developer relates to agents, and team-level modes describe how the team coordinates, organisational maturity tracks whether the organisation can support and benefit from that adoption.

**Stage 1: Minimal or no AI.** Autocomplete, occasional chat questions. AI is a novelty, not a workflow. No organisational stance on AI use. *I asked Co-Pilot.*

**Stage 2: Supervised AI assistant.** AI agents are in use, but every action needs human approval. High friction, limited trust. The organisation may have policies about AI use, but they are primarily restrictive.

**Stage 3: Trusted AI partner.** Permissions are relaxed. Agents operate autonomously within a bounded scope. Humans review output, not each step. The organisation has begun developing guardrails that build trust rather than merely restrict use.

**Stage 4: AI-first workflow.** The agent does most of the work in specific domains. The human role shifts to reviewing changes, setting direction, and quality assurance. Organisational processes begin to adapt to agent-speed output.

**Stage 5: Single autonomous agent.** An agent runs end-to-end with full autonomy in a bounded domain. Humans may or may not review. This requires strong guardrails, observability, and clear escalation paths.

**Stage 6: Multi-agent parallel.** Multiple agents run concurrently across different workstreams. Teams coordinate agent output rather than doing the work directly. Organisational governance must address agent-to-agent interaction, not just human-to-agent interaction.

**Stage 7: Agent fleet management.** Ten or more agents, manually coordinated. The organisation is reaching the limits of human orchestration. Governance, observability, and coordination become critical organisational capabilities in their own right.

**Stage 8: Custom orchestration.** The organisation builds bespoke orchestration layers. Agents manage agents. The operating model is being redesigned around AI-native workflows.

### The critical stall

Most organisations believe they are at stages 3-4. Most are at stages 1-2. The gap between self-assessment and reality is itself diagnostic: organisations that overestimate their maturity typically lack the measurement capability to know where they actually are.

The critical stall is between stages 2 and 3: moving from supervised to trusted. This requires engineering evidence (tests, observability, and deployment controls) that most organisations lack. The work of moving from stage 2 to stage 3 is primarily engineering enablement, not AI adoption.

This is structurally identical to the move from manual change advisory boards to automated CABs. In both cases, the organisation is replacing human judgment-as-gate with engineering evidence-as-gate: trusting the pipeline to tell you whether a change is safe rather than trusting a committee to decide. The DORA research shows that high performers who use peer review and automated pipelines instead of CABs achieve better change failure rates, not worse. Stage 2 organisations require human approval for every agent action for the same reason low performers require a CAB for every deployment: they lack the engineering controls that would make that approval unnecessary. The investment is not in removing the gate. It is in building the replacement mechanism - the tests, observability, and deployment controls - that makes the gate redundant.

There is a second reason the stage 2-to-3 transition matters disproportionately, and it predates DORA. Eliyahu Goldratt's Theory of Constraints holds that optimising any step in a system other than the binding constraint makes throughput worse, not better, because it pushes more work into the bottleneck. Code generation is almost never the binding constraint in a software delivery system. Testing, code review, integration, deployment approval, and production learning are. When Agentic AI accelerates code generation inside a system whose constraints live downstream, it increases the arrival rate at those constraints. Queues lengthen. Batch sizes grow. Quality leaks multiply. This is the mechanism behind the DORA finding that AI amplifies dysfunction: not that AI is bad for low performers, but that AI optimises a non-constraint, thereby making every constraint worse. The readiness diagnostic exists because of this. Before an organisation adds Agentic AI to its delivery system, the binding constraints must be identified and relieved. Otherwise, the intervention is not neutral - it is actively harmful, and the harm compounds with usage.

## How the three dimensions interact

The first interaction is between the individual stage and the organisational stage. A stage-8 individual developer operating in a stage-2 organisation is a liability, because they move faster than the organisational guardrails can support. A stage-2 individual developer in a stage-5 organisation is an opportunity, because the organisational infrastructure exists to support their growth.

Adding the team dimension surfaces two further interactions and one bounding relationship.

**Teams mediate individual and organisational dimensions.** A team of stage-6 individuals in a stage-4 organisation can operate in any mode the team chooses - solo-mediated, shared-context, pair-with-agent - provided the team has done the work of establishing its own practices. The same individuals in the same organisation, operating as loosely associated individuals without team-level agreements, will fall back on solo-mediated and will under-realise the organisational capability available to them. This is a common failure mode: organisations that have invested in infrastructure but not in team-level coordination see lower adoption than their infrastructure warrants.

The inverse case is also worth naming. A stage-11 individual operating a custom orchestrator like Gas Town inside a stage-2 organisation produces a different failure mode: code volume far in excess of what the team's review and the organisation's deployment controls can absorb. This is not a coordination problem; it is the bounding relationship operating in reverse, with individual capability outrunning organisational containment. The framework's prediction is that the resulting code will reach production faster than incidents can produce learning, and that the organisation will spend the next quarter cleaning up consequences rather than capturing benefits.

**Team capability is bounded by organisational infrastructure.** Some team modes and practices are accessible regardless of organisational maturity. Solo-mediated and shared-context modes can be adopted by any team whose organisation permits agent use at all. Basic practices - agent-aware code review, retrospectives covering agent-authored work - are similarly accessible. But orchestrated multi-agent mode requires organisational infrastructure that the team cannot provision itself: CI capacity, merge tooling, observability, a compute budget for parallel agent sessions, and policy clarity about what agents are permitted to do. Coordinated agent invocation as a practice requires a CI capable of handling the volume. Shared context stewardship requires governance clarity about what belongs in the shared context and who owns it.

The bounding claim, stated plainly: team modes and practices that depend on infrastructure the team cannot provision are bounded by organisational maturity. Modes and practices internal to the team's own agreements are not. A team can adopt shared spec authorship at any organisational stage; it cannot adopt orchestrated multi-agent at stage 2.

This matters because of a predictable misdiagnosis. Teams that attempt to operate in an orchestrated multi-agent mode in stage-2 organisations will fail, and the failure will appear as "the team can't coordinate." The actual cause is the lack of organisational infrastructure. Investing in team coaching or reorganising the team will not fix it. The organisation has to move from stage 2 to stage 3 before the team mode becomes accessible at all.

**The diagnostic question becomes three-part.** Where is the gap? If individuals are ahead of the team's modes and practices, invest in team-level coaching and explicit agreements. If the team is operating at the limit of its current mode and wants to move to a more demanding one, check whether the organisational infrastructure supports that move before investing in team capability. If the organisation is ahead of both the team and the individuals, invest in enablement and in team-level practice adoption rather than in more infrastructure that the team will not yet use.
