import { useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import type { EventInput } from '@fullcalendar/core';
import type { EventContentArg } from '@fullcalendar/core';
import type { EventMountArg } from '@fullcalendar/core';
import type { ScheduleEntry } from '@/types';

interface SchedulePreviewProps {
  entries: ScheduleEntry[];
}

const normalizeDate = (date: string): string => {
  return (date || '').replace('T00:00:00', '');
};

const buildLocation = (entry: ScheduleEntry): string => {
  const parts: string[] = [];
  if (entry.PREDIO) parts.push(entry.PREDIO);
  if (entry.BLOCO) parts.push(`Bloco ${entry.BLOCO}`);
  if (entry.SALA) parts.push(`Sala ${entry.SALA}`);
  return parts.join(' • ') || 'Local não informado';
};

const parseWeekday = (date: string): number => {
  const normalized = normalizeDate(date);
  const parsed = new Date(`${normalized}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return -1;
  }

  return parsed.getDay();
};

const withTime = (date: string, time: string): Date => {
  return new Date(`${normalizeDate(date)}T${time || '00:00:00'}`);
};

const addOneDay = (date: string): string => {
  const normalized = normalizeDate(date);
  const parsed = new Date(`${normalized}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return normalized;

  parsed.setDate(parsed.getDate() + 1);
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const truncate = (value: string, maxLength: number): string => {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1)}…`;
};

const toEventInput = (entry: ScheduleEntry, index: number): EventInput | null => {
  if (!entry?.NOME || !entry?.DATAINICIAL) {
    return null;
  }

  const startDate = normalizeDate(entry.DATAINICIAL);
  const endDate = normalizeDate(entry.DATAFINAL || entry.DATAINICIAL);
  const startTime = entry.HORAINICIAL || '00:00:00';
  const endTime = entry.HORAFINAL || startTime;
  const location = buildLocation(entry);
  const weekday = parseWeekday(startDate);

  if (entry.DATAFINAL && endDate > startDate && weekday >= 0) {
    return {
      id: `rec-${index}-${entry.NOME}`,
      title: entry.NOME,
      daysOfWeek: [weekday],
      startTime,
      endTime,
      startRecur: startDate,
      endRecur: addOneDay(endDate),
      extendedProps: { location, fullTitle: entry.NOME },
    };
  }

  return {
    id: `single-${index}-${entry.NOME}`,
    title: entry.NOME,
    start: withTime(startDate, startTime),
    end: withTime(startDate, endTime),
    extendedProps: { location, fullTitle: entry.NOME },
  };
};

const renderEventContent = (eventInfo: EventContentArg) => {
  const title = String(eventInfo.event.extendedProps.fullTitle || eventInfo.event.title || '');
  const viewType = eventInfo.view.type;

  if (viewType === 'dayGridMonth') {
    const compactText = eventInfo.timeText
      ? `${eventInfo.timeText} ${truncate(title, 24)}`
      : truncate(title, 28);

    return (
      <div className="schedule-event schedule-event--month">
        <span className="schedule-event__title">{compactText}</span>
      </div>
    );
  }

  return (
    <div className="schedule-event schedule-event--week">
      <strong>{eventInfo.timeText}</strong>
      <span className="schedule-event__title">{truncate(title, 34)}</span>
    </div>
  );
};

const handleEventDidMount = (arg: EventMountArg) => {
  const location = String(arg.event.extendedProps.location || '');
  const title = String(arg.event.extendedProps.fullTitle || arg.event.title || '');
  const timeText = arg.timeText ? `Horário: ${arg.timeText}` : '';
  const locationText = location ? `Local: ${location}` : '';

  arg.el.title = [title, timeText, locationText].filter(Boolean).join('\n');
};

export const SchedulePreview = ({ entries }: SchedulePreviewProps) => {
  const events = useMemo(() => {
    return entries
      .map((entry, index) => toEventInput(entry, index))
      .filter((event): event is EventInput => event !== null);
  }, [entries]);

  if (!events.length) {
    return null;
  }

  const firstDate = entries[0]?.DATAINICIAL ? normalizeDate(entries[0].DATAINICIAL) : undefined;

  return (
    <section className="schedule-preview fade-in" aria-labelledby="schedule-preview-title">
      <div className="schedule-preview__header">
        <h2 id="schedule-preview-title">Pré-visualização da agenda</h2>
        <p>Visualização completa mensal e semanal dos seus horários.</p>
      </div>

      <div className="schedule-preview__calendar surface-card">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin]}
          locale={ptBrLocale}
          initialView="dayGridMonth"
          initialDate={firstDate}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek',
          }}
          buttonText={{
            today: 'Hoje',
            month: 'Mês',
            week: 'Semana',
          }}
          allDaySlot={false}
          slotMinTime="06:00:00"
          slotMaxTime="23:00:00"
          slotDuration="00:30:00"
          height="auto"
          events={events}
          eventContent={renderEventContent}
          eventDidMount={handleEventDidMount}
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }}
          dayMaxEventRows={2}
          eventMinHeight={22}
          expandRows
        />
      </div>

      <p className="schedule-preview__hint">Use os botões <strong>Mês</strong> e <strong>Semana</strong> para alternar a visualização.</p>
    </section>
  );
};