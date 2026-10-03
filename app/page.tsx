import Link from "next/link";

// Temporary home page — replaced by the lesson path in build step 3.
export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl font-semibold">Learn Amharic</h1>
      <p className="mt-2 text-muted">The lesson path is coming next. For now, explore the fidel.</p>
      <Link href="/fidel" className="mt-6 inline-block rounded-full bg-berbere px-5 py-2.5 text-white">
        Open the fidel explorer
      </Link>
    </main>
  );
}
