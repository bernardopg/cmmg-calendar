import type { Toast } from '@/types';
import { ToastItem } from './ToastItem';

interface ToastViewportProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export const ToastViewport = ({ toasts, onDismiss }: ToastViewportProps) => {
  return (
    <aside
      className="toast-viewport"
      role="region"
      aria-live="polite"
      aria-relevant="additions text"
      aria-label="Notificações"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </aside>
  );
};
