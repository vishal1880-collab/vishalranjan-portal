import Link from "next/link";

export default function NotFound() {
  return (
    <section className="max-w-prose mx-auto px-5 py-24 text-center">
      <p className="text-sm text-gray-500">404</p>
      <h1 className="text-3xl font-semibold mt-2">Page not found</h1>
      <p className="text-gray-700 mt-3">That URL doesn't match anything on the site.</p>
      <Link href="/" className="inline-block mt-6 text-accent">← Back home</Link>
    </section>
  );
}
