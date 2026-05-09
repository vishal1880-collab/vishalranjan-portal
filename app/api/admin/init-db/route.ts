import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    const auth = requireAdmin(req);
    if (!auth.ok) return NextResponse.json(auth.body, { status: auth.status });
    try {
          await sql`CREATE TABLE IF NOT EXISTS email_requests (id SERIAL PRIMARY KEY, desired_username TEXT NOT NULL, full_name TEXT NOT NULL, contact_email TEXT NOT NULL, reason TEXT NOT NULL, country TEXT, status TEXT NOT NULL DEFAULT 'pending', admin_note TEXT, ip TEXT, user_agent TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());`;
          await sql`CREATE INDEX IF NOT EXISTS email_requests_status_idx ON email_requests (status);`;
          await sql`CREATE INDEX IF NOT EXISTS email_requests_created_idx ON email_requests (created_at DESC);`;
          const { rows } = await sql`SELECT count(*)::int AS n FROM email_requests;`;
          return NextResponse.json({ ok: true, rowCount: rows[0]?.n ?? 0 });
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Unknown error";
          return NextResponse.json({ error: "Init failed", message: msg }, { status: 500 });
        }
  }
