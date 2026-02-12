import { CheckCircle2, CircleAlert, X } from 'lucide-react';
import { clsx } from 'clsx';
import type { Toast } from '@/types';

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

export const ToastItem = ({ toast, onDismiss }: ToastItemProps) => {
  const isErrorToast = toast.variant === 'error';

  return (
    <article
      className={clsx('toast', {
        'toast--success': toast.variant === 'success',
        'toast--error': toast.variant === 'error',
      })}
      role={isErrorToast ? 'alert' : 'status'}
      aria-live={isErrorToast ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      <div className="toast__icon" aria-hidden="true">
        {toast.variant === 'success' ? <CheckCircle2 size={16} /> : <CircleAlert size={16} />}
      </div>

      <div className="toast__content">
        <strong>{toast.title}</strong>
        {toast.message && <p>{toast.message}</p>}
      </div>

      <button
        type="button"
        className="toast__close"
        onClick={() => onDismiss(toast.id)}
        aria-label="Fechar notificação"
        title="Fechar"
      >
        <X size={14} />
      </button>
    </article>
  );
};
