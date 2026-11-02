/**
 * Copy and settings for the custom checkout (/checkout/[id]) and thank-you page.
 * Edit the wording here. Prices, items, shipping and totals always come live from Swell.
 *
 * Rules this checkout follows (keep them when you edit):
 * - No fake timers or fake stock warnings. Swell keeps the cart for 14 days, so a "reserved for
 *   10 minutes" countdown would be a lie.
 * - Every claim must be true: guarantee, shipping, reviews.
 */
import { policyInfo } from './policies';
import { brand, buyBoxQuote, guarantee, rating } from './sales-content';

/** First and last number in a text like "1–3 business days". */
function range(text: string): [number, number] {
  const nums = (text.match(/\d+/g) || []).map((n) => parseInt(n, 10));
  const first = nums[0] ?? 0;
  return [first, nums[nums.length - 1] ?? first];
}

const [arrivalMin, arrivalMax] = range(policyInfo.shipping.delivery);

export const checkoutContent = {
  brand: brand.name,
  supportEmail: policyInfo.email,
  secureLabel: 'Secure checkout',

  /** Estimated arrival in calendar days after the order (`delivery` in policies.ts, e.g. 5–10). */
  arrival: { minDays: arrivalMin, maxDays: arrivalMax },
  processing: policyInfo.shipping.processing,

  /**
   * One-click upgrade from 1 pair to 2 pairs, shown when the cart has the 1-pair pack.
   * {extra} = what the second pair adds, {total} = price for 2 pairs, {regular} = 2 single pairs.
   */
  bump: {
    title: 'Add a second pair for just {extra}',
    body: 'One pair lives in your gym bag, one stays home, so you never train without them. {total} for both instead of {regular}.',
    badge: 'Best value',
    added: 'Second pair added'
  },

  emailOptIn: 'Email me training tips and exclusive offers',
  payButton: 'Complete Order',
  processingLabel: 'Processing your order…',
  paymentNote: 'All transactions are secure and encrypted. Payments are processed by Stripe.',

  trust: [
    { icon: 'lock', text: 'Secure, encrypted payment' },
    { icon: 'truck', text: 'Free shipping to the US' },
    { icon: 'shield', text: '30-day money-back guarantee' }
  ] as const,

  guarantee,
  rating,
  review: buyBoxQuote,

  /** Thank-you page. */
  thanks: {
    title: 'Thank you, {name}!',
    titleNoName: 'Thank you for your order!',
    confirmed: 'Order #{number} is confirmed.',
    emailNote: 'A confirmation is on its way to {email}.',
    nextTitle: 'What happens next',
    next: [
      {
        title: 'We pack your sleeves',
        body: `Your order leaves our warehouse within ${policyInfo.shipping.processing}.`
      },
      {
        title: 'You get a tracking number',
        body: 'As soon as your order ships, we email you the tracking details.'
      },
      {
        title: 'Squat heavy',
        body: 'Pull them on before your first warm-up set. A snug, tight fit is normal for 7mm sleeves.'
      }
    ],
    guaranteeNote: `Not the right fit? You're covered by our ${guarantee.title.toLowerCase()}.`,
    backLabel: 'Back to store'
  }
};

/** Fills {placeholders} in a text. */
export function fill(text: string, values: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
}
