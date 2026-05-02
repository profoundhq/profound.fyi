---
title: "Scoping the Problem"
order: 20
updated: 2026-04-21
tags:
  - agentic-ai-for-teams
---


## Three types of Agentic AI

Most organisations talk about "Agentic AI" as though it were a single thing. It is not. There are three fundamentally different problem spaces, each with distinct risk profiles, governance requirements, and readiness prerequisites.

**Developer tooling agents** accelerate code production. Examples include Cursor, Claude Code, and GitHub Copilot. The key readiness factors are code quality, test coverage, CI/CD maturity, and clear architectural boundaries. The risk profile is primarily internal: bad code produced faster is still bad code, but it doesn't directly harm customers unless it reaches production through weak deployment practices.

**Business process agents** accelerate operations. Examples include workflow automation, document processing, and internal decision support. The key readiness factors are well-defined processes, clear data ownership, and explicit business rules. The risk profile is operational: an agent that processes invoices incorrectly creates financial exposure. An agent that routes customer cases poorly causes service failures.

**Customer-facing autonomous systems** act on behalf of the organisation in direct contact with customers or external parties. Examples include autonomous customer support, decision-making systems, and recommendation engines operating without human review. The key readiness factors are governance, observability, regulatory clarity, and robust fallback mechanisms. The risk profile is reputational and regulatory: an agent that makes a bad decision on behalf of the organisation can create legal, financial, and trust consequences that are difficult to reverse.

These three categories are not points on a spectrum. They are fundamentally different problem spaces that require different organisational capabilities, governance models, and risk appetites. Treating them as a single initiative leads to one of two failures: over-caution (applying production governance to internal experiments, creating friction that kills adoption) or under-caution (deploying customer-facing autonomy without adequate guardrails, creating risk that should have been managed).

Most organisations asking about "Agentic AI dev teams" are talking about the first category. This framework focuses there, with implications for the other two where relevant.

## The "tooling adoption" misconception

When organisations say they want help "setting up Agentic AI dev teams," they almost always frame it as a tooling problem. They want to equip their existing teams with Agentic AI tools and make them more productive.

This framing is understandable but incomplete. It treats Agentic AI as something you add to existing ways of working. In practice, Agentic AI changes how every role on the team operates, how quality is assured, how learning happens, and how decisions are made. The tooling is the visible part. The capability shift underneath is the substantial part.

A sharper way to put the same point: tooling is increasingly able to commoditise the technical execution layer of agentic development. IDE-based agents commoditise code generation. Frameworks like nWave commoditise the structure of a spec-driven workflow. Platforms like re:cinq's Lore are now beginning to commoditise fragments of governance - approval gates, cost attribution, audit trails, escalation loops - by encoding them as infrastructure. This is real, and any framework that treats tooling and organisation as separate will be out of date within months. What tooling does not commoditise is the organisational layer in which these primitives become coherent: the readiness diagnosis that decides whether a given primitive is appropriate at all, the apprenticeship redesign that preserves judgment as agents absorb execution, the management-culture work that determines whether audit trails are used for learning or for surveillance, and the board-facing translation that allows engineering decisions to be reported as managed risk. The capability development described in this framework lives at that layer. The tooling underneath is replaceable; the organisational scaffold around it is not.

What presents as tooling adoption is, almost always, team capability development that happens to involve new tools.


