import { useState, useCallback, useRef, useEffect } from "react";
import type {
  UseScheduleAnalysisReturn,
  AnalysisResult,
  ApiResponse,
  ScheduleData,
} from "@/types";
import { analyzeScheduleDataJson } from "@/lib/analyzeSchedule";
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

  // A análise roda no browser: não há requisição para cancelar aqui.
  const analyzeSchedule = useCallback(async (file: File) => {
    if (!file) {
      setError("Por favor, selecione um arquivo JSON.");
      return false;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      setResult(analyzeScheduleDataJson(JSON.parse(await file.text())));
      return true;
    } catch (err) {
      setError(getErrorMessage(err, "Não foi possível ler o arquivo JSON."));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResult(null);
    setError(null);
    setLoading(false);
  }, []);

  // A API PHP só faz o salto autenticado ao TOTVS; a análise é local.
  const fetchSchedule = useCallback(
    async (path: string, body: Record<string, unknown>) => {
      const signal = nextSignal();
      setLoading(true);
      setError(null);
      setResult(null);

      try {
        const response = await fetch(path, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
          signal,
        });

        const payload: ApiResponse<{ schedule_data: ScheduleData }> =
          await response.json();

        if (!response.ok || !payload.success || !payload.data) {
          setError(payload.error || `HTTP error! status: ${response.status}`);
          return null;
        }

        const schedule = payload.data.schedule_data;
        setResult(analyzeScheduleDataJson(schedule));
        return schedule;
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

  const extractAndAnalyze = useCallback(
    (totvsCookie?: string) =>
      fetchSchedule(
        "/api/extract-analyze.php",
        totvsCookie ? { totvs_cookie: totvsCookie } : {},
      ),
    [fetchSchedule],
  );

  const loginAndExtract = useCallback(
    (user: string, password: string) =>
      fetchSchedule("/api/totvs-login.php", { user, password }),
    [fetchSchedule],
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
