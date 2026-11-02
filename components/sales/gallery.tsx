'use client';

import clsx from 'clsx';
import type { SalesImage } from 'lib/sales-types';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useBuy } from './buy-state';
import { Icon } from './icons';
import css from './sales-page.module.css';

/** Swipeable product gallery: native scroll-snap on phones, arrows on desktop. */
export function Gallery({ images, labels }: { images: SalesImage[]; labels: string[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const count = images.length;
  const { galleryRequest } = useBuy();

  // Jump to a picture when the buy box asks for it (e.g. the shopper picked a color).
  useEffect(() => {
    const track = trackRef.current;
    if (!galleryRequest || !track || galleryRequest.index >= count) return;
    track.scrollTo({ left: galleryRequest.index * track.clientWidth, behavior: 'smooth' });
    setIndex(galleryRequest.index);
  }, [galleryRequest, count]);

  const goTo = (i: number) => {
    const track = trackRef.current;
    if (!track || !count) return;
    const next = (i + count) % count;
    track.scrollTo({ left: next * track.clientWidth, behavior: 'smooth' });
    setIndex(next);
  };

  const onScroll = () => {
    const track = trackRef.current;
    if (!track || !track.clientWidth) return;
    const i = Math.round(track.scrollLeft / track.clientWidth);
    setIndex((prev) => (prev === i ? prev : i));
  };

  if (!count) return null;

  return (
    <div className={css.gallery} aria-roledescription="carousel" aria-label="Product images">
      <div className={css.galleryFrame}>
        <div className={css.galleryTrack} ref={trackRef} onScroll={onScroll}>
          {images.map((img, i) => (
            <div
              key={`${img.src}-${i}`}
              className={css.gallerySlide}
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                priority={i === 0}
                sizes="(min-width: 960px) 600px, 100vw"
                className={css.galleryImg}
              />
            </div>
          ))}
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              className={clsx(css.galleryNav, css.galleryPrev)}
              onClick={() => goTo(index - 1)}
              aria-label="Previous image"
            >
              <Icon name="left" size={22} />
            </button>
            <button
              type="button"
              className={clsx(css.galleryNav, css.galleryNext)}
              onClick={() => goTo(index + 1)}
              aria-label="Next image"
            >
              <Icon name="right" size={22} />
            </button>
            <div className={css.galleryDots} aria-hidden="true">
              {images.map((img, i) => (
                <span key={`${img.src}-dot-${i}`} className={clsx(i === index && css.dotActive)} />
              ))}
            </div>
          </>
        )}
      </div>

      {count > 1 && (
        <div className={css.thumbs} role="tablist" aria-label="Choose image">
          {images.map((img, i) => (
            <button
              key={`${img.src}-thumb-${i}`}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={labels[i] || `Image ${i + 1}`}
              className={clsx(css.thumb, i === index && css.thumbActive)}
              onClick={() => goTo(i)}
            >
              <span className={css.thumbImg}>
                <Image src={img.src} alt="" fill sizes="80px" />
              </span>
              {labels[i] && <span className={css.thumbLabel}>{labels[i]}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
