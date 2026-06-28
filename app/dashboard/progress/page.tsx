'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, Award, Clock, Target } from 'lucide-react';

export default function ProgressPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/analytics', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          router.push('/login');
          return;
        }

        const data = await res.json();
        setAnalytics(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [router]);

  if (loading) {
    return (
      <div className="section flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-display font-bold text-neutral-900">
          Your Progress
        </h1>
        <p className="text-neutral-600 mt-2">
          Track your academic growth and achievements
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            icon: Clock,
            label: 'Total Study Time',
            value: analytics?.totalHours || 0,
            unit: 'hours',
            color: 'text-blue-500',
          },
          {
            icon: Target,
            label: 'Quizzes Taken',
            value: analytics?.quizzesTaken || 0,
            unit: 'quizzes',
            color: 'text-purple-500',
          },
          {
            icon: Award,
            label: 'Average Score',
            value: analytics?.avgScore || 0,
            unit: '%',
            color: 'text-green-500',
          },
          {
            icon: TrendingUp,
            label: 'Streak',
            value: analytics?.streak || 0,
            unit: 'days',
            color: 'text-orange-500',
          },
        ].map((metric, idx) => (
          <div key={idx} className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-neutral-600 text-sm font-medium">
                  {metric.label}
                </p>
                <p className="text-3xl font-bold text-neutral-900 mt-2">
                  {metric.value}
                  <span className="text-lg font-normal text-neutral-500 ml-2">
                    {metric.unit}
                  </span>
                </p>
              </div>
              <metric.icon className={`w-8 h-8 ${metric.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Course Performance */}
      <div className="card">
        <h2 className="text-2xl font-display font-bold mb-6">
          Performance by Course
        </h2>

        {analytics?.coursePerformance &&
        analytics.coursePerformance.length > 0 ? (
          <div className="space-y-4">
            {analytics.coursePerformance.map((course: any, idx: number) => (
              <div key={idx} className="p-4 bg-neutral-50 rounded-lg">
                <div className="flex items-end justify-between mb-2">
                  <h3 className="font-medium text-neutral-900">
                    {course.name}
                  </h3>
                  <span className="text-sm font-bold text-primary-600">
                    {course.score}%
                  </span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${course.score}%` }}
                  ></div>
                </div>
                <p className="text-xs text-neutral-600 mt-2">
                  {course.documents} documents • {course.flashcards} flashcards
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-neutral-600">No course data yet</p>
        )}
      </div>

      {/* Weekly Activity */}
      <div className="card">
        <h2 className="text-2xl font-display font-bold mb-6">Weekly Activity</h2>

        {analytics?.weeklyActivity && analytics.weeklyActivity.length > 0 ? (
          <div className="space-y-3">
            {analytics.weeklyActivity.map((day: any, idx: number) => (
              <div key={idx} className="flex items-center gap-4">
                <span className="w-20 text-sm font-medium text-neutral-600">
                  {day.day}
                </span>
                <div className="flex-1">
                  <div className="flex gap-1">
                    {Array.from({ length: Math.ceil(day.hours / 0.5) }).map(
                      (_, i) => (
                        <div
                          key={i}
                          className="w-3 h-6 rounded-sm bg-primary-500 opacity-100"
                        ></div>
                      )
                    )}
                  </div>
                </div>
                <span className="text-sm font-medium text-neutral-900">
                  {day.hours}h
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-neutral-600">Start studying to see activity</p>
        )}
      </div>
    </div>
  );
}