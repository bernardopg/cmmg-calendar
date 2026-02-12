import { useEffect, useMemo, useState } from "react";
import type { ThemeMode } from "@/types";

const STORAGE_KEY = "cmmg-calendar-theme";

const getInitialTheme = (): ThemeMode => {
  if (typeof window === "undefined") return "light";

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") {
    return stored;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const useTheme = () => {
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);

  useEffect(() => {
    if (theme === "system") return;

    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const isDark = useMemo(() => theme === "dark", [theme]);

  const toggleTheme = () => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  };

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme,
  };
};
