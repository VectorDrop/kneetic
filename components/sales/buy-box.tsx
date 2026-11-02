'use client';

import clsx from 'clsx';
import {
  buyBox,
  buyBoxQuote,
  guarantee,
  imageIndexFor,
  rating,
  sizeGuide,
  urgency
} from 'lib/sales-content';
import { formatMoney, isSizeOption, packCount, packValues } from 'lib/sales-pricing';
import Image from 'next/image';
import { useRef } from 'react';
import { useBuy } from './buy-state';
import { Icon } from './icons';
import css from './sales-page.module.css';

export function BuyBox({ id }: { id: string }) {
  const {
    product,
    selection,
    select,
    qty,
    setQty,
    price,
    orig,
    total,
    totalFor,
    stock,
    soldOut,
    loading,
    error,
    missing,
    checkout,
    showImage,
    pack
  } = useBuy();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openGuide = () => dialogRef.current?.showModal();

  const lowStock = stock !== null && stock > 0 && stock <= urgency.lowStockThreshold;
  const hasSizeOption = product.options.some((o) => isSizeOption(o.name));
  const boxError = error && error.box === id ? error.message : null;

  // "How many pairs?" tiles: the pack option from Swell when there is one, otherwise plain quantities.
  const offers = pack
    ? packValues(pack).map((v) => ({
        key: v.id,
        label: v.name,
        note: buyBox.packNotes[packCount(v.name)] ?? '',
        qty: 1,
        packValueId: v.id as string | undefined,
        active: selection[pack.id] === v.id,
        choose: () => select(pack.id, v.id)
      }))
    : buyBox.quantities.map((q) => ({
        key: String(q.qty),
        label: q.label,
        note: q.note,
        qty: q.qty,
        packValueId: undefined as string | undefined,
        active: qty === q.qty,
        choose: () => setQty(q.qty)
      }));

  return (
    <div className={css.buyBox} id={id}>
      <div className={css.buyHead}>
        <p className={css.buyName}>{product.name}</p>
        <div className={css.priceRow} aria-live="polite">
          {price !== null ? (
            <>
              <span className={css.priceNow}>{formatMoney(price, product.currency)}</span>
              {orig !== null && (
                <s className={css.priceWas}>{formatMoney(orig, product.currency)}</s>
              )}
              {orig !== null && (
                <span className={css.saveBadge}>
                  Save {Math.round(((orig - price) / orig) * 100)}%
                </span>
              )}
              <span className={css.pricePer}>per pair</span>
            </>
          ) : (
            <span className={css.pricePer}>Price unavailable right now</span>
          )}
        </div>
      </div>

      {product.options
        .filter((opt) => !pack || opt.id !== pack.id)
        .map((opt) => {
          const isSize = isSizeOption(opt.name);
          const isMissing = missing.indexOf(opt.id) !== -1;
          return (
            <fieldset
              key={opt.id}
              id={`${id}-opt-${opt.id}`}
              className={clsx(css.optGroup, isMissing && css.optMissing)}
            >
              <legend className={css.optLegend}>
                <span>
                  {opt.name}
                  {opt.required && !selection[opt.id] && (
                    <em className={css.optHint}> · {isMissing ? 'please choose' : 'choose one'}</em>
                  )}
                </span>
                {isSize && (
                  <button type="button" className={css.linkBtn} onClick={openGuide}>
                    <Icon name="ruler" size={18} /> Size guide
                  </button>
                )}
              </legend>
              <div
                className={clsx(
                  css.chips,
                  opt.values.some((v) => imageIndexFor(v.name) !== null) && css.chipsWide
                )}
              >
                {opt.values.map((v) => {
                  const active = selection[opt.id] === v.id;
                  const imgIndex = imageIndexFor(v.name);
                  const swatch = imgIndex !== null ? product.images[imgIndex] : undefined;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      className={clsx(css.chip, swatch && css.chipSwatch, active && css.chipActive)}
                      aria-pressed={active}
                      onClick={() => {
                        select(opt.id, v.id);
                        if (imgIndex !== null) showImage(imgIndex);
                      }}
                    >
                      {swatch && (
                        <span className={css.swatchImg}>
                          <Image src={swatch.src} alt="" fill sizes="48px" />
                        </span>
                      )}
                      {v.name}
                      {!opt.variant && v.price > 0 && (
                        <small className={css.chipExtra}>
                          {' '}
                          +{formatMoney(v.price, product.currency)}
                        </small>
                      )}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          );
        })}

      {!hasSizeOption && (
        <button type="button" className={clsx(css.linkBtn, css.linkBtnAlone)} onClick={openGuide}>
          <Icon name="ruler" size={18} /> How to find your size
        </button>
      )}

      {offers.length > 1 && (
        <fieldset className={css.optGroup}>
          <legend className={css.optLegend}>
            <span>{buyBox.quantityLabel}</span>
          </legend>
          <div className={css.qtyGrid}>
            {offers.map((o) => {
              const t = totalFor(o.qty, o.packValueId);
              return (
                <button
                  key={o.key}
                  type="button"
                  className={clsx(css.qtyTile, o.active && css.qtyTileActive)}
                  aria-pressed={o.active}
                  onClick={o.choose}
                >
                  <span className={css.qtyRadio} aria-hidden="true" />
                  <span className={css.qtyText}>
                    <strong>{o.label}</strong>
                    {o.note && <small>{o.note}</small>}
                  </span>
                  {t.total !== null && (
                    <span className={css.qtyPrice}>
                      {formatMoney(t.total, product.currency)}
                      {t.saving > 0 && (
                        <s className={css.qtyWas}>{formatMoney(t.regular, product.currency)}</s>
                      )}
                    </span>
                  )}
                  {t.saving > 0 && (
                    <span className={css.qtyBadge}>
                      Save {formatMoney(t.saving, product.currency)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {lowStock && (
        <p className={css.lowStock}>
          <span className={css.pulse} aria-hidden="true" /> Only {stock}{' '}
          {stock === 1 ? 'pair' : 'pairs'} left
        </p>
      )}
      {urgency.shippingNote && (
        <p className={css.shipNote}>
          <Icon name="truck" size={18} /> {urgency.shippingNote}
        </p>
      )}

      <button
        type="button"
        className={css.cta}
        onClick={() => checkout(id)}
        disabled={loading || soldOut}
      >
        {soldOut
          ? 'Sold out'
          : loading
            ? 'Starting checkout…'
            : `${buyBox.ctaLabel}${total !== null ? ` · ${formatMoney(total, product.currency)}` : ''}`}
      </button>
      {boxError && (
        <p className={css.buyError} role="alert">
          {boxError}
        </p>
      )}

      <div className={css.guarantee}>
        <Icon name="shield" size={30} />
        <div>
          <strong>{guarantee.title}</strong>
          <p>{guarantee.body}</p>
        </div>
      </div>

      <ul className={css.trust}>
        {buyBox.trust.map((t) => (
          <li key={t}>
            <Icon name="check" size={15} /> {t}
          </li>
        ))}
      </ul>

      {buyBoxQuote.text && (
        <figure className={css.miniReview}>
          <span className={css.miniStars} aria-label={`${rating.value} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Icon key={i} name="star" size={14} />
            ))}
          </span>
          <blockquote>{buyBoxQuote.text}</blockquote>
          <figcaption>{buyBoxQuote.author}</figcaption>
        </figure>
      )}

      <dialog
        ref={dialogRef}
        className={css.sizeGuide}
        onClick={(e) => e.target === dialogRef.current && dialogRef.current?.close()}
      >
        <div className={css.sizeGuideInner}>
          <button
            type="button"
            className={css.sizeGuideClose}
            onClick={() => dialogRef.current?.close()}
            aria-label="Close size guide"
          >
            <Icon name="x" size={22} />
          </button>
          <h3 className={css.sizeGuideTitle}>{sizeGuide.title}</h3>
          <ol className={css.sizeGuideSteps}>
            {sizeGuide.howTo.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          {sizeGuide.rows.length > 0 && (
            <table className={css.sizeTable}>
              <thead>
                <tr>
                  <th>Size</th>
                  <th>Knee (cm)</th>
                  <th>Knee (in)</th>
                </tr>
              </thead>
              <tbody>
                {sizeGuide.rows.map((r) => (
                  <tr key={r.size}>
                    <td>{r.size}</td>
                    <td>{r.cm}</td>
                    <td>{r.inches}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p className={css.sizeGuideNote}>
            Between sizes or unsure? Email us before you order and we&apos;ll help.
          </p>
        </div>
      </dialog>
    </div>
  );
}
