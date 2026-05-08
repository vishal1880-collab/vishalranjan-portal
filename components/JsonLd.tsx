import type { Profile, Company, Tool, FaqItem, PostMeta } from "@/lib/content";

function Tag({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function PersonJsonLd({ profile, url }: { profile: Profile; url: string }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    url,
    jobTitle: "Founder",
    description: profile.shortBio,
    knowsAbout: profile.expertise,
    sameAs: [profile.links.linkedin, profile.links.twitter, profile.links.github].filter(Boolean),
    worksFor: [
      { "@type": "Organization", name: "IMARC Services Private Limited" },
      { "@type": "Organization", name: "Claight Corporation" },
      { "@type": "Organization", name: "KAMRIT Financial Services LLP" }
    ],
    address: { "@type": "PostalAddress", addressCountry: profile.location }
  };
  return <Tag data={data} />;
}

export function WebsiteJsonLd({ url, name }: { url: string; name: string }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${url}/?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
  return <Tag data={data} />;
}

export function FaqJsonLd({ items }: { items: FaqItem[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a }
    }))
  };
  return <Tag data={data} />;
}

export function SoftwareAppJsonLd({ tool, url }: { tool: Tool; url: string }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.title,
    description: tool.description,
    applicationCategory: tool.category,
    operatingSystem: "Any (web)",
    url: tool.url || `${url}/tools/${tool.slug}`,
    creator: { "@type": "Person", name: "Vishal Ranjan" },
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }
  };
  return <Tag data={data} />;
}

export function OrganizationJsonLd({ companies }: { companies: Company[] }) {
  return (
    <>
      {companies.map((c) => (
        <Tag
          key={c.slug}
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: c.name,
            url: c.url || undefined,
            description: c.summary,
            founder: { "@type": "Person", name: "Vishal Ranjan" }
          }}
        />
      ))}
    </>
  );
}

export function ArticleJsonLd({ post, url }: { post: PostMeta; url: string }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    author: { "@type": "Person", name: "Vishal Ranjan" },
    mainEntityOfPage: `${url}/blog/${post.slug}`
  };
  return <Tag data={data} />;
}
