import type { Metadata } from "next";
import Link from "next/link";
import { getTools } from "@/lib/content";
import AdSlot from "@/components/AdSlot";

export const metadata: Metadata = {
  title: "Tools",
  description: "Free indie tools built by Vishal Ranjan — vCard QR generator, email deliverability checker, market research utilities, and more."
};

export default function ToolsPage() {
  const tools = getTools();
  const byCat = tools.reduce<Record<string, typeof tools>>((acc, t) => {
    (acc[t.category] = acc[t.category] || []).push(t);
    return acc;
  }, {});
  return (
    <section className="max-w-5xl mx-auto px-5 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Tools</h1>
      <p className="mt-4 text-gray-700 max-w-2xl">A growing collection of small, focused tools I built for myself and shipped because someone else might need them too. All free to use.</p>
      <div className="my-8"><AdSlot slot="tools-top" /></div>
      {Object.entries(byCat).map(([cat, items]) => (
        <div key={cat} className="mt-10">
          <h2 className="text-xl font-semibold">{cat}</h2>
          <div className="grid md:grid-cols-2 gap-5 mt-4">
            {items.map((t) => (
              <Link key={t.slug} href={`/tools/${t.slug}`} className="border border-gray-200 rounded-lg p-5 hover:border-ink transition block">
                <h3 className="font-semibold">{t.title}</h3>
                <p className="text-sm text-gray-600 mt-2">{t.tagline}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {t.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-gray-100 rounded px-2 py-0.5">{tag}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
