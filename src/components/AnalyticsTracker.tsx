import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { track } from "../utils/analytics";

// Mätning av bokningsfunneln i GA4. Fångar SPA-sidvisningar och alla
// boknings-, telefon- och mejlklick globalt utan att varje länk behöver ändras.
export default function AnalyticsTracker() {
  const { pathname } = useLocation();
  const first = useRef(true);

  useEffect(() => {
    // gtag-config skickar redan första sidvisningen – spåra bara route-byten.
    if (first.current) {
      first.current = false;
      return;
    }
    track("page_view", { page_location: window.location.href });
  }, [pathname]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      const el = (e.target as HTMLElement)?.closest?.("a");
      if (!el) return;
      const href = el.getAttribute("href") || "";
      if (href.includes("boka.stodona.se")) {
        track("booking_click", { link_text: el.textContent?.trim().slice(0, 60) || "" });
      } else if (href.startsWith("tel:")) {
        track("phone_click", { number: href.replace("tel:", "") });
      } else if (href.startsWith("mailto:")) {
        track("email_click");
      }
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
