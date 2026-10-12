---
layout: layouts/laws-entry.njk
title: Testing Pyramid
tier: Principle
slug: testing-pyramid
related: [test-driven-development, continuous-integration]
---

Have lots of small fast tests, fewer medium tests, very few big slow tests.

**How to use it.** When tests are slow and break for the wrong reasons, count the shape. An upside-down pyramid (lots of big slow tests, few small ones) produces the misery you would expect.

**How it gets misused.** Defended as the only valid shape. Other shapes suit other systems. The pyramid is a strong default and nothing more.
