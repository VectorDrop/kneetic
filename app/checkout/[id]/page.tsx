import clsx from 'clsx';
import { Checkout } from 'components/checkout/checkout';
import { bodyFont, displayFont } from 'components/sales/fonts';
import { getSalesProduct } from 'lib/swell/sales';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

// Node.js runtime: the edge runtime's 1 MB limit (Vercel Hobby) is too small for the Swell SDK.
export const runtime = 'nodejs';

export const metadata: Metadata = {
  title: { absolute: 'Secure Checkout | KNEETIC' },
  robots: { index: false, follow: false }
};

/**
 * Custom Swell checkout. In Swell: Settings > Checkout > Custom checkout, URL:
 * https://YOUR-DOMAIN/checkout/{checkout_id}
 */
export default async function CheckoutPage({ params }: { params: { id: string } }) {
  if (!/^[a-zA-Z0-9]{8,64}$/.test(params.id)) return notFound();

  // Product data adds the right photo, savings and the 2-pair upgrade. The cart itself
  // (items, prices, totals) is loaded live from Swell in the browser.
  const product = await getSalesProduct();

  return (
    <Checkout
      checkoutId={params.id}
      storeId={process.env.SWELL_STORE_ID || ''}
      publicKey={process.env.SWELL_PUBLIC_KEY || ''}
      product={product}
      className={clsx(displayFont.variable, bodyFont.variable)}
    />
  );
}
