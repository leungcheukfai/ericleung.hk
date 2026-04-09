'use client';

import { useEffect } from 'react';

export default function SiteViewTracker() {
  useEffect(() => {
    const payload = JSON.stringify({ path: '/' });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        '/api/track/view',
        new Blob([payload], { type: 'application/json' })
      );
      return;
    }

    void fetch('/api/track/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    });
  }, []);

  return null;
}
