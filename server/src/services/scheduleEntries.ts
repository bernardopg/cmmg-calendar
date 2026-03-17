import {
  ApiValidationError,
  type ScheduleData,
  type ScheduleEntry,
} from "../types.js";

export function extractScheduleEntries(payload: unknown): ScheduleEntry[] {
  if (!payload || typeof payload !== "object" || !("data" in payload)) {
    throw new ApiValidationError("Estrutura de dados inválida: chave 'data' ausente");
  }

  const data = (payload as ScheduleData).data;
  if (!data || typeof data !== "object" || !("SHorarioAluno" in data)) {
    throw new ApiValidationError(
      "Estrutura de dados inválida: chave 'SHorarioAluno' ausente",
    );
  }

  const rawEntries = data.SHorarioAluno;
  if (!Array.isArray(rawEntries)) {
    throw new ApiValidationError(
      "Estrutura de dados inválida: 'SHorarioAluno' deve ser uma lista",
    );
  }

  return rawEntries.filter(
    (entry): entry is ScheduleEntry => Boolean(entry) && typeof entry === "object",
  );
}
