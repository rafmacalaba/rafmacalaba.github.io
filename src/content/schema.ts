import { z } from "zod";

export const highlightSchema = z.object({
  type: z.enum(["paper", "blog", "talk", "repo", "other"]),
  title: z.string(),
  url: z.string().url(),
  date: z.string().optional(),
  description: z.string().optional(),
  venue: z.string().optional(),
});

export const highlightsArraySchema = z.array(highlightSchema);

export type Highlight = z.infer<typeof highlightSchema>;
