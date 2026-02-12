import type { AnalysisStatistics, StatisticsCardProps } from '@/types';

const isAnalysisStats = (data: StatisticsCardProps['data']): data is AnalysisStatistics => {
  return 'total_entries' in data;
};

export const StatisticsCard = ({ title, icon, data, type = 'list' }: StatisticsCardProps) => {
  const entries = isAnalysisStats(data)
    ? [
        ['Total', data.total_entries],
        ['Válidos', data.valid_entries],
        ['Inválidos', data.invalid_entries],
      ]
    : Object.entries(data);

  return (
    <article className="stats-card card-hover fade-up">
      <div className="stats-card__header">
        <span className="stats-card__icon" aria-hidden="true">
          {icon}
        </span>
        <h3>{title}</h3>
      </div>

      <div className="stats-card__body">
        {entries.slice(0, type === 'stats' ? 3 : 5).map(([label, value]) => (
          <div key={label} className="stats-line">
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </article>
  );
};
