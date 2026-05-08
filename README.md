# vishalranjan.com — personal portal + MCP

A Next.js 14 portal showcasing Vishal Ranjan, the founder of IMARC Services, Claight Corporation, and KAMRIT Financial Services. It lists the indie tools he has built, accepts requests for free `@vishalranjan.com` email addresses, and is fully editable through an MCP server you connect to Claude.

The site is heavily SEO-tuned (Person + Organization + SoftwareApplication + FAQ + Article JSON-LD, sitemap, robots, RSS) and GEO-tuned (`/llms.txt` and explicit disambiguation copy) so that searches and AI answers about *this* Vishal Ranjan land on this site.

## What's in the box

```
vishalranjan-portal/
├── app/                    Next.js App Router (pages, API routes, sitemap, robots, llms.txt, rss.xml)
├── components/             JsonLd helpers, AdSlot
├── content/                profile.json, companies.json, tools.json, faq.json, posts/*.mdx
├── lib/                    content loader, db client, auth helper, site config
├── db/schema.sql           Vercel Postgres schema for email-ID requests
├── public/                 ads.txt, og.svg
└── mcp/                    Standalone MCP server (TypeScript, stdio)
```

## 1. Push to GitHub

```bash
cd vishalranjan-portal
git init && git add . && git commit -m "feat: initial portal"
gh repo create vishalranjan-portal --private --source=. --push
```

## 2. Deploy on Vercel

1. Go to https://vercel.com/new, import `vishalranjan-portal`.
2. Framework: **Next.js** (auto-detected).
3. Add the env vars from `.env.example` (leave optional ones blank for now).
4. Add the **Postgres** integration: Vercel dashboard → Storage → Create → Postgres. Connect it to this project — Vercel will auto-inject `POSTGRES_*` env vars.
5. Initialize the DB:
   ```bash
   vercel env pull .env.local
   psql "$POSTGRES_URL_NON_POOLING" -f db/schema.sql
   ```
6. Deploy. After it's live, point `vishalranjan.com` at Vercel (Settings → Domains).

## 3. Email on @vishalranjan.com (Google Workspace)

1. Sign up at https://workspace.google.com — **Business Starter** at $6/user/month is the cheapest tier with full mailboxes.
2. Verify domain ownership (Google will give you a TXT record to add at your DNS provider).
3. Add MX records Google provides.
4. Create your own mailbox first (e.g. `vishal@vishalranjan.com`).
5. When the MCP marks an email request **approved** (see step 5 below), provision the mailbox in Google Admin → Users → Add user. Then set the request to **provisioned** in the MCP. (This step is intentionally manual — Google Workspace Admin SDK provisioning can be wired up later if request volume grows.)

## 4. Google AdSense + monetization

1. Apply at https://www.google.com/adsense/ once the site has a few real pages of content (Google needs traffic to approve).
2. After approval, copy your publisher ID (`ca-pub-XXXXXXXXXXXXXXXX`) and:
   - Set `NEXT_PUBLIC_ADSENSE_CLIENT` in Vercel.
   - Replace `pub-XXXXXXXXXXXXXXXX` in `public/ads.txt`.
3. Create ad units in AdSense (one per slot you want). The portal already has `<AdSlot>` placements with stable slot names: `home-mid`, `tools-top`, `tool-bottom`, `blog-bottom`. Plug your AdSense slot IDs into those (or just use AdSense Auto Ads, which works without per-slot IDs).
4. Optional monetization beyond AdSense: tool listings have a `url` field — point them at affiliate or paid versions when you have them.

## 5. The MCP — edit your portal from Claude

The MCP in `/mcp` exposes 14 tools that let you (or Claude on your behalf) maintain the portal conversationally. Two backends: edits to content commit to GitHub (Vercel auto-redeploys); the email-ID inbox is read/written via the live admin API.

### Build it

```bash
cd mcp
npm install
npm run build      # outputs dist/server.js
```

### Wire it into Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (Mac) or the equivalent on Windows:

```jsonc
{
  "mcpServers": {
    "vishalranjan": {
      "command": "node",
      "args": ["/absolute/path/to/vishalranjan-portal/mcp/dist/server.js"],
      "env": {
        "GITHUB_TOKEN":  "ghp_...",            // PAT with `contents: read+write` on the portal repo
        "GITHUB_OWNER":  "your-github-handle",
        "GITHUB_REPO":   "vishalranjan-portal",
        "GITHUB_BRANCH": "main",
        "SITE_URL":      "https://vishalranjan.com",
        "ADMIN_TOKEN":   "<same value as Vercel ADMIN_TOKEN>"
      }
    }
  }
}
```

Restart Claude Desktop. You should see `vishalranjan` listed under MCP servers, with these tools available:

| Tool | What it does |
|---|---|
| `list_tools_catalog`, `add_tool`, `update_tool`, `remove_tool` | Manage the tool tiles on `/tools` |
| `list_companies`, `add_company`, `update_company`, `remove_company` | Manage the companies list |
| `get_profile`, `update_profile` | Edit bio, headline, links, expertise, disambiguation copy |
| `list_posts`, `publish_post`, `remove_post` | Author MDX blog posts |
| `list_email_requests`, `set_email_request_status` | Review the @vishalranjan.com inbox; approve / reject / mark provisioned |

### Example prompts in Claude

- "Add a new tool called *PR Pulse Check* under Market Research, tagline 'See what your competitors announced this week', tag it as research and competitive-intelligence."
- "Show me all pending @vishalranjan.com requests."
- "Approve request #4 with the note 'verified, will create vishal2@... tomorrow'."
- "Publish a blog post titled 'How I think about TAM' with this body: ..."

Each content edit creates a commit on `main`. Vercel watches `main` and redeploys in ~30 seconds.

## 6. SEO & GEO checklist (already shipped, just verify)

- `app/layout.tsx` carries default `<title>`, `<meta description>`, OpenGraph, Twitter card, robots.
- `components/JsonLd.tsx` injects `Person`, `WebSite`, `Organization`, `SoftwareApplication`, `Article`, `FAQPage` JSON-LD as appropriate per page.
- `/sitemap.xml` is generated dynamically from your tools and posts (`app/sitemap.ts`).
- `/robots.txt` allows everything except `/api/admin/*` (`app/robots.ts`).
- `/llms.txt` is a hand-shaped, machine-readable summary of who you are, designed for AI search engines (`app/llms.txt/route.ts`).
- `/rss.xml` for blog readers and aggregators.
- The homepage carries an FAQ block + FAQ JSON-LD that explicitly says *this Vishal Ranjan founded IMARC, Claight, KAMRIT* — strong disambiguation signal for both classical search and LLM-based search.

After deploy, submit the site to:

- **Google Search Console** (https://search.google.com/search-console) — verify with the `NEXT_PUBLIC_GSC_VERIFICATION` env var (paste only the content value of the `<meta>` tag), submit `/sitemap.xml`.
- **Bing Webmaster Tools** — same idea.
- **schema.org Rich Results Test** (https://search.google.com/test/rich-results) — paste your homepage and confirm Person + FAQ schemas validate.

## 7. Local development

```bash
npm install
cp .env.example .env.local   # fill in at minimum NEXT_PUBLIC_SITE_URL=http://localhost:3000 and ADMIN_TOKEN
npm run dev                  # http://localhost:3000
```

The email-request form needs a working Postgres connection to actually save (otherwise it'll show a 500). For pure UI work, ignore — every other page renders without the DB.

## License

All rights reserved by Vishal Ranjan. The code is shared as a personal-site starter — not redistributable as-is.
