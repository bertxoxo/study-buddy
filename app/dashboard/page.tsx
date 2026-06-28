'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  TrendingUp,
  Calendar,
  BookOpen,
  Flame,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          router.push('/login');
          return;
        }

        const data = await res.json();
        setDashboardData(data);
      } catch (error) {
        console.error('Error fetching dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [router]);

  if (loading) {
    return (
      <div className="section flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-4xl font-display font-bold text-neutral-900 mb-2">
          Welcome back, {dashboardData?.user?.name}! ??
        </h1>
        <p className="text-neutral-600">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            icon: Flame,
            label: 'Study Streak',
            value: dashboardData?.stats?.streak || 0,
            color: 'text-orange-500',
            unit: 'days',
          },
          {
            icon: CheckCircle,
            label: 'Completed Today',
            value: dashboardData?.stats?.completedToday || 0,
            color: 'text-green-500',
            unit: 'tasks',
          },
          {
            icon: Clock,
            label: 'Study Hours',
            value: dashboardData?.stats?.weeklyHours || 0,
            color: 'text-blue-500',
            unit: 'hrs',
          },
          {
            icon: TrendingUp,
            label: 'Avg Score',
            value: dashboardData?.stats?.avgScore || 0,
            color: 'text-purple-500',
            unit: '%',
          },
        ].map((stat, idx) => (
          <div key={idx} className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-neutral-600 text-sm font-medium">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold text-neutral-900 mt-2">
                  {stat.value}
                  <span className="text-lg font-normal text-neutral-500 ml-2">
                    {stat.unit}
                  </span>
                </p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Deadlines */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold">
                Upcoming Deadlines
              </h2>
              <Link
                href="/dashboard/courses"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {dashboardData?.upcomingDeadlines?.length > 0 ? (
                dashboardData.upcomingDeadlines.slice(0, 5).map(
                  (deadline: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-neutral-900">
                          {deadline.title}
                        </p>
                        <p className="text-sm text-neutral-600">
                          {deadline.course}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-neutral-900">
                          {new Date(deadline.dueDate).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {Math.ceil(
                            (new Date(deadline.dueDate).getTime() -
                              new Date().getTime()) /
                              (1000 * 60 * 60 * 24)
                          )}{' '}
                          days
                        </p>
                      </div>
                    </div>
                  )
                )
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No upcoming deadlines</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Today's Tasks */}
        <div>
          <div className="card">
            <h2 className="text-2xl font-display font-bold mb-6">
              Today's Tasks
            </h2>

            {dashboardData?.todaysTasks?.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.todaysTasks.map((task: any, idx: number) => (
                  <label
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-neutral-50 cursor-pointer transition-colors"
                  >
                    <input type="checkbox" className="mt-1" />
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900 text-sm">
                        {task.title}
                      </p>
                      <p className="text-xs text-neutral-600">{task.course}</p>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-500">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">All caught up!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Courses Overview */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold">Your Courses</h2>
          <Link
            href="/dashboard/courses"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
          >
            Manage
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {dashboardData?.courses?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dashboardData.courses.map((course: any) => (
              <Link
                key={course.id}
                href={`/dashboard/courses/${course.id}`}
                className="p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md cursor-pointer"
                style={{
                  borderColor: course.color,
                  backgroundColor: `${course.color}10`,
                }}
              >
                <h3 className="font-semibold text-neutral-900 mb-2">
                  {course.name}
                </h3>
                <p className="text-xs text-neutral-600 mb-3">
                  {course.instructor}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-600">
                    {course.documents} files
                  </span>
                  {course.examDate && (
                    <span className="text-primary-600 font-medium">
                      Exam:{' '}
                      {new Date(course.examDate).toLocaleDateString(
                        undefined,
                        { month: 'short', day: 'numeric' }
                      )}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-neutral-500">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="mb-4">No courses yet</p>
            <Link
              href="/dashboard/courses"
              className="button button-primary button-sm"
            >
              Create Course
            </Link>
          </div>
        )}
      </div>

      {/* Risk Assessment */}
      {dashboardData?.riskWarning && (
        <div className="bg-danger-50 border border-danger-200 rounded-lg p-6 flex gap-4">
          <AlertCircle className="w-6 h-6 text-danger-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-danger-900 mb-2">
              {dashboardData.riskWarning.level} Risk Alert
            </h3>
            <p className="text-danger-700 text-sm">
              {dashboardData.riskWarning.message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}