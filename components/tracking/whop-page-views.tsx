'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

/**
 * The Whop Ads snippet in app/layout.tsx counts the first page view. Links inside the site
 * (e.g. sales page -> policy page) change pages without a full reload, so this counts those too.
 */
export function WhopPageViews() {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false; // already tracked by the snippet itself
      return;
    }
    const whop = (window as unknown as { whop?: { track?: (event: string) => void } }).whop;
    whop?.track?.('page');
  }, [pathname]);

  return null;
}
