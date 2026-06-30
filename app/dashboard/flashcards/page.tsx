'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookMarked, Plus, Trash2, X } from 'lucide-react';

interface Flashcard {
  id: number;
  question: string;
  answer: string;
  difficulty: string;
  course_name: string;
  times_reviewed: number;
  next_review_date: string;
  interval_days: number;
}

interface Document {
  id: number;
  filename: string;
  course_name: string;
  course_id: number;
}

export default function FlashcardsPage() {
  const router = useRouter();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [filter, setFilter] = useState('all');
  const [dueOnly, setDueOnly] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({ document_id: '', count: '10' });
  const [lastRating, setLastRating] = useState<{ interval: number } | null>(null);

  useEffect(() => { fetchFlashcards(); }, [filter, dueOnly]);

  const fetchFlashcards = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/flashcards?difficulty=${filter}&due=${dueOnly}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { router.push('/login'); return; }
      const data = await res.json();
      setFlashcards(data.flashcards);
      setCurrentIndex(0);
      setIsFlipped(false);
      setLastRating(null);
    } catch (error) {
      console.error('Error fetching flashcards:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/documents', { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setDocuments(data.documents || []);
  };

  const handleGenerate = async () => {
    if (!form.document_id) { alert('Please select a document'); return; }
    const selectedDoc = documents.find(d => d.id === parseInt(form.document_id));
    if (!selectedDoc) return;
    setGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/flashcards/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ document_id: parseInt(form.document_id), course_id: selectedDoc.course_id, count: parseInt(form.count) || 10 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setShowModal(false);
      setForm({ document_id: '', count: '10' });
      fetchFlashcards();
    } catch (error) {
      alert('Error generating flashcards: ' + error);
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this flashcard?')) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`/api/flashcards/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      setFlashcards(flashcards.filter(f => f.id !== id));
      if (currentIndex >= flashcards.length - 1) setCurrentIndex(Math.max(0, currentIndex - 1));
    } catch { alert('Error deleting flashcard'); }
  };

  const handleRate = async (rating: 'again' | 'hard' | 'good' | 'easy') => {
    const card = flashcards[currentIndex];
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/flashcards/${card.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating }),
      });
      const data = await res.json();
      setLastRating({ interval: data.interval_days });
      setTimeout(() => {
        setLastRating(null);
        if (currentIndex < flashcards.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setIsFlipped(false);
        } else {
          fetchFlashcards();
        }
      }, 700);
    } catch {
      alert('Error rating flashcard');
    }
  };

  const openModal = () => { fetchDocuments(); setShowModal(true); };
  const currentCard = flashcards[currentIndex];

  if (loading) return (
    <div className="section flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-neutral-600">Loading flashcards...</p>
      </div>
    </div>
  );

  return (
    <div className="section space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold text-neutral-900">Flashcards</h1>
          <p className="text-neutral-600 mt-2">{flashcards.length} card{flashcards.length !== 1 ? 's' : ''} {dueOnly ? 'due for review' : ''}</p>
        </div>
        <button onClick={openModal} className="button button-primary">
          <Plus className="w-5 h-5" /> Generate Flashcards
        </button>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {['all', 'easy', 'medium', 'hard'].map(d => (
          <button key={d} onClick={() => setFilter(d)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${filter === d ? 'bg-primary-600 text-white' : 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300'}`}>
            {d}
          </button>
        ))}
        <button onClick={() => setDueOnly(!dueOnly)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${dueOnly ? 'bg-success-600 text-white' : 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300'}`}>
          {dueOnly ? '✓ Due Today Only' : 'Show Due Today Only'}
        </button>
      </div>

      {flashcards.length > 0 && currentCard ? (
        <div className="space-y-6 max-w-2xl mx-auto">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-neutral-600">Card {currentIndex + 1} of {flashcards.length}</p>
            <p className="text-sm text-neutral-600">
              {currentCard.next_review_date ? `Next review: ${currentCard.next_review_date}` : 'New card'}
            </p>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2">
            <div className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}></div>
          </div>

          {lastRating ? (
            <div className="card min-h-64 flex flex-col items-center justify-center">
              <div className="text-4xl mb-2">✓</div>
              <p className="text-lg font-medium text-neutral-700">
                Next review in {lastRating.interval} day{lastRating.interval !== 1 ? 's' : ''}
              </p>
            </div>
          ) : (
            <>
              <div className="card cursor-pointer min-h-64 flex flex-col items-center justify-center relative"
                onClick={() => setIsFlipped(!isFlipped)}>
                <p className="text-sm font-medium text-neutral-500 mb-4">{isFlipped ? 'Answer' : 'Question'}</p>
                <p className="text-2xl font-display font-bold text-neutral-900 text-center px-8">
                  {isFlipped ? currentCard.answer : currentCard.question}
                </p>
                {!isFlipped && <p className="absolute bottom-4 right-4 text-neutral-400 text-xs">Click to reveal answer</p>}
                <span className={`absolute top-4 right-4 badge capitalize ${currentCard.difficulty === 'easy' ? 'badge-success' : currentCard.difficulty === 'medium' ? 'badge-warning' : 'badge-danger'}`}>
                  {currentCard.difficulty}
                </span>
              </div>

              {isFlipped ? (
                <div>
                  <p className="text-center text-sm text-neutral-500 mb-3">How well did you know this?</p>
                  <div className="grid grid-cols-4 gap-2">
                    <button onClick={() => handleRate('again')}
                      style={{ padding: '12px 8px', borderRadius: 8, background: '#fee2e2', color: '#991b1b', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                      Again<br/><span style={{ fontSize: 11, fontWeight: 400 }}>forgot</span>
                    </button>
                    <button onClick={() => handleRate('hard')}
                      style={{ padding: '12px 8px', borderRadius: 8, background: '#fef3c7', color: '#92400e', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                      Hard<br/><span style={{ fontSize: 11, fontWeight: 400 }}>difficult</span>
                    </button>
                    <button onClick={() => handleRate('good')}
                      style={{ padding: '12px 8px', borderRadius: 8, background: '#d1fae5', color: '#065f46', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                      Good<br/><span style={{ fontSize: 11, fontWeight: 400 }}>recalled</span>
                    </button>
                    <button onClick={() => handleRate('easy')}
                      style={{ padding: '12px 8px', borderRadius: 8, background: '#e0e9fe', color: '#3730a3', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                      Easy<br/><span style={{ fontSize: 11, fontWeight: 400 }}>instant</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button onClick={() => { setCurrentIndex(Math.max(0, currentIndex - 1)); setIsFlipped(false); }}
                    disabled={currentIndex === 0}
                    className="button button-secondary flex-1 disabled:opacity-50">Previous</button>
                  <button onClick={() => handleDelete(currentCard.id)} className="button button-danger">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => setIsFlipped(true)} className="button button-primary flex-1">
                    Show Answer
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="card text-center py-16">
          <BookMarked className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-2xl font-display font-bold text-neutral-900 mb-2">
            {dueOnly ? 'No cards due for review!' : 'No flashcards yet'}
          </h3>
          <p className="text-neutral-600 mb-6">
            {dueOnly ? 'Great job staying on top of your reviews. Check back later.' : 'Generate flashcards from your study materials'}
          </p>
          <button onClick={openModal} className="button button-primary mx-auto">
            <Plus className="w-5 h-5" /> Generate Flashcards
          </button>
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 24, width: '100%', maxWidth: 480 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontWeight: 700, fontSize: 20 }}>Generate Flashcards</h2>
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
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Number of Flashcards</label>
              <select style={{ width: '100%', padding: 8, border: '1px solid #e4e4e7', borderRadius: 6 }}
                value={form.count} onChange={e => setForm({...form, count: e.target.value})}>
                <option value="5">5 cards</option>
                <option value="10">10 cards</option>
                <option value="15">15 cards</option>
                <option value="20">20 cards</option>
              </select>
            </div>
            <button onClick={handleGenerate} disabled={generating}
              style={{ width: '100%', padding: 10, background: '#6366f1', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
              {generating ? 'Generating...' : 'Generate Flashcards'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}