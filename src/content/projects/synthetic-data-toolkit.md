---
title: "Synthetic data toolkit"
domain: "engineering"
year: 2024
summary: "An open-source toolkit for generating, calibrating, and evaluating synthetic tabular datasets. Designed for researchers who need a privacy-preserving proxy and want to know exactly what they are losing in the trade. Released under MIT."
links:
  - label: "Repository"
    url: "https://github.com/rafmacalaba/synthetic-data-toolkit"
featured: true
status: "active"
---

Built because most synthetic data libraries answer the easy half of the
question (how to sample from a model) and skip the hard half (how to
report calibration). The toolkit ships with a calibration report that runs
alongside the generator so users cannot accidentally publish a generator
without one.
