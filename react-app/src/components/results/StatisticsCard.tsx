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
    : Object.entries(data).sort(([, left], [, right]) => right - left);

  return (
    <article className={`stats-card stats-card--${type} card-hover fade-up`}>
      <div className="stats-card__header">
        <span className="stats-card__icon" aria-hidden="true">
          {icon}
        </span>
        <h3>{title}</h3>
      </div>

      <div className="stats-card__body">
        {entries.slice(0, type === 'stats' ? 3 : 5).map(([label, value]) => (
          <div key={String(label)} className={`stats-line stats-line--${type}`}>
            <span className="stats-line__label" title={String(label)}>
              {label}
            </span>
            <strong className="stats-line__value">{value}</strong>
          </div>
        ))}
      </div>
    </article>
  );
};
