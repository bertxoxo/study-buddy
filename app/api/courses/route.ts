import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { getAll, runQuery } from '@/lib/db';
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const courses = await getAll('SELECT * FROM courses WHERE user_id = ? ORDER BY created_at DESC', [user.id]);
    return NextResponse.json({ courses });
  } catch (error) {
    console.error('Courses error:', error);
    return NextResponse.json({ error: 'Failed to load courses' }, { status: 500 });
  }
}
export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { name, instructor, schedule, exam_date, color } = await request.json();
    if (!name) return NextResponse.json({ error: 'Course name is required' }, { status: 400 });
    const result = await runQuery('INSERT INTO courses (user_id, name, instructor, schedule, exam_date, color) VALUES (?, ?, ?, ?, ?, ?)', [user.id, name, instructor || '', schedule || '', exam_date || null, color || '#6366f1']);
    const course = await getAll('SELECT * FROM courses WHERE id = ?', [result.lastID]);
    return NextResponse.json({ course: course[0] }, { status: 201 });
  } catch (error) {
    console.error('Create course error:', error);
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 });
  }
}
