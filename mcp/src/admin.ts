function requireEnv(k: string): string {
  const v = process.env[k];
  if (!v) throw new Error(`Missing env: ${k}`);
  return v;
}

async function adminFetch(path: string, init: RequestInit = {}) {
  const url = requireEnv("SITE_URL").replace(/\/$/, "") + path;
  const res = await fetch(url, {
    ...init,
    headers: {
      "x-admin-token": requireEnv("ADMIN_TOKEN"),
      "content-type": "application/json",
      ...(init.headers || {})
    }
  });
  const text = await res.text();
  let body: unknown = text;
  try { body = JSON.parse(text); } catch { /* leave as text */ }
  if (!res.ok) throw new Error(`Admin API ${res.status}: ${typeof body === "string" ? body : JSON.stringify(body)}`);
  return body;
}

export async function listEmailRequests(status?: "pending" | "approved" | "rejected" | "provisioned") {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  return adminFetch(`/api/admin/email-requests${qs}`);
}

export async function updateEmailRequest(id: number, status: "pending" | "approved" | "rejected" | "provisioned", note?: string) {
  return adminFetch(`/api/admin/email-requests/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status, note })
  });
}
