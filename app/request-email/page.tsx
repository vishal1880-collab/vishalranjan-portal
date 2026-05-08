import type { Metadata } from "next";
import RequestEmailForm from "./Form";

export const metadata: Metadata = {
  title: "Request a free @vishalranjan.com email",
  description: "Are you also a Vishal Ranjan, or have a strong reason to want a vishalranjan.com address? Request one here — free, manually reviewed."
};

export default function RequestEmailPage() {
  return (
    <section className="max-w-prose mx-auto px-5 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Get a free <span className="text-accent">@vishalranjan.com</span> address</h1>
      <p className="mt-4 text-gray-700">There are many Vishal Ranjans in the world, and a clean personal email is hard to come by. If your name is Vishal Ranjan — or you have a thoughtful reason to want a vishalranjan.com address — request one below.</p>
      <ul className="mt-4 text-sm text-gray-600 list-disc pl-5 space-y-1">
        <li>Free. No payment, no strings.</li>
        <li>Each request is reviewed by Vishal personally.</li>
        <li>Approved addresses are real Google Workspace mailboxes — full send + receive.</li>
        <li>One address per person.</li>
      </ul>
      <div className="mt-10">
        <RequestEmailForm />
      </div>
    </section>
  );
}
