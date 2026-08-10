---
title: "Synthetic data is a research instrument, not a dataset"
description: "Treating synthetic data as a measurement tool changes how you evaluate its quality and where you are willing to use it."
pubDate: 2026-06-04
updatedDate: 2026-06-18
tags: ["research", "synthetic-data"]
---

The most common framing of synthetic data is as a stand-in for the real thing:
"could we have got the same answer with a privacy-preserving proxy?" That framing
puts the comparison on the wrong axis.

Synthetic data is a research instrument. Like any instrument, it has calibration
errors, sensitivity limits, and operating ranges where it should not be used at
all. Treating it as a dataset obscures all three.

## Three implications

1. **Evaluation lives downstream.** A synthetic dataset's quality is a property of
   the analysis you run on it, not of the data alone. The same generator produces
   excellent inputs for one study and misleading ones for another.
2. **Calibration is part of the release.** Publishing a generator without a
   calibration report is like publishing a sensor without a spec sheet.
3. **Out-of-range use should fail loud.** A study that uses synthetic data outside
   its calibration envelope should be visibly different from a study inside it,
   not silently so.

This changes the workflow. You don't ship data; you ship an instrument with a
documented envelope.
