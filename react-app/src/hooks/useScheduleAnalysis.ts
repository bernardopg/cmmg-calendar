import { useState, useCallback, useRef, useEffect } from "react";
import type {
  UseScheduleAnalysisReturn,
  AnalysisResult,
  ApiResponse,
  ScheduleData,
} from "@/types";
import { getErrorMessage } from "@/utils/errorUtils";

const isAbortError = (err: unknown): boolean =>
  err instanceof DOMException && err.name === "AbortError";

export const useScheduleAnalysis = (): UseScheduleAnalysisReturn => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cancela a requisição anterior quando uma nova é disparada, evitando
  // race conditions (resposta antiga sobrescrevendo a mais recente).
  const abortRef = useRef<AbortController | null>(null);

  const nextSignal = useCallback((): AbortSignal => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    return controller.signal;
  }, []);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const analyzeSchedule = useCallback(
    async (file: File) => {
      if (!file) {
        setError("Por favor, selecione um arquivo JSON.");
        return false;
      }

      const signal = nextSignal();
      setLoading(true);
      setError(null);
      setResult(null);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/analyze", {
          method: "POST",
          body: formData,
          signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ApiResponse<AnalysisResult> = await response.json();

        if (data.success && data.data) {
          setResult(data.data);
          return true;
        } else {
          setError(data.error || "Erro desconhecido durante a análise");
          return false;
        }
      } catch (err) {
        if (isAbortError(err)) {
          return false;
        }
        setError(getErrorMessage(err));
        return false;
      } finally {
        if (abortRef.current?.signal === signal) {
          setLoading(false);
        }
      }
    },
    [nextSignal],
  );

  const clearResults = useCallback(() => {
    setResult(null);
    setError(null);
    setLoading(false);
  }, []);

  const extractAndAnalyze = useCallback(
    async (totvsCookie?: string) => {
      const signal = nextSignal();
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
          signal,
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
        if (isAbortError(err)) {
          return null;
        }
        setError(getErrorMessage(err));
        return null;
      } finally {
        if (abortRef.current?.signal === signal) {
          setLoading(false);
        }
      }
    },
    [nextSignal],
  );

  const loginAndExtract = useCallback(
    async (user: string, password: string) => {
      const signal = nextSignal();
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
          signal,
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
        if (isAbortError(err)) {
          return null;
        }
        setError(getErrorMessage(err));
        return null;
      } finally {
        if (abortRef.current?.signal === signal) {
          setLoading(false);
        }
      }
    },
    [nextSignal],
  );

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
