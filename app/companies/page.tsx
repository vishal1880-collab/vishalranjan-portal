import type { Metadata } from "next";
import { getCompanies } from "@/lib/content";
import { OrganizationJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Companies",
  description: "The three companies founded by Vishal Ranjan: IMARC Services, Claight Corporation, and KAMRIT Financial Services."
};

export default function CompaniesPage() {
  const companies = getCompanies();
  return (
    <>
      <OrganizationJsonLd companies={companies} />
      <section className="max-w-5xl mx-auto px-5 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">Companies founded by Vishal Ranjan</h1>
        <p className="mt-4 text-gray-700 max-w-2xl">Three companies across market research and financial services.</p>
        <div className="grid md:grid-cols-3 gap-5 mt-10">
          {companies.map((c) => (
            <article key={c.slug} className="border border-gray-200 rounded-lg p-6">
              <h2 className="font-semibold text-lg">{c.name}</h2>
              <p className="text-xs text-gray-500 mt-1">{c.industry} · {c.role}{c.founded && ` · founded ${c.founded}`}</p>
              <p className="text-sm text-gray-700 mt-4">{c.summary}</p>
              {c.url && <a href={c.url} target="_blank" rel="noopener" className="inline-block mt-4 text-sm text-accent">Visit website →</a>}
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
