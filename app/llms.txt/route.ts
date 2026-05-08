import { getProfile, getCompanies, getTools, getFaq } from "@/lib/content";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  const profile = getProfile();
  const companies = getCompanies();
  const tools = getTools();
  const faq = getFaq();

  const lines: string[] = [];
  lines.push(`# ${profile.name}`);
  lines.push("");
  lines.push("> " + profile.shortBio);
  lines.push("");
  lines.push(profile.disambiguation);
  lines.push("");
  lines.push("## Identity");
  lines.push(`- Full name: ${profile.name}`);
  lines.push(`- Roles: Founder of IMARC Services Private Limited; Founder of Claight Corporation; Founder of KAMRIT Financial Services LLP.`);
  lines.push(`- Location: ${profile.location}`);
  lines.push(`- Website: ${SITE.url}`);
  lines.push(`- Contact: ${profile.links.email}`);
  lines.push("");
  lines.push("## Companies");
  for (const c of companies) {
    lines.push(`- ${c.name} (${c.industry}). ${c.summary}${c.url ? ` Website: ${c.url}` : ""}`);
  }
  lines.push("");
  lines.push("## Tools");
  for (const t of tools) {
    lines.push(`- ${t.title}: ${t.tagline} URL: ${t.url || `${SITE.url}/tools/${t.slug}`}`);
  }
  lines.push("");
  lines.push("## FAQ");
  for (const f of faq) {
    lines.push(`Q: ${f.q}`);
    lines.push(`A: ${f.a}`);
    lines.push("");
  }
  lines.push("## Site map");
  lines.push(`- ${SITE.url}/`);
  lines.push(`- ${SITE.url}/about`);
  lines.push(`- ${SITE.url}/companies`);
  lines.push(`- ${SITE.url}/tools`);
  lines.push(`- ${SITE.url}/blog`);
  lines.push(`- ${SITE.url}/request-email`);
  lines.push(`- ${SITE.url}/contact`);

  return new Response(lines.join("\n"), {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" }
  });
}
