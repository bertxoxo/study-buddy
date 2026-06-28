import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { runQuery, getOne } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const course = await getOne('SELECT * FROM courses WHERE id = ? AND user_id = ?', [params.id, user.id]);
    if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });

    await runQuery('DELETE FROM courses WHERE id = ?', [params.id]);
    return NextResponse.json({ message: 'Course deleted' });
  } catch (error) {
    console.error('Delete course error:', error);
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 });
  }
}