'use server';

import { createBuyNowCheckout } from 'lib/swell/sales';
import type { BuyOptionInput } from 'lib/sales-types';

export type BuyNowResult = { checkoutUrl: string } | { error: string };

/** Adds the chosen item to a fresh Swell cart and returns the checkout URL. */
export async function buyNow(input: {
  productId: string;
  quantity: number;
  options: BuyOptionInput[];
}): Promise<BuyNowResult> {
  // Server actions are public endpoints: validate everything that comes in.
  const productId = typeof input?.productId === 'string' ? input.productId.slice(0, 64) : '';
  const quantity = Math.floor(Number(input?.quantity));
  const options = (Array.isArray(input?.options) ? input.options : [])
    .slice(0, 10)
    .filter((o) => o && typeof o.name === 'string' && typeof o.value === 'string')
    .map((o) => ({ name: o.name.slice(0, 100), value: o.value.slice(0, 100) }));

  if (!productId || !isFinite(quantity) || quantity < 1 || quantity > 10) {
    return { error: 'invalid' };
  }

  try {
    const checkoutUrl = await createBuyNowCheckout(productId, quantity, options);
    return { checkoutUrl };
  } catch (error) {
    console.error('[sales] buyNow failed:', error);
    return { error: 'checkout' };
  }
}
