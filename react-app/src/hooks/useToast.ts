import { useCallback, useMemo, useState } from "react";
import type { Toast } from "@/types";

const AUTO_DISMISS_MS = 4000;

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
      const nextToast: Toast = {
        ...toast,
        id,
      };

      setToasts((current) => [...current, nextToast]);

      window.setTimeout(() => {
        removeToast(id);
      }, AUTO_DISMISS_MS);
    },
    [removeToast],
  );

  const showSuccess = useCallback(
    (title: string, message?: string) => {
      showToast({ title, message, variant: "success" });
    },
    [showToast],
  );

  const showError = useCallback(
    (title: string, message?: string) => {
      showToast({ title, message, variant: "error" });
    },
    [showToast],
  );

  return useMemo(
    () => ({
      toasts,
      showSuccess,
      showError,
      removeToast,
    }),
    [toasts, showSuccess, showError, removeToast],
  );
};
