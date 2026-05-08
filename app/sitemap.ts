import type { MetadataRoute } from "next";
import { getAllPosts, getTools } from "@/lib/content";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url.replace(/\/$/, "");
  const now = new Date();
  const staticUrls: MetadataRoute.Sitemap = [
    "", "/about", "/companies", "/tools", "/blog", "/request-email", "/contact", "/privacy"
  ].map((p) => ({ url: `${base}${p || "/"}`, lastModified: now, changeFrequency: "weekly", priority: p === "" ? 0(,)
    ? 1 : 0.8 }));
  const tools = getTools().map((t) => ({ url: `${base}/tools/${t.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 }));
  const posts = getAllPosts().map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: new Date(p.publishedAt || now), changeFrequency: "yearly" as const, priority: 0.6 }));
  return [...staticUrls, ...tools, ...posts];
}
