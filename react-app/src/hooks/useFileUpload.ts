import { useState, useCallback } from "react";
import type { UseFileUploadReturn, ScheduleData } from "@/types";

const isJsonFile = (candidate: File): boolean => {
  return (
    candidate.type === "application/json" || candidate.name.endsWith(".json")
  );
};

/**
 * Valida que o JSON tem o shape mínimo esperado de `ScheduleData`
 * (`data.SHorarioAluno` como array), evitando aceitar JSON arbitrário.
 */
const isScheduleData = (value: unknown): value is ScheduleData => {
  if (!value || typeof value !== "object") {
    return false;
  }
  const data = (value as { data?: unknown }).data;
  if (!data || typeof data !== "object") {
    return false;
  }
  return Array.isArray((data as { SHorarioAluno?: unknown }).SHorarioAluno);
};

export const useFileUpload = (): UseFileUploadReturn => {
  const [file, setFile] = useState<File | null>(null);
  const [rawJson, setRawJson] = useState<ScheduleData | null>(null);

  const processFile = useCallback(async (selectedFile: File | null) => {
    if (!selectedFile || !isJsonFile(selectedFile)) {
      setFile(null);
      setRawJson(null);
      return;
    }

    setFile(selectedFile);

    try {
      const text = await selectedFile.text();
      const parsed: unknown = JSON.parse(text);
      if (!isScheduleData(parsed)) {
        console.warn("JSON não corresponde ao formato esperado (data.SHorarioAluno).");
        setRawJson(null);
        return;
      }
      setRawJson(parsed);
    } catch (error) {
      console.warn("Failed to parse JSON file:", error);
      setRawJson(null);
    }
  }, []);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files?.[0];
      void processFile(selectedFile ?? null);
    },
    [processFile],
  );

  const handleFileDrop = useCallback(
    async (droppedFile: File) => {
      await processFile(droppedFile);
    },
    [processFile],
  );

  const clearFile = useCallback(() => {
    setFile(null);
    setRawJson(null);
  }, []);

  return {
    file,
    setFile,
    rawJson,
    setRawJson,
    processFile,
    handleFileChange,
    handleFileDrop,
    clearFile,
  };
};
