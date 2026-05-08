import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Privacy policy for vishalranjan.com."
};

export default function PrivacyPage() {
  return (
    <section className="max-w-prose mx-auto px-5 py-16 prose-custom">
      <h1>Privacy</h1>
      <p>This site is the personal portal of Vishal Ranjan. Data handling is kept minimal and is described below.</p>
      <h2>What we collect</h2>
      <ul>
        <li><strong>Email-ID requests.</strong> If you request a free <code>@vishalranjan.com</code> address, we collect the desired username, your contact email, and the reason you provided. This is used only to evaluate and provision the address.</li>
        <li><strong>Analytics.</strong> Aggregate, anonymous traffic data via Vercel Analytics. No fingerprinting, no cookies for identification.</li>
        <li><strong>Advertising.</strong> Pages may include Google AdSense, which uses cookies under Google's policies. You can manage ad personalization at <a href="https://adssettings.google.com" target="_blank" rel="noopener">adssettings.google.com</a>.</li>
      </ul>
      <h2>What we don't do</h2>
      <ul>
        <li>We do not sell your data.</li>
        <li>We do not share email-request data with third parties.</li>
      </ul>
      <h2>Contact</h2>
      <p>Questions? Email <a href="mailto:hello@vishalranjan.com">hello@vishalranjan.com</a>.</p>
    </section>
  );
}
