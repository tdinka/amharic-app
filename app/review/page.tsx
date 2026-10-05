"use client";

import Link from "next/link";
import { useState } from "react";
import { ReviewSession, type ReviewResult } from "@/components/review/ReviewSession";
import type { StoredCard } from "@/lib/progress/types";
import { useProgress } from "@/lib/progress/ProgressProvider";
import { sessionCards } from "@/lib/review";
import { dueCards, nextDue } from "@/lib/srs";

const MAX_DUE = 20;
const QUICK = 10; // about five minutes

function whenText(date: Date) {
  return date.toLocaleString(undefined, { weekday: "long", hour: "numeric", minute: "2-digit" });
}

export default function ReviewPage() {
  const { ready, data } = useProgress();
  const [session, setSession] = useState<StoredCard[] | null>(null);
  const [result, setResult] = useState<ReviewResult | null>(null);

  const total = Object.keys(data.cards).length;
  const due = ready ? dueCards(data).length : 0;
  const next = ready ? nextDue(data) : undefined;

  function start(quick: boolean) {
    setResult(null);
    setSession(sessionCards(data, new Date(), quick ? { max: QUICK, topUp: true } : { max: MAX_DUE, topUp: false }));
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-display text-3xl font-semibold">Review</h1>

      {!ready ? (
        <div className="mt-6 h-24 animate-pulse rounded-2xl bg-line/50" />
      ) : session ? (
        <div className="mt-5">
          <ReviewSession
            cards={session}
            onDone={(r) => {
              setSession(null);
              setResult(r);
            }}
          />
        </div>
      ) : total === 0 ? (
        <>
          <p className="mt-3 text-muted">
            Finish a lesson and its letters and words come back here, a day later, for a quick review.
          </p>
          <Link href="/" className="mt-6 inline-block text-berbere">
            ← Back to lessons
          </Link>
        </>
      ) : (
        <>
          {result && (
            <div className="mt-4 animate-pop rounded-2xl bg-leaf-light p-5 text-center">
              <div className="text-4xl" aria-hidden>
                {result.correct === result.total ? "🌟" : "👏"}
              </div>
              <p className="mt-2 text-lg font-semibold">
                {result.total === 0
                  ? "Nothing to review."
                  : `${result.correct} of ${result.total} right first time.`}
              </p>
              <p className="text-sm text-muted">Each card is now scheduled for when it&rsquo;s best to see it again.</p>
            </div>
          )}

          <div className="mt-4 rounded-2xl border border-line bg-card p-5">
            <p className="text-lg">
              {due > 0 ? (
                <>
                  <strong>{due}</strong> {due === 1 ? "card is" : "cards are"} due now.
                </>
              ) : (
                "You're all caught up."
              )}
            </p>
            {due === 0 && next && <p className="mt-1 text-muted">The next ones come due {whenText(next)}.</p>}
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => start(false)}
                disabled={due === 0}
                className="btn-primary px-6 py-3"
              >
                Start review{due > MAX_DUE ? ` (${MAX_DUE} of ${due})` : ""}
              </button>
              <button type="button" onClick={() => start(true)} className="btn-secondary px-5 py-3">
                ⏱ Quick 5-minute review
              </button>
            </div>
            <p className="mt-3 text-sm text-muted">
              {total} {total === 1 ? "card" : "cards"} in your deck — every letter and word from the lessons you&rsquo;ve finished.
            </p>
          </div>

          <Link href="/" className="mt-6 inline-block text-berbere">
            ← Back to lessons
          </Link>
        </>
      )}
    </main>
  );
}
