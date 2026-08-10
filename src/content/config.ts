import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { blogSchema, projectsSchema, nowSchema } from "./schema.ts";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: blogSchema,
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: projectsSchema,
});

const now = defineCollection({
  loader: glob({ pattern: "now.md", base: "./src/content" }),
  schema: nowSchema,
});

export const collections = { blog, projects, now };
