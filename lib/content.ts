import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const ROOT = path.join(process.cwd(), "content");

export type Profile = {
  name: string;
  headline: string;
  tagline: string;
  location: string;
  bio: string;
  shortBio: string;
  links: { email: string; linkedin: string; twitter: string; github: string };
  expertise: string[];
  alsoKnownAs: string[];
  disambiguation: string;
};

export type Company = {
  slug: string;
  name: string;
  role: string;
  summary: string;
  url: string;
  industry: string;
  founded: string;
};

export type Tool = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  category: string;
  url: string;
  image: string;
  tags: string[];
  featured: boolean;
  publishedAt: string;
};

export type FaqItem = { q: string; a: string };

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  tags: string[];
  draft: boolean;
};

export type Post = PostMeta & { content: string };

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(ROOT, file), "utf8")) as T;
}

export function getProfile(): Profile {
  return readJson<Profile>("profile.json");
}

export function getCompanies(): Company[] {
  return readJson<Company[]>("companies.json");
}

export function getTools(): Tool[] {
  return readJson<Tool[]>("tools.json");
}

export function getFaq(): FaqItem[] {
  return readJson<FaqItem[]>("faq.json");
}

export function getAllPosts(): Post[] {
  const dir = path.join(ROOT, "posts");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .map((f) => {
      const raw = fs.readFileSync(path.join(dir, f), "utf8");
      const { data, content } = matter(raw);
      const slug = f.replace(/\.(md|mdx)$/, "");
      return {
        slug,
        title: String(data.title ?? slug),
        description: String(data.description ?? ""),
        publishedAt: String(data.publishedAt ?? ""),
        tags: Array.isArray(data.tags) ? data.tags : [],
        draft: Boolean(data.draft),
        content
      } as Post;
    })
    .filter((p) => !p.draft)
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

export function getPostBySlug(slug: string): Post | null {
  return getAllPosts().find((p) => p.slug === slug) ?? null;
}
