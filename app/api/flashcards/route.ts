import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { getAll } from '@/lib/db';
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const flashcards = await getAll('SELECT f.*, c.name as course_name FROM flashcards f LEFT JOIN courses c ON f.course_id = c.id WHERE f.user_id = ? ORDER BY f.created_at DESC', [user.id]);
    return NextResponse.json({ flashcards });
  } catch (error) {
    console.error('Flashcards error:', error);
    return NextResponse.json({ error: 'Failed to load flashcards' }, { status: 500 });
  }
}
