import crypto from "node:crypto";
import {
  type ScheduleEntry,
} from "../types.js";
import { extractScheduleEntries } from "./scheduleEntries.js";

const ICS_HEADER =
  "BEGIN:VCALENDAR\n" +
  "VERSION:2.0\n" +
  "PRODID:-//CMMG Calendar//Schedule Converter//PT\n" +
  "CALSCALE:GREGORIAN\n" +
  "METHOD:PUBLISH\n" +
  "X-WR-CALNAME:Horário Acadêmico CMMG\n" +
  "X-WR-CALDESC:Horário das aulas da faculdade CMMG\n" +
  "X-WR-TIMEZONE:America/Sao_Paulo\n";

const ICS_FOOTER = "END:VCALENDAR\n";

function pad(value: unknown): string {
  return value == null ? "" : String(value);
}

function formatDateForGoogle(dateStr: string): string {
  const clean = (dateStr || "").replace("T00:00:00", "");
  const parts = clean.split("-");
  if (parts.length !== 3) {
    return clean;
  }

  const [year, month, day] = parts;
  return `${month}/${day}/${year}`;
}

function formatDateTimeForIcs(dateStr: string, timeStr: string): string {
  if (!dateStr || !timeStr) {
    return "";
  }

  const cleanDate = dateStr.replace("T00:00:00", "");
  const [year, month, day] = cleanDate.split("-");
  if (!year || !month || !day) {
    return "";
  }

  const parts = (timeStr || "00:00:00").split(":");
  while (parts.length < 3) {
    parts.push("00");
  }

  const [hours, minutes, seconds] = parts;
  return `${year}${month}${day}T${hours ?? "00"}${minutes ?? "00"}${seconds ?? "00"}`;
}

function escapeIcsText(text: string): string {
  return String(text || "")
    .replaceAll("\\", "\\\\")
    .replaceAll(",", "\\,")
    .replaceAll(";", "\\;")
    .replaceAll("\n", "\\n");
}

export function buildLocationString(entry: ScheduleEntry): string {
  const parts: string[] = [];
  if (entry.PREDIO) {
    parts.push(String(entry.PREDIO));
  }
  if (typeof entry.BLOCO === "string" && entry.BLOCO) {
    parts.push(`Bloco: ${entry.BLOCO}`);
  }
  if (typeof entry.SALA === "string" && entry.SALA) {
    parts.push(`Sala: ${entry.SALA}`);
  }
  return parts.join(" - ");
}

export function buildDescriptionString(entry: ScheduleEntry): string {
  const parts: string[] = [];
  if (typeof entry.CODTURMA === "string" && entry.CODTURMA) {
    parts.push(`Turma: ${entry.CODTURMA}`);
  }
  if (typeof entry.CODSUBTURMA === "string" && entry.CODSUBTURMA) {
    parts.push(`Subturma: ${entry.CODSUBTURMA}`);
  }
  if (typeof entry.NOMEREDUZIDO === "string" && entry.NOMEREDUZIDO) {
    parts.push(`Código: ${entry.NOMEREDUZIDO}`);
  }
  if (typeof entry.URLAULAONLINE === "string" && entry.URLAULAONLINE) {
    parts.push(`Aula Online: ${entry.URLAULAONLINE}`);
  }
  return parts.join(" | ");
}

function toCsvField(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

export function generateCsv(entries: ScheduleEntry[]): string {
  const header = [
    "Subject",
    "Start Date",
    "Start Time",
    "End Date",
    "End Time",
    "All Day Event",
    "Description",
    "Location",
    "Private",
  ];

  const rows: string[][] = [header];

  for (const entry of entries) {
    if (!entry.NOME || !entry.DATAINICIAL) {
      continue;
    }

    const startDate = pad(entry.DATAINICIAL).replace("T00:00:00", "");
    const endDate = pad(entry.DATAFINAL || entry.DATAINICIAL).replace(
      "T00:00:00",
      "",
    );

    rows.push([
      pad(entry.NOME),
      formatDateForGoogle(startDate),
      pad(entry.HORAINICIAL),
      formatDateForGoogle(endDate),
      pad(entry.HORAFINAL),
      "False",
      buildDescriptionString(entry),
      buildLocationString(entry),
      "True",
    ]);
  }

  return rows.map((row) => row.map(toCsvField).join(",")).join("\n");
}

export function generateIcs(entries: ScheduleEntry[]): string {
  const now = new Date();
  const dtstamp =
    `${now.getUTCFullYear()}` +
    `${String(now.getUTCMonth() + 1).padStart(2, "0")}` +
    `${String(now.getUTCDate()).padStart(2, "0")}T` +
    `${String(now.getUTCHours()).padStart(2, "0")}` +
    `${String(now.getUTCMinutes()).padStart(2, "0")}` +
    `${String(now.getUTCSeconds()).padStart(2, "0")}Z`;

  let ics = ICS_HEADER;

  for (const entry of entries) {
    if (
      !entry.NOME ||
      !entry.DATAINICIAL ||
      !entry.HORAINICIAL ||
      !entry.HORAFINAL
    ) {
      continue;
    }

    const startDate = String(entry.DATAINICIAL).replace("T00:00:00", "");
    const endDate = String(entry.DATAFINAL || entry.DATAINICIAL).replace(
      "T00:00:00",
      "",
    );
    const uid = crypto.randomUUID();

    ics +=
      "BEGIN:VEVENT\n" +
      `UID:${uid}\n` +
      `DTSTAMP:${dtstamp}\n` +
      `DTSTART:${formatDateTimeForIcs(startDate, String(entry.HORAINICIAL))}\n` +
      `DTEND:${formatDateTimeForIcs(endDate, String(entry.HORAFINAL))}\n` +
      `SUMMARY:${escapeIcsText(String(entry.NOME))}\n` +
      `DESCRIPTION:${escapeIcsText(buildDescriptionString(entry))}\n` +
      `LOCATION:${escapeIcsText(buildLocationString(entry))}\n` +
      "STATUS:CONFIRMED\n" +
      "TRANSP:OPAQUE\n" +
      "END:VEVENT\n";
  }

  ics += ICS_FOOTER;
  return ics;
}

export function exportScheduleFromPayload(payload: unknown): {
  entries: ScheduleEntry[];
  csv: string;
  ics: string;
} {
  const entries = extractScheduleEntries(payload);
  return {
    entries,
    csv: generateCsv(entries),
    ics: generateIcs(entries),
  };
}
