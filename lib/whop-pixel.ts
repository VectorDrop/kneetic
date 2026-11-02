/**
 * Whop Pixel conversion events (https://docs.whop.com/developer/ads/pixel).
 * The pixel itself is loaded on every page by app/layout.tsx.
 *
 * Events used on this store:
 *   view_content    sales page viewed
 *   add_to_cart     "Get My Sleeves" tapped (value = what's in the buy box)
 *   begin_checkout  checkout page opened (custom event)
 *   lead            valid email typed in checkout
 *   purchase        order completed (thank-you page), value = order total
 *
 * Whop counts each event name + event_id pair once, so reloads never double-count.
 */

export type WhopParams = {
  value?: number;
  currency?: string;
  event_id?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  phone?: string;
  external_id?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
};

type WhopGlobal = { track: (event: string, params?: Record<string, unknown>) => void };

/** A fresh id for events that happen once per action (e.g. a button tap). */
export function newEventId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function clean(params: WhopParams): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  (Object.keys(params) as (keyof WhopParams)[]).forEach((key) => {
    const v = params[key];
    if (typeof v === 'number' && isFinite(v)) out[key] = Math.round(v * 100) / 100;
    else if (typeof v === 'string' && v.trim()) out[key] = v.trim();
  });
  return out;
}

/**
 * Sends an event. The pixel script loads right after the page becomes interactive, so this waits
 * for it (up to 10 seconds) instead of dropping events that happen early.
 */
export function whopTrack(event: string, params: WhopParams = {}): void {
  if (typeof window === 'undefined') return;
  const data = clean(params);
  const started = Date.now();
  const send = () => {
    const whop = (window as unknown as { whop?: WhopGlobal }).whop;
    if (whop && typeof whop.track === 'function') {
      try {
        whop.track(event, data);
      } catch {
        // Tracking must never break the store.
      }
      return;
    }
    if (Date.now() - started < 10000) setTimeout(send, 100);
  };
  send();
}
