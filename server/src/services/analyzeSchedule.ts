import {
  ApiValidationError,
  type AnalysisResult,
  type ScheduleData,
  type ScheduleEntry,
} from "../types.js";

const DAYS_MAP: Record<string, string> = {
  "0": "Domingo",
  "1": "Segunda",
  "2": "Terça",
  "3": "Quarta",
  "4": "Quinta",
  "5": "Sexta",
  "6": "Sábado",
};

const DAY_ORDER = [
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
  "Domingo",
] as const;

function incrementCounter(counter: Record<string, number>, key: string): void {
  counter[key] = (counter[key] ?? 0) + 1;
}

function sortCounterEntries(
  counter: Record<string, number>,
  limit?: number,
): Record<string, number> {
  const entries = Object.entries(counter).sort((left, right) => {
    if (right[1] !== left[1]) {
      return right[1] - left[1];
    }

    return left[0].localeCompare(right[0], "pt-BR");
  });

  return Object.fromEntries(limit ? entries.slice(0, limit) : entries);
}

function toValidScheduleEntries(payload: unknown): ScheduleEntry[] {
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

function extractMonthYear(rawDate: string): string | null {
  const normalized = rawDate.replace("T00:00:00", "");
  const match = normalized.match(/^(\d{4})-(\d{2})/);
  if (!match) {
    return null;
  }

  return `${match[1]}-${match[2]}`;
}

export function analyzeScheduleDataJson(payload: unknown): AnalysisResult {
  const entries = toValidScheduleEntries(payload);
  const subjects: Record<string, number> = {};
  const timeSlots: Record<string, number> = {};
  const locations: Record<string, number> = {};
  const daysOfWeek: Record<string, number> = {};
  const monthlyDistribution: Record<string, number> = {};

  let validEntries = 0;

  for (const entry of entries) {
    const subject = typeof entry.NOME === "string" ? entry.NOME.trim() : "";
    const startDate =
      typeof entry.DATAINICIAL === "string" ? entry.DATAINICIAL.trim() : "";

    if (!subject || !startDate) {
      continue;
    }

    validEntries += 1;
    incrementCounter(subjects, subject);

    const startTime =
      typeof entry.HORAINICIAL === "string" ? entry.HORAINICIAL.trim() : "";
    const endTime =
      typeof entry.HORAFINAL === "string" ? entry.HORAFINAL.trim() : "";
    if (startTime && endTime) {
      incrementCounter(timeSlots, `${startTime} - ${endTime}`);
    }

    const location =
      typeof entry.PREDIO === "string" ? entry.PREDIO.trim() : "";
    if (location) {
      incrementCounter(locations, location);
    }

    const weekday =
      typeof entry.DIASEMANA === "string" ? entry.DIASEMANA.trim() : "";
    if (weekday && DAYS_MAP[weekday]) {
      incrementCounter(daysOfWeek, DAYS_MAP[weekday]);
    }

    const monthYear = extractMonthYear(startDate);
    if (monthYear) {
      incrementCounter(monthlyDistribution, monthYear);
    }
  }

  return {
    statistics: {
      total_entries: entries.length,
      valid_entries: validEntries,
      invalid_entries: entries.length - validEntries,
    },
    subjects: sortCounterEntries(subjects),
    time_slots: sortCounterEntries(timeSlots, 10),
    locations: sortCounterEntries(locations, 5),
    days_of_week: Object.fromEntries(
      DAY_ORDER.filter((day) => (daysOfWeek[day] ?? 0) > 0).map((day) => [
        day,
        daysOfWeek[day] ?? 0,
      ]),
    ),
    monthly_distribution: Object.fromEntries(
      Object.entries(monthlyDistribution).sort((left, right) =>
        left[0].localeCompare(right[0]),
      ),
    ),
  };
}
