import { useState, useEffect } from 'react';
import type { UseApiHealthReturn, ApiStatus } from '@/types';

export const useApiHealth = (checkInterval: number = 10000): UseApiHealthReturn => {
  const [status, setStatus] = useState<ApiStatus>('checking');

  useEffect(() => {
    let active = true;

    const checkHealth = async () => {
      try {
        const response = await fetch('/api/health');
        const data = await response.json();

        if (!active) return;

        setStatus(data?.status === 'up' ? 'up' : 'down');
      } catch {
        if (!active) return;
        setStatus('down');
      }
    };

    // Check immediately
    checkHealth();

    // Set up interval for periodic checks
    const intervalId = setInterval(checkHealth, checkInterval);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, [checkInterval]);

  return {
    status,
    isOnline: status === 'up',
    isChecking: status === 'checking',
  };
};
