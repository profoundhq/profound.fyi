---
title: "Format and Access"
order: 70
updated: 2026-10-12
tags:
  - creating-playbooks
---


A playbook nobody can access fails before anyone has a chance to use it. Default to public, make sure everyone in the organisation can read it at the very least, and never make reading or proposing depend on technical wizardry.

Access decides whether the improvement loop can run at all, so it cannot wait until after the writing. A local improvement cannot become the new standard if the person who made it cannot find the play, read it, or propose the change without learning a toolchain first.

## Play: default to public

**When:** starting a collection, or reviewing one that has drifted private by habit rather than decision.

**The action:** publish openly unless a specific play has a specific reason not to. Make the exception per play, not per collection. Client-confidential instances get anonymised at extraction, not locked away at publication.

**Signals:** people outside the org cite, steal, and challenge your plays. Outside pushback is free quality control. A public collection also works as a recruitment instrument: candidates arrive already knowing how you work, and authors take pride in work that is out there.

**When not to:** when a play's situation or instances would expose client work, security posture, or people who did not agree to appear, and anonymising would gut the play. Then the play stays internal and the collection says a play exists there.

## Play: separate the reading path from the change path

**When:** choosing where the collection lives.

**The action:** the master copy is plain text under version control, because that is what makes the govern stage cheap: diffs, history, proposals, owners. But the reading path is web pages, at links that do not change, that anyone can open with nothing more than a browser. No login where public, single sign-on at most where internal, never a repository clone.

**Signals:** the least technical person in the org can get from "I have a situation" to reading the right play without asking anyone for help or access.

**When not to:** a tiny team all fluent in the same tools can collapse the two paths. The moment one person is not fluent, the paths separate, because that person is exactly who the collection most needs to reach.

## Play: make proposing as easy as complaining

**When:** the improvement-to-standard loop is live.

**The action:** offer at least one proposal route that requires no tooling beyond what everyone already uses. A form, an email address, a comment thread. The maintainer turns it into a change under version control. Git-fluent people can raise changes directly, but knowing git should never be the entry fee.

**Signals:** proposals arrive from people who could not have raised a merge request. If every proposal comes from the technical few, the loop is only sampling part of the org, and the plays will drift toward the practices of the people who can operate the door.

**When not to:** never in an org context. The whole point of the loop is that improvement comes from where the work is, and the work is not all done by people who know git.

## Antipattern: the wizard's tax

Tools picked for the maintainer's convenience that end up deciding who can take part. Version control is the right home for the master copy, and it is also a fluency test that most of an organisation fails. When reading requires cloning and proposing requires a pull request, the playbook has become the property of the people who can operate it. GitLab's handbook works this way and works well, but only because git fluency is a hiring condition there. That is a condition of their model, not a transferable practice, and copying the mechanism without the condition builds the tax without the benefit.

You can see it happening when the people closest to the work are not the people proposing changes.

## Copies, decks, and printouts

The master copy is text. Everything else is a copy generated from it: a PDF for an executive who wants to read offline, a slide deck for a briefing, cards for a workshop wall, and a print layout, because people ask for paper more often than screen-first teams expect. Copies help good practice spread, because they make plays easy for other teams to see and borrow.

Two rules keep copies honest. Nobody edits a copy, because the moment people edit the deck or the PDF, there are two competing versions. And a copy never carries the last-tested date or status, because it cannot keep them accurate. A deck is out of date the moment it is exported, and pretending otherwise gives it false authority. Point every copy back at the playbook's own pages.

A deck can be part of a play's kit, where the action is itself a facilitated session and the slides are the facilitation material. That is different from the deck being the play, and the difference is who governs what: the kit travels with the play, the play lives in the collection.

*Hypothesis: the reading path matters more than the licence. An openly licensed collection behind a login gets less external challenge than an all-rights-reserved page anyone can open. I have not tested this.*
