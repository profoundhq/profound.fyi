---
title: "Worked Examples"
order: 130
section: artefacts
updated: 2026-10-12
tags:
  - creating-playbooks
---


**Five well-known "playbooks" and playbook-adjacent documents run through the [Is It a Playbook](/playbooks/creating-playbooks/artefacts/is-it-a-playbook/) test. The label is doing marketing work in most of them, and the failures are more instructive than the passes.**

Each example gets the five questions, a verdict from the neighbour table, and the lesson it carries for anyone building a collection. The point is not to score points off other people's documents. It is that the test only earns trust by being run in public on things readers already know.


## Atlassian Team Playbook

The strongest structural match in the wild. A collection of named plays, each with a trigger situation, a facilitation procedure, materials, and a time estimate. Guidance exists on where to start and what order to run plays in.

1. **Decomposes into plays?** Yes. This is the genre done properly at the level of form.
2. **Says when each play applies?** Mostly. Plays name the team situation they address, though some entries drift toward "run this quarterly" scheduling rather than situational triggers.
3. **Says when not to?** Weakly. When-not-to sections are largely absent. The collection implies every play suits every team.
4. **Observable signals?** Partially. Some plays name what better looks like, many settle for the workshop having happened.
5. **Judgement required?** Yes. Plays assume a facilitator reading the room.

**Verdict:** a playbook, with the caveat that nearly every play is a facilitated workshop. That is one species of play, not the whole genus.

**The lesson:** best-in-class codification can coexist with invisible governance. There is no public evidence trail, no retirement, no visible mechanism for a team's local improvement to change the standard play. Codification quality and governance quality are separate achievements.


## US Digital Services Playbook

Thirteen plays for building government digital services, each with a checklist and key questions. Public domain.

1. **Decomposes into plays?** Yes, thirteen of them, numbered.
2. **Says when each play applies?** Implicitly. The whole document assumes one situation: you are building a US government digital service. Within that, plays are sequenced rather than situated.
3. **Says when not to?** No.
4. **Observable signals?** The key questions function as weak signals. Better than nothing, softer than observable.
5. **Judgement required?** Yes.

**Verdict:** a playbook for one situation. Closer to an adoption sequence than a collection of situated plays.

**The lesson:** when the entry conditions are global to the document rather than local to each play, you have written a programme, and readers cannot steal one play without inheriting the programme's assumptions.


## The DDaT Playbook (UK Cabinet Office)

Procurement and delivery policy for public sector digital, published under the playbook label, mandated for implementation across the public sector.

1. **Decomposes into plays?** No. It decomposes into policies.
2. **Says when each play applies?** Not applicable. Policies apply always, which is the point of policies.
3. **Says when not to?** No, and it cannot. Mandatory guidance with a when-not-to would not be mandatory.
4. **Observable signals?** Compliance checkpoints, not practice signals.
5. **Judgement required?** Explicitly minimised. The document exists to constrain judgement.

**Verdict:** a methodology-adjacent policy framework wearing the label. This is the one-way door in government form: when-not-to deleted, plays made mandatory, certainty sold as the feature.

**The lesson:** the label sets the reader's contract, and here the mismatch has consequences. A supplier reading "playbook" expects situated judgement and gets compliance requirements. Nothing wrong with policy. Something wrong with the costume.


## GitLab Handbook

Over 2,000 pages of how the company runs, open to the world, changed by merge request.

1. **Decomposes into plays?** No. It decomposes into pages of operating procedure, policy, and reference.
2. **Says when each page applies?** By org structure and topic, not by situation.
3. **Says when not to?** Rarely.
4. **Observable signals?** For the handbook's content, seldom. For the handbook system, yes, and this is where it gets interesting.
5. **Judgement required?** Varies by page. Much of it is deliberately procedural.

**Verdict:** an operating manual, and an exceptional one. It fails the steal test at 2,000 pages and was never trying to pass it.

**The lesson:** this is the reference implementation of the govern stage, running in public at scale. Anyone can propose a change by merge request, pages have owners, every change carries its history. The improvement-to-standard loop exists here more completely than in any document that calls itself a playbook. Its known failure mode is equally instructive: at that page count, staleness is a permanent condition somewhere in the corpus, which is the museum piece antipattern distributed rather than concentrated.


## GOV.UK Service Manual

Guidance helping teams create and run public services that meet the Service Standard, maintained by named communities of practice, with an assessment regime attached.

1. **Decomposes into plays?** No. Guidance topics, some procedural, some explanatory.
2. **Says when each applies?** By delivery phase, which is closer to situating than most manage.
3. **Says when not to?** Occasionally, which puts it ahead of most of this list.
4. **Observable signals?** The Service Standard assessments are the signal mechanism, and they are real.
5. **Judgement required?** Yes, within the bounds the Standard sets.

**Verdict:** a manual plus a standard. Fails the verb test. Not a playbook and not pretending hard.

**The lesson:** this is the broadcast antipattern made to work, and the honest account carries a tension. GDS's stated intent is trust and discretion: their guidance model starts with the why so experts can stop early, offers a range of models rather than one implementation, and explicitly rejects the manual being assessment-prep, on the argument that if you build a great service the assessment takes care of itself. The mechanism that drives engagement is still the gate. Both are true at once: the intent is pull, the teeth are push, and the combination works in a context where thousands of teams must clear a common bar. It would suffocate a context where local variation is the engine of improvement. The broadcast antipattern is an antipattern for playbooks, not a universal law of guidance.


## What the survey shows

Two things, and they pull against each other.

First, codification quality and governance quality almost never co-occur. Atlassian and the USDS codify plays competently and govern invisibly. GitLab governs superbly and has no plays. Nothing surveyed does both.

Second, that gap is either an opportunity or a warning. Either the field genuinely lacks a collection with situated plays and a working improvement loop, or doing both at once is harder than a lifecycle diagram admits, and the survivors specialised for a reason. This playbook is a bet on the first reading. The first external uses will start to settle which reading is right.

*Hypothesis: the reason the two qualities separate is that codifying is an authorial skill and govern is an organisational commitment, and most collections have only one of an author or an organisation behind them.*
