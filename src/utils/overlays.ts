// Gemensam kö för sajtens flytande lager, så att besökaren aldrig möts av
// rabattpopup + bokningstoast + sticky-fält samtidigt.
//
// Regler:
// - Cookiebannern går alltid först; inget annat armas innan den är besvarad
//   (komponenterna väntar in `cookie-consent` i localStorage).
// - Bara ETT lager åt gången får platsen. Först till kvarn.
// - Det mobila sticky-fältet är permanent chrome, men döljer sig när en
//   fullskärmspopup har platsen.

import { useSyncExternalStore } from 'react';

export type OverlayId = 'discount' | 'booking-toast';

let active: OverlayId | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

/** Ta platsen. Returnerar false om något annat lager redan har den. */
export function claimOverlay(id: OverlayId): boolean {
  if (active !== null && active !== id) return false;
  if (active === id) return true;
  active = id;
  emit();
  return true;
}

export function releaseOverlay(id: OverlayId): void {
  if (active === id) {
    active = null;
    emit();
  }
}

export function isOverlayFree(): boolean {
  return active === null;
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

const getSnapshot = () => active;
const getServerSnapshot = () => null;

/** Vilket lager som just nu har platsen (null = inget). */
export function useActiveOverlay(): OverlayId | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** True när cookiebannern är besvarad – då först får andra lager armas. */
export function hasAnsweredCookieBanner(): boolean {
  try {
    return !!localStorage.getItem('cookie-consent');
  } catch {
    return false;
  }
}

/** Kör `start` när cookiebannern är besvarad. Returnerar en cleanup. */
export function whenCookieBannerAnswered(start: () => void): () => void {
  if (hasAnsweredCookieBanner()) {
    start();
    return () => {};
  }
  const poll = setInterval(() => {
    if (hasAnsweredCookieBanner()) {
      clearInterval(poll);
      start();
    }
  }, 500);
  return () => clearInterval(poll);
}
