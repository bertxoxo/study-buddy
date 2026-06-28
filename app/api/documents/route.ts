import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { getAll, getOne } from '@/lib/db';


export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const documents = await getAll(
      `SELECT d.*, c.name as course_name FROM documents d
       JOIN courses c ON d.course_id = c.id
       WHERE d.user_id = ? ORDER BY d.created_at DESC`,
      [user.id]
    );

    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Get documents error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}