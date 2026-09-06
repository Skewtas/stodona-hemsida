import { getPartnerRef, normalizePartnerRef } from './partnerRef';

/**
 * GEMENSAM HJÄLPFUNKTION FÖR ALLA BOKNINGSLÄNKAR.
 *
 * All navigation till boka.stodona.se ska gå genom den här filen. Poängen är
 * att influencerreferensen följer med automatiskt, utan att varje komponent
 * behöver känna till att den finns.
 *
 *   bookingUrl()                                  → https://boka.stodona.se/?ref=INFL-7K4P
 *   bookingUrl({ service: 'Hemstädning' })        → …/?service=Hemst%C3%A4dning&ref=INFL-7K4P
 *   bookingUrl({}, '/presentkort')                → …/presentkort?ref=INFL-7K4P
 *
 * Regler:
 *   • Befintliga parametrar skrivs ALDRIG över — anger anroparen ett eget
 *     `ref` vinner det.
 *   • Finns ingen giltig referens läggs ingenting till.
 *   • Referensen är inte en rabattkod och visas aldrig som en för kunden.
 */

export const BOOKING_ORIGIN = 'https://boka.stodona.se';

export function bookingUrl(
  params: Record<string, string | number | undefined | null> = {},
  path = '/',
): string {
  const url = new URL(path.startsWith('http') ? path : `${BOOKING_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`);

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    url.searchParams.set(key, String(value));
  }

  // Referensen läggs på sist och bara om anroparen inte redan satt en.
  if (!url.searchParams.has('ref')) {
    const ref = getPartnerRef();
    if (ref) url.searchParams.set('ref', ref);
  }
  return url.toString();
}

/**
 * Lägger till referensen på en färdig länk (t.ex. en URL som kommer från
 * blogginnehåll eller redaktionell text). Idempotent och lämnar allt annat
 * orört. Returnerar länken oförändrad om den inte pekar på bokningsmodulen.
 */
export function withPartnerRef(href: string): string {
  try {
    const url = new URL(href, window.location.origin);
    if (url.origin !== BOOKING_ORIGIN) return href;
    if (url.searchParams.has('ref')) return href;
    const ref = getPartnerRef();
    if (!ref) return href;
    url.searchParams.set('ref', ref);
    return url.toString();
  } catch { return href; }
}

/** Är detta en länk till bokningsmodulen? */
export function isBookingLink(href: string): boolean {
  try { return new URL(href, window.location.origin).origin === BOOKING_ORIGIN; }
  catch { return false; }
}

/**
 * Global säkerhetsnät: fångar klick på bokningslänkar som INTE gick genom
 * `bookingUrl()` — till exempel markdown-länkar i bloggartiklar — och lägger
 * på referensen i sista stund.
 *
 * Detta ersätter inte hjälpfunktionen; det garanterar bara att inget faller
 * mellan stolarna när innehåll skrivs som fri text.
 *
 * Returnerar en funktion som kopplar bort lyssnaren.
 */
export function installBookingLinkInterceptor(): () => void {
  const onClick = (event: MouseEvent) => {
    // Låt webbläsaren sköta mittenklick, ctrl/cmd-klick och redan hanterade klick.
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const anchor = (event.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
    if (!anchor) return;

    const href = anchor.getAttribute('href') || '';
    if (!isBookingLink(href)) return;

    const decorated = withPartnerRef(href);
    // Skriv tillbaka på elementet i stället för att styra navigationen själv,
    // så att target="_blank", nedladdningar och tangentbordsnavigation beter
    // sig exakt som förut.
    if (decorated !== href) anchor.setAttribute('href', decorated);
  };

  document.addEventListener('click', onClick, true);
  return () => document.removeEventListener('click', onClick, true);
}
