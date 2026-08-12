import { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { useApiHealth, useTheme } from '@/hooks';

import { AppHeader } from '@/components/layout/AppHeader';
import { AppFooter } from '@/components/layout/AppFooter';
import { HamburgerSidebar } from '@/components/layout/HamburgerSidebar';

import { LandingPage } from '@/pages/LandingPage';

const HomePage = lazy(async () => ({
  default: (await import('@/pages/HomePage')).HomePage,
}));
const GuidePage = lazy(async () => ({
  default: (await import('@/pages/GuidePage')).GuidePage,
}));
const FaqPage = lazy(async () => ({
  default: (await import('@/pages/FaqPage')).FaqPage,
}));
const AboutPage = lazy(async () => ({
  default: (await import('@/pages/AboutPage')).AboutPage,
}));

const RouteFallback = () => (
  <div className="route-fallback" role="status" aria-live="polite">
    <span className="route-fallback__spinner" aria-hidden="true" />
    <span>Carregando...</span>
  </div>
);

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { status: apiStatus, isOnline } = useApiHealth();
  const { isDark, toggleTheme } = useTheme();

  const toggleSidebar = () => {
    setIsSidebarOpen((current) => !current);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeSidebar();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <BrowserRouter>
      <div className="app-shell">
        <div className="app-container">
          <AppHeader
            apiStatus={apiStatus}
            isOnline={isOnline}
            isDark={isDark}
            onToggleTheme={toggleTheme}
            onToggleMenu={toggleSidebar}
            isMenuOpen={isSidebarOpen}
          />

          <HamburgerSidebar
            open={isSidebarOpen}
            onClose={closeSidebar}
          />

          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/gerador" element={<HomePage />} />
              <Route path="/guia" element={<GuidePage />} />
              <Route path="/faq" element={<FaqPage />} />
              <Route path="/sobre" element={<AboutPage />} />
            </Routes>
          </Suspense>

          <AppFooter />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
