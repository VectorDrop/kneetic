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
    'The knee sleeves serious lifters switch to when cheap pairs die and premium prices sting. 7mm neoprene, pre-curved fit, 30-day money-back guarantee.'
};

export const announcement = 'Free US Shipping · 30-Day Money-Back Guarantee';

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
    'Stop wondering if your knees will hold up on the walkout. Feel locked in from the first working set — or send them back within 30 days for a full refund.',
  benefits: [
    // Benefit-first: what they FEEL, not what the product IS
    { icon: 'flame', strong: 'Warm and ready', rest: ' before your first working set — no more stiff, cold knees on set one' },
    { icon: 'lock', strong: 'Feel locked in on the walkout', rest: ' — the kind of confidence that lets you stop thinking about your knees and start thinking about the lift' },
    { icon: 'layers', strong: 'Thick enough to feel the difference', rest: ' — 7mm neoprene that stays snug after months of heavy squats, not weeks' },
    { icon: 'curve', strong: 'Shaped for a bent knee', rest: ' — sits flat behind the joint, no bunching, no sliding, no readjusting mid-set' }
  ]
};

export const buyBox = {
  ctaLabel: 'Get My Sleeves',
  quantityLabel: 'How many pairs?',
  /**
   * If your Swell product has a pack option (e.g. "1 Pair" / "2 Pairs" as variants), its values are
   * shown as these tiles automatically, with prices from Swell. The notes below are matched by the
   * number of pairs. `quantities` is only used when there is no pack option.
   */
  packNotes: { 1: 'For your heavy days', 2: 'One for the gym bag, one for meet day' } as Record<number, string>,
  quantities: [
    { qty: 1, label: '1 Pair', note: 'For your heavy days' },
    { qty: 2, label: '2 Pairs', note: 'One for the gym bag, one for meet day' }
  ],
  trust: ['Secure checkout', '30-day money-back guarantee', 'Ships in 5–10 days']
};

export const guarantee = {
  title: '30-Day Money-Back Guarantee',
  // IMPORTANT: "even if you've worn them" must match your actual return policy. Change it if not.
  body: "Squat in them for a full training cycle. If they don't feel locked in on every heavy set, send them back for a full refund — even if you've worn them. No hoops, no hassle."
};

/** Objection handlers right under the buy box. */
export const heroFaqs = [
  {
    q: 'What size should I get?',
    a: "Measure around the middle of your kneecap with your leg straight and relaxed, then match it to the size guide. They should feel snug when you first pull them on — that's normal for 7mm. If the fit isn't right, you're covered by the 30-day guarantee."
  },
  {
    q: '5mm or 7mm?',
    a: 'If you squat heavy or train for strength, 7mm. It’s the thickest sleeve allowed in raw powerlifting and gives the firmest compression. 5mm is built for high-rep, high-movement work like metcons and WODs.'
  },
  {
    q: 'Are 7mm sleeves hard to put on?',
    a: 'The first time, they feel tight. That’s by design. Fold the top half down, slide it over your calf, roll it up over the knee. After two or three sessions, it takes seconds. See "How to put them on" below.'
  },
  {
    q: 'What if they stretch out or rip?',
    a: "That's exactly why the risk is on us, not you. Train in them for 30 days. If the compression fades or they don't hold up, send them back for a full refund. No questions."
  },
  {
    q: 'Do knee sleeves actually do anything?',
    a: "They won't fix your knees, and anyone promising that is selling you something. What they will do: keep your joints warm from the first working set, give firm, even compression around the knee, and make heavy squats feel more stable and confident. In a 2024 study, 94% of athletes reported feeling more stable in 7mm sleeves."
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
  label: 'verified lifters'
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
    title: '"Equal or possibly better than the bigger brand knee sleeves"',
    body: "Very good quality. they provide great support while lifting heavy. i'd say these are equal or possibly better than the bigger brand knee sleeves i've used in the past. the rubber grip at the top really helps keep them in place. definitely recommend so far.",
    verified: true
  },
  {
    name: 'S***n',
    detail: 'Size M · Nov 2025',
    rating: 5,
    title: '"You can notice the 7 mm of neoprene"',
    body: 'Fast shipping, good quality, you can notice the 7 mm of neoprene.',
    verified: true
  },
  {
    name: 'Verified buyer',
    detail: 'Size M',
    rating: 5,
    title: '"Excellent product!"',
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
  title: "Don't Take Our Word for It. | Hear It From Lifters Like You.",
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
  kicker: 'The real reason heavy days start feeling shaky',
  title: "Your Sleeves Didn't Stop Working.",
  titleAccent: 'They Died.',
  image: '/carousel/03-before-after.jpg',
  imageAlt: 'Worn-out old sleeves vs. KNEETIC 7mm sleeves',
  body: [
    "You add weight to the bar, unrack it, and something feels off. The walkout isn't solid. The hole doesn't feel as confident. Most lifters blame their knees, their age, or their form. But often the real culprit is sitting right below the kneecap: dead neoprene.",
    "Every time you yank a sleeve over your calf and squat deep, cheap material stretches a little — and doesn't fully come back. You don't notice it day to day. You just notice the bar feels heavier than it should on the walkout. You start second-guessing sets you used to own.",
    "That's not your knees getting older. That's your sleeves getting weaker."
  ],
  stages: [
    { when: 'Day 1', what: 'Snug and locked in. Warm before your first working set.' },
    { when: 'Week 4', what: 'Goes on easier than it should. Holds less heat. You start pulling them up between sets.' },
    { when: 'Week 8', what: 'Slides down mid-squat, bunches behind the knee, splits at the seam. Time to throw them away — again.' }
  ],
  footnote:
    "We call it Compression Fade. It's the #1 complaint in knee sleeve reviews — and the reason most lifters are on their third or fourth pair."
};

export const materials = {
  title: "What's in | Every Pair",
  items: [
    {
      icon: 'layers',
      name: 'Dense 7mm Neoprene',
      text: 'Traps body heat fast, so your knees feel warm and ready before your first working set — not your third. Stays snug after months of heavy training, not just weeks.'
    },
    {
      icon: 'curve',
      name: 'Pre-Curved Cut',
      text: 'Shaped to fit a bent knee, not a straight pipe. Sits flat behind the joint — no bunching, no sliding, no pulling them up between sets.'
    },
    {
      icon: 'medal',
      name: 'Meet-Legal Thickness',
      text: '7mm is the thickest sleeve allowed in raw powerlifting. The same thickness serious lifters trust on meet day — and train in every heavy session.'
    }
  ]
};

export const science = {
  title: "What Sleeves Do. | And What They Don't.",
  dont: ['Fix an injured knee', 'Build strength for you', 'Replace good technique'],
  do: [
    'Keep your knees warm from the first working set — no more cold, stiff joints on heavy days',
    'Give firm, even compression that makes the walkout feel solid',
    'Help you stop thinking about your knees and start thinking about the lift'
  ],
  stat: '94%',
  statText: 'of athletes reported feeling more stable in 7mm neoprene sleeves.',
  // TODO: double-check this source and wording before going live
  statSource:
    'Manchester Metropolitan University, 2024. 17 trained CrossFit athletes wearing 7mm neoprene knee sleeves.'
};

export const howToUse = {
  title: 'How to Put Them On | (Without the Fight)',
  steps: [
    {
      title: 'Fold the top half down',
      text: 'Turn the upper half of the sleeve inside out over the lower half. This is the trick that makes 7mm sleeves easy.'
    },
    {
      title: 'Slide it over your calf',
      text: 'Pull it up until the fold sits just below your kneecap. Snug is normal — that’s the compression doing its job.'
    },
    {
      title: 'Roll the top half up',
      text: 'Unfold it up over your knee and onto your lower thigh. Two or three sessions and this takes seconds.'
    },
    {
      title: 'Center it on the kneecap',
      text: 'Smooth out wrinkles behind the knee. You should feel snug, locked in, and ready to squat — not strangled.'
    }
  ],
  /** Optional short looping clips per step, e.g. '/howto/step1.mp4' (muted, plays inline). */
  media: [] as string[]
};

export const whoFor = {
  title: 'Built for Lifters | Who Refuse to Go Light',
  cards: [
    {
      icon: 'barbell',
      title: 'Chasing a PR',
      text: "Working toward 315, 405, or your first meet. You need gear that doesn't quit on you before you quit on the set."
    },
    {
      icon: 'clock',
      title: '35+ and Still Under the Bar',
      text: "Years of training behind you, and you're not done. Warm, locked-in knees so your heavy days feel like they used to."
    },
    {
      icon: 'bolt',
      title: 'WODs and Heavy Metcons',
      text: 'High volume, constant squatting, and no time to readjust your gear. Sleeves that stay put from the first rep to the last.'
    },
    {
      icon: 'dumbbell',
      title: 'You Just Squat Heavy',
      text: "You're not a powerlifter, but leg day is sacred. You squat, you leg press, and you want your knees to feel solid doing it."
    }
  ],
  note: 'Recovering from a knee injury? Talk to a physician or physical therapist first. Sleeves are training gear, not treatment.'
};

export const comparison = {
  title: 'Stuck Between "Will Rip" | and "Overpriced"?',
  columns: ['Budget', 'Premium', 'KNEETIC'],
  rows: [
    // values: [budget, premium, kneetic] -> 'yes' | 'no' | 'varies' | any text. '{price}' = Swell price.
    { label: 'Price per pair', values: ['<$25', '$80–130+', '{price}'] },
    { label: 'Real 7mm neoprene', values: ['varies', 'yes', 'yes'] },
    { label: 'Pre-curved fit', values: ['varies', 'yes', 'yes'] },
    { label: 'Lasts 6+ months of heavy use', values: ['no', 'yes', 'yes'] },
    { label: '30-day refund, even if worn', values: ['no', 'varies', 'yes'] },
    { label: 'Clear sizing help before you buy', values: ['no', 'varies', 'yes'] }
  ],
  note: 'Based on typical products in each price range. Check individual brands for their exact terms.'
};

export const timeline = {
  title: 'What to | Expect',
  items: [
    {
      when: 'First session',
      text: 'Knees feel warm before your first working set. The walkout feels more solid than it has in months.'
    },
    {
      when: 'First week',
      text: 'Pulling them on becomes the ritual that flips the switch. You stop thinking about your knees and start thinking about the lift.'
    },
    { when: 'Day 30', text: 'Still snug. Still locked in. Same compression as day one. If not — full refund, no questions.' }
  ]
};

export const roadmap = {
  title: 'Your Next Heavy Day, | Sorted in 4 Steps',
  steps: [
    { title: 'Measure your knee', text: '30 seconds, mid-kneecap, leg straight. That’s all you need.' },
    { title: 'Pick your size', text: 'Match it to the size guide. Between sizes or unsure? Email us before you order — we’ll help.' },
    { title: 'Squat your next heavy day', text: 'Sleeves on, belt on, walk it out. Feel the difference from the first working set.' },
    { title: 'Decide within 30 days', text: 'Keep them, or send them back for a full refund. The risk is on us, not you.' }
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
    a: 'Most lifters save them for working sets and heavy days, the same way you use a belt. Warming up without them is fine and lets your joints work through a full range first.'
  },
  {
    q: 'Will I become dependent on them?',
    a: "No more than you'd become dependent on a belt or lifting shoes. They're gear, not a crutch. Use them on heavy days, keep training the basics, and take them off when you don't need them."
  },
  {
    q: 'How do I wash them?',
    a: 'Rinse in cool water after sweaty sessions and let them air-dry completely. Never put neoprene in the dryer — heat breaks down the material and kills the compression faster than anything else.'
  },
  {
    q: 'Do they come in women’s sizes?',
    a: 'Sizing is based on knee circumference, not gender. Measure and match it to the size guide — it works the same for everyone.'
  },
  {
    q: 'Is one order one sleeve or two?',
    a: 'Every order is a pair: two sleeves, one for each knee.'
  },
  {
    q: 'What if they don’t fit right?',
    a: `Email us within 30 days of delivery at ${brand.supportEmail} and we'll send return instructions. Once the sleeves are back, you get a full refund — even if you've worn them.`
  },
  {
    q: 'How long until they arrive?',
    a: 'Most US orders arrive in 5–10 days. You’ll get a tracking number as soon as they ship.'
  }
];

/* ------------------------------------------------------------------ */
/* FINAL OFFER + URGENCY                                               */
/* ------------------------------------------------------------------ */

export const finalOffer = {
  title: 'Your Next Heavy Day | Is Coming.',
  subtitle: 'You can walk it out in sleeves that are still locked in 6 months from now — or keep second-guessing the ones you have. Try them risk-free for 30 days.'
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
