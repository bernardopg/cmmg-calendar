import {
  X,
  Home,
  CalendarPlus,
  BookOpen,
  HelpCircle,
  Heart,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface HamburgerSidebarProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  { to: '/', label: 'Início', icon: Home },
  { to: '/gerador', label: 'Gerador de Calendário', icon: CalendarPlus },
  { to: '/guia', label: 'Guia de Uso', icon: BookOpen },
  { to: '/faq', label: 'FAQ', icon: HelpCircle },
  { to: '/sobre', label: 'Sobre', icon: Heart },
];

export const HamburgerSidebar = ({ open, onClose }: HamburgerSidebarProps) => {
  const location = useLocation();

  return (
    <>
      <button
        type="button"
        className={`sidebar-overlay ${open ? 'sidebar-overlay--open' : ''}`}
        onClick={onClose}
        aria-hidden={!open}
        tabIndex={open ? 0 : -1}
      />

      <aside
        id="sidebar-index"
        className={`sidebar-drawer ${open ? 'sidebar-drawer--open' : ''}`}
        aria-label="Menu de navegação"
      >
        <div className="sidebar-drawer__header">
          <h2>Menu</h2>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Fechar menu"
            title="Fechar"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Navegação principal">
          <span className="sidebar-nav__label">Páginas</span>

          {navItems.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={onClose}
                className={`sidebar-nav__link ${isActive ? 'sidebar-nav__link--active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
