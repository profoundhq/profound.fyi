---
marp: true
title: Creating Playbooks - overview
layout: layouts/deck.njk
templateEngineOverride: md
permalink: /playbooks/creating-playbooks/overview/
tags: []
paginate: true
footer: profound.fyi
---

<!-- _class: lead -->
<!-- _paginate: false -->
<!-- _footer: "" -->

# Creating Playbooks

Writing down what works, so other teams can use it, improve it, and drop it when it stops working

---

## Most playbooks fail in one of two ways

- **Nobody updates it.** It was written once, every page has the same date, and people go on trusting it long after it stopped being true.
- **Everyone has to follow it.** It becomes a rulebook with no room for judgement. Teams say they follow it and quietly do something else.

Both happen when a playbook has no way to change as teams find better ways of working.

---

## You need a standard to see what got better

Writing a play down helps teams work the same way. But improvement often relies on someone trying a way that isn't written down yet.

Toyota's car plants handle this by writing down the current best way to do each job, then letting anyone test a better way against it. When a team tries a change, they compare it with the written way to see if it is better.

That only works if any play can change, and a better way can replace the old one without a fight.

---

<!-- _class: steps -->

## Every play answers four questions

1. **When** What situation is this for?
2. **The action** What do you do? Often the shortest part
3. **Signals** How will you know, within weeks, that it is working?
4. **When not to** Where does it not apply? Every play needs this

---

## Most things called playbooks are something else

Does it break into plays? Does each play say when it applies, when it does not, and how you would know it is working? Does it still need judgement? Any no, and it is a neighbour:

- **Checklist:** items to verify, with no situation
- **Runbook:** deterministic steps, with judgement minimised
- **Methodology:** adopted wholesale, with the when-not-to deleted
- **Values statement:** aspirations without actions or signals

Any of these can be the right tool. Label it honestly.

---

<!-- _class: pairs -->

## Each stage has a play, and a mistake it prevents

| Stage | Play | Mistake it prevents |
| --- | --- | --- |
| Sense | Wait until you have seen it three times | Writing a play from one lucky success |
| Extract | Write it from what really happened | Writing how work should go, not how it goes |
| Codify | Start with the situation | Following a recipe in the wrong situation |
| Publish | Publish before you feel ready | Announcing a new way and expecting teams to comply |
| Format and access | Anyone can read it, and suggest changes without git | Only people who know git can change it |
| Govern | Let a better local way become the standard | A playbook nobody updates |

---

## Write the play from what actually happened

Ask people how they work and they describe how it is supposed to go. What they do is often different. The gap is biggest for the most skilled people, because they no longer notice what they do.

- First write down what happened each time, warts and all. Then write the play from those notes.
- Keep the failures in. If it took three attempts, say so, and say what made it hard.

An honest play usually includes something you would rather leave out.

---

## A local improvement becomes the new standard

![w:960 A loop of four steps around the standard play: vary, prove, decide, and shift](/images/playbooks/creating-playbooks/improvement-loop.svg)

The change path must cost less than the workaround.

---

## Anyone should be able to read a play and suggest a change

1. **Make it public by default.** Keep a play private only when there is a reason to.
2. **Reading needs only a browser.** Keep the source in version control, and give each page a link that does not change.
3. **Suggesting a change needs no special tools.** A form, an email, or a comment is enough.

If the people doing the work are not the ones suggesting changes, something is in their way.

---

## Start small, with something that really happened

1. Start a list today. Add a line each time you see your team repeat something that works.
2. Write one play about a time it really happened, using the template. Start with when it applies.
3. Publish before you feel ready. The first three times someone uses it are the real test.

---

<!-- _class: lead -->
<!-- _paginate: false -->
<!-- _footer: "" -->

## Read the full playbook

[profound.fyi/playbooks/creating-playbooks](https://profound.fyi/playbooks/creating-playbooks/)

The playbook online is kept up to date. These slides may not be.
