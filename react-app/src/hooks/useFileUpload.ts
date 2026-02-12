import { useState, useCallback } from "react";
import type { UseFileUploadReturn, ScheduleData } from "@/types";

export const useFileUpload = (): UseFileUploadReturn => {
  const [file, setFile] = useState<File | null>(null);
  const [rawJson, setRawJson] = useState<ScheduleData | null>(null);

  const isJsonFile = (candidate: File): boolean => {
    return (
      candidate.type === "application/json" || candidate.name.endsWith(".json")
    );
  };

  const processFile = useCallback(async (selectedFile: File | null) => {
    if (!selectedFile || !isJsonFile(selectedFile)) {
      setFile(null);
      setRawJson(null);
      return;
    }

    setFile(selectedFile);

    try {
      const text = await selectedFile.text();
      const parsed = JSON.parse(text) as ScheduleData;
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
