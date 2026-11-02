'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/**
 * Hides its children (the store navbar) on the sales page and policy pages, which have their own
 * minimal header. `paths` must match exactly; `prefixes` match every page that starts with them.
 */
export function HideOnPaths({
  paths,
  prefixes = [],
  children
}: {
  paths: string[];
  prefixes?: string[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  if (paths.indexOf(pathname) !== -1) return null;
  if (prefixes.some((prefix) => pathname.indexOf(prefix) === 0)) return null;
  return <>{children}</>;
}
