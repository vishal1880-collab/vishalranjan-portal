import { NextRequest } from "next/server";

export function requireAdmin(req: NextRequest): { ok: true } | { ok: false; status: number; body: { error: string } } {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) return { ok: false, status: 500, body: { error: "ADMIN_TOKEN not configured" } };
  const got = req.headers.get("x-admin-token") || req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (got !== expected) return { ok: false, status: 401, body: { error: "Unauthorized" } };
  return { ok: true };
}
