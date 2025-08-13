'use client';

import { ThemeProvider as NextThemeProvider } from 'next-themes';
import { useAppContext } from './AppProvider';
import { useEffect } from 'react';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { config, setConfig } = useAppContext();

  useEffect(() => {
    // Sync Next.js theme with Phoenix theme system
    const handleThemeChange = () => {
      if (config.isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-bs-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-bs-theme', 'light');
      }
    };

    handleThemeChange();
  }, [config.isDark]);

  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme={config.isDark ? 'dark' : 'light'}
      enableSystem={false}
      themes={['light', 'dark']}
    >
      {children}
    </NextThemeProvider>
  );
}