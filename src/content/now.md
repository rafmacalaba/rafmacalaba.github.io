---
updated: 2026-08-10
---

Lately I have been going deep on semantic search — embeddings, rerankers, the whole retrieval pipeline. The problem that keeps me up is not just finding relevant documents but understanding why they are relevant, which means getting comfortable with how dense retrievers collapse semantic space and where hybrid sparse/dense approaches break down. This ties directly into information retrieval more broadly; I have been revisiting classic IR evaluation frameworks and thinking about how well modern embedding-based systems hold up under the precision-recall expectations those frameworks demand.

On the engineering side, I am building armada, an open-source orchestration project for agentic workflows. The idea is to give multi-agent systems a structured delivery lane — think phases, gates, and role-bound specialists — so you can ship agent-driven work with the same discipline you would expect from a human team. It is equal parts infrastructure challenge and design problem: how do you keep state coherent across agents, how do you enforce boundaries without choking throughput, and how do you make the whole thing observable. Those questions bleed into my broader interest in scalable infrastructure — message queues, checkpointing, retry semantics — the kind of plumbing that stops being boring the moment you realize your agents are making thousands of decisions a minute and you need each one to be traceable.

Through all of this I keep circling back to open source. I want useful systems to be small, composable, and well-documented, so other people can inspect, reuse, and adapt them. That is the thread connecting retrieval, armada, and infrastructure: making the things I wish already existed and putting them out in the open.
