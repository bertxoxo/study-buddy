'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Plus, Trash2, Calendar, User, Clock } from 'lucide-react';

interface Course {
  id: number;
  name: string;
  instructor: string;
  schedule: string;
  exam_date: string;
  color: string;
  class_days: string;
  class_time: string;
  rest_days: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', instructor: '', exam_date: '', color: '#6366f1',
    class_days: [] as string[], class_time_start: '08:00', class_time_end: '09:00',
    rest_days: ['Sunday'] as string[],
  });

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/courses', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { router.push('/login'); return; }
      const data = await res.json();
      setCourses(data.courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day: string, field: 'class_days' | 'rest_days') => {
    const current = formData[field] as string[];
    const updated = current.includes(day) ? current.filter(d => d !== day) : [...current, day];
    setFormData({ ...formData, [field]: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: formData.name,
          instructor: formData.instructor,
          exam_date: formData.exam_date,
          color: formData.color,
          schedule: formData.class_days.join(', ') + ' ' + formData.class_time_start + '-' + formData.class_time_end,
          class_days: formData.class_days.join(','),
          class_time: formData.class_time_start + '-' + formData.class_time_end,
          rest_days: formData.rest_days.join(','),
        }),
      });
      if (!res.ok) throw new Error('Failed to create course');
      const data = await res.json();
      setCourses([...courses, data.course]);
      setFormData({ name: '', instructor: '', exam_date: '', color: '#6366f1', class_days: [], class_time_start: '08:00', class_time_end: '09:00', rest_days: ['Sunday'] });
      setShowForm(false);
    } catch (error) {
      alert('Error creating course');
    }
  };

  const deleteCourse = async (id: number) => {
    if (!confirm('Delete this course?')) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`/api/courses/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      setCourses(courses.filter(c => c.id !== id));
    } catch { alert('Error deleting course'); }
  };

  if (loading) return (
    <div className="section flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-neutral-600">Loading courses...</p>
      </div>
    </div>
  );

  return (
    <div className="section space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold text-neutral-900">My Courses</h1>
          <p className="text-neutral-600 mt-2">Manage {courses.length} course{courses.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="button button-primary">
          <Plus className="w-5 h-5" /> Add Course
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h2 className="text-2xl font-display font-bold mb-6">Create New Course</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="label">Course Name *</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Calculus 101" className="input" required />
              </div>
              <div className="form-group">
                <label className="label">Instructor</label>
                <input type="text" value={formData.instructor} onChange={e => setFormData({...formData, instructor: e.target.value})}
                  placeholder="e.g., Dr. Smith" className="input" />
              </div>
              <div className="form-group">
                <label className="label">Exam Date</label>
                <input type="date" value={formData.exam_date} onChange={e => setFormData({...formData, exam_date: e.target.value})}
                  className="input" />
              </div>
            </div>

            <div className="form-group">
              <label className="label">Class Days</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {DAYS.map(day => (
                  <button key={day} type="button" onClick={() => toggleDay(day, 'class_days')}
                    style={{ padding: '6px 12px', borderRadius: 6, border: '2px solid', cursor: 'pointer',
                      borderColor: formData.class_days.includes(day) ? '#6366f1' : '#e4e4e7',
                      background: formData.class_days.includes(day) ? '#6366f1' : 'white',
                      color: formData.class_days.includes(day) ? 'white' : '#3f3f46' }}>
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="label">Class Start Time</label>
                <input type="time" value={formData.class_time_start}
                  onChange={e => setFormData({...formData, class_time_start: e.target.value})} className="input" />
              </div>
              <div className="form-group">
                <label className="label">Class End Time</label>
                <input type="time" value={formData.class_time_end}
                  onChange={e => setFormData({...formData, class_time_end: e.target.value})} className="input" />
              </div>
            </div>

            <div className="form-group">
              <label className="label">Rest Days (no study)</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {DAYS.map(day => (
                  <button key={day} type="button" onClick={() => toggleDay(day, 'rest_days')}
                    style={{ padding: '6px 12px', borderRadius: 6, border: '2px solid', cursor: 'pointer',
                      borderColor: formData.rest_days.includes(day) ? '#ef4444' : '#e4e4e7',
                      background: formData.rest_days.includes(day) ? '#ef4444' : 'white',
                      color: formData.rest_days.includes(day) ? 'white' : '#3f3f46' }}>
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
              <p className="text-xs text-neutral-500 mt-1">Selected rest days will be excluded from study plan</p>
            </div>

            <div className="form-group">
              <label className="label">Color</label>
              <div className="flex gap-3 mt-2">
                {COLORS.map(color => (
                  <button key={color} type="button" onClick={() => setFormData({...formData, color})}
                    style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: color, border: formData.color === color ? '3px solid #18181b' : '2px solid transparent', cursor: 'pointer' }} />
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button type="submit" className="button button-primary">Create Course</button>
              <button type="button" onClick={() => setShowForm(false)} className="button button-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <div key={course.id} className="card-interactive group relative" style={{ borderLeft: `4px solid ${course.color}` }}>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => deleteCourse(course.id)}
                  className="p-2 bg-danger-100 text-danger-600 rounded-lg hover:bg-danger-200">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: course.color + '20' }}>
                  <BookOpen className="w-5 h-5" style={{ color: course.color }} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-neutral-900">{course.name}</h3>
                  {course.instructor && <p className="text-sm text-neutral-500">{course.instructor}</p>}
                </div>
              </div>
              {course.class_days && (
                <div className="flex items-center gap-2 text-sm text-neutral-600 mb-2">
                  <Clock className="w-4 h-4" />
                  {course.class_days} {course.class_time && `• ${course.class_time}`}
                </div>
              )}
              {course.rest_days && (
                <div className="flex items-center gap-2 text-sm text-neutral-500 mb-2">
                  🏖️ Rest: {course.rest_days}
                </div>
              )}
              {course.exam_date && (
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <Calendar className="w-4 h-4" />
                  Exam: {new Date(course.exam_date).toLocaleDateString()}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <BookOpen className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">No courses yet</h3>
          <p className="text-neutral-600 mb-6">Create your first course to get started</p>
          <button onClick={() => setShowForm(true)} className="button button-primary mx-auto">
            <Plus className="w-5 h-5" /> Create Course
          </button>
        </div>
      )}
    </div>
  );
}