---
title: "Format and Access"
order: 70
updated: 2026-10-12
tags:
  - creating-playbooks
---


**A playbook nobody can reach fails the same way a museum piece does, just earlier. Default to public, guarantee org-wide access as the floor, and never make reading or proposing depend on technical wizardry.**

Access is not an infrastructure detail to sort out after the writing. It determines whether the amplification loop can run at all. A local improvement cannot become the new standard if the person who made it cannot find the play, read it, or propose the change without learning a toolchain first.

## Play: default to public

**When:** starting a collection, or reviewing one that has drifted private by habit rather than decision.

**The move:** publish openly unless a specific play has a specific reason not to. Make the exception per play, not per collection. Client-confidential instances get anonymised at extraction, not locked away at publication.

**Signals:** people outside the org cite, steal, and challenge your plays. External challenge is a test suite you do not have to recruit. A public collection also works as a recruitment instrument: candidates arrive already knowing how you work, and authors take pride in work that is out there.

**When not to:** when a play's entry conditions or instances would expose client work, security posture, or people who did not agree to appear, and anonymising would gut the play. Then the play stays internal and the collection says a play exists there. A visible gap beats a secret door.

## Play: separate the reading path from the change path

**When:** choosing where the collection lives.

**The move:** the canonical form is plain text under version control, because that is what makes the govern stage cheap: diffs, history, proposals, owners. But the reading path is rendered pages at a stable URL that anyone can open with nothing more than a browser. No login where public, single sign-on at most where internal, never a repository clone.

**Signals:** the least technical person in the org can get from "I have a situation" to reading the right play without asking anyone for help or access.

**When not to:** a tiny team all fluent in the same tools can collapse the two paths. The moment one person is not fluent, the paths separate, because that person is exactly who the collection most needs to reach.

## Play: make proposing as easy as complaining

**When:** the improvement-to-standard loop is live.

**The move:** offer at least one proposal route that requires no tooling beyond what everyone already uses. A form, an email address, a comment thread. The maintainer translates it into the canonical mechanism. Git-fluent people can raise changes directly, but git fluency is never the price of participation.

**Signals:** proposals arrive from people who could not have raised a merge request. If every proposal comes from the technical few, the loop is only sampling part of the org, and the plays will drift toward the practices of the people who can operate the door.

**When not to:** never in an org context. The whole point of the loop is that improvement comes from where the work is, and the work is not all done by people who know git.

## Antipattern: the wizard's tax

Governance affordances chosen for the maintainer's convenience becoming a gate on the collection. Version control is the right canonical store, and it is also a fluency test that most of an organisation fails. When reading requires cloning and proposing requires a pull request, the playbook has quietly become the property of the people who can operate it. GitLab's handbook works this way and works well, but only because git fluency is a hiring condition there. That is an entry condition of their model, not a transferable practice, and copying the mechanism without the condition builds the tax without the benefit.

The tell: the people closest to the work are not the people proposing changes.

## Formats and projections

The canonical form is text. Everything else is a projection generated from it: a PDF for the exec who wants to read offline, a slide deck for a briefing or a teach-in, cards for a workshop wall, and a print stylesheet, because demand for paper reliably surprises the people who build for screens. Projections are part of the amplification layer, the go-and-see artefacts that make plays legible enough to steal.

Two rules keep projections honest. A projection never becomes the thing people edit, because the moment it does the collection forks into an official version and a circulating one. And a projection never carries the last-tested date or status, because it cannot honour them. A deck is stale the moment it is exported, and pretending otherwise lends false authority. Point every projection back at the canonical URL.

A deck can be part of a play's kit, where the move is itself a facilitated session and the slides are the facilitation material. That is different from the deck being the play, and the difference is who governs what: the kit travels with the play, the play lives in the collection.

*Hypothesis: the reading path matters more than the licence. An openly licensed collection behind a login gets less external challenge than an all-rights-reserved page anyone can open. I have not tested this.*
