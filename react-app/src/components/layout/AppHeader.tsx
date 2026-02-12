import { FileText } from 'lucide-react';
import type { ApiStatus } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface AppHeaderProps {
  apiStatus: ApiStatus;
  isOnline: boolean;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const AppHeader = ({ apiStatus, isOnline, isDark, onToggleTheme }: AppHeaderProps) => {
  const statusText = isOnline ? 'API online' : apiStatus === 'down' ? 'API indisponível' : 'Verificando API';

  return (
    <header className="app-header">
      <div className="app-header__top-row">
        <div className="brand">
          <img src="/CMMG Calendar - Logo.svg" alt="CMMG Calendar" className="brand__logo" />
          <div className="brand__title-wrap">
            <h1>CMMG Calendar Analyzer</h1>
            <p>Envie seu JSON, analise os dados e exporte com um clique.</p>
          </div>
        </div>

        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
      </div>

      <div className="app-header__meta">
        <StatusBadge status={apiStatus}>{statusText}</StatusBadge>
        <span className="header-hint">
          <FileText size={14} />
          Formato esperado: QuadroHorarioAluno.json
        </span>
      </div>
    </header>
  );
};
