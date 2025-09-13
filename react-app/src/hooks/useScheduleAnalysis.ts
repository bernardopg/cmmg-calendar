import { useState, useCallback } from 'react';
import type { UseScheduleAnalysisReturn, AnalysisResult, ApiResponse } from '@/types';

export const useScheduleAnalysis = (): UseScheduleAnalysisReturn => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeSchedule = useCallback(async (file: File) => {
    if (!file) {
      setError('Por favor, selecione um arquivo JSON.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse<AnalysisResult> = await response.json();

      if (data.success && data.data) {
        setResult(data.data);
      } else {
        setError(data.error || 'Erro desconhecido durante a análise');
      }
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'Erro ao conectar com o servidor. Certifique-se de que a API está rodando.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResult(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    loading,
    result,
    error,
    analyzeSchedule,
    clearResults,
  };
};
