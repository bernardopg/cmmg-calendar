import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { useApiHealth, useTheme } from '@/hooks';

import { AppHeader } from '@/components/layout/AppHeader';
import { AppFooter } from '@/components/layout/AppFooter';
import { HamburgerSidebar } from '@/components/layout/HamburgerSidebar';

import { LandingPage } from '@/pages/LandingPage';
import { HomePage } from '@/pages/HomePage';
import { GuidePage } from '@/pages/GuidePage';
import { FaqPage } from '@/pages/FaqPage';
import { AboutPage } from '@/pages/AboutPage';

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

          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/gerador" element={<HomePage />} />
            <Route path="/guia" element={<GuidePage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/sobre" element={<AboutPage />} />
          </Routes>

          <AppFooter />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
