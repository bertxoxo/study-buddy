import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { getAll } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get('difficulty');
    const dueOnly = searchParams.get('due') === 'true';

    let query = 'SELECT f.*, c.name as course_name FROM flashcards f LEFT JOIN courses c ON f.course_id = c.id WHERE f.user_id = ?';
    const queryParams: any[] = [user.id];

    if (difficulty && difficulty !== 'all') {
      query += ' AND f.difficulty = ?';
      queryParams.push(difficulty);
    }

    if (dueOnly) {
      const today = new Date().toISOString().split('T')[0];
      query += ' AND (f.next_review_date IS NULL OR f.next_review_date <= ?)';
      queryParams.push(today);
    }

    query += ' ORDER BY f.next_review_date ASC, f.created_at DESC';

    const flashcards = await getAll(query, queryParams);
    return NextResponse.json({ flashcards });
  } catch (error) {
    console.error('Flashcards error:', error);
    return NextResponse.json({ error: 'Failed to load flashcards' }, { status: 500 });
  }
}