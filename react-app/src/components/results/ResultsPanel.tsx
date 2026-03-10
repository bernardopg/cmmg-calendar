import { BarChart } from '@/components/charts/BarChart';
import { ExportButtons } from '@/components/results/ExportButtons';
import { SchedulePreview } from '@/components/results/SchedulePreview';
import { StatisticsCard } from '@/components/results/StatisticsCard';
import {
  BookOpenText,
  Building2,
  CalendarRange,
  ChartColumnBig,
  ChevronDown,
  Download,
  LayoutPanelTop,
} from 'lucide-react';
import type { AnalysisResult, ScheduleEntry } from '@/types';

interface ResultsPanelProps {
  result: AnalysisResult;
  entries: ScheduleEntry[];
  onExportCSV: () => void;
  onExportICS: () => void;
  exportDisabled?: boolean;
}

export const ResultsPanel = ({
  result,
  entries,
  onExportCSV,
  onExportICS,
  exportDisabled = false,
}: ResultsPanelProps) => {
  return (
    <section id="results-section" className="results-panel fade-in">
      <div className="results-panel__header">
        <h2>Resultado da análise</h2>
        <p>Veja os dados organizados em seções dobráveis de pré-visualização, estatísticas, gráficos e exportação.</p>
      </div>

      <details className="results-foldable" open>
        <summary className="results-foldable__summary">
          <span className="results-foldable__title">
            <CalendarRange size={18} />
            Pré-visualização da agenda
          </span>
          <ChevronDown size={18} className="results-foldable__chevron" aria-hidden="true" />
        </summary>
        <div className="results-foldable__content">
          <SchedulePreview entries={entries} />
        </div>
      </details>

      <details className="results-foldable" open>
        <summary className="results-foldable__summary">
          <span className="results-foldable__title">
            <LayoutPanelTop size={18} />
            Estatísticas
          </span>
          <ChevronDown size={18} className="results-foldable__chevron" aria-hidden="true" />
        </summary>
        <div className="results-foldable__content">
          <div className="stats-grid">
            <StatisticsCard
              title="Estatísticas"
              icon={<ChartColumnBig size={18} />}
              data={result.statistics}
              type="stats"
            />
            <StatisticsCard
              title={`Matérias (${Object.keys(result.subjects).length})`}
              icon={<BookOpenText size={18} />}
              data={result.subjects}
              type="list"
            />
            <StatisticsCard
              title={`Locais (${Object.keys(result.locations).length})`}
              icon={<Building2 size={18} />}
              data={result.locations}
              type="list"
            />
          </div>
        </div>
      </details>

      <details className="results-foldable">
        <summary className="results-foldable__summary">
          <span className="results-foldable__title">
            <ChartColumnBig size={18} />
            Gráficos
          </span>
          <ChevronDown size={18} className="results-foldable__chevron" aria-hidden="true" />
        </summary>
        <div className="results-foldable__content">
          <div className="charts-grid">
            <BarChart title="Distribuição por dia" data={result.days_of_week} limit={7} />
            <BarChart title="Matérias mais frequentes" data={result.subjects} limit={8} />
            <BarChart title="Horários mais comuns" data={result.time_slots} limit={10} />
          </div>
        </div>
      </details>

      <details id="export-section" className="results-foldable">
        <summary className="results-foldable__summary">
          <span className="results-foldable__title">
            <Download size={18} />
            Exportação
          </span>
          <ChevronDown size={18} className="results-foldable__chevron" aria-hidden="true" />
        </summary>
        <div className="results-foldable__content">
          <div className="results-panel__actions">
            <h3>Exportar arquivos</h3>
            <ExportButtons
              onExportCSV={onExportCSV}
              onExportICS={onExportICS}
              disabled={exportDisabled}
            />
          </div>
        </div>
      </details>
    </section>
  );
};
