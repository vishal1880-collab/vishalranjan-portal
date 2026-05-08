#!/usr/bin/env node
/**
 * vishalranjan-mcp — MCP server for managing the vishalranjan.com portal.
 *
 * Two backends:
 *   1. GitHub Contents API — edits content/*.json + content/posts/*.mdx so commits trigger Vercel redeploys.
 *   2. Admin REST API on the live site — manages the email-ID request inbox in Postgres.
 *
 * Connect from Claude Desktop by adding to claude_desktop_config.json:
 *   {
 *     "mcpServers": {
 *       "vishalranjan": {
 *         "command": "node",
 *         "args": ["/absolute/path/to/vishalranjan-portal/mcp/dist/server.js"],
 *         "env": {
 *           "GITHUB_TOKEN": "...",
 *           "GITHUB_OWNER": "your-handle",
 *           "GITHUB_REPO": "vishalranjan-portal",
 *           "GITHUB_BRANCH": "main",
 *           "SITE_URL": "https://vishalranjan.com",
 *           "ADMIN_TOKEN": "..."
 *         }
 *       }
 *     }
 *   }
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { putFile, deleteFile, readJson, writeJson, getFile } from "./github.js";
import { listEmailRequests, updateEmailRequest } from "./admin.js";

const server = new Server({ name: "vishalranjan", version: "1.0.0" }, { capabilities: { tools: {} } });

// --- Schemas ---
const ToolSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  tagline: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  url: z.string().url().or(z.literal("")).default(""),
  image: z.string().default(""),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  publishedAt: z.string().default(() => new Date().toISOString().slice(0, 10))
});

const CompanySchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  role: z.string().default("Founder"),
  summary: z.string().min(1),
  url: z.string().url().or(z.literal("")).default(""),
  industry: z.string().default(""),
  founded: z.string().default("")
});

const ProfilePatchSchema = z.object({
  headline: z.string().optional(),
  tagline: z.string().optional(),
  bio: z.string().optional(),
  shortBio: z.string().optional(),
  location: z.string().optional(),
  links: z.object({
    email: z.string().email().optional(),
    linkedin: z.string().url().or(z.literal("")).optional(),
    twitter: z.string().url().or(z.literal("")).optional(),
    github: z.string().url().or(z.literal("")).optional()
  }).partial().optional(),
  expertise: z.array(z.string()).optional(),
  alsoKnownAs: z.array(z.string()).optional(),
  disambiguation: z.string().optional()
});

const PostSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  description: z.string().min(1),
  publishedAt: z.string().default(() => new Date().toISOString().slice(0, 10)),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  body: z.string().min(1)
});

// --- Tool list ---
const TOOLS = [
  { name: "list_tools_catalog", description: "List all tool tiles on the portal.", inputSchema: { type: "object", properties: {}, additionalProperties: false } },
  { name: "add_tool", description: "Add a new tool tile to the portal.", inputSchema: zodToJson(ToolSchema) },
  { name: "update_tool", description: "Update fields on an existing tool tile by slug.", inputSchema: zodToJson(z.object({ slug: z.string() }).and(ToolSchema.partial())) },
  { name: "remove_tool", description: "Remove a tool tile by slug.", inputSchema: zodToJson(z.object({ slug: z.string() })) },

  { name: "list_companies", description: "List all companies featured on the portal.", inputSchema: { type: "object", properties: {}, additionalProperties: false } },
  { name: "add_company", description: "Add a company.", inputSchema: zodToJson(CompanySchema) },
  { name: "update_company", description: "Update a company by slug.", inputSchema: zodToJson(z.object({ slug: z.string() }).and(CompanySchema.partial())) },
  { name: "remove_company", description: "Remove a company by slug.", inputSchema: zodToJson(z.object({ slug: z.string() })) },

  { name: "get_profile", description: "Read the current bio / profile.", inputSchema: { type: "object", properties: {}, additionalProperties: false } },
  { name: "update_profile", description: "Patch any fields on the profile (bio, headline, links, etc).", inputSchema: zodToJson(ProfilePatchSchema) },

  { name: "list_posts", description: "List blog posts (slugs and metadata).", inputSchema: { type: "object", properties: {}, additionalProperties: false } },
  { name: "publish_post", description: "Create or replace a blog post (frontmatter + MDX body).", inputSchema: zodToJson(PostSchema) },
  { name: "remove_post", description: "Delete a blog post by slug.", inputSchema: zodToJson(z.object({ slug: z.string() })) },

  { name: "list_email_requests", description: "List @vishalranjan.com email-ID requests, optionally filtered by status.", inputSchema: zodToJson(z.object({ status: z.enum(["pending", "approved", "rejected", "provisioned"]).optional() })) },
  { name: "set_email_request_status", description: "Approve, reject, or mark provisioned an email-ID request.", inputSchema: zodToJson(z.object({ id: z.number().int(), status: z.enum(["pending", "approved", "rejected", "provisioned"]), note: z.string().optional() })) }
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const name = req.params.name;
  const args = (req.params.arguments ?? {}) as Record<string, unknown>;
  try {
    const out = await dispatch(name, args);
    return { content: [{ type: "text", text: typeof out === "string" ? out : JSON.stringify(out, null, 2) }] };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { content: [{ type: "text", text: `ERROR: ${msg}` }], isError: true };
  }
});

async function dispatch(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    // --- Tools catalog ---
    case "list_tools_catalog": {
      const cur = (await readJson<unknown[]>("content/tools.json")) ?? [];
      return cur;
    }
    case "add_tool": {
      const tool = ToolSchema.parse(args);
      const cur = (await readJson<unknown[]>("content/tools.json")) ?? [];
      if ((cur as { slug: string }[]).some((t) => t.slug === tool.slug)) throw new Error(`Tool with slug "${tool.slug}" already exists.`);
      const next = [...cur, tool];
      await writeJson("content/tools.json", next, `chore(content): add tool ${tool.slug}`);
      return { ok: true, tool };
    }
    case "update_tool": {
      const slug = String(args.slug);
      const cur = ((await readJson<unknown[]>("content/tools.json")) ?? []) as Record<string, unknown>[];
      const idx = cur.findIndex((t) => t.slug === slug);
      if (idx < 0) throw new Error(`Tool "${slug}" not found.`);
      const merged = { ...cur[idx], ...args };
      cur[idx] = ToolSchema.parse(merged);
      await writeJson("content/tools.json", cur, `chore(content): update tool ${slug}`);
      return { ok: true, tool: cur[idx] };
    }
    case "remove_tool": {
      const slug = String(args.slug);
      const cur = ((await readJson<unknown[]>("content/tools.json")) ?? []) as Record<string, unknown>[];
      const next = cur.filter((t) => t.slug !== slug);
      if (next.length === cur.length) throw new Error(`Tool "${slug}" not found.`);
      await writeJson("content/tools.json", next, `chore(content): remove tool ${slug}`);
      return { ok: true };
    }

    // --- Companies ---
    case "list_companies": {
      return (await readJson<unknown[]>("content/companies.json")) ?? [];
    }
    case "add_company": {
      const c = CompanySchema.parse(args);
      const cur = ((await readJson<unknown[]>("content/companies.json")) ?? []) as { slug: string }[];
      if (cur.some((x) => x.slug === c.slug)) throw new Error(`Company "${c.slug}" already exists.`);
      await writeJson("content/companies.json", [...cur, c], `chore(content): add company ${c.slug}`);
      return { ok: true, company: c };
    }
    case "update_company": {
      const slug = String(args.slug);
      const cur = ((await readJson<unknown[]>("content/companies.json")) ?? []) as Record<string, unknown>[];
      const idx = cur.findIndex((x) => x.slug === slug);
      if (idx < 0) throw new Error(`Company "${slug}" not found.`);
      const merged = { ...cur[idx], ...args };
      cur[idx] = CompanySchema.parse(merged);
      await writeJson("content/companies.json", cur, `chore(content): update company ${slug}`);
      return { ok: true, company: cur[idx] };
    }
    case "remove_company": {
      const slug = String(args.slug);
      const cur = ((await readJson<unknown[]>("content/companies.json")) ?? []) as Record<string, unknown>[];
      const next = cur.filter((x) => x.slug !== slug);
      if (next.length === cur.length) throw new Error(`Company "${slug}" not found.`);
      await writeJson("content/companies.json", next, `chore(content): remove company ${slug}`);
      return { ok: true };
    }

    // --- Profile ---
    case "get_profile": {
      return await readJson<unknown>("content/profile.json");
    }
    case "update_profile": {
      const patch = ProfilePatchSchema.parse(args);
      const cur = ((await readJson<Record<string, unknown>>("content/profile.json")) ?? {}) as Record<string, unknown>;
      const next: Record<string, unknown> = { ...cur, ...patch };
      if (patch.links) next.links = { ...(cur.links as object || {}), ...patch.links };
      await writeJson("content/profile.json", next, `chore(content): update profile`);
      return { ok: true, profile: next };
    }

    // --- Posts ---
    case "list_posts": {
      // We can't easily ls a folder via Octokit getContent without a directory listing call.
      // We'll list directly:
      const dir = await getFile("content/posts/").catch(() => null);
      if (!dir) return [];
      // Octokit returns array for directories — handle separately via raw call
      const { Octokit } = await import("@octokit/rest");
      const o = new Octokit({ auth: process.env.GITHUB_TOKEN });
      const res = await o.repos.getContent({
        owner: process.env.GITHUB_OWNER!, repo: process.env.GITHUB_REPO!, path: "content/posts", ref: process.env.GITHUB_BRANCH || "main"
      });
      if (!Array.isArray(res.data)) return [];
      return res.data.filter((f) => f.type === "file" && (f.name.endsWith(".mdx") || f.name.endsWith(".md"))).map((f) => f.name);
    }
    case "publish_post": {
      const p = PostSchema.parse(args);
      const fm = [
        "---",
        `title: ${JSON.stringify(p.title)}`,
        `description: ${JSON.stringify(p.description)}`,
        `publishedAt: ${JSON.stringify(p.publishedAt)}`,
        `tags: [${p.tags.map((t) => JSON.stringify(t)).join(", ")}]`,
        `draft: ${p.draft}`,
        "---",
        "",
        p.body.trim(),
        ""
      ].join("\n");
      await putFile(`content/posts/${p.slug}.mdx`, fm, `content: publish post ${p.slug}`);
      return { ok: true, slug: p.slug };
    }
    case "remove_post": {
      const slug = String(args.slug);
      await deleteFile(`content/posts/${slug}.mdx`, `content: remove post ${slug}`);
      return { ok: true };
    }

    // --- Email requests ---
    case "list_email_requests": {
      const status = args.status as ("pending" | "approved" | "rejected" | "provisioned" | undefined);
      return await listEmailRequests(status);
    }
    case "set_email_request_status": {
      const id = Number(args.id);
      const status = args.status as "pending" | "approved" | "rejected" | "provisioned";
      const note = args.note ? String(args.note) : undefined;
      return await updateEmailRequest(id, status, note);
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// Crude zod -> JSON Schema for our simple tool inputs (object-shaped only).
function zodToJson(schema: z.ZodTypeAny): Record<string, unknown> {
  const root = unwrap(schema);
  if (root instanceof z.ZodObject) return objectShape(root);
  if (root instanceof z.ZodIntersection) {
    // best-effort: merge two object shapes
    const a = objectShape((root as z.ZodIntersection<z.ZodObject<z.ZodRawShape>, z.ZodObject<z.ZodRawShape>>)._def.left as z.ZodObject<z.ZodRawShape>);
    const b = objectShape((root as z.ZodIntersection<z.ZodObject<z.ZodRawShape>, z.ZodObject<z.ZodRawShape>>)._def.right as z.ZodObject<z.ZodRawShape>);
    return {
      type: "object",
      properties: { ...(a.properties as object), ...(b.properties as object) },
      required: Array.from(new Set([...(a.required as string[] ?? []), ...(b.required as string[] ?? [])])),
      additionalProperties: false
    };
  }
  return { type: "object" };
}

function unwrap(s: z.ZodTypeAny): z.ZodTypeAny {
  if (s instanceof z.ZodEffects) return unwrap(s._def.schema);
  if (s instanceof z.ZodOptional) return unwrap(s._def.innerType);
  if (s instanceof z.ZodDefault) return unwrap(s._def.innerType);
  if (s instanceof z.ZodNullable) return unwrap(s._def.innerType);
  return s;
}

function objectShape(o: z.ZodObject<z.ZodRawShape>): Record<string, unknown> {
  const shape = o.shape;
  const properties: Record<string, unknown> = {};
  const required: string[] = [];
  for (const [k, v] of Object.entries(shape) as [string, z.ZodTypeAny][]) {
    properties[k] = jsonForType(v);
    if (!(v instanceof z.ZodOptional) && !(v instanceof z.ZodDefault)) required.push(k);
  }
  return { type: "object", properties, required, additionalProperties: false };
}

function jsonForType(t: z.ZodTypeAny): Record<string, unknown> {
  const inner = unwrap(t);
  if (inner instanceof z.ZodString) return { type: "string" };
  if (inner instanceof z.ZodNumber) return { type: "number" };
  if (inner instanceof z.ZodBoolean) return { type: "boolean" };
  if (inner instanceof z.ZodArray) return { type: "array", items: jsonForType(inner._def.type) };
  if (inner instanceof z.ZodEnum) return { type: "string", enum: inner._def.values };
  if (inner instanceof z.ZodObject) return objectShape(inner);
  if (inner instanceof z.ZodUnion) return { anyOf: (inner._def.options as z.ZodTypeAny[]).map(jsonForType) };
  return {};
}

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // eslint-disable-next-line no-console
  console.error("vishalranjan-mcp: ready");
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
