'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Sparkles, Loader } from 'lucide-react';

export default function PlannerPage() {
  const router = useRouter();
  const [studyPlan, setStudyPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generateStudyPlan = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('/api/planner/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to generate plan');

      const data = await res.json();
      setStudyPlan(data.plan);
    } catch (error) {
      alert('Error generating study plan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchExistingPlan = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/planner', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.plan) {
            setStudyPlan(data.plan);
          }
        }
      } catch (error) {
        console.error('Error fetching plan:', error);
      }
    };

    fetchExistingPlan();
  }, []);

  const days = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];

  return (
    <div className="section space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold text-neutral-900">
            Study Planner
          </h1>
          <p className="text-neutral-600 mt-2">
            AI-powered personalized study schedule
          </p>
        </div>
        <button
          onClick={generateStudyPlan}
          disabled={loading}
          className="button button-primary"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Plan
            </>
          )}
        </button>
      </div>

      {/* Study Plan */}
      {studyPlan ? (
        <div className="space-y-6">
          {studyPlan.summary && (
            <div className="card bg-gradient-to-br from-primary-50 to-accent-50 border-l-4 border-primary-600">
              <h2 className="font-display font-bold mb-2">Plan Summary</h2>
              <p className="text-neutral-700">{studyPlan.summary}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {days.map((day) => (
              <div key={day} className="card">
                <h3 className="font-display font-bold capitalize mb-4 text-primary-600">
                  {day}
                </h3>

                {studyPlan[day] && studyPlan[day].length > 0 ? (
                  <div className="space-y-3">
                    {studyPlan[day].map((session: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 bg-neutral-50 rounded-lg border border-neutral-200"
                      >
                        <p className="font-medium text-neutral-900 text-sm">
                          {session.subject}
                        </p>
                        <p className="text-xs text-neutral-600 mt-1">
                          📚 {session.duration_minutes} mins
                        </p>
                        {session.topics && (
                          <p className="text-xs text-neutral-500 mt-2">
                            {session.topics}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-neutral-500 text-sm">Rest day</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card text-center py-16">
          <Calendar className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-2xl font-display font-bold text-neutral-900 mb-2">
            No Study Plan Yet
          </h3>
          <p className="text-neutral-600 mb-6">
            Let AI create a personalized study schedule based on your courses
            and deadlines
          </p>
          <button
            onClick={generateStudyPlan}
            className="button button-primary mx-auto"
          >
            <Sparkles className="w-5 h-5" />
            Generate Plan
          </button>
        </div>
      )}
    </div>
  );
}