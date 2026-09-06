/**
 * Influencerreferens på stodona.se (?ref=INFL-XXXX).
 *
 * Webbplatsens ENDA uppgift är att bära referensen vidare till
 * boka.stodona.se. Här finns medvetet ingen provisionslogik, ingen partnerdata
 * och ingen rabattberäkning — allt sådant hör hemma i Bokis, som validerar
 * referensen på nytt server-side vid varje bokning.
 *
 * Samtycke: referensen är marknadsföringsspårning, inte en nödvändig funktion.
 * Den lagras därför enligt sidans befintliga samtyckeshantering
 * (`cookie-consent` i localStorage, se CookieConsent.tsx):
 *
 *   • samtycke = "accepted" → localStorage, i högst 15 dagar
 *   • annars                → sessionStorage, bara under det pågående besöket
 *
 * Vidarebefordran i URL:en kräver ingen lagring alls och sker därför alltid.
 */

const REF_KEY = 'stodona_partner_ref';
const VISITOR_KEY = 'stodona_visitor_id';
const CONSENT_KEY = 'cookie-consent';

/** Måste vara identisk med PARTNER_REF_PATTERN i Bokis (commissionEngine.ts). */
const PARTNER_REF_PATTERN = /^(INFL|STAF|KONS)-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4,8}$/;

/** 15 dagar — samma fönster som Bokis. Bokis är alltid sanningen. */
const TTL_MS = 15 * 24 * 60 * 60 * 1000;

const BOKIS_ORIGIN = 'https://boka.stodona.se';

export function normalizePartnerRef(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const v = raw.trim().toUpperCase();
  return PARTNER_REF_PATTERN.test(v) ? v : null;
}

function hasStorageConsent(): boolean {
  try { return localStorage.getItem(CONSENT_KEY) === 'accepted'; }
  catch { return false; }
}

/** localStorage om samtycke finns, annars sessionStorage. */
function store(): Storage | null {
  try {
    if (typeof window === 'undefined') return null;
    return hasStorageConsent() ? window.localStorage : window.sessionStorage;
  } catch { return null; }
}

interface StoredRef { ref: string; savedAt: number; }

/** Anonymt besökar-id. Knyter ihop klick och bokning — innehåller inga personuppgifter. */
export function getVisitorId(): string {
  const s = store();
  if (!s) return '';
  try {
    const existing = s.getItem(VISITOR_KEY);
    if (existing) return existing;
    const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `v${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
    s.setItem(VISITOR_KEY, id);
    return id;
  } catch { return ''; }
}

/** Den sparade referensen, om den inte gått ut. */
export function getPartnerRef(): string | null {
  // Referensen i den aktuella URL:en vinner alltid — den är färskast.
  try {
    const fromUrl = normalizePartnerRef(new URLSearchParams(window.location.search).get('ref'));
    if (fromUrl) return fromUrl;
  } catch { /* ignorera */ }

  const s = store();
  if (!s) return null;
  try {
    const raw = s.getItem(REF_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredRef;
    if (!parsed?.ref || !normalizePartnerRef(parsed.ref)) return null;
    if (Date.now() - (parsed.savedAt ?? 0) > TTL_MS) {
      s.removeItem(REF_KEY);
      return null;
    }
    return parsed.ref;
  } catch { return null; }
}

/**
 * Kör en gång vid första sidladdningen.
 *
 * Registrerar klicket hos Bokis så att attributionen finns server-side även om
 * besökaren surfar runt en stund innan hen bokar. Fire-and-forget — spårning
 * får aldrig sinka eller krascha sidan.
 */
export function capturePartnerRefOnLoad(): void {
  try {
    const ref = normalizePartnerRef(new URLSearchParams(window.location.search).get('ref'));
    if (!ref) return;

    const s = store();
    if (s) s.setItem(REF_KEY, JSON.stringify({ ref, savedAt: Date.now() } satisfies StoredRef));

    void fetch(`${BOKIS_ORIGIN}/api/attribution/click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ref,
        visitorId: getVisitorId(),
        // Räckvidd: någon tryckte på länken. Att de sedan når bokningen räknas
        // separat av Bokis — sajterna har olika origins och därmed olika
        // besökar-id, så samma person kan inte slås ihop över gränsen.
        stage: 'site',
        landingPage: window.location.pathname + window.location.search,
      }),
    }).catch(() => {});
  } catch { /* spårning får aldrig krascha sidan */ }
}

/**
 * Flyttas samtycket till "accepted" efter att referensen hamnat i
 * sessionStorage ska den följa med över till localStorage — annars tappas den
 * när fliken stängs trots att besökaren just sagt ja.
 */
export function migrateRefOnConsent(): void {
  try {
    if (!hasStorageConsent()) return;
    const fromSession = window.sessionStorage.getItem(REF_KEY);
    if (fromSession && !window.localStorage.getItem(REF_KEY)) {
      window.localStorage.setItem(REF_KEY, fromSession);
    }
    const visitor = window.sessionStorage.getItem(VISITOR_KEY);
    if (visitor && !window.localStorage.getItem(VISITOR_KEY)) {
      window.localStorage.setItem(VISITOR_KEY, visitor);
    }
  } catch { /* noop */ }
}
