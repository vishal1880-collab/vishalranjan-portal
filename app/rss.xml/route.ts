import RSS from "rss";
import { getAllPosts } from "@/lib/content";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  const feed = new RSS({
    title: "Vishal Ranjan — Blog",
    description: "Notes from Vishal Ranjan.",
    site_url: SITE.url,
    feed_url: `${SITE.url}/rss.xml`,
    language: "en"
  });
  for (const p of getAllPosts()) {
    feed.item({
      title: p.title,
      description: p.description,
      url: `${SITE.url}/blog/${p.slug}`,
      date: p.publishedAt,
      guid: p.slug
    });
  }
  return new Response(feed.xml({ indent: true }), {
    headers: { "content-type": "application/rss+xml; charset=utf-8" }
  });
}
