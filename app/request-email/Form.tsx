"use client";
import { useState } from "react";

export default function RequestEmailForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "ok" | "err">("idle");
  const [message, setMessage] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd.entries());
    const res = await fetch("/api/email-request", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) {
      setStatus("ok");
      setMessage("Got it! I'll personally review and email you back at the address you provided.");
      e.currentTarget.reset();
    } else {
      setStatus("err");
      setMessage(json?.error || "Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="border border-gray-200 rounded-lg p-6 space-y-4 bg-white">
      <div>
        <label className="text-sm font-medium">Desired username (the part before @vishalranjan.com)</label>
        <input name="desiredUsername" required pattern="[a-z0-9._-]{2,30}" className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="e.g. vishal" />
        <p className="text-xs text-gray-500 mt-1">2–30 chars, lowercase letters, numbers, dot, dash, underscore.</p>
      </div>
      <div>
        <label className="text-sm font-medium">Your full name</label>
        <input name="fullName" required className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium">Contact email (where I'll write you back)</label>
        <input name="contactEmail" type="email" required className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium">Why do you want this address?</label>
        <textarea name="reason" required rows={4} maxLength={1000} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Anything that helps me understand who you are and what you'll use this for." />
      </div>
      <div>
        <label className="text-sm font-medium">Country (optional)</label>
        <input name="country" className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
      </div>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <button type="submit" disabled={status === "submitting"} className="bg-ink text-white px-4 py-2 rounded-md text-sm disabled:opacity-50">
        {status === "submitting" ? "Submitting…" : "Submit request"}
      </button>
      {status === "ok" && <p className="text-sm text-green-700">{message}</p>}
      {status === "err" && <p className="text-sm text-red-700">{message}</p>}
    </form>
  );
}
