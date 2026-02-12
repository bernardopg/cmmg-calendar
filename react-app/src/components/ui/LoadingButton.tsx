import { clsx } from 'clsx';
import type { LoadingButtonProps } from '@/types';

export const LoadingButton = ({
  loading = false,
  variant = 'primary',
  size = 'md',
  children,
  className,
  disabled,
  ...props
}: LoadingButtonProps) => {
  return (
    <button
      className={clsx('button', `button--${variant}`, `button--${size}`, className)}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading && <span className="spinner" role="status" aria-label="Carregando" />}
      <span>{children}</span>
    </button>
  );
};
