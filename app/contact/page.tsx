import type { Metadata } from "next";
import { getProfile } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach Vishal Ranjan — founder of IMARC, Claight, and KAMRIT."
};

export default function ContactPage() {
  const p = getProfile();
  return (
    <section className="max-w-prose mx-auto px-5 py-16">
      <h1 className="text-3xl font-semibold">Get in touch</h1>
      <p className="mt-4 text-gray-700">For business, partnerships, press, or just to say hi.</p>
      <ul className="mt-6 space-y-2 text-gray-800">
        <li>Email: <a className="text-accent underline" href={`mailto:${p.links.email}`}>{p.links.email}</a></li>
        {p.links.linkedin && <li>LinkedIn: <a className="text-accent underline" href={p.links.linkedin} target="_blank" rel="noopener">{p.links.linkedin}</a></li>}
      </ul>
    </section>
  );
}
