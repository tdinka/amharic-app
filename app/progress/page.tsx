import Link from "next/link";

// Holding page until the progress page arrives in build step 6.
export default function ProgressPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-display text-3xl font-semibold">Progress</h1>
      <p className="mt-3 text-muted">
        Your streak calendar, minutes practised and reading, writing, listening and speaking bars will appear here soon.
        Your progress is already being saved.
      </p>
      <Link href="/" className="mt-6 inline-block text-berbere">
        ← Back to lessons
      </Link>
    </main>
  );
}
