'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Save, LogOut } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    school: '',
    program: '',
    semester: '',
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          router.push('/login');
          return;
        }

        const data = await res.json();
        setUser(data.user);
        setFormData({
          name: data.user.name || '',
          email: data.user.email || '',
          school: data.user.school || '',
          program: data.user.program || '',
          semester: data.user.semester || '',
        });
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to update profile');

      alert('Profile updated successfully!');
    } catch (error) {
      alert('Error updating profile');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="section flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-display font-bold text-neutral-900">
          Settings
        </h1>
        <p className="text-neutral-600 mt-2">Manage your account and preferences</p>
      </div>

      <div className="max-w-2xl">
        {/* Profile Section */}
        <div className="card">
          <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Profile Information
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="label">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="label">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="input bg-neutral-100 text-neutral-500 cursor-not-allowed"
                />
              </div>

              <div className="form-group">
                <label className="label">School</label>
                <input
                  type="text"
                  value={formData.school}
                  onChange={(e) =>
                    setFormData({ ...formData, school: e.target.value })
                  }
                  placeholder="University name"
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="label">Program/Major</label>
                <input
                  type="text"
                  value={formData.program}
                  onChange={(e) =>
                    setFormData({ ...formData, program: e.target.value })
                  }
                  placeholder="e.g., Computer Science"
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="label">Semester</label>
                <select
                  value={formData.semester}
                  onChange={(e) =>
                    setFormData({ ...formData, semester: e.target.value })
                  }
                  className="input"
                >
                  <option value="">Select semester...</option>
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                  <option value="3">Year 3</option>
                  <option value="4">Year 4</option>
                  <option value="5">Year 5</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button type="submit" className="button button-primary">
                <Save className="w-5 h-5" />
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="card border-danger-200 bg-danger-50 mt-8">
          <h2 className="text-2xl font-display font-bold mb-6 text-danger-900">
            Danger Zone
          </h2>

          <button
            onClick={handleLogout}
            className="button bg-danger-600 text-white hover:bg-danger-700"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}