import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { getOne, runQuery } from '@/lib/db';

// POST review flashcard
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const flashcardId = parseInt(params.id);

    const flashcard = await getOne(
      'SELECT * FROM flashcards WHERE id = ? AND user_id = ?',
      [flashcardId, user.id]
    );

    if (!flashcard) {
      return NextResponse.json(
        { error: 'Flashcard not found' },
        { status: 404 }
      );
    }

    // Update review count and last reviewed date
    await runQuery(
      `UPDATE flashcards SET times_reviewed = times_reviewed + 1, last_reviewed = CURRENT_TIMESTAMP WHERE id = ?`,
      [flashcardId]
    );

    return NextResponse.json({
      message: 'Flashcard reviewed',
    });
  } catch (error) {
    console.error('Review flashcard error:', error);
    return NextResponse.json(
      { error: 'Failed to review flashcard' },
      { status: 500 }
    );
  }
}

// DELETE flashcard
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const flashcardId = parseInt(params.id);

    const flashcard = await getOne(
      'SELECT * FROM flashcards WHERE id = ? AND user_id = ?',
      [flashcardId, user.id]
    );

    if (!flashcard) {
      return NextResponse.json(
        { error: 'Flashcard not found' },
        { status: 404 }
      );
    }

    await runQuery('DELETE FROM flashcards WHERE id = ?', [flashcardId]);

    return NextResponse.json({
      message: 'Flashcard deleted',
    });
  } catch (error) {
    console.error('Delete flashcard error:', error);
    return NextResponse.json(
      { error: 'Failed to delete flashcard' },
      { status: 500 }
    );
  }
}