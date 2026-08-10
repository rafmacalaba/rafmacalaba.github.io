---
title: "armada: orchestrating AI agent teams with evidence gates"
description: "Introducing armada, an open-source tool that splits coding work into evidence-gated phases and dispatches specialist subagents."
pubDate: 2026-08-10
tags: [armada, agents, open-source]
draft: false
---

I built something over the past few months. It is small, opinionated, and probably only useful to a narrow slice of people. I am putting it out anyway.

The problem it solves is one I kept tripping over: long-running AI coding sessions that start with momentum and end in sprawl. An agent edits a file, another agent edits the same file differently, and somewhere around hour three I am staring at a diff I do not trust, unsure which piece of the contract got satisfied and which got trampled. I wanted discipline. Not vibes.

## What armada does

Armada is an orchestration layer for AI agent teams. It takes a multi-step coding task, splits it into phases, and runs each phase against a written contract. No phase completes without evidence.

The contract is a single file: `REQUIREMENTS.md`. It defines what gets built, what each phase must deliver, and what counts as done. Armada reads it and builds a phase graph from it.

Each phase is a gate. A phase starts when its dependencies pass. It ends when a subagent — a specialist with a narrow role like backend-dev, qa, or adversary — produces evidence that satisfies the phase's success criteria. A backend phase might require a passing test run pasted into a receipt. A QA phase might require screenshots and a defect ledger. If the evidence is missing or weak, the phase does not pass.

The specialists do not chat. They read their task spec, do the work, and return a receipt. The receipts thread through the whole process. At the end, the work ships as a pull request with the full chain of evidence behind it.

## Why now

Two things changed. First, agent models got capable enough that "follow a structured contract" is not a joke anymore. They still drift, but with narrow roles and clear deliverables, the drift stays contained. Second, I got tired of prompting my way out of messes. I wanted the machine to hold the line, not me.

Armada is a bet on structure over cleverness. It does not try to make agents smarter. It tries to make their work auditable.

## What it is not

This is a personal tool. It is single-tenant — one workspace, one human calling the shots. The risk model is simple: I trust the agents enough to give them edit access, and I review the receipts before I accept the PR. That model would not hold for a team where different people have different trust postures. I have not tested it there and I am not claiming it works there.

It is also not a general-purpose agent framework. There are plenty of those. Armada is narrow by design: it fits coding tasks that benefit from sequential phases, specialist roles, and evidence gates. If your workflow is "ask agent to do a thing and watch it go," armada adds overhead you do not need.

## What is next

I am open-sourcing it at [github.com/rafmacalaba/armada](https://github.com/rafmacalaba/armada). I do not expect a rush of contributors — this scratches a specific itch — but if a handful of people find the shape useful, or adapt the contract-gate pattern into their own workflows, that is enough.

The next thing I want to add is a stronger adversary loop: pairing each phase's output with a second agent whose only job is to break it. Everything else can wait.

If you try it, I would like to hear what breaks.
