'use client';

import { newEventId, whopTrack, type WhopParams } from 'lib/whop-pixel';
import { useEffect } from 'react';

/** Sends one Whop Pixel event when the page is shown (once per page view). */
export function TrackOnView({ event, params }: { event: string; params?: WhopParams }) {
  useEffect(() => {
    whopTrack(event, { ...params, event_id: params?.event_id || newEventId(event) });
    // Once per page view on purpose.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
