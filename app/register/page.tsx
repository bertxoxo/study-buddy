'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
export default function Register() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', school: '', password: '', confirmPassword: '' });
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.name, email: form.email, school: form.school, password: form.password }) });
      const data = await res.json();
      console.log('Register response:', data);
      if (!res.ok) { setError(data.error || 'Registration failed'); return; }
      if (!data.token) { setError('No token: ' + JSON.stringify(data)); return; }
      localStorage.setItem('token', data.token);
      console.log('Token saved:', localStorage.getItem('token'));
      router.push('/dashboard');
    } catch (err) { setError('Network error: ' + String(err)); } finally { setLoading(false); }
  };
  return (
    <div style={{ maxWidth: 400, margin: '100px auto', padding: 24 }}>
      <h1>Create Account</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}><label>Full Name</label><input style={{ display: 'block', width: '100%', padding: 8 }} value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
        <div style={{ marginBottom: 12 }}><label>Email</label><input type='email' style={{ display: 'block', width: '100%', padding: 8 }} value={form.email} onChange={e => setForm({...form, email: e.target.value})} required /></div>
        <div style={{ marginBottom: 12 }}><label>School</label><input style={{ display: 'block', width: '100%', padding: 8 }} value={form.school} onChange={e => setForm({...form, school: e.target.value})} /></div>
        <div style={{ marginBottom: 12 }}><label>Password</label><input type='password' style={{ display: 'block', width: '100%', padding: 8 }} value={form.password} onChange={e => setForm({...form, password: e.target.value})} required /></div>
        <div style={{ marginBottom: 12 }}><label>Confirm Password</label><input type='password' style={{ display: 'block', width: '100%', padding: 8 }} value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} required /></div>
        <button type='submit' disabled={loading} style={{ width: '100%', padding: 10, background: '#6366f1', color: 'white', border: 'none', cursor: 'pointer' }}>{loading ? 'Creating...' : 'Create Account'}</button>
      </form>
      <p><a href='/login'>Already have an account? Login here</a></p>
    </div>
  );
}
