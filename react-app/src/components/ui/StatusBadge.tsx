import { Activity } from 'lucide-react';
import { clsx } from 'clsx';
import type { StatusBadgeProps } from '@/types';

export const StatusBadge = ({ status, children }: StatusBadgeProps) => {
  return (
    <div
      className={clsx('status-badge', {
        'status-badge--up': status === 'up',
        'status-badge--down': status === 'down',
        'status-badge--checking': status === 'checking',
      })}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <Activity size={14} aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
};
