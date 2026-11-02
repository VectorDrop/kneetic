import type { PriceRule, SalesProduct, SalesVariant } from './sales-types';

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

export function findVariant(product: SalesProduct, selection: Selection): SalesVariant | undefined {
  const chosen = selectedValueIds(selection);
  return product.variants.find(
    (v) => v.optionValueIds.length > 0 && v.optionValueIds.every((id) => chosen.indexOf(id) !== -1)
  );
}

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
  const variant = findVariant(product, selection);
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

/** Totals for buying `qty` pairs: what they pay, and what it would cost without the multi-pair price. */
export function totalFor(product: SalesProduct, selection: Selection, qty: number) {
  const single = unitPrice(product, selection, 1).price;
  const unit = unitPrice(product, selection, qty).price;
  if (single === null || unit === null) return { total: null, regular: null, saving: 0 };
  const total = Math.round(unit * qty * 100) / 100;
  const regular = Math.round(single * qty * 100) / 100;
  return { total, regular, saving: Math.max(0, Math.round((regular - total) * 100) / 100) };
}

/** Stock for the current selection, or null when Swell isn't tracking stock. */
export function stockFor(product: SalesProduct, selection: Selection): number | null {
  if (!product.stockTracking) return null;
  const variant = findVariant(product, selection);
  return variant?.stockLevel ?? product.stockLevel;
}

export const isSizeOption = (name: string) => /size|größe|groesse|taille/i.test(name);
