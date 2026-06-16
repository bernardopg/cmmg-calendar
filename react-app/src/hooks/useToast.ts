import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Toast } from "@/types";
import { safeRandomId } from "@/utils/idUtils";

const AUTO_DISMISS_MS = 4000;

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  // Limpa todos os timers pendentes ao desmontar.
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const timer of timers.values()) {
        clearTimeout(timer);
      }
      timers.clear();
    };
  }, []);

  const showToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = safeRandomId();
      const nextToast: Toast = {
        ...toast,
        id,
      };

      setToasts((current) => [...current, nextToast]);

      const timer = setTimeout(() => {
        timersRef.current.delete(id);
        removeToast(id);
      }, AUTO_DISMISS_MS);
      timersRef.current.set(id, timer);
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
