import { BarChart } from '@/components/charts/BarChart';
import { ExportButtons } from '@/components/results/ExportButtons';
import { StatisticsCard } from '@/components/results/StatisticsCard';
import { BookOpenText, Building2, ChartColumnBig } from 'lucide-react';
import type { AnalysisResult } from '@/types';

interface ResultsPanelProps {
  result: AnalysisResult;
  onExportCSV: () => void;
  onExportICS: () => void;
  exportDisabled?: boolean;
}

export const ResultsPanel = ({
  result,
  onExportCSV,
  onExportICS,
  exportDisabled = false,
}: ResultsPanelProps) => {
  return (
    <section className="results-panel fade-in">
      <div className="results-panel__header">
        <h2>Resultado da análise</h2>
        <p>Visão geral dos dados e distribuição das aulas.</p>
      </div>

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

      <div className="results-panel__actions">
        <h3>Exportação</h3>
        <ExportButtons
          onExportCSV={onExportCSV}
          onExportICS={onExportICS}
          disabled={exportDisabled}
        />
      </div>

      <div className="charts-grid">
        <BarChart title="Distribuição por dia" data={result.days_of_week} limit={7} />
        <BarChart title="Matérias mais frequentes" data={result.subjects} limit={8} />
        <BarChart title="Horários mais comuns" data={result.time_slots} limit={10} />
      </div>
    </section>
  );
};
