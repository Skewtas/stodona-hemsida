// Enkel GA4-händelselogg. gtag är laddat i index.html (G-FHQH6WENP9) och
// respekterar cookie-samtycke via Consent Mode. Anropen är no-ops om gtag saknas.
type GtagParams = Record<string, unknown>;

// window.gtag deklareras globalt i CookieConsent.tsx.
export function track(event: string, params: GtagParams = {}): void {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", event, { ...params, page_path: window.location.pathname });
  }
}
