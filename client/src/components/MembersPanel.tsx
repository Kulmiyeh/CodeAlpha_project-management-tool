import { FormEvent, useEffect, useState } from 'react';
import type { Invite, Project, Role } from '../types';
import * as projectService from '../services/projectService';
import * as inviteService from '../services/inviteService';
import { Avatar } from './Avatar';
import { Crown, Shield, UserMinus, Mail, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  project: Project;
  role: Role;
  onProjectChange?: (p: Project) => void;
}

export function MembersPanel({ project, role, onProjectChange }: Props) {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [email, setEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');
  const [loadingInvites, setLoadingInvites] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const canManage = role === 'owner' || role === 'admin';

  useEffect(() => {
    if (!canManage) return;
    setLoadingInvites(true);
    inviteService
      .listProjectInvites(project._id)
      .then(({ invites }) => setInvites(invites))
      .finally(() => setLoadingInvites(false));
  }, [project._id, canManage]);

  async function handleInvite(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      const { invite } = await inviteService.createInvite(project._id, {
        email: email.trim(),
        role: inviteRole,
      });
      setInvites((prev) => [invite, ...prev]);
      setEmail('');
      const acceptUrl = `${window.location.origin}/invites/${invite.token}`;
      await navigator.clipboard?.writeText(acceptUrl).catch(() => null);
      toast.success('Invite created — link copied to clipboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Failed to create invite');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancelInvite(inviteId: string) {
    try {
      await inviteService.cancelInvite(project._id, inviteId);
      setInvites((prev) => prev.filter((i) => i._id !== inviteId));
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Failed');
    }
  }

  async function handleRoleChange(userId: string, newRole: 'admin' | 'member') {
    try {
      const { project: updated } = await projectService.updateMemberRole(project._id, userId, newRole);
      onProjectChange?.(updated);
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Failed to change role');
    }
  }

  async function handleRemove(userId: string) {
    if (!confirm('Remove this member?')) return;
    try {
      const { project: updated } = await projectService.removeMember(project._id, userId);
      onProjectChange?.(updated);
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Failed to remove');
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="mb-2 text-sm font-semibold">Members</h3>
        <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
          {project.members.map((m) => (
            <li key={m.user._id} className="flex items-center gap-3 p-3">
              <Avatar name={m.user.name} email={m.user.email} src={m.user.avatar} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{m.user.name}</div>
                <div className="truncate text-xs text-slate-500">{m.user.email}</div>
              </div>
              <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                {m.role === 'owner' && <Crown size={12} className="text-amber-500" />}
                {m.role === 'admin' && <Shield size={12} className="text-brand-500" />}
                {m.role}
              </span>
              {role === 'owner' && m.role !== 'owner' && (
                <select
                  className="input !w-auto !py-1 !text-xs"
                  value={m.role}
                  onChange={(e) => handleRoleChange(m.user._id, e.target.value as 'admin' | 'member')}
                >
                  <option value="admin">admin</option>
                  <option value="member">member</option>
                </select>
              )}
              {canManage && m.role !== 'owner' && (
                <button
                  className="btn-ghost !p-1 text-slate-400 hover:text-red-600"
                  onClick={() => handleRemove(m.user._id)}
                  aria-label="Remove"
                >
                  <UserMinus size={14} />
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      {canManage && (
        <div>
          <h3 className="mb-2 text-sm font-semibold">Invite a teammate</h3>
          <form onSubmit={handleInvite} className="flex flex-wrap items-center gap-2">
            <input
              type="email"
              required
              className="input flex-1"
              placeholder="teammate@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <select
              className="input !w-auto"
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member')}
            >
              <option value="member">member</option>
              <option value="admin">admin</option>
            </select>
            <button className="btn-primary" disabled={submitting}>
              <Mail size={14} /> Invite
            </button>
          </form>

          <div className="mt-4">
            <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Pending invites</h4>
            {loadingInvites && <div className="text-xs text-slate-400">Loading…</div>}
            {!loadingInvites && invites.length === 0 && (
              <div className="text-xs text-slate-400">No invites.</div>
            )}
            <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
              {invites.map((i) => (
                <li key={i._id} className="flex items-center gap-3 p-3 text-sm">
                  <Mail size={14} className="text-slate-400" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{i.email}</div>
                    <div className="text-xs text-slate-500">
                      {i.role} • {i.status}
                    </div>
                  </div>
                  {i.status === 'pending' && (
                    <>
                      <button
                        className="btn-ghost !py-1 !text-xs"
                        onClick={() => {
                          const url = `${window.location.origin}/invites/${i.token}`;
                          navigator.clipboard.writeText(url).then(() => toast.success('Link copied'));
                        }}
                      >
                        Copy link
                      </button>
                      <button
                        className="btn-ghost !p-1 text-slate-400 hover:text-red-600"
                        onClick={() => handleCancelInvite(i._id)}
                        aria-label="Cancel invite"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
