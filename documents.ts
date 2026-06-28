import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function generateSummary(text: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `Please provide a concise summary of the following text in 2-3 paragraphs:

${text}

Focus on the main points and key concepts.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

export async function extractKeyConceptsAndTopics(text: string): Promise<{
  concepts: string[];
  topics: string[];
}> {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `Analyze the following text and extract:
1. Key concepts (important terms and ideas)
2. Main topics covered

Return your response as JSON with this format:
{
  "concepts": ["concept1", "concept2", ...],
  "topics": ["topic1", "topic2", ...]
}

Text:
${text}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  
  try {
    const jsonStr = response.text().match(/\{[\s\S]*\}/)?.[0] || '{}';
    return JSON.parse(jsonStr);
  } catch (error) {
    return { concepts: [], topics: [] };
  }
}

export async function generateFlashcards(
  text: string,
  courseId: number,
  count: number = 10
): Promise<Array<{ question: string; answer: string; difficulty: string }>> {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `Generate ${count} flashcards from the following text. Each flashcard should have a question and answer.

Return as JSON array with this format:
[
  {
    "question": "...",
    "answer": "...",
    "difficulty": "easy|medium|hard"
  }
]

Text:
${text}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;

  try {
    const jsonStr = response.text().match(/\[[\s\S]*\]/)?.[0] || '[]';
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Error parsing flashcards:', error);
    return [];
  }
}

export async function generateQuizQuestions(
  text: string,
  courseId: number,
  count: number = 10
): Promise<
  Array<{
    question: string;
    type: string;
    options?: string[];
    correct_answer: string;
    explanation: string;
  }>
> {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `Generate ${count} quiz questions from the following text. Mix different question types.

Return as JSON array with this format:
[
  {
    "question": "...",
    "type": "multiple-choice|true-false|short-answer",
    "options": ["option1", "option2", ...] (only for multiple-choice),
    "correct_answer": "...",
    "explanation": "..."
  }
]

Text:
${text}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;

  try {
    const jsonStr = response.text().match(/\[[\s\S]*\]/)?.[0] || '[]';
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Error parsing quiz questions:', error);
    return [];
  }
}

export async function generateStudyPlan(
  courses: Array<{ name: string; examDate: string }>,
  userAvailability: string,
  weakSubjects: string[] = []
): Promise<any> {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `Create a personalized study plan for a student with the following information:

Courses and exam dates:
${courses.map((c) => `- ${c.name}: Exam on ${c.examDate}`).join('\n')}

Student availability: ${userAvailability}

Weak subjects: ${weakSubjects.length > 0 ? weakSubjects.join(', ') : 'None identified'}

Create a daily study schedule for the next 2 weeks. Return as JSON:
{
  "monday": [
    { "subject": "...", "duration_minutes": ..., "topics": "..." }
  ],
  "tuesday": [...],
  ...
  "summary": "..."
}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;

  try {
    const jsonStr = response.text().match(/\{[\s\S]*\}/)?.[0] || '{}';
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Error parsing study plan:', error);
    return {};
  }
}

export async function analyzeAcademicHealth(
  missedAssignments: number,
  lowScores: number,
  studyHours: number,
  upcomingExams: number
): Promise<{
  riskLevel: string;
  warnings: string[];
  recommendations: string[];
  healthScore: number;
}> {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `Analyze the academic health of a student with this data:
- Missed assignments: ${missedAssignments}
- Low quiz scores: ${lowScores}
- Study hours this week: ${studyHours}
- Upcoming exams: ${upcomingExams}

Return as JSON:
{
  "riskLevel": "low|medium|high|critical",
  "healthScore": 0-100,
  "warnings": ["warning1", "warning2"],
  "recommendations": ["recommendation1", "recommendation2"]
}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;

  try {
    const jsonStr = response.text().match(/\{[\s\S]*\}/)?.[0] || '{}';
    return JSON.parse(jsonStr);
  } catch (error) {
    return {
      riskLevel: 'medium',
      warnings: [],
      recommendations: [],
      healthScore: 50,
    };
  }
}

export async function getAcademicInsight(question: string, context: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `A student is asking you for academic advice. Use the context provided to give personalized guidance.

Question: ${question}

Context (student's materials and progress):
${context}

Provide helpful, actionable advice based on the context.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}