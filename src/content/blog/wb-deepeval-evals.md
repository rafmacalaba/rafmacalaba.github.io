---
title: "Beyond chat demos: evaluating LLM systems at scale with DeepEval"
description: "World Bank Open Data blog post on an automated, persona-driven evaluation framework for multi-turn LLM assistants, built on DeepEval."
pubDate: 2026-10-21
tags: [blog, world-bank, llm-evaluation, agents]
draft: false
---

World Bank Open Data blog post on how we moved the Data360 Chat Assistant past the demo stage. Building a chat prototype takes days; proving it is reliable across hundreds of multi-turn sessions is a different problem, so we built an automated evaluation framework on top of [DeepEval](https://deepeval.com/).

Four stages: compose a test user from modular YAML persona facets (base profile, topic, country, conversational pattern), run that persona against the live chatbot API to capture real dialogue traces, pre-filter turns to skip metrics that do not apply (no data returned, so skip Data Accuracy instead of grading a "Hello"), then score with a lightweight LLM judge against custom rubrics using conversation-level and per-turn metrics.

Two pieces matter most in practice. The pre-filtering engine keeps judge cost and runtime down without inflating aggregate scores, since pre-filtered metrics are excluded from the averages. The replay mechanism saves raw text, planner reasoning and tool calls to trace files, so a rubric change can be re-scored in seconds instead of re-running the whole simulation.

In production since February, over 150 runs across 10 composed personas (5-turn dialogues, 3 repeated trials for variance) produced a 98% overall pass rate in a 170-metric sweep, while still surfacing real weak spots: missing "Sources:" headers, overly formal follow-ups, and prompt tweaks whose accuracy gains held up under repeated trials rather than luck.

[World Bank Open Data Blog](https://blogs.worldbank.org/en/opendata/beyond-chat-demos--evaluating-llm-systems-at-scale-with-deepeval) &middot; [GitHub: data-ai-chatbot evals](https://github.com/worldbank/data-ai-chatbot/tree/dev/backend/evals)
