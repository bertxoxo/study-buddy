import Groq from 'groq-sdk';
let groq: any;
const getGroq = () => {
  if (!groq) groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return groq;
};
async function ask(prompt: string): Promise<string> {
  const res = await getGroq().chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [{ role: 'user', content: prompt }]
  });
  return res.choices[0]?.message?.content || '';
}

export async function generateSummary(text: string): Promise<string> {
  return ask('Summarize this in 2-3 paragraphs:\n' + text);
}

export async function extractKeyConceptsAndTopics(text: string): Promise<{ concepts: string[]; topics: string[] }> {
  try {
    const r = await ask('Extract key concepts and topics. Return ONLY valid JSON object with concepts and topics arrays:\n' + text);
    const j = r.match(/\{[\s\S]*\}/)?.[0] || '{}';
    return JSON.parse(j);
  } catch { return { concepts: [], topics: [] }; }
}

export async function generateFlashcards(text: string, courseId: number, count: number = 10): Promise<Array<{ question: string; answer: string; difficulty: string }>> {
  try {
    const r = await ask('Generate ' + count + ' flashcards. Return ONLY valid JSON array with question, answer, difficulty fields:\n' + text);
    const j = r.match(/\[[\s\S]*\]/)?.[0] || '[]';
    return JSON.parse(j);
  } catch { return []; }
}

export async function generateQuizQuestions(text: string, courseId: number, count: number = 10): Promise<Array<{ question: string; type: string; options?: string[]; correct_answer: string; explanation: string }>> {
  try {
    const r = await ask('Generate ' + count + ' multiple choice quiz questions. Return ONLY valid JSON array with question, type, options, correct_answer, explanation fields:\n' + text);
    const j = r.match(/\[[\s\S]*\]/)?.[0] || '[]';
    return JSON.parse(j);
  } catch { return []; }
}

export async function generateStudyPlan(courses: Array<{ name: string; examDate: string }>, userAvailability: string, weakSubjects: string[]): Promise<any> {
  try {
    const courseList = courses.map(c => c.name + ' exam: ' + c.examDate).join(', ');
    const r = await ask('Create a 2-week study plan for: ' + courseList + '. Return ONLY valid JSON with keys monday through sunday, each an array of objects with subject, duration_minutes, topics fields, plus a summary key.');
    const j = r.match(/\{[\s\S]*\}/)?.[0] || '{}';
    return JSON.parse(j);
  } catch { return {}; }
}

export async function analyzeAcademicHealth(missedAssignments: number, lowScores: number, studyHours: number, upcomingExams: number): Promise<{ riskLevel: string; warnings: string[]; recommendations: string[]; healthScore: number }> {
  try {
    const r = await ask('Analyze academic health. missed=' + missedAssignments + ' lowScores=' + lowScores + ' studyHours=' + studyHours + ' upcomingExams=' + upcomingExams + '. Return ONLY valid JSON with riskLevel, healthScore, warnings array, recommendations array.');
    const j = r.match(/\{[\s\S]*\}/)?.[0] || '{}';
    return JSON.parse(j);
  } catch { return { riskLevel: 'medium', warnings: [], recommendations: [], healthScore: 50 }; }
}

export async function getAcademicInsight(question: string, context: string): Promise<string> {
  return ask('Answer this student question: ' + question + '\nContext: ' + context);
}