---
title: "Six Principles for Adoption"
order: 70
tags:
  - agentic-ai-for-teams
---


These principles apply to technology adoption broadly but are sharpened here for the specific context of Agentic AI.

## 1. Solve the sharpest constraint

Do not adopt technology broadly. Identify the single most painful bottleneck in your value stream and point the technology at that. If you cannot name the constraint, you are not ready to adopt anything. You are shopping.

This is the value stream mapping step from the adoption sequence. The question is not "where could we use AI?" It is "what is actually blocking flow right now, and would this technology shift it?"

## 2. Own your interfaces, not your implementations

Define the contracts between your systems, teams, and capabilities. Make those contracts the stable centre. Let the technology behind them be swappable.

For Agentic AI specifically: do not couple your workflows to a specific model or vendor. Define what you need at the API boundary - inputs, outputs, quality thresholds, latency constraints - and treat the model as a replaceable component behind that boundary. This is twelve-factor thinking applied to AI adoption: dependencies are explicit, backing services are attached resources.

This principle connects directly to the spec-driven development position in Part 5. OpenAPI specifications, integration contracts, and architectural decision records are the top layer of the specification hierarchy. They are also the interfaces you own. When agents produce code that crosses service boundaries, these contracts are what prevent integration drift. Contract testing tools validate agent-produced code against published interfaces automatically. The spec and the interface are the same artefact, serving two purposes: governing agent behaviour and defining system boundaries.

## 3. Structure for flow, not for now

Design your work, data, and processes so they can be consumed by systems and capabilities that do not exist yet. This means investing in clean data pipelines, well-defined domain events, and explicit knowledge structures before investing in tooling.

The organisation that structures for flow will be able to adopt the next generation of AI tooling without restructuring. The organisation that optimises for today's tools will face a re-adoption cost every time the tooling landscape shifts.

## 4. Sense and classify, do not predict

Build feedback loops that detect what is happening rather than dashboards that forecast what might happen. Measure DORA metrics, cognitive load, team satisfaction, and flow efficiency. Use these signals to classify where you are and what to do next, not to predict where you will be in six months.

Prediction assumes stability. Agentic AI adoption is moving too fast for prediction to be reliable. Sensing and classification let you respond to what is actually happening rather than what you expected to happen.

## 5. Distribute decisions to where the knowledge is

The people closest to the work should make the decisions about how agents are used in that work. A centralised AI strategy that prescribes tools, permissions, and practices for all teams will be wrong for most of them. Teams vary in their maturity, their risk profile, their domain complexity, and their readiness. Decisions about agent adoption should be made at the team level, within guardrails set at the organisational level.

The team is usually where the knowledge is. Teams understand their own codebase, their own domain, and the specific failure modes their work is prone to. They are also the unit capable of choosing which agentic mode and which practices fit their current work - a choice that a central function cannot make for them without destroying the context sensitivity that makes the choice useful.

The organisational role is to set the guardrails: minimum test coverage, required observability, mandatory quality gates, governance requirements. Within those guardrails, teams decide how and when to advance their agent adoption, which mode to operate in, and which practices to emphasise.

## 6. Adopt as experiment, not as programme

Every adoption step is a hypothesis. "We believe that giving this team terminal agents with skipped permissions will reduce cycle time by 20% without increasing change failure rate." Measure whether it worked. Reverse it if it did not.

This is the antidote to adoption-as-rollout, the pattern where someone decides "we are adopting X" and it gets pushed to every team on a timeline regardless of readiness or fit. Adoption-as-experiment respects context, generates evidence, and builds genuine organisational learning.
