import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const login = useAuthStore((s) => s.login);
  const nav = useNavigate();
  const loc = useLocation() as { state?: { from?: string } };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      nav(loc.state?.from || '/', { replace: true });
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <h1 className="mb-1 text-2xl font-semibold">Welcome back</h1>
      <p className="mb-6 text-sm text-slate-500">Log in to your workspace</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className="btn-primary mt-2" disabled={submitting}>
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        No account?{' '}
        <Link to="/register" className="text-brand-600 hover:underline">
          Create one
        </Link>
      </p>
    </>
  );
}
