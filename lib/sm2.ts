// SM-2 Spaced Repetition Algorithm (SuperMemo 2)
// quality: 0-5 rating of how well the user remembered the card
// 0-2 = forgot/hard, 3 = ok, 4 = good, 5 = perfect

export interface SM2Result {
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  next_review_date: string;
}

export function calculateSM2(
  quality: number,
  prevEaseFactor: number = 2.5,
  prevInterval: number = 0,
  prevRepetitions: number = 0
): SM2Result {
  let easeFactor = prevEaseFactor;
  let interval = prevInterval;
  let repetitions = prevRepetitions;

  if (quality < 3) {
    // Forgot the card - reset repetitions, review again soon
    repetitions = 0;
    interval = 1;
  } else {
    // Remembered the card
    repetitions += 1;
    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.round(prevInterval * easeFactor);
    }
  }

  // Update ease factor (never goes below 1.3)
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return {
    ease_factor: Math.round(easeFactor * 100) / 100,
    interval_days: interval,
    repetitions,
    next_review_date: nextReviewDate.toISOString().split('T')[0],
  };
}

// Map simple difficulty buttons to SM-2 quality scores
export function difficultyToQuality(difficulty: 'again' | 'hard' | 'good' | 'easy'): number {
  switch (difficulty) {
    case 'again': return 1;
    case 'hard': return 3;
    case 'good': return 4;
    case 'easy': return 5;
    default: return 3;
  }
}