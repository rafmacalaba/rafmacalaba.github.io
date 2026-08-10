import { z } from "zod";

export const blogSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  tags: z.array(z.string()).optional(),
  draft: z.boolean().optional().default(false),
});

export type BlogFrontmatter = z.infer<typeof blogSchema>;

export const projectsSchema = z.object({
  title: z.string().min(1),
  domain: z.enum(["research", "engineering", "policy"]),
  year: z.number().int().gte(1900).lte(2100),
  summary: z.string().min(1),
  links: z
    .array(
      z.object({
        label: z.string().min(1),
        url: z.string().url(),
      })
    )
    .min(1),
  featured: z.boolean().optional().default(false),
  status: z.enum(["active", "archived"]).optional(),
});

export type ProjectFrontmatter = z.infer<typeof projectsSchema>;

export const nowSchema = z.object({
  updated: z.coerce.date(),
});

export type NowFrontmatter = z.infer<typeof nowSchema>;
