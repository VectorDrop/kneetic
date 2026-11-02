import clsx from 'clsx';
import { Thanks } from 'components/checkout/thanks';
import { bodyFont, displayFont } from 'components/sales/fonts';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const runtime = 'edge';

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
