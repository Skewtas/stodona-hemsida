import { useEffect, useRef, useState } from "react";

/**
 * Bakgrundsvideo i hero-sektioner.
 *
 * Videofilerna väger 2–4,4 MB och laddades tidigare ned i sin helhet även på
 * mobil – `preload="metadata"` hjälper inte när `autoPlay` är satt. Här är
 * postern alltid det som ritas först (och är LCP-elementet), medan videon
 * hämtas bara när den faktiskt tillför något:
 *
 *  - viewport minst 768 px – på mobil syns ändå bara en beskuren remsa
 *  - inte `prefers-reduced-motion: reduce`
 *  - inte `Save-Data` eller 2g/3g-anslutning
 *
 * Failar något av villkoren blir heron en vanlig, optimerad bild.
 */
export default function HeroVideo({
  src,
  poster,
  alt,
  className = "absolute inset-0 w-full h-full object-cover",
  style,
}: {
  src: string;
  poster: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Under förrendering ska HTML:en alltid innehålla postern, aldrig videon.
    // Annars skulle mobiler börja hämta filmen redan innan React tagit över.
    if ((window as Window & { __PRERENDER__?: boolean }).__PRERENDER__) return;

    const wideEnough = window.matchMedia("(min-width: 768px)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const conn = (navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }).connection;
    const frugal =
      conn?.saveData === true ||
      (conn?.effectiveType ? /2g|3g/.test(conn.effectiveType) : false);

    if (wideEnough && !reducedMotion && !frugal) setShowVideo(true);
  }, []);

  // Vissa webbläsare startar inte uppspelning när src sätts efter montering.
  useEffect(() => {
    if (showVideo) videoRef.current?.play().catch(() => {});
  }, [showVideo]);

  if (!showVideo) {
    return (
      <img
        src={poster}
        alt={alt}
        className={className}
        style={style}
        loading="eager"
        fetchPriority="high"
      />
    );
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      poster={poster}
      aria-label={alt}
      className={className}
      style={style}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
