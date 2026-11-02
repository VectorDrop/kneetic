import Navbar from 'components/layout/navbar';
import { HideOnPaths } from 'components/sales/hide-on-paths';
import { GeistSans } from 'geist/font';
import { siteUrl } from 'lib/site-url';
import { ensureStartsWith } from 'lib/utils';
import Script from 'next/script';
import { ReactNode, Suspense } from 'react';
import './globals.css';

const { TWITTER_CREATOR, TWITTER_SITE, SITE_NAME } = process.env;
const twitterCreator = TWITTER_CREATOR ? ensureStartsWith(TWITTER_CREATOR, '@') : undefined;
const twitterSite = TWITTER_SITE ? ensureStartsWith(TWITTER_SITE, 'https://') : undefined;

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: SITE_NAME!,
    template: `%s | ${SITE_NAME}`
  },
  robots: {
    follow: true,
    index: true
  },
  ...(twitterCreator &&
    twitterSite && {
      twitter: {
        card: 'summary_large_image',
        creator: twitterCreator,
        site: twitterSite
      }
    })
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body className="bg-neutral-50 text-black selection:bg-teal-300 dark:bg-neutral-900 dark:text-white dark:selection:bg-pink-500 dark:selection:text-white">
        {/* The sales page (homepage), policy pages and checkout have their own minimal header */}
        <HideOnPaths paths={['/']} prefixes={['/policies/', '/checkout/']}>
          <Navbar />
        </HideOnPaths>
        <Suspense>
          <main>{children}</main>
        </Suspense>
        {/* Microsoft Clarity (heatmaps + session recordings). Loads after the page is interactive. */}
        <Script id="ms-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","z7c3pxq3cv");`}
        </Script>
      </body>
    </html>
  );
}
