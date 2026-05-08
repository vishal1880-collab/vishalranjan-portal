import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTools } from "@/lib/content";
import { SoftwareAppJsonLd } from "@/components/JsonLd";
import { SITE } from "@/lib/site";
import AdSlot from "@/components/AdSlot";

export function generateStaticParams() {
  return getTools().map((t) => ({ slug: t.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const tool = getTools().find((t) => t.slug === params.slug);
  if (!tool) return {};
  return {
    title: tool.title,
    description: tool.tagline,
    alternates: { canonical: `${SITE.url}/tools/${tool.slug}` },
    openGraph: { title: tool.title, description: tool.tagline }
  };
}

export default function ToolPage({ params }: { params: { slug: string } }) {
  const tool = getTools().find((t) => t.slug === params.slug);
  if (!tool) notFound();
  return (
    <>
      <SoftwareAppJsonLd tool={tool} url={SITE.url} />
      <article className="max-w-prose mx-auto px-5 py-16 prose-custom">
        <p className="text-sm uppercase tracking-widest text-gray-500">{tool.category}</p>
        <h1 className="text-3xl font-semibold mt-2">{tool.title}</h1>
        <p className="text-lg text-gray-700">{tool.tagline}</p>
        <p>{tool.description}</p>
        {tool.url ? (
          <p>
            <a href={tool.url} target="_blank" rel="noopener" className="inline-block bg-ink text-white px-4 py-2 rounded-md text-sm">Open the tool →</a>
          </p>
        ) : (
          <p className="text-sm text-gray-500">Live link coming soon.</p>
        )}
        <div className="mt-10"><AdSlot slot="tool-bottom" /></div>
      </article>
    </>
  );
}
