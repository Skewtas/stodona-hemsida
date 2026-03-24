import { useEffect } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
  }
}

export default function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);

    // Track page view in Google Analytics
    if (typeof window.gtag === 'function') {
      window.gtag('config', 'G-FHQH6WENP9', {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  return null;
}
