import type { Highlight } from "../content/schema.ts";

// Read highlights from the JSON content file directly.
// During astro build, this is evaluated at build time;
// during tests, this avoids astro:content import issues.
import highlightsRaw from "../content/highlights.json" with { type: "json" };

const all: Highlight[] = highlightsRaw as Highlight[];

export async function getHighlightsByType(): Promise<Map<string, Highlight[]>> {
  const groups = new Map<string, Highlight[]>();

  for (const entry of all) {
    const list = groups.get(entry.type) ?? [];
    list.push(entry);
    groups.set(entry.type, list);
  }

  // Sort each group: entries with date first (desc), entries without date last
  for (const [, entries] of groups) {
    entries.sort((a, b) => {
      if (a.date && b.date) return b.date.localeCompare(a.date);
      if (a.date && !b.date) return -1; // a has date, b doesn't — a first
      if (!a.date && b.date) return 1;  // b has date, a doesn't — b first
      return 0;
    });
  }

  return groups;
}

export async function getRecentHighlights(n: number): Promise<Highlight[]> {
  // All entries sorted by date desc, undated last
  const sorted = [...all].sort((a, b) => {
    if (a.date && b.date) return b.date.localeCompare(a.date);
    if (a.date && !b.date) return -1;
    if (!a.date && b.date) return 1;
    return 0;
  });

  return sorted.slice(0, n);
}
