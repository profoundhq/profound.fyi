---
title: "Underwriting Pack"
order: 110
section: artefacts
tags:
  - agentic-ai-for-teams
---


## What this is

The underwriting pack is the document an engineering leader hands to a board, audit committee, executive risk function, or investor when AI adoption has become a strategic conversation rather than a tactical one. It translates the framework's findings into categories that the governance audience already uses.

It is deliberately short. A 15-minute read is the design constraint. A board reading 40 pages will skim; a board reading 4 pages will remember. The pack refers outward to detailed evidence rather than containing it.

It is also deliberately templated. The same structure populated with different evidence produces a pack for any engagement. This matters because the pack is not a one-time deliverable; it is the standing instrument through which engineering risk is reported to governance on an ongoing basis. A pack that cannot be produced quarterly cannot be maintained.

## Design principles

**Lead with the headline.** The first page answers the question a board member cares about: Are we safe to continue? If not, what should we do? Everything else supports that answer.

**Translate, do not restate.** Engineering-specific terminology (change failure rate, deployment frequency, test coverage, observability maturity) gets translated into governance categories (operational continuity, financial exposure, regulatory exposure, reputational exposure) at the boundary. The underlying evidence remains technically accurate; the presentation is board-legible.

**Show evidence, not assertion.** Every claim in the pack cites specific, named evidence the reader can inspect if they want to. "Test coverage is 34% on critical paths" is evidence. "Our testing is mature" is an assertion. Boards see through assertions quickly.

**Make escalation obvious.** The escalation policy has to look like a change-approval matrix because boards already know how to read those. Introducing a new artefact shape at the escalation point is an accessibility failure.

**Commit to what you will report.** The measurement commitment names specific metrics, specific thresholds, and a specific cadence. Vague commitments to "monitor the situation" are worse than no commitment; they signal that measurement is not yet taken seriously.


## Worked example

*This example shows a completed pack for a hypothetical engineering organisation (Acme Financial, retail banking, mid-adoption). Names and numbers are illustrative but the shape is production-realistic.*

### 1. Position

As of Q2 2026, Acme Financial's retail banking engineering organisation sits at **individual stage 6, team shared-context mode, organisational stage 2** on the three-dimensional maturity model.

**What this means in plain terms.** Individual developers are using agentic tools competently with manual approval on every action. Teams have established shared context for agents (CLAUDE.md, shared specifications) but have not moved to more autonomous modes. The organisation still requires human approval for every agent action, and the engineering controls that would make reduced approval safe are not yet in place.

**The gap.** Individual and team capability are ahead of organisational readiness. Developers are capable of operating in more autonomous modes but cannot do so safely given the current state of organisational infrastructure. The binding constraint on realising value from AI investment is organisational, not individual.

**The target for this review period.** Move the organisation from stage 2 to stage 3 (trusted AI partner, autonomous within bounded scope) by end of Q4 2026, which will allow teams to operate in pair-with-agent mode on low-risk work streams.

### 2. Controls and gaps

**Controls currently in place:**

- Code review is mandatory for every change, human or agent-authored. ✓
- CI runs on every commit to main branches. ✓
- Manual approval gate on every deployment to production. ✓
- Basic observability on production services (uptime, error rates, latency). ✓
- Agent use policy published and acknowledged by all developers. ✓

**Controls required for stage 3 but not yet in place:**

- **Test coverage above 70% on critical paths.** Current: 34% on the payments service, 52% on customer data, 71% on reporting. *Gap: critical path coverage is below the threshold at which agent-authored code can be trusted to CI gating alone.*
- **Deployment pipeline that gates on test results.** Current: CI runs but deployment is manually approved regardless of CI outcome. *Gap: pipeline cannot currently enforce what tests catch.*
- **Observability sufficient to detect agent-specific failure modes.** Current: observability covers service health but not provenance of changes. *Gap: we cannot currently tell from production data whether a failure originated in agent-authored code.*
- **Audit trail linking commits to agent sessions.** Current: commit metadata does not indicate agent involvement. *Gap: we cannot reconstruct which agent made which decision if an incident requires it.*

**Controls required for stage 4 (visible horizon):** policy clarity on agent-to-agent interaction, compute budget governance, specification lifecycle management. Not addressed in this review period.

### 3. Risk register

Risks expressed in governance-legible categories, each with a current exposure assessment and the mitigation in progress.

**Operational continuity.**
*Risk:* An agent-authored change reaches production with a defect that affects customer-facing service.
*Current exposure:* Medium. Manual approval on every deployment reduces probability but does not address the detection gap once code is in production.
*Mitigation in progress:* Test coverage uplift on critical paths (target Q3 2026), deployment pipeline test gating (target Q4 2026).

**Financial exposure.**
*Risk:* Agent-authored changes to financial calculation or settlement logic produce incorrect monetary outcomes.
*Current exposure:* Medium-low. Payments service is subject to reconciliation controls that would detect aggregate discrepancies within 24 hours, but individual transaction errors could affect customers before detection.
*Mitigation in progress:* Agents are not currently permitted on payment-path code changes; this policy remains in force for this review period regardless of other progress.

**Regulatory exposure.**
*Risk:* Agent use in systems subject to regulatory oversight (customer data, credit decisions) produces outcomes that cannot be explained to regulators.
*Current exposure:* Low-medium. Current stage 2 operation means every agent action has a human approver who can be held accountable; the accountability chain is intact.
*Mitigation in progress:* Audit trail development (target Q4 2026) will be required before stage 3 operation is permitted in regulated code paths. Stage 3 operation will remain excluded from regulated code until audit trail controls are independently validated.

**Reputational exposure.**
*Risk:* A public incident is attributed, correctly or incorrectly, to AI-driven change, damaging customer trust.
*Current exposure:* Low. No current public incidents attributed to AI. However, the industry is increasingly sensitive to AI-related incidents and the threshold for reputational damage is declining.
*Mitigation in progress:* Incident response process updated to include AI-provenance assessment as a standard step in customer communication drafting.

### 4. Escalation policy

Agent activity is classified into four tiers, each with specified approval requirements. This matrix mirrors the change approval process already in use for non-AI changes, with additional gates where warranted.

| Tier | Activity | Approval required | Example |
|------|----------|-------------------|---------|
| A | Agent-assisted work on non-production code, internal tools, documentation | Individual developer self-approval | Generating test data, writing documentation, scaffolding new internal services |
| B | Agent-assisted work on production code in non-regulated paths | Peer review + standard CI gates | Adding features to the reporting service, refactoring the admin interface |
| C | Agent-assisted work on production code in regulated paths (customer data, reporting, analytics) | Peer review + tech lead approval + standard CI gates + audit trail entry | Modifying customer-data query logic, updating dashboard metrics |
| D | Agent-assisted work on financial-path code (payments, settlement, balances) | **Not permitted at current maturity level.** Escalates to head of engineering for case-by-case review. | Any change to payment processing, settlement, or balance calculation |

**Escalation triggers.** Any of the following moves a given piece of work up one tier: opaque agent reasoning that cannot be explained in review, novel architectural implications, cross-service impact, regulatory-flagged code path not previously tagged.

**Review cadence.** This escalation policy is reviewed quarterly. The next review is at end of Q3 2026, aligned with the test coverage milestone. If test coverage and pipeline gating milestones are met, tier C may be revisited for simplified approval.

### 5. Measurement commitment

The following metrics will be reported to the board at the end of each quarter. Thresholds marked *amber* trigger a discussion at the subsequent board meeting; thresholds marked *red* trigger an immediate pause on any expansion of agent autonomy pending review.

**Delivery metrics (DORA).**

| Metric | Current (Q2) | Target (Q4) | Amber | Red |
|--------|--------------|-------------|-------|-----|
| Deployment frequency (retail banking) | 3.2/week | 5/week | <2/week | <1/week |
| Lead time for changes | 4.8 days | 3 days | >7 days | >10 days |
| Change failure rate | 9.1% | <7% | >12% | >18% |
| Time to restore service | 3.4 hours | <2 hours | >6 hours | >12 hours |

**AI-specific metrics.**

| Metric | Current | Target | Amber | Red |
|--------|---------|--------|-------|-----|
| % of commits with agent-provenance metadata | 0% | 100% | <80% | <50% |
| % of incidents where agent involvement can be determined from data | Not measured | 100% | <90% | <70% |
| Critical path test coverage (payments) | 34% | 70% | <60% | <40% |
| Critical path test coverage (customer data) | 52% | 70% | <60% | <40% |

**Organisational metrics.**

- Team cognitive load (quarterly survey, all engineering teams): direction of change reported, with any team showing increase flagged for review.
- Engineer retention in AI-active teams: compared to organisational baseline, variance greater than 5 percentage points flagged for review.

**What will not be measured.** Lines of code produced, commits per developer, agent invocations per day, or any volume-based metric. These are not reported in any forum, including internal engineering management forums, because they create incentives that damage the capabilities this programme depends on.


## Template

The following is the blank template. Copy this into your engagement, populate with the evidence you have, and mark gaps explicitly.

### 1. Position

As of [period], [organisation or unit] sits at **individual stage [n], team [mode] mode, organisational stage [n]** on the three-dimensional maturity model.

**What this means in plain terms.** [Two or three sentences translating the stages into what the organisation can and cannot currently do.]

**The gap.** [Identify which dimension is the binding constraint. State whether investment should focus on individual, team, or organisational capability.]

**The target for this review period.** [Specific, time-bounded target. Typically one step of movement on the constraining dimension.]

### 2. Controls and gaps

**Controls currently in place:**

- [Named control, with evidence it is in place. Use a check mark only if independently verifiable.]
- [Repeat for every material control.]

**Controls required for [next stage] but not yet in place:**

- **[Control name].** Current: [specific measurement]. *Gap: [one-sentence explanation of what this specifically allows or prevents].*
- [Repeat for every gap.]

**Controls required for [stage beyond next] (visible horizon):** [brief list, not addressed in this review period.]

### 3. Risk register

**Operational continuity.**
*Risk:* [Specific, concrete risk.]
*Current exposure:* [High/Medium/Low, with one-sentence justification.]
*Mitigation in progress:* [Named mitigation with target date, or explicit statement that none is in progress.]

**Financial exposure.** [Same structure.]

**Regulatory exposure.** [Same structure.]

**Reputational exposure.** [Same structure.]

*Optional additional categories depending on sector: safety (healthcare, transportation, industrial), data protection (any regulated personal data), strategic (competitive or market-position risk from AI failures).*

### 4. Escalation policy

| Tier | Activity | Approval required | Example |
|------|----------|-------------------|---------|
| A | [Lowest-risk agent activity] | [Self-approval or minimal gate] | [Concrete example] |
| B | [Medium-risk agent activity] | [Peer review + CI gates] | [Concrete example] |
| C | [High-risk agent activity] | [Additional approval + audit] | [Concrete example] |
| D | [Highest-risk or not-yet-permitted] | [Explicit escalation or prohibition] | [Concrete example] |

**Escalation triggers.** [Specific signals that move a piece of work up a tier.]

**Review cadence.** [When this matrix is next reviewed, and what would cause an out-of-cycle review.]

### 5. Measurement commitment

**Delivery metrics (DORA).**

| Metric | Current | Target | Amber | Red |
|--------|---------|--------|-------|-----|
| Deployment frequency | | | | |
| Lead time for changes | | | | |
| Change failure rate | | | | |
| Time to restore service | | | | |

**AI-specific metrics.** [Specific to this engagement - typically provenance, traceability, and coverage metrics.]

**Organisational metrics.** [Cognitive load, retention, and at least one culture signal.]

**What will not be measured.** [Explicit exclusion list. Minimum: volume-based metrics.]


## Notes on using the pack

**Populate with evidence the organisation already has.** The pack is not a new measurement programme. It is a reformatting of information that already exists in CI dashboards, incident reports, survey results, and policy documents. If the organisation cannot populate the pack from existing sources, that itself is a finding - the readiness diagnostic has surfaced a visibility gap.

**Do not populate gaps with aspiration.** An empty cell is honest. A cell filled with a target dressed as a current value destroys the pack's credibility with governance audiences, permanently. If a metric is not currently measured, say so; commit to measuring it by a specific date if appropriate.

**Refresh quarterly, not annually.** The pack is a standing instrument. Boards that see it once are unlikely to see it again, and the organisation loses the benefit of establishing a rhythm around AI-risk reporting. Quarterly is the minimum cadence at which the pack remains meaningful.

**Expect the escalation matrix to be the most contested section.** Boards and governance functions respond strongly to clear escalation because they understand it. They also tend to push for more restrictive matrices than engineering leaders think are warranted. Negotiating the matrix is part of the engagement, not a separate conversation.

**The pack is not a substitute for the diagnostic.** Populating the pack requires the diagnostic to have been done. If a client asks for the underwriting pack without the diagnostic, the honest response is that the pack's outputs would be fabricated. The pack is the communication layer over the diagnostic's evidence base.


## Related

- [Framework Part 3: Maturity Models](/playbooks/agentic-ai-for-teams/maturity-models/) - the model the position section references.
- [Framework Part 6: The Management Question](/playbooks/agentic-ai-for-teams/management-question/) - the governance framing the risk register translates.
- [Framework Part 8: Open Questions](/playbooks/agentic-ai-for-teams/open-questions/) - where the underwriting pack was committed as a development priority.
- [Recovery Playbook](/playbooks/agentic-ai-for-teams/artefacts/recovery-playbook/) - the operational instrument that runs alongside the pack when an engagement begins in crisis.
