import type { BlogFrontmatter, ProjectFrontmatter, NowFrontmatter } from "../content/schema.ts";

export interface PostEntry {
  id: string;
  slug: string;
  body: string;
  data: BlogFrontmatter;
}

export interface ProjectEntry {
  id: string;
  slug: string;
  body: string;
  data: ProjectFrontmatter;
}

export interface NowEntry {
  id: string;
  body: string;
  data: NowFrontmatter;
}

export function getPublishedPosts(posts: PostEntry[]): PostEntry[] {
  return posts
    .filter((p) => !p.data.draft)
    .slice()
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

export function getRecentPosts(posts: PostEntry[], n: number): PostEntry[] {
  return getPublishedPosts(posts).slice(0, n);
}

export function getFeaturedProjects(projects: ProjectEntry[]): ProjectEntry[] {
  return projects
    .filter((p) => p.data.featured === true)
    .slice()
    .sort((a, b) => b.data.year - a.data.year);
}

export interface ProjectQuery {
  domain?: ProjectFrontmatter["domain"];
}

export function getProjects(
  projects: ProjectEntry[],
  query: ProjectQuery = {}
): ProjectEntry[] {
  const filtered = query.domain
    ? projects.filter((p) => p.data.domain === query.domain)
    : projects.slice();
  return filtered.sort((a, b) => b.data.year - a.data.year);
}

export function getNow(nowEntries: NowEntry[]): NowEntry | undefined {
  return nowEntries[0];
}
