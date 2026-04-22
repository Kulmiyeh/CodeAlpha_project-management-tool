import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as inviteService from '../services/inviteService';
import type { Invite } from '../types';
import { Skeleton } from '../components/Skeleton';
import toast from 'react-hot-toast';
import { Check, X } from 'lucide-react';

export function InvitesPage() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useParams<{ token?: string }>();
  const nav = useNavigate();

  useEffect(() => {
    async function init() {
      if (token) {
        try {
          const { project } = await inviteService.acceptInvite(token);
          toast.success(`Joined ${project.name}`);
          nav(`/projects/${project._id}/board`, { replace: true });
          return;
        } catch (err: any) {
          toast.error(err?.response?.data?.error ?? 'Invalid invite');
          nav('/invites', { replace: true });
          return;
        }
      }
      const { invites } = await inviteService.myPendingInvites();
      setInvites(invites);
      setLoading(false);
    }
    void init();
  }, [token, nav]);

  async function handleAccept(inv: Invite) {
    try {
      const { project } = await inviteService.acceptInvite(inv.token);
      toast.success(`Joined ${project.name}`);
      nav(`/projects/${project._id}/board`);
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Failed');
    }
  }
  async function handleReject(inv: Invite) {
    try {
      await inviteService.rejectInvite(inv.token);
      setInvites((prev) => prev.filter((i) => i._id !== inv._id));
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Failed');
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Invites</h1>
        <p className="text-sm text-slate-500">Projects you've been invited to join.</p>
      </div>

      {loading && <Skeleton className="h-24 w-full" />}
      {!loading && invites.length === 0 && (
        <div className="card p-8 text-center text-sm text-slate-500">No pending invites.</div>
      )}
      <ul className="space-y-2">
        {invites.map((inv) => {
          const projectName = typeof inv.project === 'string' ? 'A project' : inv.project.name;
          const projectDesc = typeof inv.project === 'string' ? '' : inv.project.description || '';
          return (
            <li key={inv._id} className="card flex items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <div className="font-medium">{projectName}</div>
                {projectDesc && <div className="text-sm text-slate-500">{projectDesc}</div>}
                <div className="mt-1 text-xs text-slate-400">Role: {inv.role}</div>
              </div>
              <button className="btn-primary" onClick={() => handleAccept(inv)}>
                <Check size={14} /> Accept
              </button>
              <button className="btn-secondary" onClick={() => handleReject(inv)}>
                <X size={14} /> Reject
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
