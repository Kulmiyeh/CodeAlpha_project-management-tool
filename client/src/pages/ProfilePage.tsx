import { FormEvent, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Avatar } from '../components/Avatar';
import * as authService from '../services/authService';
import toast from 'react-hot-toast';

export function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const { user: updated } = await authService.updateProfile({ name, avatar });
      setUser(updated);
      toast.success('Profile updated');
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Failed to update');
    } finally {
      setSaving(false);
    }
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-slate-500">Manage your personal information.</p>
      </div>
      <div className="card p-6">
        <div className="mb-6 flex items-center gap-4">
          <Avatar name={user.name} email={user.email} src={avatar || user.avatar} size="lg" />
          <div>
            <div className="text-lg font-semibold">{user.name}</div>
            <div className="text-sm text-slate-500">{user.email}</div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Avatar URL</label>
            <input
              className="input"
              placeholder="https://…"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
            />
          </div>
          <button className="btn-primary mt-2 self-start" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
