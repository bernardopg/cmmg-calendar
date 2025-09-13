import { useState, useCallback } from 'react';
import type { UseFileUploadReturn, ScheduleData } from '@/types';

export const useFileUpload = (): UseFileUploadReturn => {
  const [file, setFile] = useState<File | null>(null);
  const [rawJson, setRawJson] = useState<ScheduleData | null>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile && selectedFile.type === 'application/json') {
      setFile(selectedFile);

      // Parse JSON immediately for export features
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content) as ScheduleData;
          setRawJson(parsed);
        } catch (error) {
          console.warn('Failed to parse JSON file:', error);
          setRawJson(null);
        }
      };
      reader.readAsText(selectedFile);
    } else {
      setFile(null);
      setRawJson(null);
    }
  }, []);

  const handleFileDrop = useCallback(async (droppedFile: File) => {
    if (droppedFile.type === 'application/json' || droppedFile.name.endsWith('.json')) {
      setFile(droppedFile);

      try {
        const text = await droppedFile.text();
        const parsed = JSON.parse(text) as ScheduleData;
        setRawJson(parsed);
      } catch (error) {
        console.warn('Failed to parse dropped JSON file:', error);
        setRawJson(null);
      }
    }
  }, []);

  const clearFile = useCallback(() => {
    setFile(null);
    setRawJson(null);
  }, []);

  return {
    file,
    setFile,
    rawJson,
    setRawJson,
    handleFileChange,
    handleFileDrop,
    clearFile,
  };
};
