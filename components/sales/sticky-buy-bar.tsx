'use client';

import clsx from 'clsx';
import { buyBox } from 'lib/sales-content';
import { formatMoney } from 'lib/sales-pricing';
import { useEffect, useState } from 'react';
import { useBuy } from './buy-state';
import css from './sales-page.module.css';

/** Bottom bar on phones, shown whenever neither buy box is on screen. */
export function StickyBuyBar() {
  const { product, total: totalPrice, loading, soldOut, checkout } = useBuy();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const targets = ['buy', 'final-buy']
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (!targets.length || typeof IntersectionObserver === 'undefined') return;

    const visible: Record<string, boolean> = {};
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        visible[e.target.id] = e.isIntersecting;
      });
      setShow(!Object.keys(visible).some((k) => visible[k]));
    });
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  const total = totalPrice !== null ? formatMoney(totalPrice, product.currency) : '';

  return (
    <div className={clsx(css.sticky, show && css.stickyVisible)} aria-hidden={!show}>
      <div className={css.stickyText}>
        <strong>{total || product.name}</strong>
        <span>30-day money-back guarantee</span>
      </div>
      <button
        type="button"
        className={css.stickyCta}
        tabIndex={show ? 0 : -1}
        disabled={loading || soldOut}
        onClick={() => checkout('buy')}
      >
        {soldOut ? 'Sold out' : loading ? 'Loading…' : buyBox.ctaLabel}
      </button>
    </div>
  );
}
