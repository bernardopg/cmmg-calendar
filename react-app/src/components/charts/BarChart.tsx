interface BarChartProps {
  title: string;
  data: Record<string, number>;
  limit?: number;
}

export const BarChart = ({ title, data, limit = 8 }: BarChartProps) => {
  const rows = Object.entries(data)
    .sort(([, left], [, right]) => right - left)
    .slice(0, limit);

  const maxValue = rows[0]?.[1] ?? 0;

  return (
    <article className="chart-card card-hover fade-up">
      <h3>{title}</h3>

      <div className="chart-list">
        {rows.map(([label, value]) => {
          const percent = maxValue > 0 ? (value / maxValue) * 100 : 0;

          return (
            <div className="chart-row" key={label}>
              <div className="chart-row__meta">
                <span className="chart-row__label" title={label}>
                  {label}
                </span>
                <strong className="chart-row__value">{value}</strong>
              </div>

              <div className="chart-row__track" aria-hidden="true">
                <span className="chart-row__bar" style={{ width: `${percent}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
};
