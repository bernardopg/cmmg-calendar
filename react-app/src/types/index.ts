// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface HealthResponse {
  status: "up" | "down";
  timestamp: string;
  version?: string;
}

// Schedule Data Types
export interface ScheduleEntry {
  NOME: string;
  DATAINICIAL: string;
  DATAFINAL?: string;
  HORAINICIAL: string;
  HORAFINAL: string;
  CODTURMA?: string;
  CODSUBTURMA?: string;
  NOMEREDUZIDO?: string;
  PREDIO?: string;
  BLOCO?: string;
  SALA?: string;
  URLAULAONLINE?: string;
}

export interface ScheduleData {
  data: {
    SHorarioAluno: ScheduleEntry[];
  };
}

// Analysis Results Types
export interface AnalysisStatistics {
  total_entries: number;
  valid_entries: number;
  invalid_entries: number;
}

export interface AnalysisResult {
  statistics: AnalysisStatistics;
  subjects: Record<string, number>;
  time_slots: Record<string, number>;
  locations: Record<string, number>;
  days_of_week: Record<string, number>;
  monthly_distribution: Record<string, number>;
}

// Component Props Types
export interface FileDropzoneProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  error: string | null;
  disabled?: boolean;
}

export interface StatusBadgeProps {
  status: "up" | "down" | "checking";
  children: React.ReactNode;
}

export interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export interface StatisticsCardProps {
  title: string;
  icon: React.ReactNode;
  data: Record<string, number> | AnalysisStatistics;
  type?: "list" | "stats";
}

export interface ExportButtonsProps {
  onExportCSV: () => void;
  onExportICS: () => void;
  disabled?: boolean;
}

// Hook Types
export interface UseApiHealthReturn {
  status: "up" | "down" | "checking";
  isOnline: boolean;
  isChecking: boolean;
}

export interface UseFileUploadReturn {
  file: File | null;
  setFile: (file: File | null) => void;
  rawJson: ScheduleData | null;
  setRawJson: (data: ScheduleData | null) => void;
  processFile: (file: File | null) => Promise<void>;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleFileDrop: (file: File) => Promise<void>;
  clearFile: () => void;
}

export interface UseScheduleAnalysisReturn {
  loading: boolean;
  result: AnalysisResult | null;
  error: string | null;
  analyzeSchedule: (file: File) => Promise<void>;
  clearResults: () => void;
}

// Utility Types
export type ApiStatus = "up" | "down" | "checking";

export type ExportFormat = "csv" | "ics";

export type ThemeMode = "light" | "dark" | "system";

export type ToastVariant = "success" | "error";

export interface Toast {
  id: string;
  title: string;
  message?: string;
  variant: ToastVariant;
}

// Form Types
export interface UploadFormData {
  file: File | null;
}

// Error Types
export interface AppError {
  message: string;
  code?: string;
  details?: unknown;
}

// Export utilities
export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  data: ScheduleEntry[];
}
