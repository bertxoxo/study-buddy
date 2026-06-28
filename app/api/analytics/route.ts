import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { getOne, getAll } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get total study hours
    const hoursResult = await getOne(
      `SELECT SUM(duration_minutes) as total FROM study_sessions WHERE user_id = ?`,
      [user.id]
    );
    const totalHours = hoursResult ? Math.round(hoursResult.total / 60) : 0;

    // Get quizzes taken
    const quizzesResult = await getOne(
      `SELECT COUNT(*) as count FROM quiz_results WHERE user_id = ?`,
      [user.id]
    );
    const quizzesTaken = quizzesResult?.count || 0;

    // Get average score
    const scoresResult = await getOne(
      `SELECT AVG((score / total_questions) * 100) as avg FROM quiz_results WHERE user_id = ?`,
      [user.id]
    );
    const avgScore = scoresResult ? Math.round(scoresResult.avg) : 0;

    // Get streak
    const streakResult = await getOne(
      `SELECT study_streak FROM users WHERE id = ?`,
      [user.id]
    );
    const streak = streakResult?.study_streak || 0;

    // Get course performance
    const courses = await getAll(
      `SELECT id, name FROM courses WHERE user_id = ?`,
      [user.id]
    );

    const coursePerformance = await Promise.all(
      courses.map(async (course: any) => {
        const docCount = await getOne(
          `SELECT COUNT(*) as count FROM documents WHERE course_id = ?`,
          [course.id]
        );

        const flashcardCount = await getOne(
          `SELECT COUNT(*) as count FROM flashcards WHERE course_id = ?`,
          [course.id]
        );

        const quizResults = await getAll(
          `SELECT qr.score, qr.total_questions FROM quiz_results qr
           JOIN quizzes q ON qr.quiz_id = q.id
           WHERE q.course_id = ?`,
          [course.id]
        );

        const score =
          quizResults.length > 0
            ? Math.round(
                quizResults.reduce(
                  (sum: number, r: any) =>
                    sum + (r.score / r.total_questions) * 100,
                  0
                ) / quizResults.length
              )
            : 0;

        return {
          name: course.name,
          score: score || 0,
          documents: docCount?.count || 0,
          flashcards: flashcardCount?.count || 0,
        };
      })
    );

    // Get weekly activity
    const weekDays = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const weeklyActivity = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayName =
        i === 0 ? 'Today' : weekDays[date.getDay()].slice(0, 3);

      const hoursResult = await getOne(
        `SELECT SUM(duration_minutes) as total FROM study_sessions 
         WHERE user_id = ? AND DATE(started_at) = ?`,
        [user.id, dateStr]
      );

      weeklyActivity.push({
        day: dayName,
        hours: hoursResult ? Math.round(hoursResult.total / 60) : 0,
      });
    }

    return NextResponse.json({
      totalHours,
      quizzesTaken,
      avgScore,
      streak,
      coursePerformance,
      weeklyActivity,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}