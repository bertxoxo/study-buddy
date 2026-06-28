import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { getOne, runQuery } from '@/lib/db';
import { generateQuizQuestions } from '@/lib/gemini';
export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { document_id, course_id, title, question_count } = await request.json();
    if (!document_id || !course_id) return NextResponse.json({ error: 'document_id and course_id are required' }, { status: 400 });
    const document = await getOne('SELECT * FROM documents WHERE id = ? AND user_id = ?', [document_id, user.id]);
    if (!document) return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    const text = document.extracted_text || document.summary || 'No content available';
    const questions = await generateQuizQuestions(text, course_id, question_count || 10);
    const quizResult = await runQuery('INSERT INTO quizzes (user_id, course_id, document_id, title) VALUES (?, ?, ?, ?)', [user.id, course_id, document_id, title || 'AI Generated Quiz']);
    const quizId = quizResult.lastID;
    for (const q of questions) {
      await runQuery('INSERT INTO quiz_questions (quiz_id, question, question_type, options, correct_answer, explanation) VALUES (?, ?, ?, ?, ?, ?)', [quizId, q.question, q.type, JSON.stringify(q.options || []), q.correct_answer, q.explanation]);
    }
    return NextResponse.json({ quiz_id: quizId, questions }, { status: 201 });
  } catch (error) {
    console.error('Generate quiz error:', error);
    return NextResponse.json({ error: 'Failed to generate quiz' }, { status: 500 });
  }
}
