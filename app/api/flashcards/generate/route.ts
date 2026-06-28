import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { getOne, runQuery } from '@/lib/db';
import { generateFlashcards } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { document_id, count } = await request.json();

    // Get document
    const document = await getOne(
      'SELECT * FROM documents WHERE id = ? AND user_id = ?',
      [document_id, user.id]
    );

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    if (!document.extracted_text) {
      return NextResponse.json(
        { error: 'Document has no extractable content' },
        { status: 400 }
      );
    }

    // Generate flashcards with AI
    const generatedCards = await generateFlashcards(
      document.extracted_text,
      document.course_id,
      count || 10
    );

    // Save to database
    for (const card of generatedCards) {
      await runQuery(
        `INSERT INTO flashcards (user_id, course_id, document_id, question, answer, difficulty)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          user.id,
          document.course_id,
          document_id,
          card.question,
          card.answer,
          card.difficulty || 'medium',
        ]
      );
    }

    return NextResponse.json({
      count: generatedCards.length,
      message: `Generated ${generatedCards.length} flashcards`,
    });
  } catch (error) {
    console.error('Generate flashcards error:', error);
    return NextResponse.json(
      { error: 'Failed to generate flashcards' },
      { status: 500 }
    );
  }
}