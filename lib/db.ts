import { sql } from "@vercel/postgres";

export type EmailRequestStatus = "pending" | "approved" | "rejected" | "provisioned";

export type EmailRequest = {
  id: number;
  desired_username: string;
  full_name: string;
  contact_email: string;
  reason: string;
  country: string | null;
  status: EmailRequestStatus;
  admin_note: string | null;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
};

export async function insertEmailRequest(input: {
  desired_username: string;
  full_name: string;
  contact_email: string;
  reason: string;
  country?: string;
  ip?: string;
  user_agent?: string;
}): Promise<EmailRequest> {
  const { rows } = await sql<EmailRequest>`
    INSERT INTO email_requests (desired_username, full_name, contact_email, reason, country, ip, user_agent)
    VALUES (${input.desired_username}, ${input.full_name}, ${input.contact_email}, ${input.reason}, ${input.country ?? null}, ${input.ip ?? null}, ${input.user_agent ?? null})
    RETURNING *;
  `;
  return rows[0];
}

export async function listEmailRequests(status?: EmailRequestStatus): Promise<EmailRequest[]> {
  if (status) {
    const { rows } = await sql<EmailRequest>`SELECT * FROM email_requests WHERE status = ${status} ORDER BY created_at DESC LIMIT 200;`;
    return rows;
  }
  const { rows } = await sql<EmailRequest>`SELECT * FROM email_requests ORDER BY created_at DESC LIMIT 200;`;
  return rows;
}

export async function updateEmailRequestStatus(id: number, status: EmailRequestStatus, note?: string): Promise<EmailRequest | null> {
  const { rows } = await sql<EmailRequest>`
    UPDATE email_requests
    SET status = ${status}, admin_note = COALESCE(${note ?? null}, admin_note), updated_at = now()
    WHERE id = ${id}
    RETURNING *;
  `;
  return rows[0] ?? null;
}
