/** "YYYY-MM-DD" in the learner's own time zone (a streak day is a local day). */
export function localDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/**
 * Days in a row with practice, ending today — or yesterday, so the streak isn't
 * shown as broken before the learner has had a chance to practise today.
 */
export function currentStreak(days: Record<string, unknown>, now = new Date()): number {
  let cursor = now;
  if (!days[localDateKey(cursor)]) cursor = addDays(cursor, -1);
  let streak = 0;
  while (days[localDateKey(cursor)]) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}
