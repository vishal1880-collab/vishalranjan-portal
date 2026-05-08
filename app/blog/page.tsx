import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Blog",
  description: "Notes from Vishal Ranjan on building companies, market research, and indie tools."
};

export default function BlogPage() {
  const posts = getAllPosts();
  return (
    <section className="max-w-prose mx-auto px-5 py-16">
      <h1 className="text-3xl font-semibold">Blog</h1>
      <ul className="mt-8 space-y-6">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link href={`/blog/${p.slug}`} className="block group">
              <p className="text-xs text-gray-500">{p.publishedAt}</p>
              <h2 className="text-xl font-semibold group-hover:text-accent mt-1">{p.title}</h2>
              <p className="text-gray-700 mt-1">{p.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
