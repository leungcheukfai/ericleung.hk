'use client';

import type { SiteCard } from '@/content/site';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

export type SiteRenderBreakpoint = 'sm' | 'md';

const SiteBreakpointContext = createContext<SiteRenderBreakpoint | null>(null);

export function SiteBreakpointProvider({
  breakpoint,
  children,
}: {
  breakpoint?: SiteRenderBreakpoint | null;
  children: ReactNode;
}) {
  return (
    <SiteBreakpointContext.Provider value={breakpoint ?? null}>
      {children}
    </SiteBreakpointContext.Provider>
  );
}

export function useSiteBreakpoint() {
  const forcedBreakpoint = useContext(SiteBreakpointContext);
  const [viewportBreakpoint, setViewportBreakpoint] =
    useState<SiteRenderBreakpoint>('sm');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const syncBreakpoint = () =>
      setViewportBreakpoint(mediaQuery.matches ? 'md' : 'sm');

    syncBreakpoint();
    mediaQuery.addEventListener('change', syncBreakpoint);

    return () => {
      mediaQuery.removeEventListener('change', syncBreakpoint);
    };
  }, []);

  return forcedBreakpoint ?? viewportBreakpoint;
}

export function getCardSizeForBreakpoint(
  card: Pick<SiteCard, 'size'>,
  breakpoint: SiteRenderBreakpoint
) {
  return card.size[breakpoint];
}
