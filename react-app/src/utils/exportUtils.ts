import type { ScheduleEntry, ExportOptions } from '@/types';

/**
 * Downloads a blob as a file with the specified filename
 */
const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

/**
 * Safely pads a value to string, handling null/undefined
 */
const pad = (value: any): string => {
  return value == null ? '' : String(value);
};

/**
 * Formats date from ISO string to MM/DD/YYYY for Google Calendar
 */
const formatDateForGoogle = (dateStr: string): string => {
  try {
    const date = new Date(dateStr.replace('T00:00:00', ''));
    return date.toLocaleDateString('en-US');
  } catch {
    return dateStr;
  }
};

/**
 * Formats datetime for ICS format (YYYYMMDDTHHMMSS)
 */
const formatDateTimeForICS = (dateStr: string, timeStr: string): string => {
  if (!dateStr || !timeStr) return '';

  try {
    const [Y, M, D] = dateStr.split('-');
    const [h, m, s] = (timeStr || '00:00:00').split(':');
    return `${Y}${M}${D}T${h}${m}${s || '00'}`;
  } catch {
    return '';
  }
};

/**
 * Escapes text for ICS format
 */
const escapeICSText = (text: string): string => {
  return String(text || '')
    .replaceAll('\\', '\\\\')
    .replaceAll(',', '\\,')
    .replaceAll(';', '\\;')
    .replaceAll('\n', '\\n');
};

/**
 * Builds location string from schedule entry
 */
const buildLocationString = (entry: ScheduleEntry): string => {
  const parts: string[] = [];
  if (entry.PREDIO) parts.push(entry.PREDIO);
  if (entry.BLOCO) parts.push(`Bloco: ${entry.BLOCO}`);
  if (entry.SALA) parts.push(`Sala: ${entry.SALA}`);
  return parts.join(' - ');
};

/**
 * Builds description string from schedule entry
 */
const buildDescriptionString = (entry: ScheduleEntry): string => {
  const parts: string[] = [];
  if (entry.CODTURMA) parts.push(`Turma: ${entry.CODTURMA}`);
  if (entry.CODSUBTURMA) parts.push(`Subturma: ${entry.CODSUBTURMA}`);
  if (entry.NOMEREDUZIDO) parts.push(`Código: ${entry.NOMEREDUZIDO}`);
  if (entry.URLAULAONLINE) parts.push(`Aula Online: ${entry.URLAULAONLINE}`);
  return parts.join(' | ');
};

/**
 * Exports schedule data to CSV format for Google Calendar
 */
export const exportToCSV = (scheduleEntries: ScheduleEntry[], filename: string = 'GoogleAgenda.csv'): void => {
  if (!scheduleEntries?.length) {
    console.warn('No schedule entries to export');
    return;
  }

  const header = [
    'Subject',
    'Start Date',
    'Start Time',
    'End Date',
    'End Time',
    'All Day Event',
    'Description',
    'Location',
    'Private',
  ];

  const rows = [header];

  for (const entry of scheduleEntries) {
    if (!entry?.NOME || !entry?.DATAINICIAL) continue;

    const subject = pad(entry.NOME);
    const startDate = pad((entry.DATAINICIAL || '').replace('T00:00:00', ''));
    const endDate = pad((entry.DATAFINAL || entry.DATAINICIAL || '').replace('T00:00:00', ''));
    const startTime = pad(entry.HORAINICIAL || '');
    const endTime = pad(entry.HORAFINAL || '');
    const location = buildLocationString(entry);
    const description = buildDescriptionString(entry);

    rows.push([
      subject,
      formatDateForGoogle(startDate),
      startTime,
      formatDateForGoogle(endDate),
      endTime,
      'False',
      description,
      location,
      'True',
    ]);
  }

  const csv = rows
    .map(row =>
      row.map(cell => `"${String(cell).replaceAll('"', '""')}"`).join(',')
    )
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  downloadBlob(blob, filename);
};

/**
 * Exports schedule data to ICS format for Thunderbird/other calendar apps
 */
export const exportToICS = (scheduleEntries: ScheduleEntry[], filename: string = 'ThunderbirdAgenda.ics'): void => {
  if (!scheduleEntries?.length) {
    console.warn('No schedule entries to export');
    return;
  }

  let ics = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//CMMG Calendar//Schedule Converter//PT\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\nX-WR-CALNAME:Horário Acadêmico CMMG\nX-WR-CALDESC:Horário das aulas da faculdade CMMG\nX-WR-TIMEZONE:America/Sao_Paulo\n`;

  for (const entry of scheduleEntries) {
    if (!entry?.NOME || !entry?.DATAINICIAL || !entry?.HORAINICIAL || !entry?.HORAFINAL) {
      continue;
    }

    const startDate = (entry.DATAINICIAL || '').replace('T00:00:00', '');
    const endDate = (entry.DATAFINAL || entry.DATAINICIAL || '').replace('T00:00:00', '');
    const location = buildLocationString(entry);
    const description = buildDescriptionString(entry);

    // Generate unique ID for each event
    const uid = crypto.randomUUID?.() || Math.random().toString(36).slice(2);

    // Create timestamp for DTSTAMP
    const now = new Date();
    const dtstamp = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, '0')}${String(now.getUTCDate()).padStart(2, '0')}T${String(now.getUTCHours()).padStart(2, '0')}${String(now.getUTCMinutes()).padStart(2, '0')}${String(now.getUTCSeconds()).padStart(2, '0')}Z`;

    ics += `BEGIN:VEVENT\nUID:${uid}\nDTSTAMP:${dtstamp}\nDTSTART:${formatDateTimeForICS(startDate, entry.HORAINICIAL)}\nDTEND:${formatDateTimeForICS(endDate, entry.HORAFINAL)}\nSUMMARY:${escapeICSText(entry.NOME)}\nDESCRIPTION:${escapeICSText(description)}\nLOCATION:${escapeICSText(location)}\nSTATUS:CONFIRMED\nTRANSP:OPAQUE\nEND:VEVENT\n`;
  }

  ics += 'END:VCALENDAR\n';

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  downloadBlob(blob, filename);
};

/**
 * Generic export function that handles both CSV and ICS formats
 */
export const exportScheduleData = (options: ExportOptions): void => {
  const { format, filename, data } = options;

  switch (format) {
    case 'csv':
      exportToCSV(data, filename);
      break;
    case 'ics':
      exportToICS(data, filename);
      break;
    default:
      console.error('Unsupported export format:', format);
  }
};
