'use client';

import { useEffect, useState } from 'react';
import css from './sales-page.module.css';

/** Live countdown to a REAL deadline. Renders nothing if the date is empty or has passed. */
export function Countdown({ endsAt, label }: { endsAt: string; label: string }) {
  const end = endsAt ? Date.parse(endsAt) : NaN;
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (!isFinite(end)) return;
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [end]);

  if (!isFinite(end) || now === null || end <= now) return null;

  const sec = Math.floor((end - now) / 1000);
  const parts = [
    { v: Math.floor(sec / 86400), l: 'days' },
    { v: Math.floor((sec % 86400) / 3600), l: 'hrs' },
    { v: Math.floor((sec % 3600) / 60), l: 'min' },
    { v: sec % 60, l: 'sec' }
  ];

  return (
    <div className={css.countdown} role="timer">
      <span className={css.countdownLabel}>{label}</span>
      <div className={css.countdownParts}>
        {parts.map((p) => (
          <span key={p.l} className={css.countdownPart}>
            <strong>{String(p.v).padStart(2, '0')}</strong>
            <small>{p.l}</small>
          </span>
        ))}
      </div>
    </div>
  );
}
