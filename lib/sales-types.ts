export type SalesOptionValue = {
  id: string;
  name: string;
  /** Extra charge Swell adds when this value is chosen (0 if none). */
  price: number;
};

export type SalesOption = {
  id: string;
  name: string;
  required: boolean;
  /** True when this option creates variants (e.g. Size). */
  variant: boolean;
  values: SalesOptionValue[];
};

/** Swell quantity price rule: from `min` pieces (up to `max`), each piece costs `price`. */
export type PriceRule = { min: number; max: number | null; price: number };

export type SalesVariant = {
  id: string;
  optionValueIds: string[];
  price: number | null;
  origPrice: number | null;
  stockLevel: number | null;
  priceRules: PriceRule[];
};

export type SalesImage = { src: string; alt: string; width: number; height: number };

export type SalesProduct = {
  id: string | null;
  slug: string;
  name: string;
  currency: string;
  price: number | null;
  /** "Was" price, only set when it is higher than the current price. */
  origPrice: number | null;
  images: SalesImage[];
  options: SalesOption[];
  variants: SalesVariant[];
  /** Quantity price rules set on the product in Swell (e.g. 2+ pairs at a lower price each). */
  priceRules: PriceRule[];
  stockTracking: boolean;
  stockLevel: number | null;
  /** False when the product couldn't be loaded from Swell and the page shows fallbacks. */
  live: boolean;
};

export type SalesReview = {
  name: string;
  /** e.g. "Powerlifter, 41". Only what the customer told you. */
  detail?: string;
  rating: number;
  title: string;
  body: string;
  /** Optional customer photo in /public (with their permission). */
  photo?: string;
  verified?: boolean;
};

export type BuyOptionInput = { name: string; value: string };
