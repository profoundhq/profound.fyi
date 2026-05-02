---
title: "The Management Question"
order: 60
updated: 2026-04-21
tags:
  - agentic-ai-for-teams
---


Agentic AI does not change which management philosophy is appropriate. It makes it impossible to sustain the fiction of one while practising another.

## The Theory X/Y forcing function

McGregor's Theory X assumes workers are inherently lazy, need control, and will not take initiative without supervision. Theory Y assumes people are self-motivated, seek responsibility, and thrive with autonomy. Most knowledge-work organisations claim to practice Theory Y. Many actually practice Theory X dressed as accountability frameworks, performance management systems, and "transparency" initiatives.

Agentic AI exposes this gap. If you instrument everything an AI agent does - every call, every decision, every output - you have the panopticon applied to the humans who work alongside those agents. The transparency that makes AI auditable makes human work measurable in ways that feed Theory X instincts in managers.

The question is not whether Agentic AI enables Theory Y management. It is whether your organisation's management culture can handle the transparency that Agentic AI creates without reverting to surveillance and control.

If you were already practising genuine Theory Y - real autonomy, outcome focus, and trust - Agentic AI extends that naturally. The team gets more capable, the manager focuses on removing obstacles and setting direction, and the transparency is used for learning rather than monitoring.

If you were practising Theory X dressed as Theory Y, Agentic AI hands you better surveillance tools and reveals the contradiction. The manager now has data on exactly how much each developer is producing, exactly what the agents are doing, and exactly where time is being spent. The temptation to use this data for control rather than learning is immense. And developers will feel it.

This dynamic plays out at the team level as well as the organisational level. A team that adopts shared-context or orchestrated multi-agent modes makes its internal coordination visible in ways that solo work does not. Whether that visibility is used for mutual learning or for mutual surveillance is a team-culture question, and it tends to reflect the organisational culture above it. Teams are where Theory X and Theory Y are lived day-to-day; the organisation sets the conditions, but the team determines the actual practice.

## Governance without engineering foundations is performative

You cannot govern what you cannot observe. Most AI governance frameworks assume the existence of engineering capabilities that many organisations lack: observability, contract-driven design, automated testing, deployment controls. Without these capabilities, governance is policy without enforcement - a document that describes how things should work in an organisation that cannot verify whether they do.

The practical implication: governance and engineering enablement must advance together. A governance framework that outpaces engineering capability creates compliance theatre. Engineering capability that outpaces governance creates unmanaged risk. Neither is acceptable.

The specific governance capabilities that matter for Agentic AI in development teams:

**Observability of agent actions.** What did the agent do? What code did it produce? What decisions did it make? If you cannot answer these questions after the fact, you cannot govern agent use.

**Contract-driven design.** Clear, versioned, enforced interfaces between services. Agents operating without explicit contracts will find and exploit implicit assumptions in ways that are difficult to detect and expensive to fix.

**Automated quality gates.** Tests, linting, security scanning, and deployment controls that gate agent-produced code before it reaches production. These must be automated because the volume of agent-produced code exceeds what human review can handle. These gates must run on every change, regardless of whether a human or an agent produced the code. The pipeline does not know or care about authorship. It cares about quality.

**Audit trails.** Who asked the agent to do what, when, and what was the result? This is not about surveillance of developers. It is about the ability to trace a production problem back to its origin, whether that origin was a human decision or an agent action. At minimum, every commit should record whether it was agent-assisted and which agent produced it. Git commit metadata can carry this information without changing the development workflow. For regulated environments, a richer audit trail may be required: the full agent session log linked to the resulting commits, reviewable by compliance. The principle is traceability, not surveillance. The question you need to answer after an incident is "what happened and why," not "who was slacking."

## Governance maturity tracks organisational maturity

An organisation at stage 2 (supervised AI assistant) needs minimal governance beyond existing code review and CI practices. An organisation at stage 5 (single autonomous agent) needs the full set of capabilities described above. Governance investment should match the level of autonomy being granted to agents. Over-governing early adoption creates friction that kills experimentation. Under-governing advanced adoption creates risk that should have been managed.
