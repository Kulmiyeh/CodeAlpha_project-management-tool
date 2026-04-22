import { avatarColor, initials } from '../utils/avatar';
import { cn } from '../utils/cn';

interface Props {
  name: string;
  email?: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
};

export function Avatar({ name, email, src, size = 'sm', className }: Props) {
  const seed = email || name || 'anon';
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn('inline-block rounded-full object-cover ring-2 ring-white dark:ring-slate-900', sizes[size], className)}
      />
    );
  }
  return (
    <span
      title={name}
      className={cn(
        'inline-flex items-center justify-center rounded-full font-semibold text-white ring-2 ring-white dark:ring-slate-900',
        avatarColor(seed),
        sizes[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
