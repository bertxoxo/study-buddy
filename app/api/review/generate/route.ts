import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { getOne } from '@/lib/db';
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

    const { document_id } = await request.json();
    if (!document_id) return NextResponse.json({ error: 'document_id required' }, { status: 400 });

    const document = await getOne(
      'SELECT * FROM documents WHERE id = ? AND user_id = ?',
      [document_id, user.id]
    );
    if (!document) return NextResponse.json({ error: 'Document not found' }, { status: 404 });

    const text = document.extracted_text || document.summary || 'No content available';

    const res = await getGroq().chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{
        role: 'user',
        content: `You are a study coach. Break this document into study slides for review.
        
For each slide, identify the type: "concept", "formula", "essay", "example", or "summary".

Return ONLY a valid JSON array like this:
[
  {
    "title": "Slide title",
    "type": "concept",
    "content": "Main explanation here...",
    "key_points": ["point 1", "point 2"],
    "example": "Optional example or formula here"
  }
]

Create 5-8 slides. Document:
${text}`
      }]
    });

    const raw = res.choices[0]?.message?.content || '[]';
    const json = raw.match(/\[[\s\S]*\]/)?.[0] || '[]';
    const slides = JSON.parse(json);

    return NextResponse.json({ slides, document_title: document.filename });
  } catch (error) {
    console.error('Review generate error:', error);
    return NextResponse.json({ error: 'Failed to generate review' }, { status: 500 });
  }
}