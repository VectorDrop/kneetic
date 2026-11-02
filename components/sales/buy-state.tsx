'use client';

import {
  isSizeOption,
  packOption,
  packValues,
  singlePairPrice,
  stockFor,
  totalFor,
  type Selection
} from 'lib/sales-pricing';
import type { SalesOption, SalesProduct } from 'lib/sales-types';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { buyNow } from './actions';

type BuyState = {
  product: SalesProduct;
  selection: Selection;
  select: (optionId: string, valueId: string) => void;
  qty: number;
  setQty: (qty: number) => void;
  /** Price of one pair (and its crossed-out "was" price). */
  price: number | null;
  orig: number | null;
  /** What the chosen quantity costs, including Swell's multi-pair price. */
  total: number | null;
  /** Totals for an offer tile: `qty` pairs, or a pack value from Swell. */
  totalFor: (qty: number, packValueId?: string) => ReturnType<typeof totalFor>;
  /** Swell option that sells several pairs as its own variant (e.g. "1 Pair" / "2 Pairs"), if any. */
  pack: SalesOption | undefined;
  stock: number | null;
  soldOut: boolean;
  loading: boolean;
  /** Error message and the buy box it belongs to. */
  error: { box: string; message: string } | null;
  missing: string[];
  /** boxId = the buy box that should show errors / receive focus ('buy' for the sticky bar). */
  checkout: (boxId: string) => void;
  /** Asks the gallery to show a picture (0-based). `n` changes on every request. */
  galleryRequest: { index: number; n: number } | null;
  showImage: (index: number) => void;
};

const Ctx = createContext<BuyState | null>(null);

export function useBuy(): BuyState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useBuy must be used inside <BuyStateProvider>');
  return ctx;
}

export function BuyStateProvider({
  product,
  defaultQty,
  children
}: {
  product: SalesProduct;
  defaultQty: number;
  children: ReactNode;
}) {
  const pack = useMemo(() => packOption(product), [product]);

  // Pre-select options with a single value and non-size options (the pack starts at 1 pair).
  // Size stays a conscious choice.
  const [selection, setSelection] = useState<Selection>(() => {
    const init: Selection = {};
    product.options.forEach((o) => {
      const first = pack && o.id === pack.id ? packValues(o)[0] : o.values[0];
      if (first && (o.values.length === 1 || !isSizeOption(o.name))) init[o.id] = first.id;
    });
    return init;
  });
  const [qty, setQty] = useState(defaultQty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<BuyState['error']>(null);
  const [missing, setMissing] = useState<string[]>([]);
  const [galleryRequest, setGalleryRequest] = useState<BuyState['galleryRequest']>(null);

  // Coming back from checkout with the browser's back button restores the page from cache:
  // reset the "Starting checkout…" state so the button works again.
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) setLoading(false);
    };
    window.addEventListener('pageshow', onShow);
    return () => window.removeEventListener('pageshow', onShow);
  }, []);

  const { price, orig } = useMemo(() => singlePairPrice(product, selection), [product, selection]);
  const { total } = useMemo(() => totalFor(product, selection, qty), [product, selection, qty]);
  const stock = useMemo(() => stockFor(product, selection), [product, selection]);
  const soldOut = stock !== null && stock <= 0;

  const select = (optionId: string, valueId: string) => {
    setSelection((s) => ({ ...s, [optionId]: valueId }));
    setMissing((m) => m.filter((id) => id !== optionId));
    setError(null);
  };

  const checkout = async (boxId: string) => {
    if (loading) return;
    const notChosen = product.options.filter((o) => o.required && !selection[o.id]);
    const firstMissing = notChosen[0];
    if (firstMissing) {
      setMissing(notChosen.map((o) => o.id));
      setError({ box: boxId, message: `Choose your ${firstMissing.name.toLowerCase()} first.` });
      document
        .getElementById(`${boxId}-opt-${firstMissing.id}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (!product.live || !product.id) {
      setError({ box: boxId, message: "Checkout isn't connected yet. Check your Swell settings." });
      return;
    }

    setLoading(true);
    setError(null);
    const options = product.options
      .map((o) => ({ name: o.name, value: o.values.find((v) => v.id === selection[o.id])?.name }))
      .filter((o): o is { name: string; value: string } => typeof o.value === 'string');

    let result: Awaited<ReturnType<typeof buyNow>>;
    try {
      // With a pack option, the pack variant already holds the number of pairs and its price.
      result = await buyNow({ productId: product.id, quantity: pack ? 1 : qty, options });
    } catch {
      result = { error: 'network' };
    }
    if ('checkoutUrl' in result) {
      window.location.assign(result.checkoutUrl); // keep the loading state while the browser leaves
      return;
    }
    setLoading(false);
    setError({ box: boxId, message: 'Something went wrong starting checkout. Please try again.' });
  };

  const value: BuyState = {
    product,
    selection,
    select,
    qty,
    setQty,
    price,
    orig,
    total,
    totalFor: (q, packValueId) => totalFor(product, selection, q, packValueId),
    pack,
    stock,
    soldOut,
    loading,
    error,
    missing,
    checkout: (boxId) => void checkout(boxId),
    galleryRequest,
    showImage: (index) => setGalleryRequest((r) => ({ index, n: (r?.n ?? 0) + 1 }))
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
