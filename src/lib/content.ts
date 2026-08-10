import { getCollection, type CollectionEntry } from "astro:content";
import {
  getPublishedPosts as logicGetPublishedPosts,
  getRecentPosts as logicGetRecentPosts,
  getFeaturedProjects as logicGetFeaturedProjects,
  getProjects as logicGetProjects,
  getNow as logicGetNow,
  type PostEntry,
  type ProjectEntry,
  type NowEntry,
} from "./content-logic.ts";

type BlogEntry = CollectionEntry<"blog">;
type ProjectsEntry = CollectionEntry<"projects">;
type NowCollectionEntry = CollectionEntry<"now">;

function postFromEntry(entry: BlogEntry): PostEntry {
  return {
    id: entry.id,
    slug: entry.id.replace(/\.md$/, ""),
    body: entry.body ?? "",
    data: entry.data,
  };
}

function projectFromEntry(entry: ProjectsEntry): ProjectEntry {
  return {
    id: entry.id,
    slug: entry.id.replace(/\.md$/, ""),
    body: entry.body ?? "",
    data: entry.data,
  };
}

function nowFromEntry(entry: NowCollectionEntry): NowEntry {
  return {
    id: entry.id,
    body: entry.body ?? "",
    data: entry.data,
  };
}

export async function getPublishedPosts(): Promise<PostEntry[]> {
  const entries = await getCollection("blog");
  return logicGetPublishedPosts(entries.map(postFromEntry));
}

export async function getRecentPosts(n: number): Promise<PostEntry[]> {
  const entries = await getCollection("blog");
  return logicGetRecentPosts(entries.map(postFromEntry), n);
}

export async function getFeaturedProjects(): Promise<ProjectEntry[]> {
  const entries = await getCollection("projects");
  return logicGetFeaturedProjects(entries.map(projectFromEntry));
}

export async function getProjects(
  query: { domain?: ProjectEntry["data"]["domain"] } = {}
): Promise<ProjectEntry[]> {
  const entries = await getCollection("projects");
  return logicGetProjects(entries.map(projectFromEntry), query);
}

export async function getNow(): Promise<NowEntry | undefined> {
  const entries = await getCollection("now");
  return logicGetNow(entries.map(nowFromEntry));
}
