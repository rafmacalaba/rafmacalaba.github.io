import { defineCollection } from "astro:content";
import { file } from "astro/loaders";
import { highlightSchema } from "./schema";

const highlights = defineCollection({
  loader: file("src/content/highlights.json", {
    parser: (text) => {
      const entries = JSON.parse(text);
      if (!Array.isArray(entries)) throw new Error("highlights.json must be an array");
      return entries.map((entry) => ({
        ...entry,
        id: entry.url,
      }));
    },
  }),
  schema: highlightSchema,
});

export const collections = { highlights };
