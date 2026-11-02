import clsx from 'clsx';
import { Thanks } from 'components/checkout/thanks';
import { bodyFont, displayFont } from 'components/sales/fonts';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

// Node.js runtime: the edge runtime's 1 MB limit (Vercel Hobby) is too small for the Swell SDK.
export const runtime = 'nodejs';

export const metadata: Metadata = {
  title: 'Order Confirmed',
  robots: { index: false, follow: false }
};

export default function ThanksPage({ params }: { params: { id: string } }) {
  if (!/^[a-zA-Z0-9]{8,64}$/.test(params.id)) return notFound();

  return (
    <Thanks
      checkoutId={params.id}
      storeId={process.env.SWELL_STORE_ID || ''}
      publicKey={process.env.SWELL_PUBLIC_KEY || ''}
      className={clsx(displayFont.variable, bodyFont.variable)}
    />
  );
}
