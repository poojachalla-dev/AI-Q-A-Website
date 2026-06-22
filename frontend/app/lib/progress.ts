const MASTERED_KEY = "aiprep_mastered";
const STREAK_KEY = "aiprep_streak";
const LAST_PRACTICE_KEY = "aiprep_last_practice_date";

export function getMastered(): number[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(MASTERED_KEY) || "[]");
  } catch {
    return [];
  }
}

export function isMastered(id: number): boolean {
  return getMastered().includes(id);
}

export function toggleMastered(id: number): boolean {
  const current = getMastered();
  const idx = current.indexOf(id);
  let updated: number[];
  if (idx >= 0) {
    updated = current.filter((x) => x !== id);
  } else {
    updated = [...current, id];
  }
  localStorage.setItem(MASTERED_KEY, JSON.stringify(updated));
  return updated.includes(id);
}

export function getStreak(): number {
  if (typeof window === "undefined") return 0;
  return Number(localStorage.getItem(STREAK_KEY) || "0");
}

// Call once per completed practice session. Increments the streak if the
// last session was "yesterday" (by local date), keeps it if it was already
// today, resets to 1 otherwise.
export function recordPracticeSession(): number {
  const today = new Date().toDateString();
  const last = localStorage.getItem(LAST_PRACTICE_KEY);
  let streak = getStreak();

  if (last === today) {
    // already counted today
  } else if (last) {
    const lastDate = new Date(last);
    const diffDays = Math.round(
      (new Date(today).getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    streak = diffDays === 1 ? streak + 1 : 1;
  } else {
    streak = 1;
  }

  localStorage.setItem(STREAK_KEY, String(streak));
  localStorage.setItem(LAST_PRACTICE_KEY, today);
  return streak;
}
