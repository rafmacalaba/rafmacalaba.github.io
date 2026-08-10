import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";
import { siteConfig } from "../lib/site.ts";

export async function GET(context: APIContext) {
  const posts = await getCollection("blog", (entry) => entry.data.draft !== true);
  const sorted = posts.sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime()
  );
  return rss({
    title: `${siteConfig.name} — Writing`,
    description: siteConfig.tagline,
    site: context.site ?? siteConfig.url,
    items: sorted.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id.replace(/\.md$/, "")}`,
    })),
    customData: `<language>en-us</language>`,
  });
}
