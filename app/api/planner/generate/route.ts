import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { getAll, runQuery } from '@/lib/db';
import Groq from 'groq-sdk';

let groq: any;
const getGroq = () => {
  if (!groq) groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return groq;
};

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const courses = await getAll(
      'SELECT name, exam_date, class_days, class_time, rest_days FROM courses WHERE user_id = ?',
      [user.id]
    );

    if (courses.length === 0) return NextResponse.json({ error: 'No courses found. Add courses first.' }, { status: 400 });

    // Build schedule context for AI
    const scheduleInfo = courses.map((c: any) => {
      const parts = [];
      if (c.class_days) parts.push(`Class days: ${c.class_days}`);
      if (c.class_time) parts.push(`Class time: ${c.class_time}`);
      if (c.rest_days) parts.push(`Rest days: ${c.rest_days}`);
      if (c.exam_date) parts.push(`Exam: ${c.exam_date}`);
      return `${c.name} — ${parts.join(', ')}`;
    }).join('\n');

    // Collect all rest days across courses
    const allRestDays = [...new Set(
      courses.flatMap((c: any) => (c.rest_days || '').split(',').map((d: string) => d.trim()).filter(Boolean))
    )];

    const prompt = `You are a study planner. Create a realistic 1-week study plan for a student.

IMPORTANT RULES:
- Do NOT schedule study time during class hours
- Do NOT schedule anything on rest days: ${allRestDays.join(', ') || 'Sunday'}
- Schedule study sessions BEFORE or AFTER class, not during
- Include 15-minute breaks between study sessions
- Max 3-4 hours of study per day
- Keep evenings light (max 1 hour after 8pm)

Student's course schedule:
${scheduleInfo}

Return ONLY a valid JSON object like this:
{
  "monday": [
    { "time": "7:00 AM - 8:00 AM", "subject": "Math", "activity": "Review Chapter 3", "duration_minutes": 60, "type": "study" },
    { "time": "8:00 AM - 8:15 AM", "subject": "", "activity": "Break", "duration_minutes": 15, "type": "break" }
  ],
  "tuesday": [],
  "wednesday": [],
  "thursday": [],
  "friday": [],
  "saturday": [],
  "sunday": [],
  "summary": "Brief summary of the plan",
  "rest_days": ["Sunday"],
  "tips": ["tip1", "tip2"]
}

Only include days that have study sessions. Leave rest days as empty arrays.`;

    const res = await getGroq().chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }]
    });

    const raw = res.choices[0]?.message?.content || '{}';
    const json = raw.match(/\{[\s\S]*\}/)?.[0] || '{}';
    const plan = JSON.parse(json);

    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    await runQuery(
      'INSERT INTO study_plans (user_id, title, start_date, end_date, plan_data) VALUES (?, ?, ?, ?, ?)',
      [user.id, 'AI Generated Study Plan', startDate, endDate, JSON.stringify(plan)]
    );

    return NextResponse.json({ plan });
  } catch (error) {
    console.error('Generate plan error:', error);
    return NextResponse.json({ error: 'Failed to generate plan' }, { status: 500 });
  }
}