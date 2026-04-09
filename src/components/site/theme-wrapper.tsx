'use client';

import { getThemePreset } from '@/lib/themes';
import { type CSSProperties, type ReactNode, useEffect } from 'react';

export default function SiteThemeWrapper({
  children,
  themeName,
  darkMode,
  accentColor,
}: {
  children: ReactNode;
  themeName: string;
  darkMode: boolean;
  accentColor?: string;
}) {
  const theme = getThemePreset(themeName);
  const colors = darkMode ? theme.colors.dark : theme.colors.light;
  const style: CSSProperties = { ...colors } as CSSProperties;

  if (accentColor) {
    (style as Record<string, string>)['--primary'] = accentColor;
    (style as Record<string, string>)['--accent'] = accentColor;
  }

  useEffect(() => {
    const body = document.body;
    const entries = Object.entries(style) as [string, string][];

    for (const [key, value] of entries) {
      body.style.setProperty(key, value);
    }

    if (darkMode) {
      body.classList.add('dark');
    }

    return () => {
      for (const [key] of entries) {
        body.style.removeProperty(key);
      }
      body.classList.remove('dark');
    };
  }, [style, darkMode]);

  return (
    <div
      className={`${darkMode ? 'dark ' : ''}w-full bg-background text-foreground`}
      style={style}
    >
      <div className="fixed inset-0 z-0 bg-background" />
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}

