import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllPosts, getPostBySlug } from "@/lib/content";
import { ArticleJsonLd } from "@/components/JsonLd";
import { SITE } from "@/lib/site";
import AdSlot from "@/components/AdSlot";

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = getPostBySlug(params.slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.description,
    alternates: { canonical: `${SITE.url}/blog/${p.slug}` },
    openGraph: { title: p.title, description: p.description, type: "article", publishedTime: p.publishedAt }
  };
}

export default function PostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();
  return (
    <>
      <ArticleJsonLd post={post} url={SITE.url} />
      <article className="max-w-prose mx-auto px-5 py-16 prose-custom">
        <p className="text-xs text-gray-500">{post.publishedAt}</p>
        <h1 className="text-3xl font-semibold mt-1">{post.title}</h1>
        <p className="text-lg text-gray-700">{post.description}</p>
        <div className="mt-8"><MDXRemote source={post.content} /></div>
        <div className="mt-12"><AdSlot slot="blog-bottom" /></div>
      </article>
    </>
  );
}
