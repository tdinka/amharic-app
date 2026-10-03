import Link from "next/link";
import { lessons } from "@/lib/content";

// Temporary home page — replaced by the lesson path in build step 3.
export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl font-semibold">Learn Amharic</h1>
      <p className="mt-2 text-muted">The full lesson path is coming next. For now, jump into any lesson.</p>
      <ul className="mt-6 space-y-3">
        {lessons.map((l) => (
          <li key={l.id}>
            <Link href={`/lesson/${l.id}`} className="block rounded-2xl border border-line bg-card p-4 hover:border-berbere">
              <div className="text-sm text-muted">
                Week {l.week} · Lesson {l.order} · about {l.estimatedMinutes} min
              </div>
              <div className="mt-1 text-lg font-semibold">{l.title}</div>
              <div className="text-muted">{l.goal}</div>
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/fidel" className="mt-6 inline-block rounded-full border border-berbere px-5 py-2.5 text-berbere">
        Open the fidel explorer
      </Link>
    </main>
  );
}
