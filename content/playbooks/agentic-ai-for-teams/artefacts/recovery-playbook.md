---
title: "Recovery Playbook"
order: 120
section: artefacts
updated: 2026-04-21
tags:
  - agentic-ai-for-teams
---


## When to use this

This playbook is for one specific situation: the organisation has already introduced Agentic AI at scale, downstream chaos has materialised, and the engagement is about getting out of the hole rather than avoiding it in the first place.

Use this playbook when the following are all true:

- Agent-authored code is in production across multiple services.
- At least one of: DORA metrics have visibly degraded since adoption; incidents attributable to agent-authored changes have occurred; engineering leadership has lost confidence in the current adoption trajectory.
- The organisation is not yet asking to stop using AI entirely - it wants to recover, not retreat.
- The engagement has leadership support to reduce agent autonomy temporarily. Without this support, the playbook cannot be executed.

Do *not* use this playbook when:

- Adoption is going well but slower than expected. That is tuning, not recovery.
- The organisation wants to abandon AI adoption. Recovery is a route back to productive adoption, not a way of managing retreat.
- The engineering leader wants the playbook executed but the CTO or equivalent does not support reducing agent autonomy. The political precondition for recovery is not yet met; the engagement is about establishing that support first.

If the situation doesn't match, use the [standard adoption sequence](/playbooks/agentic-ai-for-teams/adoption-sequence/) instead.

## Total time-box

**Eight to twelve weeks end-to-end** for a single engineering organisation of up to 200 engineers. Larger organisations should expect twelve to twenty weeks. Engagements that try to complete recovery in less than eight weeks typically either skip the stabilisation step (producing a fragile result that regresses within a quarter) or underinvest in the diagnostic (producing a plan that addresses symptoms rather than causes).

The time-box is deliberately longer than the urgency usually feels. Recovery under pressure is the pattern that created the situation in the first place.


## Step 1: Stabilise

**Entry criteria.** Agent-authored code is in production across multiple services. At least one of: DORA degradation, incident attribution to agent work, or explicit leadership concern about trajectory.

**Expected duration.** One to two weeks.

**Objective.** Reduce the arrival rate of agent-generated change into production until the existing quality backlog can be worked down. This is a WIP-limit intervention, not a measurement or reorganisation step.

**Named interventions.**

*Reduce agent autonomy across all teams.* Move from current stage (typically 3 or 4) back to stage 2 (supervised AI, approval on every action). This is non-negotiable for the duration of stabilisation. It will be resisted - "we need to ship faster, not slower" - and the resistance needs to be met with the Theory of Constraints argument: throughput through a constrained system is maximised by reducing arrival rate, not by increasing it. The organisation is already paying the cost of the constraint. The question is whether it pays that cost as visible slowdown or as invisible quality debt.

*Freeze expansion of agent use.* No new teams, no new repositories, no new tiers of autonomy during stabilisation. Any exceptions go to the head of engineering with written justification.

*Publish the stabilisation timeline.* Engineering leadership announces the stabilisation step, its expected duration, and what will trigger exit. Silent reductions in agent autonomy damage trust and invite workaround behaviour. Visible stabilisation with a named end date is tolerable.

*Stand up an incident-reduction cell.* A small cross-team group (typically 3-5 people) with explicit authority to prioritise fixing agent-attributable issues in production ahead of new feature work. This cell remains in place for the stabilisation step only; its purpose is to clear the immediate backlog, not to become a permanent structure.

**Common resistance patterns and responses.**

*"This will kill our velocity."* Velocity is already damaged; it is presenting as incidents rather than as visible throughput. Making the damage visible is the point.

*"We've invested in these tools and this reverses it."* The investment is not in the tools. It is in the capability. Stabilisation preserves the capability by protecting the capability's operating conditions.

*"Our competitors are racing ahead."* The industry data is unambiguous that AI accelerates dysfunction where foundations are weak. Competitors racing ahead without stabilisation are accumulating the same debt you are trying to pay down. The race is not the one that it appears to be.

**Evidence of completion.** Exit to step 2 requires:

- All teams are operating at stage 2 (supervised AI) or below for at least one full sprint cycle.
- The incident-reduction cell reports the agent-attributable incident backlog is being worked down at a measurable rate (typically defined as the backlog reducing week-on-week for two consecutive weeks).
- No new agent-related incidents have entered the backlog faster than existing ones are being resolved for at least one week.

**What failure looks like.** If stabilisation is still not meeting these criteria after three weeks, the organisation is in a deeper hole than the playbook assumes. Escalate: the engagement may need to expand scope to include specific service-level remediation before recovery can proceed.

**Handoff to step 2.** Step 2 begins when the above criteria are met and the incident-reduction cell's backlog is under control - not necessarily empty, but trending down and no longer growing.


## Step 2: Diagnose

**Entry criteria.** Stabilisation complete. Agent-attributable incident backlog under control. Leadership engaged in what comes next.

**Expected duration.** Two to three weeks.

**Objective.** Identify what specifically broke during adoption. This is different from the standard readiness diagnostic, which identifies what an organisation lacks before adoption. The remediation diagnostic asks: what was present before AI that is now damaged?

**Named interventions.**

*Run a four-axis diagnostic.* For each axis, collect specific evidence, not impressions.

**Axis 1: Which delivery metrics degraded and when.** DORA metrics before adoption vs current. Specifically: the shape of the degradation curve matters. Metrics that dropped gradually suggest capability erosion. Metrics that dropped sharply suggest a specific triggering change (a new tool, a policy change, a team restructure).

**Axis 2: Which team practices were displaced.** Interview team leads and senior engineers. What did teams used to do that they no longer do? Typical displacements: code review became perfunctory because volume exceeded capacity; retrospectives stopped covering agent-authored work; specifications were abandoned in favour of prompts; pair programming was dropped because "the agent is the pair."

**Axis 3: What organisational learning has been lost.** This is the hardest axis to measure directly. Proxies: has the number of architectural decision records dropped? Are post-incident reviews producing durable artefacts? Can the team explain why current designs are the way they are, or only how to modify them? Loss of organisational learning is the underlying damage that continues to produce symptoms long after acute incidents are resolved.

**Axis 4: Where specification debt has accumulated.** For each service or major code area, can the team produce the specifications (OpenAPI, BDD scenarios, architectural contracts) that should govern agent work on that area? The gap between where specs should exist and where they do exist is specification debt. Services with high specification debt are the ones where future agent work will continue to produce problems regardless of other recovery work.

*Produce a diagnostic report.* Four axes, concrete evidence per axis, three to five prioritised findings with named owners. The report is the handoff artefact to step 3.

*Present the diagnostic to leadership.* Not a summary. The full diagnostic. Leadership sometimes wants the comfortable version; the playbook does not permit this. Present evidence directly.

**Common resistance patterns and responses.**

*"We don't have time for a three-week diagnostic."* The alternative is recovery work that addresses symptoms rather than causes, and the need to repeat recovery within two quarters. The three-week investment is the cheap path.

*"We already know what's wrong."* Often true at a high level; rarely true at the specificity needed to design interventions. Collect evidence anyway; the specifics are where the interventions live.

*"Can we skip axis 3? It's soft."* Axis 3 is the hardest and the most important. Organisations that skip it tend to recover DORA metrics without recovering capability, and relapse.

**Evidence of completion.** Exit to step 3 requires:

- Diagnostic report covering all four axes, with named prioritised findings.
- Leadership has reviewed and accepted the findings (or formally disputed them, which is itself a useful input).
- Owners named for each priority finding.

**What failure looks like.** A diagnostic that produces generic findings ("communication could be better", "we need more testing") has failed. Specific findings are actionable; generic findings are not. If the diagnostic is producing genericity, the interview protocol needs sharpening - typically the interviewers are not pushing past first answers.

**Handoff to step 3.** Step 3 begins when leadership has accepted the diagnostic and named owners for priority findings.


## Step 3: Restore

**Entry criteria.** Diagnostic complete and accepted. Named priority findings with owners.

**Expected duration.** Three to five weeks.

**Objective.** Restore the feedback loops and team practices that AI acceleration eroded. This is team-level capability work primarily, with organisational infrastructure work in support.

**Named interventions.** The specific interventions depend on the diagnostic findings. The following are the most common and the order in which they are typically addressed.

*Restore spec authorship as a team practice.* For each service with specification debt, the team owning that service spends time reconstructing the specifications from the existing code and recent behavioural decisions. This is often painful; the team discovers that they do not fully understand their own service. That discovery is the point. Until the team can articulate the spec, they cannot supervise agent work against it.

*Restore retrospectives covering agent-authored work.* Teams explicitly add "agent-authored work" as a standing retrospective agenda item. What worked, what misled, what needs to change in the shared context or the spec. This is the mechanism by which individual agent interactions become team learning. Without it, the team keeps hitting the same classes of problem.

*Restore substantive code review.* Not line-by-line review; that will never scale. Review focused on spec adherence, architectural coherence, and system-level consequences. Teams often need coaching on what this looks like. Senior engineers demonstrate the shape of good review in pairing sessions. The practice has to be learned; it does not emerge spontaneously from a policy statement.

*Restore pair-with-agent for knowledge transfer.* For any team where juniors arrived during the AI-amplified period and did not benefit from the traditional apprenticeship, set up pair-with-agent pairings with seniors observing. This is a structural investment in the next cohort of senior engineers; skipping it accumulates the damage.

*Address the top organisational-infrastructure finding.* If the diagnostic identified an organisational infrastructure gap (typically test coverage on critical paths, pipeline test gating, or observability completeness), begin the work of closing it. This is usually a multi-quarter investment; the objective of step 3 is to start it, not complete it.

*Hold at stage 2 across all teams.* Agent autonomy remains at stage 2 throughout this step. Any pressure to restore autonomy before practices are restored is refused. The relaxation is for step 4.

**Common resistance patterns and responses.**

*"We're spending too long on internal work and not delivering features."* True, and that is the cost of recovery. The alternative is feature delivery at the current accelerated-but-broken pace, which has already produced the incidents that triggered recovery in the first place.

*"The spec reconstruction feels like academic make-work."* It will, until the first time a team catches a defect during spec reconstruction that would otherwise have reached production. After that it feels different. The first instance usually arrives in the second or third week of step 3.

*"Junior developers are bored."* Juniors paired with agents under senior observation are not bored; they are learning. Juniors running agents on their own are bored and developing bad habits. The difference is the senior's presence.

**Evidence of completion.** Exit to step 4 requires:

- Every team with specification debt has produced specs for at least the critical paths of their services.
- Retrospectives have covered agent-authored work for at least two full cycles in every team.
- Code review practice has visibly shifted - samples reviewed by engineering leadership show focus on spec and architectural issues rather than line-by-line inspection.
- Apprenticeship pairing is in place for every junior hired during the AI-amplified period.
- The top organisational-infrastructure finding has a time-bounded delivery plan with a named owner.

**What failure looks like.** Step 3 runs over by more than two weeks with no sign of practices actually changing in team behaviour. Typical cause: the interventions are being performed as compliance rather than adopted as capability. The honest conversation is whether the team can genuinely recover or whether it needs leadership changes.

**Handoff to step 4.** Step 4 begins when team practices are visibly restored in behaviour, not just in policy.


## Step 4: Re-adopt

**Entry criteria.** Team practices restored. Organisational infrastructure work underway. Leadership ready to re-introduce agent autonomy selectively.

**Expected duration.** Two to three weeks initially; ongoing for two to four quarters as re-adoption proceeds.

**Objective.** Re-introduce agent autonomy on the evidence-gated basis the standard adoption sequence prescribes, now with the advantage that the organisation has lived through the failure mode and the case for evidence gating no longer requires abstract persuasion.

**Named interventions.**

*Identify the first re-adoption candidate.* A team, a service, or a specific kind of work that has: restored practices (step 3 exit criteria met at team level), low risk profile (not financial, not regulated, not safety-critical), and volunteers rather than conscripts. The first re-adoption is a demonstration, not a rollout.

*Define the re-adoption hypothesis explicitly.* "We believe that allowing team [X] to operate in [mode] on [work stream] will improve [specific metric] without degrading [specific metric]." Written down. Measured. Reviewed after two sprint cycles.

*Run the first re-adoption with explicit review.* Engineering leadership reviews progress weekly for the first month. Not micromanagement; an acknowledgement that this is the test case for the recovery's validity. Problems surface quickly under this attention.

*If the first re-adoption succeeds, expand deliberately.* Second team, third team. Each expansion is its own hypothesis with its own measurement. Pace is determined by the rate at which organisational infrastructure continues to close gaps, not by the appetite for agent use.

*Hand off to the standard adoption sequence.* Once three to five teams have successfully re-adopted and the organisational infrastructure has moved to stage 3, recovery is complete. The engagement either ends or transitions to standard adoption sequence work for the remaining teams.

**Common resistance patterns and responses.**

*"Can we go faster now that we've done the work?"* Maybe. The data will tell you. The data has to tell you, because the whole point of recovery is that intuition about readiness was wrong the last time.

*"The first re-adoption is being cautious to the point of ceremony."* Caution is the feature, not the bug. The next re-adoption will be faster because the first one established the shape.

*"Other teams are frustrated that they have to wait."* True, and a reasonable frustration. The order in which teams re-adopt is determined by their step 3 readiness, not by tenure or organisational politics.

**Evidence of completion.** Recovery is complete when:

- Three to five teams have successfully re-adopted without regression of DORA metrics.
- Organisational infrastructure has moved to at least stage 3.
- No agent-attributable incidents have occurred in re-adopted teams for at least one quarter.
- The underwriting pack produced at the start of recovery shows material improvement on measured gaps.

**What failure looks like.** Re-adoption produces a repeat of the original symptoms within the first two cycles. The honest diagnosis is usually that steps 1-3 were executed as theatre rather than as genuine recovery; the organisation did not internalise what had to change. Escalation path: return to step 1, with a shorter stabilisation this time but a more demanding diagnostic, and honest leadership conversation about whether recovery is viable without structural change.


## Running the playbook alongside the underwriting pack

The recovery playbook produces evidence that the underwriting pack reports. Concretely:

- Step 1 stabilisation produces the "current exposure" assessment in the risk register.
- Step 2 diagnostic populates the "controls and gaps" section.
- Step 3 restoration work appears as "mitigation in progress" against each risk.
- Step 4 re-adoption measurement populates the "measurement commitment" deliverables.

Running these as a single instrument rather than two parallel programmes is the efficiency. Boards see one pack; engineering leaders work one playbook; the pack is the communication layer over the playbook's evidence.


## Notes on using the playbook

**The playbook is the engagement plan, not a supplement to it.** Clients sometimes ask for the playbook to be embedded in a larger transformation programme. Resist this. The playbook has specific entry criteria and a specific exit point; embedding it in a broader programme typically corrupts the entry criteria and postpones the exit.

**Leadership commitment is the precondition, not the output.** Do not start step 1 without explicit leadership support to reduce agent autonomy. If that support is uncertain, the engagement begins with a political and educational step before the playbook itself can start.

**The time-boxes are minimums, not targets.** Engagements that finish faster than the ranges above have usually cut a corner. Engagements that finish slower often have a deeper structural issue; treat overruns as findings in themselves.

**Recovery is not one-shot.** Organisations that recover and then slide back into the same pattern are common. The re-adoption step's standing review is not decoration; it is the early-warning system for a second recovery cycle. Treat the first year after recovery exits as maintenance of recovery, not as a return to normal operations.

**Provisional status.** This playbook is drafted from the logic of the remediation sequence in the framework, validated against adjacent practice in delivery improvement and crisis response work, but not yet tested across multiple independent engagements. Treat its specifics as defensible hypotheses rather than proven patterns, and expect refinement with use.


## Related

- [Framework Part 4: The Adoption Sequence](/playbooks/agentic-ai-for-teams/adoption-sequence/) - the remediation sequence that this playbook operationalises.
- [Framework Part 3: Maturity Models](/playbooks/agentic-ai-for-teams/maturity-models/) - the stages and modes the playbook moves teams through.
- [Underwriting Pack](/playbooks/agentic-ai-for-teams/artefacts/underwriting-pack/) - the governance-facing instrument that runs alongside this playbook.
