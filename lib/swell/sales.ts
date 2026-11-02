/**
 * Swell data for the sales page.
 *
 * Uses its own GraphQL client per request (instead of the shared client in ./index.ts), so a
 * shopper's cart session can never leak into another shopper's request.
 */
import { GraphQLClient } from 'graphql-request';
import { SWELL_GRAPHQL_API_ENDPOINT, TAGS } from 'lib/constants';
import { salesFallbackImages } from 'lib/sales-content';
import { packCount, packOption } from 'lib/sales-pricing';
import { revalidateTag } from 'next/cache';
import type {
  BuyOptionInput,
  PriceRule,
  SalesImage,
  SalesOption,
  SalesProduct,
  SalesVariant
} from 'lib/sales-types';

/** Optional: slug of the product to sell. If empty, the first product in your store is used. */
const PRODUCT_SLUG = process.env.SWELL_SALES_PRODUCT_SLUG || '';

const PRODUCT_FIELDS = `
  id
  name
  slug
  currency
  price
  origPrice
  sale
  salePrice
  stockTracking
  stockLevel
  prices {
    price
    quantityMin
    quantityMax
    accountGroup
  }
  images {
    caption
    file {
      url
      width
      height
    }
  }
  options {
    id
    name
    active
    required
    variant
    values {
      id
      name
      price
    }
  }
  variants {
    results {
      id
      optionValueIds
      price
      origPrice
      stockLevel
      prices {
        price
        quantityMin
        quantityMax
        accountGroup
      }
    }
  }
`;

const PRODUCT_BY_SLUG = `query salesProductBySlug($slug: String!) {
  productBySlug(slug: $slug) { ${PRODUCT_FIELDS} }
}`;

const FIRST_PRODUCT = `query salesFirstProduct {
  products(limit: 1) { results { ${PRODUCT_FIELDS} } }
}`;

const BUY_NOW = `mutation salesBuyNow($productId: ID!, $quantity: Int!, $options: [SwellCartItemOptionInput]) {
  addCartItem(input: { productId: $productId, quantity: $quantity, options: $options }) {
    checkoutUrl
  }
}`;

type Mode = 'product' | 'fresh' | 'cart';

function swellClient(mode: Mode): GraphQLClient | null {
  const storeId = process.env.SWELL_STORE_ID;
  const key = process.env.SWELL_PUBLIC_KEY;
  if (!storeId || !key) return null;

  return new GraphQLClient(`https://${storeId}.swell.store${SWELL_GRAPHQL_API_ENDPOINT}`, {
    headers: { Authorization: key },
    // Product data: cached for 1 minute and cleared by your Swell revalidation webhook.
    // 'fresh' (used by checkout) and cart calls are never cached. No X-Session header is sent,
    // so every order starts a fresh cart.
    fetch: (input: RequestInfo | URL, init?: RequestInit) =>
      fetch(
        input,
        mode === 'product'
          ? { ...init, next: { revalidate: 60, tags: [TAGS.products] } }
          : { ...init, cache: 'no-store' }
      )
  });
}

const num = (v: unknown): number | null => {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return typeof n === 'number' && isFinite(n) ? n : null;
};

const str = (v: unknown, fallback = ''): string =>
  typeof v === 'string' || typeof v === 'number' ? String(v) : fallback;

/** Quantity price rules for everyone (rules limited to an account group are ignored). */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const priceRules = (raw: any): PriceRule[] =>
  (Array.isArray(raw) ? raw : [])
    .filter((r) => r && !r.accountGroup && num(r.price) !== null && (num(r.quantityMin) ?? 0) > 1)
    .map((r) => ({
      min: num(r.quantityMin) ?? 1,
      max: num(r.quantityMax),
      price: num(r.price) as number
    }));

function fallbackProduct(): SalesProduct {
  return {
    id: null,
    slug: PRODUCT_SLUG,
    name: 'KNEETIC 7mm Knee Sleeves',
    currency: 'USD',
    price: null,
    origPrice: null,
    images: salesFallbackImages,
    options: [],
    variants: [],
    priceRules: [],
    stockTracking: false,
    stockLevel: null,
    live: false
  };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function normalizeProduct(p: any): SalesProduct {
  const name = str(p?.name, 'KNEETIC 7mm Knee Sleeves');

  // Swell: during a sale `price` is normally already the sale price and `origPrice` the original.
  let price = num(p?.price);
  let origPrice = num(p?.origPrice);
  const salePrice = num(p?.salePrice);
  if (p?.sale && salePrice !== null && (price === null || salePrice < price)) {
    origPrice = origPrice ?? price;
    price = salePrice;
  }
  if (price === null || origPrice === null || origPrice <= price) origPrice = null;

  const images: SalesImage[] = (Array.isArray(p?.images) ? p.images : [])
    .filter((img: any) => typeof img?.file?.url === 'string')
    .map((img: any, i: number) => ({
      src: img.file.url as string,
      alt: str(img.caption) || `${name}, image ${i + 1}`,
      width: num(img.file.width) ?? 1400,
      height: num(img.file.height) ?? 1400
    }));

  const options: SalesOption[] = (Array.isArray(p?.options) ? p.options : [])
    .filter((o: any) => o && o.active !== false && Array.isArray(o.values) && o.values.length > 0)
    .map((o: any) => ({
      id: str(o.id ?? o.name),
      name: str(o.name, 'Option'),
      required: o.required !== false,
      variant: !!o.variant,
      values: o.values
        .filter((v: any) => v && v.name)
        .map((v: any) => ({ id: str(v.id ?? v.name), name: str(v.name), price: num(v.price) ?? 0 }))
    }));

  const rawVariants: any[] = Array.isArray(p?.variants?.results) ? p.variants.results : [];
  const variants: SalesVariant[] = rawVariants.map((v) => ({
    id: str(v?.id),
    optionValueIds: Array.isArray(v?.optionValueIds)
      ? v.optionValueIds.map((x: unknown) => str(x))
      : [],
    price: num(v?.price),
    origPrice: num(v?.origPrice),
    stockLevel: num(v?.stockLevel),
    priceRules: priceRules(v?.prices)
  }));

  return {
    id: p?.id ? str(p.id) : null,
    slug: str(p?.slug, PRODUCT_SLUG),
    name,
    currency: str(p?.currency, 'USD'),
    price,
    origPrice,
    images: images.length ? images : salesFallbackImages,
    options,
    variants,
    priceRules: priceRules(p?.prices),
    stockTracking: !!p?.stockTracking,
    stockLevel: num(p?.stockLevel),
    live: !!p?.id
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Loads the product shown on the sales page. Never throws: falls back to local images. */
export async function getSalesProduct(mode: 'product' | 'fresh' = 'product'): Promise<SalesProduct> {
  const client = swellClient(mode);
  if (!client) {
    console.warn('[sales] SWELL_STORE_ID / SWELL_PUBLIC_KEY missing, showing fallback product.');
    return fallbackProduct();
  }
  try {
    if (PRODUCT_SLUG) {
      const data = await client.request<{ productBySlug: unknown }>(PRODUCT_BY_SLUG, {
        slug: PRODUCT_SLUG
      });
      if (data.productBySlug) return normalizeProduct(data.productBySlug);
      console.warn(
        `[sales] Product "${PRODUCT_SLUG}" not found, trying the first product instead.`
      );
    }
    const data = await client.request<{ products: { results: unknown[] } | null }>(FIRST_PRODUCT);
    const first = data.products?.results?.[0];
    if (first) return normalizeProduct(first);
    console.warn('[sales] No products found in Swell, showing fallback product.');
  } catch (error) {
    console.error('[sales] Failed to load product from Swell:', error);
  }
  return fallbackProduct();
}

/**
 * Matches the shopper's choices to the product as it is in Swell *right now*.
 *
 * The page can be showing slightly older product data (it is cached). If an option was added in
 * Swell since then, e.g. "How many pairs?", the page doesn't send it and Swell rejects the item.
 * This keeps the values that still exist and fills in the rest: the pack option from the number
 * of pairs ordered (quantity becomes 1, since the pack variant already holds the pairs), other
 * required options with their first value.
 */
function repairOrder(
  product: SalesProduct,
  quantity: number,
  options: BuyOptionInput[]
): { quantity: number; options: BuyOptionInput[] } {
  const sent = (name: string) =>
    options.find((o) => o.name.trim().toLowerCase() === name.trim().toLowerCase());
  const pack = packOption(product);
  let qty = quantity;
  const out: BuyOptionInput[] = [];

  for (const option of product.options) {
    const chosen = sent(option.name);
    const match = chosen && option.values.find((v) => v.name === chosen.value);
    if (match) {
      out.push({ name: option.name, value: match.name });
      if (option === pack) qty = 1;
      continue;
    }
    if (option === pack) {
      // Pick the pack with exactly this many pairs; otherwise single pairs x quantity.
      const exact = option.values.find((v) => packCount(v.name) === quantity);
      const single = option.values.find((v) => packCount(v.name) === 1);
      const value = exact ?? single ?? option.values[0];
      if (value) {
        out.push({ name: option.name, value: value.name });
        qty = exact ? 1 : quantity;
      }
      continue;
    }
    if (option.required && option.values[0]) {
      out.push({ name: option.name, value: option.values[0].name });
    }
  }
  return { quantity: qty, options: out };
}

/** Creates a fresh cart with exactly this item and returns Swell's checkout URL. */
export async function createBuyNowCheckout(
  productId: string,
  quantity: number,
  options: BuyOptionInput[]
): Promise<string> {
  const client = swellClient('cart');
  if (!client) throw new Error('Swell is not configured');

  const addToNewCart = async (qty: number, opts: BuyOptionInput[]) => {
    const data = await client.request<{ addCartItem: { checkoutUrl: string | null } | null }>(
      BUY_NOW,
      { productId, quantity: qty, options: opts.length ? opts : undefined }
    );
    const url = data.addCartItem?.checkoutUrl;
    if (!url) throw new Error('Swell returned no checkout URL');
    return url;
  };

  try {
    return await addToNewCart(quantity, options);
  } catch (firstError) {
    // Most likely the page showed outdated product data. Clear the cache so the next visitor
    // sees the current product, then retry once with the options Swell has right now.
    try {
      revalidateTag(TAGS.products);
    } catch {
      // Not fatal: the cache also expires on its own after a minute.
    }
    const fresh = await getSalesProduct('fresh');
    if (!fresh.live || fresh.id !== productId) throw firstError;
    const repaired = repairOrder(fresh, quantity, options);
    console.warn('[sales] Checkout retried with current Swell options:', repaired);
    return addToNewCart(repaired.quantity, repaired.options);
  }
}
