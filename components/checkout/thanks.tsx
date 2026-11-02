'use client';

/** Order confirmation, loaded from Swell by the checkout id. */
import clsx from 'clsx';
import { Icon } from 'components/sales/icons';
import { checkoutContent as c, fill } from 'lib/checkout-content';
import { formatMoney } from 'lib/sales-pricing';
import { whopTrack } from 'lib/whop-pixel';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import css from './checkout.module.css';
import { loadSwell, swellError, type SwellOrder } from './swell-browser';

type Props = { checkoutId: string; storeId: string; publicKey: string; className?: string };

function addDays(from: Date, days: number): Date {
  const d = new Date(from.getTime());
  d.setDate(d.getDate() + days);
  return d;
}

const shortDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

/** Whop Pixel purchase. event_id = the Swell order, so a page reload never counts twice. */
function trackPurchase(order: SwellOrder) {
  const value = order.grand_total ?? 0;
  if (!order.id || !(value > 0)) return;
  const ship = order.shipping;
  const [first, ...rest] = (ship?.name || '').trim().split(' ');
  whopTrack('purchase', {
    value,
    currency: order.currency || 'USD',
    event_id: `order_${order.id}`,
    email: order.account?.email,
    first_name: ship?.first_name || first,
    last_name: ship?.last_name || rest.join(' '),
    phone: ship?.phone,
    city: ship?.city,
    state: ship?.state,
    postal_code: ship?.zip,
    country: ship?.country
  });
}

export function Thanks({ checkoutId, storeId, publicKey, className }: Props) {
  const [order, setOrder] = useState<SwellOrder | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const swell = await loadSwell(storeId, publicKey);
        // Right after payment Swell can need a moment, so try a few times.
        for (let attempt = 0; attempt < 4; attempt += 1) {
          const result = await swell.cart.getOrder(checkoutId);
          if (result && result.id && !swellError(result)) {
            if (!cancelled) {
              setOrder(result as SwellOrder);
              trackPurchase(result as SwellOrder);
              setState('ready');
            }
            return;
          }
          await new Promise((r) => setTimeout(r, 1200));
        }
      } catch {
        // falls through to "missing"
      }
      if (!cancelled) setState('missing');
    })();
    return () => {
      cancelled = true;
    };
  }, [checkoutId, storeId, publicKey]);

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

  if (state !== 'ready' || !order) {
    return (
      <div className={clsx(css.page, className)}>
        {header}
        <main className={css.notice}>
          {state === 'loading' ? (
            <>
              <span className={css.spinnerDark} aria-hidden="true" />
              <p>Confirming your order…</p>
            </>
          ) : (
            <>
              <h1>We couldn&apos;t load your order</h1>
              <p>
                If you completed the payment, your order is safe and a confirmation email is on its
                way. Questions? Email us at{' '}
                <a href={`mailto:${c.supportEmail}`}>{c.supportEmail}</a>.
              </p>
              <Link href="/" className={css.payBtn}>
                {c.thanks.backLabel}
              </Link>
            </>
          )}
        </main>
      </div>
    );
  }

  const currency = order.currency || 'USD';
  const money = (n: number | undefined) => formatMoney(n ?? 0, currency);
  const ship = order.shipping;
  const firstName = ship?.first_name || (ship?.name || '').split(' ')[0] || '';
  const email = order.account?.email;
  const placed = order.date_created ? new Date(order.date_created) : new Date();
  const arriveFrom = shortDate(addDays(placed, c.arrival.minDays));
  const arriveTo = shortDate(addDays(placed, c.arrival.maxDays));
  const cardInfo = order.billing?.card;

  return (
    <div className={clsx(css.page, className)}>
      {header}
      <main className={css.thanks}>
        <div className={css.thanksHero}>
          <span className={css.thanksIcon}>
            <Icon name="check" size={34} />
          </span>
          <h1>{firstName ? fill(c.thanks.title, { name: firstName }) : c.thanks.titleNoName}</h1>
          {order.number && (
            <p className={css.thanksNumber}>
              {fill(c.thanks.confirmed, { number: String(order.number) })}
            </p>
          )}
          {email && <p>{fill(c.thanks.emailNote, { email })}</p>}
          <p className={css.thanksArrival}>
            <Icon name="truck" size={20} /> Estimated delivery:{' '}
            <strong>
              {arriveFrom} – {arriveTo}
            </strong>
          </p>
        </div>

        <section className={css.section}>
          <h2 className={css.sectionTitle}>{c.thanks.nextTitle}</h2>
          <ol className={css.steps}>
            {c.thanks.next.map((step, i) => (
              <li key={step.title}>
                <span className={css.stepNum}>{i + 1}</span>
                <div>
                  <strong>{step.title}</strong>
                  <p>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className={css.summary} aria-label="Your order">
          {(order.items || []).map((it) => {
            const img = it.product?.images?.[0]?.file?.url;
            return (
              <div key={it.id} className={css.item}>
                <div className={css.thumb}>
                  {img && <img src={img} alt="" width={72} height={72} />}
                  <span className={css.qtyBadge}>{it.quantity}</span>
                </div>
                <div className={css.itemInfo}>
                  <p className={css.itemName}>{it.product?.name || 'KNEETIC 7mm Knee Sleeves'}</p>
                  <p className={css.itemMeta}>
                    {(it.options || [])
                      .map((o) => o.value)
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
                <div className={css.itemPrice}>
                  <strong>{money(it.price_total)}</strong>
                </div>
              </div>
            );
          })}
          <dl className={css.totals}>
            <div>
              <dt>Subtotal</dt>
              <dd>{money(order.sub_total)}</dd>
            </div>
            {(order.discount_total || 0) > 0 && (
              <div className={css.discountRow}>
                <dt>Discount</dt>
                <dd>−{money(order.discount_total)}</dd>
              </div>
            )}
            <div>
              <dt>Shipping</dt>
              <dd>
                {(order.shipment_total || 0) > 0 ? (
                  money(order.shipment_total)
                ) : (
                  <b className={css.free}>FREE</b>
                )}
              </dd>
            </div>
            {(order.tax_total || 0) > 0 && (
              <div>
                <dt>Tax</dt>
                <dd>{money(order.tax_total)}</dd>
              </div>
            )}
            <div className={css.grand}>
              <dt>Total paid</dt>
              <dd>
                <small>{currency}</small> {money(order.grand_total)}
              </dd>
            </div>
          </dl>
        </section>

        <section className={css.section}>
          <div className={css.thanksDetails}>
            {ship && (
              <div>
                <h3 className={css.subTitle}>Shipping to</h3>
                <p>
                  {ship.name || `${ship.first_name || ''} ${ship.last_name || ''}`.trim()}
                  <br />
                  {ship.address1}
                  {ship.address2 ? `, ${ship.address2}` : ''}
                  <br />
                  {[ship.city, ship.state, ship.zip].filter(Boolean).join(', ')}
                  <br />
                  {ship.country}
                </p>
              </div>
            )}
            {cardInfo?.last4 && (
              <div>
                <h3 className={css.subTitle}>Payment</h3>
                <p>
                  {(cardInfo.brand || 'Card').toString()} ending in {cardInfo.last4}
                </p>
              </div>
            )}
          </div>
        </section>

        <div className={css.guarantee}>
          <Icon name="shield" size={30} />
          <div>
            <strong>{c.guarantee.title}</strong>
            <p>{c.thanks.guaranteeNote}</p>
          </div>
        </div>

        <p className={css.thanksHelp}>
          Questions about your order? Email{' '}
          <a href={`mailto:${c.supportEmail}`}>{c.supportEmail}</a>
          {order.number ? ` with your order number #${order.number}.` : '.'}
        </p>
        <Link href="/" className={clsx(css.payBtn, css.backBtn)}>
          {c.thanks.backLabel}
        </Link>
      </main>
    </div>
  );
}
