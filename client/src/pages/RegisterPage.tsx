import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const register = useAuthStore((s) => s.register);
  const nav = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await register(name, email, password);
      nav('/', { replace: true });
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <h1 className="mb-1 text-2xl font-semibold">Create your account</h1>
      <p className="mb-6 text-sm text-slate-500">Start collaborating with your team</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Name</label>
          <input className="input" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Email</label>
          <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Password</label>
          <input
            className="input"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="mt-1 text-xs text-slate-400">At least 6 characters.</p>
        </div>
        <button className="btn-primary mt-2" disabled={submitting}>
          {submitting ? 'Creating…' : 'Create account'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="text-brand-600 hover:underline">
          Log in
        </Link>
      </p>
    </>
  );
}
