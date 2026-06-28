import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { runQuery, getOne } from '@/lib/db';
import {
  validateAndSaveUploadedFile,
  extractTextFromFile,
  truncateText,
} from '@/lib/documents';
import {
  generateSummary,
  extractKeyConceptsAndTopics,
} from '@/lib/gemini';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const courseId = formData.get('course_id') as string;

    if (!file || !courseId) {
      return NextResponse.json(
        { error: 'File and course_id are required' },
        { status: 400 }
      );
    }

    // Verify course belongs to user
    const course = await getOne(
      'SELECT * FROM courses WHERE id = ? AND user_id = ?',
      [parseInt(courseId), user.id]
    );

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Create uploads directory
    const uploadDir = path.join(process.cwd(), 'public/uploads', String(user.id));
    await fs.mkdir(uploadDir, { recursive: true });

    // Save file
    const buffer = await file.arrayBuffer();
    const filename = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, new Uint8Array(buffer));

    // Extract text from file
    const fileType = file.name.split('.').pop() || '';
    let extractedText = '';

    try {
      extractedText = await extractTextFromFile(filePath, fileType);
    } catch (error) {
      console.error('Text extraction error:', error);
      extractedText = '';
    }

    // Save document to database
    const docResult = await runQuery(
      `INSERT INTO documents (user_id, course_id, filename, file_path, file_type, extracted_text)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        user.id,
        parseInt(courseId),
        file.name,
        `/uploads/${user.id}/${filename}`,
        fileType,
        truncateText(extractedText, 50000),
      ]
    );

    const documentId = (docResult as any).lastID;

    // Process with AI in background (non-blocking)
    processDocumentAsync(documentId, extractedText);

    const document = await getOne('SELECT * FROM documents WHERE id = ?', [
      documentId,
    ]);

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'File upload failed' },
      { status: 500 }
    );
  }
}

async function processDocumentAsync(
  documentId: number,
  extractedText: string
) {
  try {
    if (!extractedText) return;

    const textToProcess = truncateText(extractedText, 10000);

    // Generate summary
    const summary = await generateSummary(textToProcess);

    // Extract concepts
    const { concepts, topics } = await extractKeyConceptsAndTopics(
      textToProcess
    );

    // Update document
    await runQuery(
      `UPDATE documents SET summary = ?, key_concepts = ? WHERE id = ?`,
      [
        summary,
        JSON.stringify({ concepts, topics }),
        documentId,
      ]
    );
  } catch (error) {
    console.error('AI processing error:', error);
  }
}