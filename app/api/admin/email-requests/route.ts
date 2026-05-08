import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { listEmailRequests, type EmailRequestStatus } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) return NextResponse.json(auth.body, { status: auth.status });
  const status = req.nextUrl.searchParams.get("status") as EmailRequestStatus | null;
  const rows = await listEmailRequests(status ?? undefined);
  return NextResponse.json({ requests: rows });
}
