'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Plus, Edit2, Trash2, Calendar, User } from 'lucide-react';

interface Course {
  id: number;
  name: string;
  instructor: string;
  schedule: string;
  exam_date: string;
  color: string;
}

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    instructor: '',
    schedule: '',
    exam_date: '',
    color: '#6366f1',
  });

  const colors = [
    '#6366f1', // primary
    '#f59e0b', // accent
    '#10b981', // success
    '#ef4444', // danger
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#f97316', // orange
  ];

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/courses', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        router.push('/login');
        return;
      }

      const data = await res.json();
      setCourses(data.courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to create course');

      const data = await res.json();
      setCourses([...courses, data.course]);
      setFormData({
        name: '',
        instructor: '',
        schedule: '',
        exam_date: '',
        color: '#6366f1',
      });
      setShowForm(false);
    } catch (error) {
      alert('Error creating course');
    }
  };

  const deleteCourse = async (id: number) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/courses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to delete course');

      setCourses(courses.filter((c) => c.id !== id));
    } catch (error) {
      alert('Error deleting course');
    }
  };

  if (loading) {
    return (
      <div className="section flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold text-neutral-900">
            My Courses
          </h1>
          <p className="text-neutral-600 mt-2">
            Manage {courses.length} course{courses.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="button button-primary"
        >
          <Plus className="w-5 h-5" />
          Add Course
        </button>
      </div>

      {/* Create Course Form */}
      {showForm && (
        <div className="card">
          <h2 className="text-2xl font-display font-bold mb-6">
            Create New Course
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="label">Course Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Calculus 101"
                  className="input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="label">Instructor</label>
                <input
                  type="text"
                  value={formData.instructor}
                  onChange={(e) =>
                    setFormData({ ...formData, instructor: e.target.value })
                  }
                  placeholder="e.g., Dr. Smith"
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="label">Schedule</label>
                <input
                  type="text"
                  value={formData.schedule}
                  onChange={(e) =>
                    setFormData({ ...formData, schedule: e.target.value })
                  }
                  placeholder="e.g., MWF 10am-11am"
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="label">Exam Date</label>
                <input
                  type="date"
                  value={formData.exam_date}
                  onChange={(e) =>
                    setFormData({ ...formData, exam_date: e.target.value })
                  }
                  className="input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="label">Color</label>
              <div className="grid grid-cols-4 gap-3">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-12 h-12 rounded-lg transition-all ${
                      formData.color === color
                        ? 'ring-2 ring-offset-2 ring-neutral-900'
                        : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: color }}
                  ></button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button type="submit" className="button button-primary">
                Create Course
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="button button-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Courses Grid */}
      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/dashboard/courses/${course.id}`}
              className="card-interactive group relative"
              style={{ borderLeft: `4px solid ${course.color}` }}
            >
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    // Edit functionality
                  }}
                  className="p-2 bg-primary-100 text-primary-600 rounded-lg hover:bg-primary-200"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    deleteCourse(course.id);
                  }}
                  className="p-2 bg-danger-100 text-danger-600 rounded-lg hover:bg-danger-200"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: course.color + '20' }}
                >
                  <BookOpen
                    className="w-5 h-5"
                    style={{ color: course.color }}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-lg text-neutral-900">
                    {course.name}
                  </h3>
                </div>
              </div>

              {course.instructor && (
                <div className="flex items-center gap-2 text-sm text-neutral-600 mb-2">
                  <User className="w-4 h-4" />
                  {course.instructor}
                </div>
              )}

              {course.schedule && (
                <div className="flex items-center gap-2 text-sm text-neutral-600 mb-2">
                  <BookOpen className="w-4 h-4" />
                  {course.schedule}
                </div>
              )}

              {course.exam_date && (
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <Calendar className="w-4 h-4" />
                  Exam: {new Date(course.exam_date).toLocaleDateString()}
                </div>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <BookOpen className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">
            No courses yet
          </h3>
          <p className="text-neutral-600 mb-6">
            Create your first course to get started
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="button button-primary mx-auto"
          >
            <Plus className="w-5 h-5" />
            Create Course
          </button>
        </div>
      )}
    </div>
  );
}