import { FormEvent, useState } from 'react';
import type { Comment } from '../types';
import { Avatar } from './Avatar';
import { useAuthStore } from '../store/authStore';
import { Send, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  comments: Comment[];
  onSubmit: (body: string) => Promise<void> | void;
  onDelete?: (commentId: string) => Promise<void> | void;
  canDeleteOthers?: boolean;
}

export function CommentBox({ comments, onSubmit, onDelete, canDeleteOthers }: Props) {
  const me = useAuthStore((s) => s.user);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit(text.trim());
      setText('');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex max-h-80 flex-col gap-3 overflow-y-auto pr-1">
        {comments.length === 0 && (
          <div className="rounded-md border border-dashed border-slate-200 p-4 text-center text-sm text-slate-400 dark:border-slate-800">
            No comments yet. Start the discussion.
          </div>
        )}
        {comments.map((c) => {
          const canDelete = onDelete && (canDeleteOthers || c.author._id === me?.id);
          return (
            <div key={c._id} className="flex gap-3">
              <Avatar name={c.author.name} email={c.author.email} src={c.author.avatar} size="sm" />
              <div className="min-w-0 flex-1 rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold">{c.author.name}</span>
                  <span className="text-slate-500">
                    {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                  </span>
                  {canDelete && (
                    <button
                      className="ml-auto text-slate-400 hover:text-red-600"
                      onClick={() => onDelete!(c._id)}
                      aria-label="Delete comment"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
                <div className="mt-1 whitespace-pre-wrap text-sm">{c.body}</div>
              </div>
            </div>
          );
        })}
      </div>
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <textarea
          className="input min-h-[2.5rem] flex-1 resize-none"
          rows={2}
          value={text}
          placeholder="Write a comment…"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              handleSubmit(e as any);
            }
          }}
        />
        <button type="submit" className="btn-primary" disabled={submitting || !text.trim()}>
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
