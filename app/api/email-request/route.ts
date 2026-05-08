import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { insertEmailRequest } from "@/lib/db";

export const runtime = "nodejs";

const Body = z.object({
  desiredUsername: z.string().regex(/^[a-z0-9._-]{2,30}$/),
  fullName: z.string().min(1).max(120),
  contactEmail: z.string().email().max(160),
  reason: z.string().min(10).max(1000),
  country: z.string().max(80).optional(),
  // honeypot — must be empty
  website: z.string().max(0).optional()
});

export async function POST(req: NextRequest) {
  let json: unknown;
  try { json = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = Body.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  const { desiredUsername, fullName, contactEmail, reason, country } = parsed.data;
  try {
    const row = await insertEmailRequest({
      desired_username: desiredUsername,
      full_name: fullName,
      contact_email: contactEmail,
      reason,
      country,
      ip: req.headers.get("x-forwarded-for") || undefined,
      user_agent: req.headers.get("user-agent") || undefined
    });
    return NextResponse.json({ ok: true, id: row.id });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: "Database error", message: msg }, { status: 500 });
  }
}
