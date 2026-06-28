'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Pause, RotateCcw, X, Clock, BookOpen, Zap } from 'lucide-react';

interface Flashcard {
  id: number;
  question: string;
  answer: string;
  difficulty: string;
  course_name: string;
}

interface Document {
  id: number;
  filename: string;
  course_name: string;
  course_id: number;
}

export default function ReviewPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [technique, setTechnique] = useState('');
  const [selectedDoc, setSelectedDoc] = useState('');
  const [phase, setPhase] = useState<'setup'|'review'|'break'|'done'>('setup');
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isBreak, setIsBreak] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    fetch('/api/documents', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setDocuments(d.documents || []));
  }, []);

  useEffect(() => {
    if (isRunning && technique === 'pomodoro') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            if (!isBreak) {
              setIsBreak(true);
              setIsRunning(false);
              setPhase('break');
              setPomodoroCount(c => c + 1);
              setTimeLeft(5 * 60);
              alert('Time for a break! Rest for 5 minutes.');
            } else {
              setIsBreak(false);
              setIsRunning(false);
              setPhase('review');
              setTimeLeft(25 * 60);
              alert('Break over! Back to studying.');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, isBreak, technique]);

  const startReview = async () => {
    if (!selectedDoc || !technique) { alert('Please select a document and technique'); return; }
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/flashcards?difficulty=all`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    const cards = (data.flashcards || []).filter((f: any) => {
      const doc = documents.find(d => d.id === parseInt(selectedDoc));
      return doc ? f.course_name === doc.course_name : true;
    });
    if (cards.length === 0) { alert('No flashcards found for this document. Generate flashcards first!'); return; }
    setFlashcards(cards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setPhase('review');
    if (technique === 'pomodoro') { setTimeLeft(25 * 60); setIsRunning(true); }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const nextCard = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      setPhase('done');
      clearInterval(timerRef.current);
      setIsRunning(false);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) { setCurrentIndex(currentIndex - 1); setIsFlipped(false); }
  };

  if (phase === 'done') return (
    <div className="section flex items-center justify-center min-h-screen">
      <div className="card text-center py-16 max-w-md mx-auto">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-display font-bold text-neutral-900 mb-2">Review Complete!</h2>
        <p className="text-neutral-600 mb-2">You reviewed {flashcards.length} flashcards</p>
        {technique === 'pomodoro' && <p className="text-neutral-600 mb-6">Completed {pomodoroCount} Pomodoro session{pomodoroCount !== 1 ? 's' : ''}</p>}
        <div className="flex gap-3 justify-center">
          <button onClick={() => { setPhase('setup'); setFlashcards([]); setIsBreak(false); setPomodoroCount(0); }}
            className="button button-secondary">Review Again</button>
          <button onClick={() => router.push('/dashboard')} className="button button-primary">Back to Dashboard</button>
        </div>
      </div>
    </div>
  );

  if (phase === 'break') return (
    <div className="section flex items-center justify-center min-h-screen">
      <div className="card text-center py-16 max-w-md mx-auto">
        <div className="text-6xl mb-4">☕</div>
        <h2 className="text-3xl font-display font-bold text-neutral-900 mb-2">Break Time!</h2>
        <p className="text-neutral-600 mb-4">Take a 5-minute break. You earned it!</p>
        <div className="text-5xl font-bold text-primary-600 mb-6">{formatTime(timeLeft)}</div>
        <button onClick={() => setIsRunning(true)} disabled={isRunning} className="button button-primary">
          {isRunning ? 'Break running...' : 'Start Break Timer'}
        </button>
        <button onClick={() => { setPhase('review'); setIsBreak(false); setTimeLeft(25 * 60); }}
          className="button button-secondary ml-3">Skip Break</button>
      </div>
    </div>
  );

  if (phase === 'setup') return (
    <div className="section space-y-8">
      <div>
        <h1 className="text-4xl font-display font-bold text-neutral-900">Study Review</h1>
        <p className="text-neutral-600 mt-2">Choose your document and review technique</p>
      </div>

      <div className="card max-w-xl">
        <div className="mb-6">
          <label className="block font-medium text-neutral-700 mb-2">Select Document</label>
          <select className="w-full p-3 border border-neutral-200 rounded-lg"
            value={selectedDoc} onChange={e => setSelectedDoc(e.target.value)}>
            <option value="">-- Choose a document --</option>
            {documents.map(doc => (
              <option key={doc.id} value={doc.id}>{doc.filename} ({doc.course_name})</option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block font-medium text-neutral-700 mb-3">Review Technique</label>
          <div className="grid grid-cols-1 gap-3">
            {[
              { id: 'pomodoro', icon: '🍅', title: 'Pomodoro', desc: '25 min study + 5 min break with timer' },
              { id: 'spaced', icon: '🧠', title: 'Spaced Repetition', desc: 'Review cards based on difficulty' },
              { id: 'free', icon: '📖', title: 'Free Review', desc: 'Go through all cards at your own pace' },
            ].map(t => (
              <div key={t.id} onClick={() => setTechnique(t.id)}
                style={{ cursor: 'pointer', padding: 16, borderRadius: 8, border: `2px solid ${technique === t.id ? '#6366f1' : '#e4e4e7'}`, background: technique === t.id ? '#f0f4ff' : 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 24 }}>{t.icon}</span>
                  <div>
                    <p style={{ fontWeight: 600 }}>{t.title}</p>
                    <p style={{ fontSize: 14, color: '#71717a' }}>{t.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button onClick={startReview} className="button button-primary w-full">
          <Play className="w-5 h-5" /> Start Review Session
        </button>
      </div>
    </div>
  );

  const currentCard = flashcards[currentIndex];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'white', zIndex: 100, padding: 24, overflowY: 'auto' }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-neutral-900">
            {technique === 'pomodoro' ? '🍅 Pomodoro Review' : technique === 'spaced' ? '🧠 Spaced Repetition' : '📖 Free Review'}
          </h1>
          <p className="text-neutral-600">Card {currentIndex + 1} of {flashcards.length}</p>
        </div>
        <div className="flex items-center gap-3">
          {technique === 'pomodoro' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: isBreak ? '#fef3c7' : '#f0f4ff', padding: '8px 16px', borderRadius: 8 }}>
              <Clock className="w-5 h-5 text-primary-600" />
              <span style={{ fontWeight: 700, fontSize: 20, color: '#4338ca' }}>{formatTime(timeLeft)}</span>
              <button onClick={() => setIsRunning(!isRunning)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                {isRunning ? <Pause className="w-5 h-5 text-primary-600" /> : <Play className="w-5 h-5 text-primary-600" />}
              </button>
            </div>
          )}
          <button onClick={() => { clearInterval(timerRef.current); setPhase('setup'); setFlashcards([]); }}
            className="button button-secondary">
            <X className="w-4 h-4" /> Exit
          </button>
        </div>
      </div>

      <div className="w-full bg-neutral-200 rounded-full h-2">
        <div className="bg-primary-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}></div>
      </div>

      <div className="card cursor-pointer min-h-64 flex flex-col items-center justify-center relative"
        onClick={() => setIsFlipped(!isFlipped)}>
        <p className="text-sm font-medium text-neutral-500 mb-4">{isFlipped ? 'Answer' : 'Question'} — Click to flip</p>
        <p className="text-2xl font-display font-bold text-neutral-900 text-center px-8">
          {isFlipped ? currentCard.answer : currentCard.question}
        </p>
        <span className={`absolute top-4 right-4 badge capitalize ${currentCard.difficulty === 'easy' ? 'badge-success' : currentCard.difficulty === 'medium' ? 'badge-warning' : 'badge-danger'}`}>
          {currentCard.difficulty}
        </span>
      </div>

      <div className="flex gap-3">
        <button onClick={prevCard} disabled={currentIndex === 0}
          className="button button-secondary flex-1 disabled:opacity-50">Previous</button>
        <button onClick={nextCard} className="button button-primary flex-1">
          {currentIndex === flashcards.length - 1 ? 'Finish' : 'Next'}
        </button>
      </div>

      {technique === 'pomodoro' && (
        <p className="text-center text-sm text-neutral-500">
          🍅 Pomodoro #{pomodoroCount + 1} — {isRunning ? 'Studying...' : 'Paused'}
        </p>
      )}
    </div>
  );
}