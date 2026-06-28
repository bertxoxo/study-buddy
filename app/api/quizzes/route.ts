import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { getAll } from '@/lib/db';
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const quizzes = await getAll('SELECT q.*, c.name as course_name FROM quizzes q LEFT JOIN courses c ON q.course_id = c.id WHERE q.user_id = ? ORDER BY q.created_at DESC', [user.id]);
    return NextResponse.json({ quizzes });
  } catch (error) {
    console.error('Quizzes error:', error);
    return NextResponse.json({ error: 'Failed to load quizzes' }, { status: 500 });
  }
}
