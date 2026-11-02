import type { PriceRule, SalesOption, SalesProduct, SalesVariant } from './sales-types';

export function formatMoney(amount: number | null, currency = 'USD'): string {
  if (amount === null) return '';
  const whole = Math.abs(amount % 1) < 0.005;
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: whole ? 0 : 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch {
    return `${amount.toFixed(whole ? 0 : 2)} ${currency}`;
  }
}

/** selection: optionId -> valueId */
export type Selection = Record<string, string>;

function selectedValueIds(selection: Selection): string[] {
  return Object.keys(selection)
    .map((key) => selection[key])
    .filter((v): v is string => typeof v === 'string');
}

/** The variant that matches every chosen variant option exactly (e.g. Color + Size + Pack). */
export function findVariant(product: SalesProduct, selection: Selection): SalesVariant | undefined {
  const chosen = selectedValueIds(selection);
  return product.variants.find(
    (v) => v.optionValueIds.length > 0 && v.optionValueIds.every((id) => chosen.indexOf(id) !== -1)
  );
}

/**
 * Like findVariant, but works before every option is picked (e.g. no size yet):
 * returns the first variant that contains all values chosen so far. Used for prices only.
 */
function findVariantLoose(product: SalesProduct, selection: Selection): SalesVariant | undefined {
  const variantValueIds: string[] = [];
  product.options
    .filter((o) => o.variant)
    .forEach((o) => o.values.forEach((v) => variantValueIds.push(v.id)));
  const chosen = selectedValueIds(selection).filter((id) => variantValueIds.indexOf(id) !== -1);
  return product.variants.find((v) => chosen.every((id) => v.optionValueIds.indexOf(id) !== -1));
}

/** Number of pairs in a pack value name like "2 Pairs" or "2x" (defaults to 1). */
export function packCount(valueName: string): number {
  const m = valueName.match(/\d+/);
  const n = m ? parseInt(m[0], 10) : 1;
  return n > 0 ? n : 1;
}

/**
 * The option that sells several pairs as its own variant in Swell (e.g. "1 Pair" / "2 Pairs").
 * Detected by its name (Pack, Pairs, Quantity, Bundle...) or by values that all start with a number.
 */
export function packOption(product: SalesProduct): SalesOption | undefined {
  return product.options.find(
    (o) =>
      o.values.length > 1 &&
      (/pack|pair|paar|quantity|qty|bundle|menge|amount/i.test(o.name) ||
        o.values.every((v) => /^\s*\d+/.test(v.name)))
  );
}

/** Pack values sorted from fewest to most pairs. */
export function packValues(pack: SalesOption) {
  return pack.values.slice().sort((a, b) => packCount(a.name) - packCount(b.name));
}

const withValue = (selection: Selection, optionId: string, valueId: string): Selection => ({
  ...selection,
  [optionId]: valueId
});

/** The Swell price rule that applies to this quantity (the most specific one wins). */
function ruleFor(rules: PriceRule[], qty: number): PriceRule | undefined {
  return rules
    .filter((r) => qty >= r.min && (r.max === null || qty <= r.max))
    .sort((a, b) => b.min - a.min)[0];
}

/**
 * Unit price for the current selection and quantity:
 * variant price (or a Swell quantity price rule when one applies), plus add-on option prices.
 */
export function unitPrice(product: SalesProduct, selection: Selection, qty = 1) {
  const variant = findVariant(product, selection) ?? findVariantLoose(product, selection);
  const rules = variant && variant.priceRules.length ? variant.priceRules : product.priceRules;
  const rule = ruleFor(rules, qty);
  let price = rule?.price ?? variant?.price ?? product.price;
  let orig = variant?.origPrice ?? product.origPrice;
  if (price === null) return { price: null, orig: null };

  product.options.forEach((opt) => {
    const value = opt.values.find((v) => v.id === selection[opt.id]);
    if (!value || !value.price) return;
    // Variant options already carry their price in the variant record when one exists.
    if (opt.variant && variant?.price != null) return;
    price = (price ?? 0) + value.price;
    if (orig !== null) orig += value.price;
  });

  return { price, orig: orig !== null && price !== null && orig > price ? orig : null };
}

/** Price of ONE pair for the current selection (uses the 1-pair pack when there is a pack option). */
export function singlePairPrice(product: SalesProduct, selection: Selection) {
  const pack = packOption(product);
  const base = pack ? packValues(pack)[0] : undefined;
  return unitPrice(product, pack && base ? withValue(selection, pack.id, base.id) : selection, 1);
}

type Totals = { total: number | null; regular: number | null; saving: number };

const round = (n: number) => Math.round(n * 100) / 100;

/**
 * Totals for an offer: either a pack value from Swell (pass `packValueId`) or `qty` pairs.
 * total = what they pay; regular = the same number of single pairs; saving = the difference.
 */
export function totalFor(
  product: SalesProduct,
  selection: Selection,
  qty: number,
  packValueId?: string
): Totals {
  const single = singlePairPrice(product, selection).price;
  const pack = packOption(product);
  if (pack) {
    const value = pack.values.find((v) => v.id === (packValueId ?? selection[pack.id]));
    if (!value || single === null) return { total: null, regular: null, saving: 0 };
    const total = unitPrice(product, withValue(selection, pack.id, value.id), 1).price;
    if (total === null) return { total: null, regular: null, saving: 0 };
    const regular = round(single * packCount(value.name));
    return { total: round(total), regular, saving: Math.max(0, round(regular - total)) };
  }
  const unit = unitPrice(product, selection, qty).price;
  if (single === null || unit === null) return { total: null, regular: null, saving: 0 };
  const total = round(unit * qty);
  const regular = round(single * qty);
  return { total, regular, saving: Math.max(0, round(regular - total)) };
}

/** Stock for the current selection, or null when Swell isn't tracking stock. */
export function stockFor(product: SalesProduct, selection: Selection): number | null {
  if (!product.stockTracking) return null;
  const variant = findVariant(product, selection);
  return variant?.stockLevel ?? product.stockLevel;
}

export const isSizeOption = (name: string) => /size|größe|groesse|taille/i.test(name);
