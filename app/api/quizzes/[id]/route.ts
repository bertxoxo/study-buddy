import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { getOne, getAll } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const quiz = await getOne(
      'SELECT * FROM quizzes WHERE id = ? AND user_id = ?',
      [params.id, user.id]
    );

    if (!quiz) return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });

    const questions = await getAll(
      'SELECT * FROM quiz_questions WHERE quiz_id = ?',
      [params.id]
    );

    return NextResponse.json({ quiz, questions });
  } catch (error) {
    console.error('Get quiz error:', error);
    return NextResponse.json({ error: 'Failed to load quiz' }, { status: 500 });
  }
}