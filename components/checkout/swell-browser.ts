/**
 * Thin, typed wrapper around Swell's official browser SDK (swell-js).
 *
 * swell-js does the security-critical parts: it loads Stripe.js, turns the card into a Stripe
 * payment method, creates the payment intent, shows the bank's 3-D Secure check when needed and
 * attaches the payment to the cart. Card numbers never touch our server.
 */

export type SwellAddress = {
  name?: string;
  first_name?: string;
  last_name?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  phone?: string;
};

export type SwellOptionValue = { name?: string; value?: string };

export type SwellItem = {
  id: string;
  product_id?: string;
  variant_id?: string;
  quantity: number;
  price: number;
  price_total: number;
  orig_price?: number;
  options?: SwellOptionValue[];
  product?: { name?: string; images?: { file?: { url?: string } }[] };
  variant?: { name?: string };
};

export type SwellShippingService = {
  id: string;
  name: string;
  price: number;
  description?: string;
};

type Totals = {
  currency?: string;
  sub_total?: number;
  shipment_total?: number;
  tax_total?: number;
  discount_total?: number;
  grand_total?: number;
};

export type SwellCart = Totals & {
  id?: string;
  checkout_id?: string;
  items?: SwellItem[];
  coupon?: { code?: string; name?: string } | null;
  coupon_code?: string;
  shipping?: SwellAddress & { service?: string; service_name?: string };
  billing?: SwellAddress;
  shipment_rating?: { services?: SwellShippingService[]; errors?: unknown } | null;
  account?: { email?: string; email_optin?: boolean } | null;
};

export type SwellOrder = Totals & {
  id?: string;
  number?: string | number;
  items?: SwellItem[];
  shipping?: SwellAddress & { service_name?: string };
  account?: { email?: string } | null;
  billing?: SwellAddress & { card?: { brand?: string; last4?: string } };
  date_created?: string;
};

type PaymentParams = Record<string, any>;

export type SwellBrowser = {
  init(storeId: string, publicKey: string, options?: Record<string, unknown>): void;
  cart: {
    recover(checkoutId: string): Promise<any>;
    get(): Promise<any>;
    update(data: Record<string, unknown>): Promise<any>;
    updateItem(id: string, item: Record<string, unknown>): Promise<any>;
    applyCoupon(code: string): Promise<any>;
    removeCoupon(): Promise<any>;
    getShippingRates(): Promise<any>;
    submitOrder(): Promise<any>;
    getOrder(checkoutId?: string): Promise<any>;
  };
  payment: {
    createElements(params: PaymentParams): Promise<void>;
    tokenize(params?: PaymentParams): Promise<void>;
  };
  settings: { payments(): Promise<any> };
};

let instance: Promise<SwellBrowser> | null = null;

/** Loads swell-js once (in the browser only) and connects it to the store. */
export function loadSwell(storeId: string, publicKey: string): Promise<SwellBrowser> {
  if (!instance) {
    instance = import('swell-js').then((mod: any) => {
      const swell = (mod.default ?? mod) as SwellBrowser;
      swell.init(storeId, publicKey, { useCamelCase: false });
      return swell;
    });
    // Let a later call try again if loading failed (e.g. flaky mobile connection).
    instance.catch(() => {
      instance = null;
    });
  }
  return instance;
}

/**
 * Swell answers problems in two ways: { errors: { field: { message } } } or { error: { message } }.
 * Returns a readable message, or null when the result is fine.
 */
export function swellError(result: any): string | null {
  if (!result) return 'No response from the store. Please try again.';
  if (result.error) {
    return typeof result.error === 'string'
      ? result.error
      : String(result.error.message || 'Something went wrong.');
  }
  if (result.errors && typeof result.errors === 'object') {
    const first = Object.keys(result.errors)
      .map((key) => result.errors[key])
      .find(Boolean);
    if (first) return typeof first === 'string' ? first : String(first.message || 'Invalid data.');
  }
  return null;
}

/** Turns a thrown error (Stripe, network, Swell) into a message a shopper understands. */
export function errorMessage(error: unknown): string {
  const raw =
    error && typeof error === 'object' && 'message' in error
      ? String((error as { message: unknown }).message)
      : typeof error === 'string'
        ? error
        : '';
  if (!raw) return 'Something went wrong. Please try again.';
  if (/failed to fetch|network/i.test(raw)) {
    return 'Connection problem. Check your internet and try again.';
  }
  return raw;
}
