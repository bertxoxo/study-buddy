import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { getAll, getOne } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const courses = await getAll(
      'SELECT * FROM courses WHERE user_id = ? ORDER BY created_at DESC',
      [user.id]
    );

    const coursesData = await Promise.all(
      courses.map(async (course: any) => {
        const docCount = await getOne(
          'SELECT COUNT(*) as count FROM documents WHERE course_id = ?',
          [course.id]
        );
        return { ...course, documents: docCount?.count || 0 };
      })
    );

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email },
      stats: { streak: 0, completedToday: 0, weeklyHours: 0, avgScore: 0 },
      courses: coursesData,
      upcomingDeadlines: [],
      todaysTasks: [],
      riskWarning: null,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 });
  }
}