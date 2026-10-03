"use client";

import Link from "next/link";
import { useProgress } from "@/lib/progress/ProgressProvider";
import { dueCards, nextDue } from "@/lib/srs";

// Holding page until spaced-repetition reviews arrive in build step 4.
export default function ReviewPage() {
  const { ready, data } = useProgress();
  const due = ready ? dueCards(data).length : 0;
  const total = Object.keys(data.cards).length;
  const next = ready ? nextDue(data) : undefined;

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-display text-3xl font-semibold">Review</h1>
      {!ready ? (
        <div className="mt-6 h-24 animate-pulse rounded-2xl bg-line/50" />
      ) : total === 0 ? (
        <p className="mt-3 text-muted">
          Finish a lesson and its letters and words come back here, a day later, for a quick review.
        </p>
      ) : (
        <div className="mt-4 rounded-2xl border border-line bg-card p-5">
          <p className="text-lg">
            <strong>{due}</strong> of your {total} cards {due === 1 ? "is" : "are"} due for review.
          </p>
          {due === 0 && next && (
            <p className="mt-1 text-muted">
              The next ones come due {next.toLocaleDateString(undefined, { weekday: "long", hour: "numeric", minute: "2-digit" })}.
            </p>
          )}
          <p className="mt-3 text-sm text-muted">The review session itself is being built next.</p>
        </div>
      )}
      <Link href="/" className="mt-6 inline-block text-berbere">
        ← Back to lessons
      </Link>
    </main>
  );
}
