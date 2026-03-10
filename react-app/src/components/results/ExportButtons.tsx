import { FileSpreadsheet, Calendar } from 'lucide-react';
import type { ExportButtonsProps } from '@/types';

export const ExportButtons = ({ onExportCSV, onExportICS, disabled = false }: ExportButtonsProps) => {
  return (
    <div className="export-actions">
      <button
        type="button"
        onClick={onExportCSV}
        disabled={disabled}
        className="button button--primary button--md"
        aria-label="Exportar para Google Calendar via CSV"
      >
        <FileSpreadsheet size={18} />
        Google Calendar (CSV)
      </button>

      <button
        type="button"
        onClick={onExportICS}
        disabled={disabled}
        className="button button--primary button--md"
        aria-label="Exportar para Thunderbird via ICS"
      >
        <Calendar size={18} />
        Thunderbird (ICS)
      </button>
    </div>
  );
};