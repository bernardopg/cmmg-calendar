export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface ScheduleEntry {
  NOME?: string | null;
  PREDIO?: string | null;
  HORAINICIAL?: string | null;
  HORAFINAL?: string | null;
  DATAINICIAL?: string | null;
  DIASEMANA?: string | null;
  [key: string]: unknown;
}

export interface SchedulePayloadData {
  SHorarioAluno: ScheduleEntry[];
  ["RMException:Message"]?: string;
  [key: string]: unknown;
}

export interface ScheduleData {
  data: SchedulePayloadData;
  messages?: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

export interface AnalysisResult {
  statistics: {
    total_entries: number;
    valid_entries: number;
    invalid_entries: number;
  };
  subjects: Record<string, number>;
  time_slots: Record<string, number>;
  locations: Record<string, number>;
  days_of_week: Record<string, number>;
  monthly_distribution: Record<string, number>;
}

export interface TotvsContextItem {
  CODCOLIGADA: string;
  CODFILIAL: string;
  CODTIPOCURSO: string;
  IDCONTEXTOALUNO: string;
  IDHABILITACAOFILIAL: string;
  IDPERLET: string;
  RA: string;
  ACESSODADOSACADEMICOS: string;
  ACESSODADOSFINANCEIROS: string;
  [key: string]: unknown;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class ApiValidationError extends ApiError {
  constructor(message: string) {
    super(message, 400);
    this.name = "ApiValidationError";
  }
}

export class ProcessingError extends ApiError {
  constructor(message: string) {
    super(message, 422);
    this.name = "ProcessingError";
  }
}

export class HttpResponseError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly body: string,
  ) {
    super(`HTTP ${statusCode}`);
    this.name = "HttpResponseError";
  }
}
