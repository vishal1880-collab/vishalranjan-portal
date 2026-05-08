import Link from "next/link";
import { getProfile, getCompanies, getTools, getFaq, getAllPosts } from "@/lib/content";
import { FaqJsonLd, WebsiteJsonLd } from "@/components/JsonLd";
import { SITE } from "@/lib/site";
import AdSlot from "@/components/AdSlot";

export default function HomePage() {
  const profile = getProfile();
  const companies = getCompanies();
  const tools = getTools().filter((t) => t.featured);
  const faq = getFaq();
  const posts = getAllPosts().slice(0, 3);

  return (
    <>
      <WebsiteJsonLd url={SITE.url} name={SITE.title} />
      <FaqJsonLd items={faq} />

      <section className="max-w-5xl mx-auto px-5 pt-16 pb-10">
        <p className="text-sm uppercase tracking-widest text-gray-500 mb-3">Personal site</p>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
          {profile.name} — {profile.headline}
        </h1>
        <p className="mt-5 text-lg text-gray-700 max-w-2xl">{profile.tagline}</p>
        <p className="mt-3 text-sm text-gray-500 max-w-2xl">{profile.disambiguation}</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/tools" className="inline-flex items-center bg-ink text-white px-4 py-2 rounded-md text-sm">Browse my tools →</Link>
          <Link href="/request-email" className="inline-flex items-center border border-gray-300 px-4 py-2 rounded-md text-sm hover:border-ink">Request a free @vishalranjan.com email</Link>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-5 py-10 border-t border-gray-200">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl font-semibold">Featured tools</h2>
          <Link href="/tools" className="text-sm text-gray-600 hover:text-accent">See all →</Link>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {tools.map((t) => (
            <Link key={t.slug} href={`/tools/${t.slug}`} className="border border-gray-200 rounded-lg p-5 hover:border-ink transition">
              <p className="text-xs uppercase tracking-wider text-gray-500">{t.category}</p>
              <h3 className="mt-2 font-semibold">{t.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{t.tagline}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-5 py-4">
        <AdSlot slot="home-mid" />
      </section>

      <section className="max-w-5xl mx-auto px-5 py-10 border-t border-gray-200">
        <h2 className="text-2xl font-semibold mb-6">Companies I founded</h2>
        <div className="grid md:grid-cols-3 gap-5">
          {companies.map((c) => (
            <div key={c.slug} className="border border-gray-200 rounded-lg p-5">
              <h3 className="font-semibold">{c.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{c.industry} · {c.role}</p>
              <p className="text-sm text-gray-700 mt-3">{c.summary}</p>
              {c.url && <a href={c.url} target="_blank" rel="noopener" className="text-sm text-accent mt-3 inline-block">Visit site →</a>}
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-5 py-10 border-t border-gray-200">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl font-semibold">Latest posts</h2>
          <Link href="/blog" className="text-sm text-gray-600 hover:text-accent">All posts →</Link>
        </div>
        <ul className="space-y-4">
          {posts.map((p) => (
            <li key={p.slug}>
              <Link href={`/blog/${p.slug}`} className="block group">
                <p className="text-xs text-gray-500">{p.publishedAt}</p>
                <h3 className="font-semibold group-hover:text-accent">{p.title}</h3>
                <p className="text-sm text-gray-600">{p.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="max-w-5xl mx-auto px-5 py-10 border-t border-gray-200">
        <h2 className="text-2xl font-semibold mb-6">Frequently asked</h2>
        <dl className="space-y-5">
          {faq.map((f, i) => (
            <div key={i}>
              <dt className="font-medium">{f.q}</dt>
              <dd className="text-gray-700 mt-1">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
