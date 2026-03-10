import { useState, useCallback } from "react";
import type {
  UseScheduleAnalysisReturn,
  AnalysisResult,
  ApiResponse,
  ScheduleData,
} from "@/types";

export const useScheduleAnalysis = (): UseScheduleAnalysisReturn => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeSchedule = useCallback(async (file: File) => {
    if (!file) {
      setError("Por favor, selecione um arquivo JSON.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse<AnalysisResult> = await response.json();

      if (data.success && data.data) {
        setResult(data.data);
      } else {
        setError(data.error || "Erro desconhecido durante a análise");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro ao conectar com o servidor. Certifique-se de que a API está rodando.";
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

  const extractAndAnalyze = useCallback(async (totvsCookie?: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/extract-analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(totvsCookie ? { totvs_cookie: totvsCookie } : {}),
      });

      const payload: ApiResponse<{
        analysis: AnalysisResult;
        schedule_data: ScheduleData;
      }> = await response.json();

      if (!response.ok || !payload.success || !payload.data) {
        setError(payload.error || `HTTP error! status: ${response.status}`);
        return null;
      }

      setResult(payload.data.analysis);
      return payload.data.schedule_data;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro ao conectar com o servidor. Certifique-se de que a API está rodando.";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const loginAndExtract = useCallback(async (user: string, password: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/totvs-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user, password }),
      });

      const payload: ApiResponse<{
        analysis: AnalysisResult;
        schedule_data: ScheduleData;
      }> = await response.json();

      if (!response.ok || !payload.success || !payload.data) {
        setError(payload.error || `HTTP error! status: ${response.status}`);
        return null;
      }

      setResult(payload.data.analysis);
      return payload.data.schedule_data;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro ao conectar com o servidor. Certifique-se de que a API está rodando.";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    result,
    error,
    analyzeSchedule,
    extractAndAnalyze,
    loginAndExtract,
    clearResults,
  };
};
