---
title: "Monitoring dataset mentions in research papers"
domain: "research"
year: 2025
summary: "A pipeline that detects when a research paper references a monitored dataset, built with a mix of citation-graph heuristics and a fine-tuned classifier. Used to surface how widely specific datasets travel through the literature, and to flag cases where the dataset is referenced without the methodology acknowledging it."
links:
  - label: "Preprint"
    url: "https://arxiv.org/abs/2502.10263"
  - label: "Code"
    url: "https://github.com/rafmacalaba/dataset-mentions"
featured: true
status: "active"
---

The original version of this work was a citation-graph heuristic. It caught
about 60% of mentions and was fast, but it missed every paper that referenced
the dataset in prose without citing it. The current version layers a
classifier on top of the citation graph and pushes the recall above 90% on
our internal benchmark.
