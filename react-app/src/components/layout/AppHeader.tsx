import { FileText, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ApiStatus } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface AppHeaderProps {
  apiStatus: ApiStatus;
  isOnline: boolean;
  isDark: boolean;
  onToggleTheme: () => void;
  onToggleMenu: () => void;
  isMenuOpen: boolean;
}

export const AppHeader = ({
  apiStatus,
  isOnline,
  isDark,
  onToggleTheme,
  onToggleMenu,
  isMenuOpen,
}: AppHeaderProps) => {
  const statusText = isOnline ? 'API online' : apiStatus === 'down' ? 'API indisponível' : 'Verificando API';

  return (
    <header className="app-header">
      <div className="app-header__top-row">
        <button
          type="button"
          className="menu-toggle"
          onClick={onToggleMenu}
          aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={isMenuOpen}
          aria-controls="sidebar-index"
          title={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          <Menu size={18} />
        </button>

        <Link to="/" className="brand">
          <img src="/CMMG Calendar - Logo.svg" alt="CMMG Calendar" className="brand__logo" />
          <div className="brand__title-wrap">
            <h1>CMMG Calendar</h1>
            <p>Seu assistente acadêmico de horários.</p>
          </div>
        </Link>

        <div className="header-actions">
          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
        </div>
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
