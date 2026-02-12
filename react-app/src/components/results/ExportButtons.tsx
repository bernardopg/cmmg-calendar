import { Download } from 'lucide-react';
import type { ExportButtonsProps } from '@/types';

export const ExportButtons = ({ onExportCSV, onExportICS, disabled = false }: ExportButtonsProps) => {
  return (
    <div className="export-actions">
      <button type="button" onClick={onExportCSV} disabled={disabled} className="button button--secondary button--sm">
        <Download size={16} />
        Exportar CSV (Google)
      </button>
      <button type="button" onClick={onExportICS} disabled={disabled} className="button button--secondary button--sm">
        <Download size={16} />
        Exportar ICS (Thunderbird)
      </button>
    </div>
  );
};
