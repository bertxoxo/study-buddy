'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Plus, Play, X } from 'lucide-react';

interface Quiz {
  id: number;
  title: string;
  course_name: string;
  total_questions: number;
  created_at: string;
}

interface Document {
  id: number;
  filename: string;
  course_name: string;
  course_id: number;
}

export default function QuizzesPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({ document_id: '', title: '', question_count: '10' });

  useEffect(() => {
    fetchQuizzes();
    fetchDocuments();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/quizzes', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { router.push('/login'); return; }
      const data = await res.json();
      setQuizzes(data.quizzes);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/documents', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const handleGenerate = async () => {
    if (!form.document_id) { alert('Please select a document'); return; }
    const selectedDoc = documents.find(d => d.id === parseInt(form.document_id));
    if (!selectedDoc) return;
    setGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/quizzes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          document_id: parseInt(form.document_id),
          course_id: selectedDoc.course_id,
          title: form.title || selectedDoc.filename + ' Quiz',
          question_count: parseInt(form.question_count) || 10
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setShowModal(false);
      setForm({ document_id: '', title: '', question_count: '10' });
      fetchQuizzes();
      router.push('/dashboard/quizzes/' + data.quiz_id);
    } catch (error) {
      alert('Error generating quiz: ' + error);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return (
    <div className="section flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-neutral-600">Loading quizzes...</p>
      </div>
    </div>
  );

  return (
    <div className="section space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold text-neutral-900">Quizzes</h1>
          <p className="text-neutral-600 mt-2">{quizzes.length} quiz{quizzes.length !== 1 ? 'zes' : ''}</p>
        </div>
        <button onClick={() => setShowModal(true)} className="button button-primary">
          <Plus className="w-5 h-5" /> Generate Quiz
        </button>
      </div>

      {quizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="card-interactive group flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-display font-bold text-neutral-900 flex-1">{quiz.title}</h3>
                <Zap className="w-6 h-6 text-primary-600 flex-shrink-0" />
              </div>
              <p className="text-neutral-600 text-sm mb-2">{quiz.course_name}</p>
              <p className="text-sm text-neutral-500 mb-6">{quiz.total_questions} questions</p>
              <button onClick={() => router.push(`/dashboard/quizzes/${quiz.id}`)} className="button button-primary button-sm mt-auto">
                <Play className="w-4 h-4" /> Start Quiz
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-16">
          <Zap className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-2xl font-display font-bold text-neutral-900 mb-2">No quizzes yet</h3>
          <p className="text-neutral-600 mb-6">Generate quizzes from your study materials</p>
          <button onClick={() => setShowModal(true)} className="button button-primary mx-auto">
            <Plus className="w-5 h-5" /> Generate Quiz
          </button>
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 24, width: '100%', maxWidth: 480 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontWeight: 700, fontSize: 20 }}>Generate Quiz</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Select Document</label>
              <select style={{ width: '100%', padding: 8, border: '1px solid #e4e4e7', borderRadius: 6 }}
                value={form.document_id} onChange={e => setForm({...form, document_id: e.target.value})}>
                <option value="">-- Choose a document --</option>
                {documents.map(doc => (
                  <option key={doc.id} value={doc.id}>{doc.filename} ({doc.course_name})</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Quiz Title (optional)</label>
              <input style={{ width: '100%', padding: 8, border: '1px solid #e4e4e7', borderRadius: 6 }}
                placeholder="e.g. English Midterm Quiz"
                value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Number of Questions</label>
              <select style={{ width: '100%', padding: 8, border: '1px solid #e4e4e7', borderRadius: 6 }}
                value={form.question_count} onChange={e => setForm({...form, question_count: e.target.value})}>
                <option value="5">5 questions</option>
                <option value="10">10 questions</option>
                <option value="15">15 questions</option>
                <option value="20">20 questions</option>
              </select>
            </div>
            <button onClick={handleGenerate} disabled={generating}
              style={{ width: '100%', padding: 10, background: '#6366f1', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
              {generating ? 'Generating...' : 'Generate Quiz'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}