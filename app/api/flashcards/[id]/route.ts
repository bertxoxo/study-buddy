import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { getOne, runQuery } from '@/lib/db';
import { calculateSM2, difficultyToQuality } from '@/lib/sm2';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const flashcardId = parseInt(params.id);
    const flashcard = await getOne(
      'SELECT * FROM flashcards WHERE id = ? AND user_id = ?',
      [flashcardId, user.id]
    );
    if (!flashcard) return NextResponse.json({ error: 'Flashcard not found' }, { status: 404 });

    const body = await request.json().catch(() => ({}));
    const rating = body.rating || 'good'; // 'again' | 'hard' | 'good' | 'easy'
    const quality = difficultyToQuality(rating);

    const result = calculateSM2(
      quality,
      flashcard.ease_factor || 2.5,
      flashcard.interval_days || 0,
      flashcard.repetitions || 0
    );

    await runQuery(
      `UPDATE flashcards SET 
        times_reviewed = times_reviewed + 1, 
        last_reviewed = CURRENT_TIMESTAMP,
        ease_factor = ?,
        interval_days = ?,
        repetitions = ?,
        next_review_date = ?
       WHERE id = ?`,
      [result.ease_factor, result.interval_days, result.repetitions, result.next_review_date, flashcardId]
    );

    return NextResponse.json({
      message: 'Flashcard reviewed',
      next_review_date: result.next_review_date,
      interval_days: result.interval_days,
    });
  } catch (error) {
    console.error('Review flashcard error:', error);
    return NextResponse.json({ error: 'Failed to review flashcard' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const flashcardId = parseInt(params.id);
    const flashcard = await getOne(
      'SELECT * FROM flashcards WHERE id = ? AND user_id = ?',
      [flashcardId, user.id]
    );
    if (!flashcard) return NextResponse.json({ error: 'Flashcard not found' }, { status: 404 });

    await runQuery('DELETE FROM flashcards WHERE id = ?', [flashcardId]);
    return NextResponse.json({ message: 'Flashcard deleted' });
  } catch (error) {
    console.error('Delete flashcard error:', error);
    return NextResponse.json({ error: 'Failed to delete flashcard' }, { status: 500 });
  }
}