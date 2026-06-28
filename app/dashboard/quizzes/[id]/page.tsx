'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    fetch('/api/quizzes/' + params.id, {
      headers: { 'Authorization': 'Bearer ' + token }
    }).then(r => r.json()).then(data => {
      setQuiz(data.quiz);
      setQuestions(data.questions || []);
      setLoading(false);
    });
  }, [params.id]);

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correct_answer) correct++;
    });
    setScore(correct);
    setSubmitted(true);
  };

  if (loading) return <div style={{ padding: 24 }}>Loading quiz...</div>;

  if (submitted) return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: 24, fontFamily: 'sans-serif' }}>
      <h1>Quiz Complete!</h1>
      <p style={{ fontSize: 24 }}>Score: {score} / {questions.length}</p>
      <p>Percentage: {Math.round((score / questions.length) * 100)}%</p>
      <button onClick={() => router.push('/dashboard/quizzes')}
        style={{ padding: '10px 20px', background: '#6366f1', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
        Back to Quizzes
      </button>
    </div>
  );

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: 24, fontFamily: 'sans-serif' }}>
      <h1>{quiz?.title || 'Quiz'}</h1>
      <p>{questions.length} questions</p>
      {questions.map((q, i) => (
        <div key={i} style={{ marginBottom: 24, padding: 16, border: '1px solid #e4e4e7', borderRadius: 8 }}>
          <p style={{ fontWeight: 600 }}>{i + 1}. {q.question}</p>
          {q.options && JSON.parse(q.options || '[]').map((opt: string, j: number) => (
            <label key={j} style={{ display: 'block', margin: '8px 0', cursor: 'pointer' }}>
              <input type="radio" name={'q' + i} value={opt}
                onChange={() => setAnswers({...answers, [i]: opt})}
                style={{ marginRight: 8 }} />
              {opt}
            </label>
          ))}
          {(!q.options || q.options === '[]') && (
            <input placeholder="Your answer" style={{ width: '100%', padding: 8, marginTop: 8 }}
              onChange={e => setAnswers({...answers, [i]: e.target.value})} />
          )}
        </div>
      ))}
      <button onClick={handleSubmit}
        style={{ width: '100%', padding: 12, background: '#6366f1', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 16 }}>
        Submit Quiz
      </button>
    </div>
  );
}