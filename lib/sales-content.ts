/**
 * ALL COPY AND SETTINGS FOR THE SALES PAGE (homepage) LIVE HERE.
 *
 * Product name, price, sale price, images, sizes and stock come from Swell.
 * Everything else (headlines, FAQs, reviews, guarantee, urgency) is edited in this file.
 *
 * Rules this copy follows. Keep them when you edit:
 * - No pain-relief, injury-prevention or medical claims. Sell warmth, compression, fit, confidence.
 * - Reviews must be real customers, word for word. Never invent one.
 * - Urgency must be real: only set a deadline or shipping promise that is actually true.
 */
import type { SalesImage, SalesReview } from './sales-types';

export const brand = {
  name: 'KNEETIC',
  supportEmail: 'support@kneetic.com' // TODO: your real support address
};

export const meta = {
  title: 'KNEETIC 7mm Knee Sleeves | Squat Heavy Without Second-Guessing Your Knees',
  description:
    '7mm neoprene knee sleeves for lifters: warm by set two, locked in on the walkout, sized to fit the first time. 30-day money-back guarantee.'
};

export const announcement = 'Free Shipping to the US';

/** Shown if the Swell product has no images (or can't be loaded). Upload the same 6 images to Swell. */
export const salesFallbackImages: SalesImage[] = [
  {
    src: '/carousel/01-hero.jpg',
    alt: 'KNEETIC 7mm knee sleeves, pair',
    width: 1400,
    height: 1400
  },
  {
    src: '/carousel/02-on-legs.jpg',
    alt: "KNEETIC sleeves on a lifter's knees",
    width: 1400,
    height: 1400
  },
  {
    src: '/carousel/03-before-after.jpg',
    alt: 'Worn-out old sleeves vs. KNEETIC 7mm',
    width: 1400,
    height: 1400
  },
  {
    src: '/carousel/04-future.jpg',
    alt: 'Lifter in KNEETIC sleeves before a heavy squat',
    width: 1400,
    height: 1400
  },
  {
    src: '/carousel/05-logic.jpg',
    alt: 'What makes KNEETIC feel locked in',
    width: 1400,
    height: 1400
  },
  {
    src: '/carousel/06-guarantee.jpg',
    alt: '30-day money-back guarantee',
    width: 1400,
    height: 1400
  }
];

/** Labels under the gallery thumbnails, in the same order as the product images in Swell. */
export const galleryLabels = [
  'The pair',
  'On the knee',
  'Before / after',
  'The feeling',
  'Why it works',
  'Guarantee'
];

/**
 * When a shopper picks one of these option values (e.g. a color), the gallery jumps to that picture.
 * Numbers are positions in your Swell image list: 1 = first picture, 2 = second, ...
 * The value names must match Swell exactly (capitals don't matter).
 */
export const optionImages: Record<string, number> = {
  'Hex Black': 2,
  'Stealth Black': 3
};

/** Gallery position (0-based) for an option value, or null if it has none. */
export function imageIndexFor(valueName: string): number | null {
  const key = Object.keys(optionImages).find(
    (k) => k.trim().toLowerCase() === valueName.trim().toLowerCase()
  );
  const pos = key ? optionImages[key] : undefined;
  return typeof pos === 'number' && pos >= 1 ? pos - 1 : null;
}

/* ------------------------------------------------------------------ */
/* ABOVE THE FOLD                                                      */
/* ------------------------------------------------------------------ */

export const hero = {
  eyebrow: '7mm Neoprene Knee Sleeves',
  // Text before "|" is set light, text after it bold (Glamory-style headline).
  headline: 'Squat Heavy | Without Second-Guessing Your Knees',
  subheadline:
    'Warm by set two. Locked in on the walkout. Sized to fit the first time. Or your money back.',
  benefits: [
    // what life looks like after
    { icon: 'flame', strong: 'Warm, ready knees', rest: ' by your second set' },
    { icon: 'lock', strong: 'Locked in', rest: ' on the walkout, confident in the hole' },
    // why it works
    { icon: 'layers', strong: '7mm neoprene', rest: ' for firm, even compression' },
    { icon: 'curve', strong: 'Pre-curved cut', rest: ' that sits flat, no bunching' }
  ]
};

export const buyBox = {
  ctaLabel: 'Get My Sleeves',
  quantityLabel: 'How many pairs?',
  quantities: [
    { qty: 1, label: '1 Pair', note: 'For your heavy days' },
    // The 2-pair price comes from a quantity price rule on the product in Swell (min. quantity 2).
    { qty: 2, label: '2 Pairs', note: 'Gym bag + meet day' }
  ],
  trust: ['Secure checkout', '30-day guarantee', 'Real 7mm neoprene']
};

export const guarantee = {
  title: '30-Day Money-Back Guarantee',
  // IMPORTANT: "even if you've worn them" must match your actual return policy. Change it if not.
  body: "Train in them for 30 days. Not locked in? Send them back for a full refund, even if you've worn them."
};

/** Objection handlers right under the buy box. */
export const heroFaqs = [
  {
    q: 'What size should I get?',
    a: "Measure around the middle of your kneecap with your leg straight and relaxed, then match it to the size guide. 7mm sleeves should feel snug, not strangling. If the fit isn't right, the 30-day guarantee has you covered."
  },
  {
    q: '5mm or 7mm?',
    a: 'Heavy squats and strength work: 7mm. 5mm is made for high-rep, high-movement training. 7mm is the thickest sleeve allowed in raw powerlifting.'
  },
  {
    q: 'Are 7mm sleeves hard to put on?',
    a: 'They should be snug. Fold the top half down, slide it over your calf, then roll it up over the knee. Takes seconds once you know the trick. See "How to put them on" below.'
  },
  {
    q: 'What if they stretch out or rip?',
    a: "That's why the risk is on us. Squat in them for 30 days. If they don't hold up to your training, send them back for a full refund."
  },
  {
    q: 'Do knee sleeves actually do anything?',
    a: "They won't fix your knees, and anyone promising that is selling you something. They keep your knees warm, give firm, even compression, and make heavy sets feel more stable. In a 2024 study, 94% of athletes said they felt more stable in 7mm sleeves."
  }
];

/* ------------------------------------------------------------------ */
/* SOCIAL PROOF                                                        */
/* ------------------------------------------------------------------ */

/**
 * Rating badge (hero + reviews section). Keep these numbers true and up to date.
 */
export const rating = {
  value: 4.9,
  count: '300+',
  label: 'customers'
};

/**
 * REAL reviews only, copied word for word. Never edit what a customer wrote or invent one.
 * `title` is a quote taken from the review itself.
 * name: use what the review shows (e.g. 'S***n'); otherwise 'Verified buyer'.
 */
export const reviews: SalesReview[] = [
  {
    name: 'Verified buyer',
    detail: 'Size XL',
    rating: 5,
    title: '“Equal or possibly better than the bigger brand knee sleeves”',
    body: "Very good quality. they provide great support while lifting heavy. i'd say these are equal or possibly better than the bigger brand knee sleeves i've used in the past. the rubber grip at the top really helps keep them in place. definitely recommend so far.",
    verified: true
  },
  {
    name: 'S***n',
    detail: 'Size M · Nov 2025',
    rating: 5,
    title: '“You can notice the 7 mm of neoprene”',
    body: 'Fast shipping, good quality, you can notice the 7 mm of neoprene.',
    verified: true
  },
  {
    name: 'Verified buyer',
    detail: 'Size M',
    rating: 5,
    title: '“Excellent product!”',
    body: 'Excellent product! It meets the need for knee stability well. I am buying another one with larger measurements to use for a longer time without affecting blood circulation. Pay close attention to the measurements when purchasing. The product fits well and has a natural feel to the material. Congratulations to the seller and manufacturer!!',
    verified: true
  }
];

/** Real customer photos (in /public/reviews). Only use photos you have permission to show. */
export const customerPhotos = [
  {
    src: '/reviews/customer-1.jpg',
    alt: 'Customer photo: the sleeve worn on the knee',
    width: 443,
    height: 960
  },
  {
    src: '/reviews/customer-2.jpg',
    alt: 'Customer photo: the pair of sleeves as delivered',
    width: 720,
    height: 960
  }
];

export const reviewsSection = {
  title: "You're Not Alone. | Reviews From Lifters Like You.",
  photosLabel: 'Customer photo',
  // TODO: if these reviews and the rating come from the manufacturer's marketplace listing,
  // keep this line so shoppers know where they come from.
  note: 'Reviews and photos from verified buyers of this sleeve.'
};

/** Short review quote shown in the buy box, right under the button. */
export const buyBoxQuote = {
  text: '…equal or possibly better than the bigger brand knee sleeves i’ve used in the past.',
  author: 'Verified buyer, Size XL'
};

/* ------------------------------------------------------------------ */
/* EDUCATION                                                           */
/* ------------------------------------------------------------------ */

export const bigIdea = {
  kicker: 'Why heavy days start feeling shaky',
  title: "Your Sleeves Didn't Stop Working.",
  titleAccent: 'They Died.',
  image: '/carousel/03-before-after.jpg',
  imageAlt: 'Worn-out old sleeves vs. KNEETIC 7mm sleeves',
  body: [
    'Most lifters blame their knees, their age or their form when heavy squats start feeling shaky. Often the real culprit is dead neoprene.',
    "Every time you yank a sleeve over your calf and squat deep, cheap material stretches a little and doesn't fully come back. You don't notice it day to day. You just notice the walkout feels less solid."
  ],
  stages: [
    { when: 'Day 1', what: 'Snug and locked in. Warm by your second set.' },
    { when: 'Week 4', what: 'Goes on easier than it should. Holds less heat.' },
    { when: 'Week 8', what: 'Slides down, bunches behind the knee, splits at the seam.' }
  ],
  footnote:
    "We call it Compression Fade, and it's one of the most common complaints in knee sleeve reviews."
};

export const materials = {
  title: "What's in | Every Pair",
  items: [
    {
      icon: 'layers',
      name: '7mm Neoprene',
      text: 'Dense neoprene traps body heat, so your knees feel warm and ready by your second set.'
    },
    {
      icon: 'curve',
      name: 'Pre-Curved Cut',
      text: 'Follows the natural bend of your knee, so it sits flat instead of bunching behind it.'
    },
    {
      icon: 'medal',
      name: 'Meet-Standard Thickness',
      text: '7mm is the thickest sleeve allowed in raw powerlifting. What serious lifters train in.'
    }
  ]
};

export const science = {
  title: 'What Sleeves Do. | And What They Don’t.',
  dont: ['Fix an injured knee', 'Build strength for you', 'Replace good technique'],
  do: [
    'Keep your knees warm from the first working set',
    'Give firm, even compression',
    'Make heavy sets feel more stable'
  ],
  stat: '94%',
  statText: 'of athletes felt more stable in 7mm neoprene sleeves.',
  // TODO: double-check this source and wording before going live
  statSource:
    'Manchester Metropolitan University, 2024. 17 trained CrossFit athletes wearing 7mm neoprene knee sleeves.'
};

export const howToUse = {
  title: 'How to Put Them On | (Without the Fight)',
  steps: [
    {
      title: 'Fold the top half down',
      text: 'Turn the upper half of the sleeve inside out over the lower half.'
    },
    {
      title: 'Slide it over your calf',
      text: 'Pull it up until the fold sits just below your kneecap.'
    },
    {
      title: 'Roll the top half up',
      text: 'Unfold it up over your knee and onto your lower thigh.'
    },
    {
      title: 'Center it on the kneecap',
      text: 'Smooth out wrinkles behind the knee. Snug, not strangling.'
    }
  ],
  /** Optional short looping clips per step, e.g. '/howto/step1.mp4' (muted, plays inline). */
  media: [] as string[]
};

export const whoFor = {
  title: 'Built for Lifters | Who Train Heavy',
  cards: [
    {
      icon: 'barbell',
      title: 'The Serious Lifter',
      text: 'Chasing 315, 405 or a first meet. You want gear that is legit on your heaviest single.'
    },
    {
      icon: 'clock',
      title: 'The 35+ Lifter',
      text: 'Years under the bar and not done yet. Warm, locked-in knees so you keep training hard.'
    },
    {
      icon: 'bolt',
      title: 'The CrossFitter',
      text: 'High volume, lots of squats. Support that lasts the whole session.'
    },
    {
      icon: 'dumbbell',
      title: 'The Gym Rat',
      text: 'Not a powerlifter, but you squat and leg press heavy and want to feel solid.'
    }
  ],
  note: 'Recovering from a knee injury? Talk to a physician or physical therapist first. Sleeves are training gear, not treatment.'
};

export const comparison = {
  title: 'Stuck Between “Will Rip” | and “Overpriced”?',
  columns: ['Budget', 'Premium', 'KNEETIC'],
  rows: [
    // values: [budget, premium, kneetic] -> 'yes' | 'no' | 'varies' | any text. '{price}' = Swell price.
    { label: 'Price per pair', values: ['<$25', '$80–130+', '{price}'] },
    { label: 'Real 7mm neoprene', values: ['varies', 'yes', 'yes'] },
    { label: 'Pre-curved fit', values: ['varies', 'yes', 'yes'] },
    { label: '30-day refund, even if worn', values: ['no', 'varies', 'yes'] },
    { label: 'Clear sizing help', values: ['no', 'varies', 'yes'] }
  ],
  note: 'Based on typical products in each price range. Check individual brands for their exact terms.'
};

export const timeline = {
  title: 'What to | Expect',
  items: [
    {
      when: 'First session',
      text: 'Knees feel warm by your second set. The walkout feels more solid.'
    },
    {
      when: 'First week',
      text: 'Pulling them on becomes your heavy-day ritual. The switch flips before the top set.'
    },
    { when: 'Day 30', text: 'Still snug, still locked in. If not, you get your money back.' }
  ]
};

export const roadmap = {
  title: 'Your Next Heavy Day, | Sorted',
  steps: [
    { title: 'Measure your knee', text: '30 seconds, mid-kneecap, leg straight.' },
    { title: 'Pick your size', text: 'Match it to the size guide. Unsure? Email us.' },
    { title: 'Squat your next heavy day', text: 'Sleeves on, belt on, walk it out.' },
    { title: 'Decide within 30 days', text: 'Keep them, or send them back for a full refund.' }
  ]
};

/** Optional authority block. Only enable with a REAL person and REAL credentials. */
export const founder = {
  enabled: false,
  name: '', // e.g. 'Alex M., founder'
  credential: '', // e.g. 'Competitive powerlifter, 600 lb squat'
  photo: '', // e.g. '/founder.jpg' in /public
  quote: ''
};

export const moreFaqs = [
  {
    q: 'Are they competition legal?',
    a: "They're 7mm thick, the maximum allowed for raw sleeves in the IPF. Federations keep their own approved gear lists, so check yours before a meet."
  },
  {
    q: 'Should I wear them for every set?',
    a: 'Most lifters save them for heavy days and working sets, like a belt. Warm-ups without them are fine.'
  },
  {
    q: 'Will I become dependent on them?',
    a: "Sleeves are gear, like a belt or lifting shoes. They don't replace strength or technique. Use them on heavy days and keep training the basics."
  },
  {
    q: 'How do I wash them?',
    a: 'Rinse in cool water after sweaty sessions and let them air-dry. Never put neoprene in the dryer; heat breaks it down.'
  },
  {
    q: 'Do they work for women?',
    a: 'Yes. Sizing is based on knee circumference, not gender. Measure and match it to the size guide.'
  },
  {
    q: 'Is one order one sleeve or two?',
    a: 'Every order is a pair: two sleeves, one for each knee.'
  },
  {
    q: 'How does the money-back guarantee work?',
    a: `Email us within 30 days of delivery at ${brand.supportEmail} and we'll send return instructions. Once the sleeves are back, you get a full refund.`
  }
];

/* ------------------------------------------------------------------ */
/* FINAL OFFER + URGENCY                                               */
/* ------------------------------------------------------------------ */

export const finalOffer = {
  title: 'Your Next Heavy Day | Is Coming.',
  subtitle: 'Walk it out in sleeves that are still locked in, or get your money back.'
};

/**
 * Urgency, OFF by default. Only switch on what is true.
 * - launchPriceEndsAt: ISO date/time your launch price really ends. Shows a live countdown.
 * - lowStockThreshold: "Only X pairs left" when Swell stock tracking is on and stock is at/below this.
 * - shippingNote: e.g. 'Order by 2 pm EST, ships same day', only if you actually do that.
 */
export const urgency = {
  launchPriceEndsAt: '', // e.g. '2026-11-15T23:59:00-05:00'
  launchPriceLabel: 'Launch price ends in',
  lowStockThreshold: 25,
  shippingNote: ''
};

export const footer = {
  disclaimer:
    'KNEETIC knee sleeves are training gear, not a medical device. They are not intended to diagnose, treat, cure or prevent any injury or medical condition. If you have a knee injury or pain, consult a qualified medical professional.',
  // Policy pages live in lib/policies.ts
  links: [
    { label: 'Shipping', href: '/policies/shipping' },
    { label: 'Returns & Refunds', href: '/policies/refunds' },
    { label: 'Privacy', href: '/policies/privacy' },
    { label: 'Terms', href: '/policies/terms' }
  ]
};

/**
 * Size guide. Fill in with the measurements from YOUR supplier's size chart.
 * The table stays hidden until rows are added, so customers never see made-up numbers.
 */
export const sizeGuide = {
  title: 'Find Your Size',
  howTo: [
    'Stand with your leg straight and relaxed.',
    'Wrap a soft tape measure around the middle of your kneecap.',
    'Match the number to the chart. 7mm sleeves should feel snug, not strangling.'
  ],
  rows: [] as { size: string; cm: string; inches: string }[]
  // e.g. { size: 'M', cm: '34–37 cm', inches: '13.4–14.6 in' },
};
