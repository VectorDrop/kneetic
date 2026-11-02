'use client';

/**
 * KNEETIC one-page checkout (mobile-first).
 *
 * Flow: Swell sends the shopper to /checkout/{checkout_id} -> we recover that cart with swell-js
 * -> contact + address + card on one page -> swell-js tokenizes the card with Stripe -> Swell
 * creates the order -> /checkout/{checkout_id}/thanks.
 *
 * Conversion levers (all honest): one page, few fields, autofill everywhere, the right product
 * photo and savings in the summary, a one-tap upgrade to 2 pairs, free shipping and estimated
 * delivery date, guarantee + real review right next to the pay button, clear error messages.
 */
import clsx from 'clsx';
import { Icon } from 'components/sales/icons';
import { checkoutContent as c, fill } from 'lib/checkout-content';
import { imageIndexFor } from 'lib/sales-content';
import { formatMoney, packCount, packOption, unitPrice, type Selection } from 'lib/sales-pricing';
import type { SalesProduct } from 'lib/sales-types';
import Link from 'next/link';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode
} from 'react';
import { countries, regionField, zipLooksWrong } from './address-data';
import css from './checkout.module.css';
import {
  errorMessage,
  loadSwell,
  swellError,
  type SwellAddress,
  type SwellBrowser,
  type SwellCart,
  type SwellItem
} from './swell-browser';

type Props = {
  checkoutId: string;
  storeId: string;
  publicKey: string;
  product: SalesProduct;
  className?: string;
};

type Address = {
  first_name: string;
  last_name: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
};

type Errors = Record<string, string>;
type Phase = 'loading' | 'ready' | 'expired' | 'unavailable';
type Wallets = { apple: boolean; google: boolean };

const emptyAddress = (country = 'US'): Address => ({
  first_name: '',
  last_name: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  zip: '',
  country,
  phone: ''
});

function fromSwell(a: SwellAddress | undefined, fallbackCountry: string): Address {
  const parts = (a?.name || '').trim().split(' ');
  return {
    first_name: a?.first_name || parts[0] || '',
    last_name: a?.last_name || parts.slice(1).join(' ') || '',
    address1: a?.address1 || '',
    address2: a?.address2 || '',
    city: a?.city || '',
    state: a?.state || '',
    zip: a?.zip || '',
    country: a?.country || fallbackCountry,
    phone: a?.phone || ''
  };
}

function toSwell(a: Address): SwellAddress {
  const t = (v: string) => v.trim();
  return {
    name: `${t(a.first_name)} ${t(a.last_name)}`.trim(),
    first_name: t(a.first_name),
    last_name: t(a.last_name),
    address1: t(a.address1),
    address2: t(a.address2) || undefined,
    city: t(a.city),
    state: t(a.state) || undefined,
    zip: t(a.zip) || undefined,
    country: a.country,
    phone: t(a.phone) || undefined
  };
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validateAddress(prefix: string, a: Address): Errors {
  const e: Errors = {};
  const region = regionField(a.country);
  if (!a.first_name.trim()) e[`${prefix}.first_name`] = 'Enter your first name';
  if (!a.last_name.trim()) e[`${prefix}.last_name`] = 'Enter your last name';
  if (!a.address1.trim()) e[`${prefix}.address1`] = 'Enter your street address';
  if (!a.city.trim()) e[`${prefix}.city`] = 'Enter your city';
  if (region.required && !a.state.trim())
    e[`${prefix}.state`] = `Select your ${region.label.toLowerCase()}`;
  if (region.zipRequired && !a.zip.trim()) e[`${prefix}.zip`] = `Enter your ${region.zipLabel}`;
  else if (a.zip.trim() && zipLooksWrong(a.country, a.zip)) {
    e[`${prefix}.zip`] = `Check your ${region.zipLabel}`;
  }
  return e;
}

/** Field id for an error key like "ship.zip" -> "ship-zip". */
const fieldId = (key: string) => key.replace('.', '-');

function addDays(from: Date, days: number): Date {
  const d = new Date(from.getTime());
  d.setDate(d.getDate() + days);
  return d;
}

const shortDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

/** The cart item's choices as product option ids -> value ids (to look up prices). */
function selectionOf(product: SalesProduct, item: SwellItem): Selection {
  const sel: Selection = {};
  product.options.forEach((opt) => {
    const chosen = (item.options || []).find(
      (o) => (o.name || '').trim().toLowerCase() === opt.name.trim().toLowerCase()
    );
    const value = chosen && opt.values.find((v) => v.name === chosen.value);
    if (value) sel[opt.id] = value.id;
  });
  return sel;
}

/** Waits for swell-js to turn the card into a payment on the cart. */
function tokenizeCard(swell: SwellBrowser): Promise<void> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const ok = () => {
      if (!settled) {
        settled = true;
        resolve();
      }
    };
    const fail = (err: unknown) => {
      if (!settled) {
        settled = true;
        reject(err instanceof Error ? err : new Error(errorMessage(err)));
      }
    };
    swell.payment
      .tokenize({ card: { onSuccess: ok, onError: fail } })
      .then(() => fail(new Error('Card payment is not available right now. Please try again.')))
      .catch(fail);
  });
}

function Stars({ value }: { value: number }) {
  return (
    <span className={css.stars} aria-label={`${value} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Icon
          key={i}
          name="star"
          size={15}
          className={i < Math.round(value) ? css.starOn : css.starOff}
        />
      ))}
    </span>
  );
}

function Field({
  id,
  label,
  error,
  children,
  className
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx(css.field, error && css.fieldError, className)}>
      <label htmlFor={id} className={css.label}>
        {label}
      </label>
      {children}
      {error && (
        <p className={css.error} id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function AddressFields({
  prefix,
  scope,
  value,
  errors,
  onChange,
  onSync
}: {
  prefix: 'ship' | 'bill';
  scope: 'shipping' | 'billing';
  value: Address;
  errors: Errors;
  onChange: (next: Address) => void;
  onSync?: (next: Address) => void;
}) {
  const [showLine2, setShowLine2] = useState(!!value.address2);
  const region = regionField(value.country);
  const list = useMemo(() => countries(), []);
  const set = (key: keyof Address) => (v: string) => onChange({ ...value, [key]: v });
  const err = (key: keyof Address) => errors[`${prefix}.${key}`];
  const input = (
    key: keyof Address,
    autoComplete: string,
    extra: Record<string, unknown> = {}
  ) => ({
    id: `${prefix}-${key}`,
    name: `${prefix}-${key}`,
    value: value[key],
    autoComplete: `${scope} ${autoComplete}`,
    className: css.input,
    'aria-invalid': !!err(key) || undefined,
    'aria-describedby': err(key) ? `${prefix}-${key}-error` : undefined,
    onChange: (e: { target: { value: string } }) => set(key)(e.target.value),
    ...extra
  });

  return (
    <div className={css.fields}>
      <Field id={`${prefix}-country`} label="Country" error={err('country')}>
        <select
          {...input('country', 'country')}
          className={css.select}
          onChange={(e) => {
            const next = { ...value, country: e.target.value, state: '' };
            onChange(next);
            onSync?.(next);
          }}
        >
          {list.map((o) => (
            <option key={o.code} value={o.code}>
              {o.name}
            </option>
          ))}
        </select>
      </Field>
      <div className={css.row2}>
        <Field id={`${prefix}-first_name`} label="First name" error={err('first_name')}>
          <input {...input('first_name', 'given-name')} />
        </Field>
        <Field id={`${prefix}-last_name`} label="Last name" error={err('last_name')}>
          <input {...input('last_name', 'family-name')} />
        </Field>
      </div>
      <Field id={`${prefix}-address1`} label="Address" error={err('address1')}>
        <input {...input('address1', 'address-line1')} placeholder="Street and house number" />
      </Field>
      {showLine2 ? (
        <Field id={`${prefix}-address2`} label="Apartment, suite, etc. (optional)">
          <input {...input('address2', 'address-line2')} />
        </Field>
      ) : (
        <button type="button" className={css.linkBtn} onClick={() => setShowLine2(true)}>
          + Add apartment, suite, etc.
        </button>
      )}
      <Field id={`${prefix}-city`} label="City" error={err('city')}>
        <input {...input('city', 'address-level2')} />
      </Field>
      <div className={css.row2}>
        <Field id={`${prefix}-state`} label={region.label} error={err('state')}>
          {region.choices ? (
            <select
              {...input('state', 'address-level1')}
              className={css.select}
              onChange={(e) => {
                const next = { ...value, state: e.target.value };
                onChange(next);
                onSync?.(next);
              }}
            >
              <option value="">Select…</option>
              {region.choices.map((o) => (
                <option key={o.code} value={o.code}>
                  {o.name}
                </option>
              ))}
            </select>
          ) : (
            <input {...input('state', 'address-level1')} />
          )}
        </Field>
        <Field id={`${prefix}-zip`} label={region.zipLabel} error={err('zip')}>
          <input
            {...input('zip', 'postal-code', {
              inputMode: value.country === 'US' ? 'numeric' : 'text',
              onBlur: () => onSync?.(value)
            })}
          />
        </Field>
      </div>
      {value.country !== 'US' && (
        <Field id={`${prefix}-phone`} label="Phone (optional, for delivery updates)">
          <input {...input('phone', 'tel', { type: 'tel', inputMode: 'tel' })} />
        </Field>
      )}
    </div>
  );
}

export function Checkout({ checkoutId, storeId, publicKey, product, className }: Props) {
  const swellRef = useRef<SwellBrowser | null>(null);
  const cardMounted = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);

  const [phase, setPhase] = useState<Phase>('loading');
  const [loadError, setLoadError] = useState('');
  const [cart, setCart] = useState<SwellCart | null>(null);

  const [email, setEmail] = useState('');
  const [optIn, setOptIn] = useState(false);
  const [ship, setShip] = useState<Address>(emptyAddress());
  const [bill, setBill] = useState<Address>(emptyAddress());
  const [billSame, setBillSame] = useState(true);
  const [errors, setErrors] = useState<Errors>({});

  const [card, setCard] = useState({ ready: false, complete: false, error: '' });
  const [wallets, setWallets] = useState<Wallets>({ apple: false, google: false });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [bumpBusy, setBumpBusy] = useState(false);
  const [bumpSeen, setBumpSeen] = useState(false);
  const [couponOpen, setCouponOpen] = useState(false);
  const [coupon, setCoupon] = useState('');
  const [couponBusy, setCouponBusy] = useState(false);
  const [couponError, setCouponError] = useState('');

  const currency = cart?.currency || product.currency || 'USD';
  const money = (n: number | null | undefined) => formatMoney(n ?? 0, currency);

  /* ---------- Load the cart ---------- */
  useEffect(() => {
    let cancelled = false;

    async function alreadyOrdered(swell: SwellBrowser) {
      try {
        const order = await swell.cart.getOrder(checkoutId);
        return !!order && !!order.id && !swellError(order);
      } catch {
        return false;
      }
    }

    (async () => {
      let swell: SwellBrowser;
      try {
        swell = await loadSwell(storeId, publicKey);
      } catch (e) {
        if (!cancelled) {
          setLoadError(errorMessage(e));
          setPhase('unavailable');
        }
        return;
      }
      swellRef.current = swell;

      let next: SwellCart | null = null;
      try {
        const recovered = await swell.cart.recover(checkoutId);
        if (!swellError(recovered) && recovered?.items?.length) next = recovered;
      } catch {
        next = null;
      }

      if (!next) {
        if (await alreadyOrdered(swell)) {
          window.location.replace(`/checkout/${checkoutId}/thanks`);
          return;
        }
        if (!cancelled) setPhase('expired');
        return;
      }

      // Prefill anything Swell already knows (returning shoppers, abandoned-cart links).
      const country = next.shipping?.country || 'US';
      if (next.account?.email) setEmail(next.account.email);
      setShip(fromSwell(next.shipping, country));
      setBill(fromSwell(next.billing, country));

      // Swell needs a country to show shipping options and tax.
      try {
        if (!next.shipping?.country || !next.shipment_rating?.services?.length) {
          const updated = await swell.cart.update({ shipping: { country } });
          if (!swellError(updated) && updated?.items) next = updated;
        }
        const services = next?.shipment_rating?.services || [];
        if (next && !next.shipping?.service && services[0]) {
          const updated = await swell.cart.update({ shipping: { service: services[0].id } });
          if (!swellError(updated) && updated?.items) next = updated;
        }
      } catch {
        // Not fatal: shipping is set again when the order is placed.
      }

      try {
        const methods = await swell.settings.payments();
        if (!cancelled && methods) setWallets({ apple: !!methods.apple, google: !!methods.google });
      } catch {
        // Wallet buttons simply stay hidden.
      }

      if (!cancelled) {
        setCart(next);
        setPhase('ready');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [checkoutId, storeId, publicKey]);

  /* ---------- Place the order (card and wallets) ---------- */
  const placeOrder = useCallback(async () => {
    const swell = swellRef.current;
    if (!swell) throw new Error('Checkout is still loading. Please try again.');
    const result = await swell.cart.submitOrder();
    const err = swellError(result);
    if (err) throw new Error(err);
    window.location.assign(`/checkout/${checkoutId}/thanks`);
  }, [checkoutId]);

  /* ---------- Mount Stripe card field and wallet buttons ---------- */
  useEffect(() => {
    const swell = swellRef.current;
    if (phase !== 'ready' || !swell || cardMounted.current) return;
    cardMounted.current = true;

    const walletParams = {
      require: { name: true, email: true, shipping: true },
      onSuccess: () => {
        setSubmitting(true);
        placeOrder().catch((e) => {
          setFormError(errorMessage(e));
          setSubmitting(false);
        });
      }
    };

    swell.payment
      .createElements({
        card: {
          elementId: 'kneetic-card',
          options: {
            hidePostalCode: true,
            style: {
              base: {
                fontSize: '16px',
                color: '#10213d',
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
                '::placeholder': { color: '#8a94a3' }
              },
              invalid: { color: '#d6282e', iconColor: '#d6282e' }
            }
          },
          onReady: () => setCard((s) => ({ ...s, ready: true })),
          onChange: (e: { complete?: boolean; error?: { message?: string } }) =>
            setCard({ ready: true, complete: !!e.complete, error: e.error?.message || '' }),
          onError: (e: unknown) => setCard((s) => ({ ...s, ready: true, error: errorMessage(e) }))
        },
        ...(wallets.apple && {
          apple: {
            ...walletParams,
            elementId: 'kneetic-applepay',
            style: { theme: 'dark', height: '48px' },
            onError: () => setWallets((w) => ({ ...w, apple: false }))
          }
        }),
        ...(wallets.google && {
          google: {
            ...walletParams,
            elementId: 'kneetic-googlepay',
            style: { color: 'black', height: '48px' },
            onError: () => setWallets((w) => ({ ...w, google: false }))
          }
        })
      })
      .catch((e) => setCard((s) => ({ ...s, ready: true, error: errorMessage(e) })));
    // Mount once per page load. Wallet flags are read at that moment on purpose.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, placeOrder]);

  /* ---------- Keep shipping + tax in sync when the country/state/ZIP changes ---------- */
  const syncShipping = useCallback(async (a: Address) => {
    const swell = swellRef.current;
    if (!swell) return;
    try {
      const updated = await swell.cart.update({
        shipping: { country: a.country, state: a.state || undefined, zip: a.zip || undefined }
      });
      if (swellError(updated) || !updated?.items) return;
      const services = updated.shipment_rating?.services || [];
      if (
        services[0] &&
        !services.some((s: { id: string }) => s.id === updated.shipping?.service)
      ) {
        const withService = await swell.cart.update({ shipping: { service: services[0].id } });
        if (!swellError(withService) && withService?.items) {
          setCart(withService);
          return;
        }
      }
      setCart(updated);
    } catch {
      // Totals refresh again on submit.
    }
  }, []);

  const saveEmail = useCallback(async () => {
    const swell = swellRef.current;
    if (!swell || !EMAIL.test(email.trim())) return;
    try {
      // Saving the email early lets Swell send abandoned-cart reminders.
      await swell.cart.update({ account: { email: email.trim() } });
    } catch {
      // Saved again on submit.
    }
  }, [email]);

  /* ---------- Derived data ---------- */
  const item = cart?.items?.[0];
  const pack = packOption(product);
  const selection = useMemo(() => (item ? selectionOf(product, item) : {}), [product, item]);
  const packValueName = (it: SwellItem | undefined) =>
    pack && it
      ? (it.options || []).find(
          (o) => (o.name || '').trim().toLowerCase() === pack.name.trim().toLowerCase()
        )?.value || ''
      : '';

  const bump = useMemo(() => {
    if (!pack || !item || (cart?.items?.length ?? 0) !== 1 || item.quantity !== 1) return null;
    const current = packValueName(item);
    if (!current) return null;
    const one = pack.values.find((v) => packCount(v.name) === 1);
    const two = pack.values.find((v) => packCount(v.name) === 2);
    if (!one || !two) return null;
    const onePrice = unitPrice(product, { ...selection, [pack.id]: one.id }).price;
    const twoPrice = unitPrice(product, { ...selection, [pack.id]: two.id }).price;
    if (onePrice === null || twoPrice === null || twoPrice >= onePrice * 2) return null;
    return {
      checked: packCount(current) === 2,
      one,
      two,
      extra: twoPrice - onePrice,
      total: twoPrice,
      regular: onePrice * 2
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pack, item, cart, product, selection]);

  // Once shown, keep the upgrade box visible so the shopper can undo it.
  const showBump = !!bump && (bumpSeen || !bump.checked);
  useEffect(() => {
    if (bump && !bump.checked) setBumpSeen(true);
  }, [bump]);

  async function toggleBump(checked: boolean) {
    const swell = swellRef.current;
    if (!swell || !item || !bump || !pack || bumpBusy) return;
    setBumpBusy(true);
    const target = checked ? bump.two.name : bump.one.name;
    const options = (item.options || []).map((o) =>
      (o.name || '').trim().toLowerCase() === pack.name.trim().toLowerCase()
        ? { name: o.name, value: target }
        : { name: o.name, value: o.value }
    );
    try {
      const updated = await swell.cart.updateItem(item.id, { options, quantity: 1 });
      const err = swellError(updated);
      if (err) throw new Error(err);
      setCart(updated);
    } catch (e) {
      setFormError(errorMessage(e));
    } finally {
      setBumpBusy(false);
    }
  }

  async function applyCoupon() {
    const swell = swellRef.current;
    if (!swell || !coupon.trim()) return;
    setCouponBusy(true);
    setCouponError('');
    try {
      const updated = await swell.cart.applyCoupon(coupon.trim());
      const err = swellError(updated);
      if (err) setCouponError(/not found|invalid/i.test(err) ? "This code isn't valid." : err);
      else {
        setCart(updated);
        setCoupon('');
        setCouponOpen(false);
      }
    } catch (e) {
      setCouponError(errorMessage(e));
    } finally {
      setCouponBusy(false);
    }
  }

  async function removeCoupon() {
    const swell = swellRef.current;
    if (!swell) return;
    try {
      const updated = await swell.cart.removeCoupon();
      if (!swellError(updated)) setCart(updated);
    } catch {
      // ignore
    }
  }

  /* ---------- Submit ---------- */
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    const swell = swellRef.current;
    if (!swell || !cart) return;

    const next: Errors = {};
    if (!EMAIL.test(email.trim())) next.email = 'Enter a valid email address';
    Object.assign(next, validateAddress('ship', ship));
    if (!billSame) Object.assign(next, validateAddress('bill', bill));
    if (!card.complete) next.card = card.error || 'Enter your card details';
    setErrors(next);
    setFormError('');

    const firstKey = Object.keys(next)[0];
    if (firstKey) {
      const el =
        firstKey === 'card'
          ? document.getElementById('kneetic-card')
          : document.getElementById(fieldId(firstKey));
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (el && firstKey !== 'card') (el as HTMLElement).focus({ preventScroll: true });
      return;
    }

    setSubmitting(true);
    try {
      const services = cart.shipment_rating?.services || [];
      const updated = await swell.cart.update({
        account: { email: email.trim(), email_optin: optIn },
        shipping: { ...toSwell(ship), service: cart.shipping?.service || services[0]?.id },
        billing: toSwell(billSame ? ship : bill)
      });
      const err = swellError(updated);
      if (err) throw new Error(err);
      if (updated?.items) setCart(updated);
      await tokenizeCard(swell);
      await placeOrder();
    } catch (error) {
      setFormError(errorMessage(error));
      setSubmitting(false);
    }
  }

  /* ---------- Render ---------- */
  const header = (
    <header className={css.header}>
      <div className={css.headerInner}>
        <Link href="/" className={css.logo} aria-label={`${c.brand} home`}>
          {c.brand}
        </Link>
        <span className={css.secure}>
          <Icon name="lock" size={16} /> {c.secureLabel}
        </span>
      </div>
    </header>
  );

  if (phase !== 'ready' || !cart || !item) {
    return (
      <div className={clsx(css.page, className)}>
        {header}
        <main className={css.notice}>
          {phase === 'loading' && (
            <>
              <span className={css.spinnerDark} aria-hidden="true" />
              <p>Loading your secure checkout…</p>
            </>
          )}
          {phase === 'expired' && (
            <>
              <h1>This checkout link has expired</h1>
              <p>
                Your cart is no longer available. Pick your sleeves again, it only takes a moment.
              </p>
              <Link href="/#buy" className={css.payBtn}>
                Back to the store
              </Link>
            </>
          )}
          {phase === 'unavailable' && (
            <>
              <h1>Checkout couldn&apos;t load</h1>
              <p>{loadError || 'Please check your connection and try again.'}</p>
              <button type="button" className={css.payBtn} onClick={() => window.location.reload()}>
                Try again
              </button>
            </>
          )}
        </main>
      </div>
    );
  }

  const today = new Date();
  const arriveFrom = shortDate(addDays(today, c.arrival.minDays));
  const arriveTo = shortDate(addDays(today, c.arrival.maxDays));
  const services = cart.shipment_rating?.services || [];
  const service = services.find((s) => s.id === cart.shipping?.service) || services[0];

  const colorValue = (item.options || []).find((o) => /colou?r/i.test(o.name || ''))?.value || '';
  const colorIndex = imageIndexFor(colorValue);
  const image =
    (colorIndex !== null ? product.images[colorIndex]?.src : undefined) ||
    item.product?.images?.[0]?.file?.url ||
    product.images[0]?.src;
  const orig = unitPrice(product, selection).orig;
  const regularTotal = orig !== null ? orig * item.quantity : null;
  const itemSaving = regularTotal !== null ? regularTotal - item.price_total : 0;
  const discount = cart.discount_total || 0;
  const totalSaving = Math.max(0, itemSaving) + discount;
  const grand = cart.grand_total ?? 0;
  const pairs = packCount(packValueName(item) || '1') * item.quantity;
  const showWallets = wallets.apple || wallets.google;

  const summary = (
    <section className={css.summary} aria-label="Order summary">
      {(cart.items || []).map((it) => (
        <div key={it.id} className={css.item}>
          <div className={css.thumb}>
            {image && <img src={image} alt="" width={72} height={72} />}
            <span className={css.qtyBadge}>{it.quantity}</span>
          </div>
          <div className={css.itemInfo}>
            <p className={css.itemName}>{it.product?.name || product.name}</p>
            <p className={css.itemMeta}>
              {(it.options || [])
                .map((o) => o.value)
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
          <div className={css.itemPrice}>
            {it.id === item.id && regularTotal !== null && regularTotal > it.price_total && (
              <s>{money(regularTotal)}</s>
            )}
            <strong>{money(it.price_total)}</strong>
          </div>
        </div>
      ))}

      <dl className={css.totals}>
        <div>
          <dt>Subtotal</dt>
          <dd>{money(cart.sub_total)}</dd>
        </div>
        {discount > 0 && (
          <div className={css.discountRow}>
            <dt>
              Discount{cart.coupon?.code ? ` (${cart.coupon.code})` : ''}{' '}
              {cart.coupon && (
                <button type="button" className={css.linkBtnSmall} onClick={removeCoupon}>
                  Remove
                </button>
              )}
            </dt>
            <dd>−{money(discount)}</dd>
          </div>
        )}
        <div>
          <dt>Shipping</dt>
          <dd>
            {(cart.shipment_total || 0) > 0 ? (
              money(cart.shipment_total)
            ) : (
              <b className={css.free}>FREE</b>
            )}
          </dd>
        </div>
        {(cart.tax_total || 0) > 0 && (
          <div>
            <dt>Tax</dt>
            <dd>{money(cart.tax_total)}</dd>
          </div>
        )}
        <div className={css.grand}>
          <dt>Total</dt>
          <dd>
            <small>{currency}</small> {money(grand)}
          </dd>
        </div>
      </dl>
      {totalSaving > 0.004 && (
        <p className={css.saving}>
          <Icon name="check" size={16} /> You&apos;re saving {money(totalSaving)} on this order
        </p>
      )}

      {!cart.coupon &&
        (couponOpen ? (
          <div className={css.coupon}>
            <input
              className={css.input}
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="Discount code"
              aria-label="Discount code"
              autoCapitalize="characters"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  applyCoupon();
                }
              }}
            />
            <button
              type="button"
              className={css.applyBtn}
              onClick={applyCoupon}
              disabled={couponBusy}
            >
              {couponBusy ? '…' : 'Apply'}
            </button>
            {couponError && <p className={css.error}>{couponError}</p>}
          </div>
        ) : (
          <button type="button" className={css.linkBtnSmall} onClick={() => setCouponOpen(true)}>
            Have a discount code?
          </button>
        ))}
    </section>
  );

  const guaranteeBox = (
    <div className={css.guarantee}>
      <Icon name="shield" size={30} />
      <div>
        <strong>{c.guarantee.title}</strong>
        <p>{c.guarantee.body}</p>
      </div>
    </div>
  );

  const reviewBox = (
    <figure className={css.review}>
      <div className={css.reviewHead}>
        <Stars value={5} />
        <span>
          {c.rating.value.toFixed(1)}/5 from {c.rating.count} {c.rating.label}
        </span>
      </div>
      <blockquote>“{c.review.text}”</blockquote>
      <figcaption>
        <Icon name="check" size={14} /> {c.review.author}
      </figcaption>
    </figure>
  );

  return (
    <div className={clsx(css.page, className)}>
      {header}

      <div className={css.layout}>
        <aside className={css.aside}>
          {summary}
          <div className={css.desktopOnly}>
            {guaranteeBox}
            {reviewBox}
          </div>
        </aside>

        <form ref={formRef} className={css.form} onSubmit={onSubmit} noValidate>
          {showBump && bump && (
            <label className={clsx(css.bump, bump.checked && css.bumpOn, bumpBusy && css.busy)}>
              <span className={css.bumpBadge}>{c.bump.badge}</span>
              <input
                type="checkbox"
                checked={bump.checked}
                disabled={bumpBusy}
                onChange={(e) => toggleBump(e.target.checked)}
              />
              <span className={css.bumpBox} aria-hidden="true">
                <Icon name="check" size={16} />
              </span>
              <span className={css.bumpText}>
                <strong>
                  {bump.checked ? c.bump.added : fill(c.bump.title, { extra: money(bump.extra) })}
                </strong>
                <span>
                  {fill(c.bump.body, {
                    extra: money(bump.extra),
                    total: money(bump.total),
                    regular: money(bump.regular)
                  })}
                </span>
              </span>
            </label>
          )}

          {showWallets && (
            <section className={css.section}>
              <h2 className={css.sectionTitle}>Express checkout</h2>
              <div className={css.wallets}>
                {wallets.apple && <div id="kneetic-applepay" className={css.wallet} />}
                {wallets.google && <div id="kneetic-googlepay" className={css.wallet} />}
              </div>
              <p className={css.divider}>
                <span>or pay with card</span>
              </p>
            </section>
          )}

          <section className={css.section}>
            <h2 className={css.sectionTitle}>Contact</h2>
            <Field id="email" label="Email" error={errors.email}>
              <input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="off"
                spellCheck={false}
                className={css.input}
                value={email}
                aria-invalid={!!errors.email || undefined}
                aria-describedby={errors.email ? 'email-error' : undefined}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={saveEmail}
                placeholder="you@example.com"
              />
            </Field>
            <p className={css.hint}>For your order confirmation and tracking number.</p>
            <label className={css.check}>
              <input type="checkbox" checked={optIn} onChange={(e) => setOptIn(e.target.checked)} />
              <span>{c.emailOptIn}</span>
            </label>
          </section>

          <section className={css.section}>
            <h2 className={css.sectionTitle}>Delivery</h2>
            <AddressFields
              prefix="ship"
              scope="shipping"
              value={ship}
              errors={errors}
              onChange={setShip}
              onSync={syncShipping}
            />
            <div className={css.shipMethod}>
              <Icon name="truck" size={22} />
              <div>
                <strong>{service ? service.name : 'Standard shipping'}</strong>
                <span>
                  Estimated delivery {arriveFrom} – {arriveTo}
                </span>
              </div>
              <b className={css.free}>
                {service && service.price > 0 ? money(service.price) : 'FREE'}
              </b>
            </div>
          </section>

          <section className={css.section}>
            <h2 className={css.sectionTitle}>Payment</h2>
            <p className={clsx(css.hint, css.hintTop)}>
              <Icon name="lock" size={14} /> {c.paymentNote}
            </p>
            <div className={clsx(css.field, errors.card && css.fieldError)}>
              <label className={css.label} htmlFor="kneetic-card">
                Card details
              </label>
              <div
                id="kneetic-card"
                className={clsx(css.cardBox, !card.ready && css.cardLoading)}
              />
              {(errors.card || card.error) && (
                <p className={css.error} role="alert">
                  {card.error || errors.card}
                </p>
              )}
            </div>
            <label className={css.check}>
              <input
                type="checkbox"
                checked={billSame}
                onChange={(e) => setBillSame(e.target.checked)}
              />
              <span>Billing address same as delivery</span>
            </label>
            {!billSame && (
              <div className={css.billing}>
                <h3 className={css.subTitle}>Billing address</h3>
                <AddressFields
                  prefix="bill"
                  scope="billing"
                  value={bill}
                  errors={errors}
                  onChange={setBill}
                />
              </div>
            )}
          </section>

          <div className={css.paySection}>
            {formError && (
              <p className={css.formError} role="alert">
                {formError}
              </p>
            )}
            <button
              type="submit"
              className={css.payBtn}
              disabled={submitting}
              aria-busy={submitting}
            >
              {submitting ? (
                <>
                  <span className={css.spinner} aria-hidden="true" /> {c.processingLabel}
                </>
              ) : (
                <>
                  <Icon name="lock" size={18} /> {c.payButton} · {money(grand)}
                </>
              )}
            </button>
            <p className={css.payNote}>
              {pairs > 1 ? `${pairs} pairs` : '1 pair'} · Free shipping · {c.guarantee.title}
            </p>
            <ul className={css.trust}>
              {c.trust.map((t) => (
                <li key={t.text}>
                  <Icon name={t.icon} size={18} />
                  {t.text}
                </li>
              ))}
            </ul>
          </div>

          <div className={css.mobileOnly}>
            {guaranteeBox}
            {reviewBox}
          </div>
        </form>
      </div>

      <footer className={css.footer}>
        <nav aria-label="Policies">
          <Link href="/policies/refunds">Refund policy</Link>
          <Link href="/policies/shipping">Shipping</Link>
          <Link href="/policies/privacy">Privacy</Link>
          <Link href="/policies/terms">Terms</Link>
        </nav>
        <p>
          Questions? <a href={`mailto:${c.supportEmail}`}>{c.supportEmail}</a>
        </p>
      </footer>
    </div>
  );
}
