import { Montserrat, Playfair_Display } from 'next/font/google';

/** Elegant serif for headlines (Glamory style). Self-hosted by Next.js, no layout shift. */
export const displayFont = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display'
});

/** Clean sans-serif for body text, buttons and labels. */
export const bodyFont = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body'
});
