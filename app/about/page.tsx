import type { Metadata } from "next";
import { getProfile } from "@/lib/content";

export const metadata: Metadata = {
  title: "About",
  description: "About Vishal Ranjan — founder of IMARC Services, Claight Corporation, and KAMRIT Financial Services."
};

export default function AboutPage() {
  const profile = getProfile();
  return (
    <article className="max-w-prose mx-auto px-5 py-16 prose-custom">
      <h1 className="text-3xl font-semibold">About {profile.name}</h1>
      <p>{profile.bio}</p>
      <h2>What I work on</h2>
      <ul>
        {profile.expertise.map((e) => <li key={e}>{e}</li>)}
      </ul>
      <h2>Also known as</h2>
      <ul>
        {profile.alsoKnownAs.map((e) => <li key={e}>{e}</li>)}
      </ul>
      <p className="text-sm text-gray-500 mt-8">{profile.disambiguation}</p>
    </article>
  );
}
