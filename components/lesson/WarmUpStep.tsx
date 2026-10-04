"use client";

import { useEffect, useState } from "react";
import { ReviewSession, type ReviewResult } from "@/components/review/ReviewSession";
import { useProgress } from "@/lib/progress/ProgressProvider";
import type { StoredCard } from "@/lib/progress/types";
import { sessionCards } from "@/lib/review";
import { StepHeading, StepText } from "./ui";

const WARM_UP_MAX = 8;

/** The `review` step: a short warm-up of cards that are due, before new material. */
export function WarmUpStep({ onDone }: { onDone: () => void }) {
  const { data } = useProgress();
  const [cards] = useState<StoredCard[]>(() => sessionCards(data, new Date(), { max: WARM_UP_MAX, topUp: false }));
  const [result, setResult] = useState<ReviewResult | null>(null);

  useEffect(() => {
    if (cards.length === 0) onDone();
    // Decide once, on arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (cards.length === 0) {
    return (
      <div>
        <StepHeading>Warm-up review</StepHeading>
        <StepText>Nothing is due for review right now — on to new things!</StepText>
      </div>
    );
  }

  if (result) {
    return (
      <div className="animate-pop">
        <StepHeading>Warmed up</StepHeading>
        <StepText>
          {result.correct} of {result.total} right first time. Now for something new.
        </StepText>
      </div>
    );
  }

  return (
    <div>
      <StepHeading>Warm-up review</StepHeading>
      <p className="mb-4 mt-1 text-muted">A few letters and words from earlier lessons.</p>
      <ReviewSession
        cards={cards}
        onDone={(r) => {
          setResult(r);
          onDone();
        }}
      />
      <button type="button" onClick={onDone} className="mt-6 text-sm text-muted underline">
        Skip the warm-up
      </button>
    </div>
  );
}
