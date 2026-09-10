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
  srcAv1,
  poster,
  alt,
  className = "absolute inset-0 w-full h-full object-cover",
  style,
  lazy = false,
}: {
  src: string;
  /** AV1-variant i MP4. Väger ungefär en tredjedel av H.264-filen vid samma
      upplevda kvalitet. Webbläsare som inte klarar codecen hoppar över den
      och hämtar `src` i stället – därför måste den ligga först. */
  srcAv1?: string;
  poster: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  /** För videor under vecket: hämta filmen först när sektionen närmar sig. */
  lazy?: boolean;
}) {
  const [showVideo, setShowVideo] = useState(false);
  const [iSikte, setISikte] = useState(!lazy);
  const videoRef = useRef<HTMLVideoElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);

  // Ligger videon under vecket är det slöseri att hämta megabyte som kanske
  // aldrig syns. Vänta tills sektionen närmar sig skärmen.
  useEffect(() => {
    if (!lazy || iSikte) return;
    const el = posterRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setISikte(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setISikte(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [lazy, iSikte]);

  useEffect(() => {
    // Under förrendering ska HTML:en alltid innehålla postern, aldrig videon.
    // Annars skulle mobiler börja hämta filmen redan innan React tagit över.
    if ((window as Window & { __PRERENDER__?: boolean }).__PRERENDER__) return;

    const wide = window.matchMedia("(min-width: 768px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    const evaluate = () => {
      if (!iSikte) return;
      const conn = (navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }).connection;
      const frugal =
        conn?.saveData === true ||
        (conn?.effectiveType ? /2g|3g/.test(conn.effectiveType) : false);

      // Uppgradera till video när villkoren uppfylls, men gå aldrig tillbaka
      // till postern – att rycka bort en spelande video vid en resize skulle
      // se ut som en bugg.
      if (wide.matches && !reduced.matches && !frugal) setShowVideo(true);
    };

    evaluate();
    // Villkoren kan ändras efter montering: skärmen roteras, fönstret dras ut,
    // eller sidan monterades i en dold flik där bredden rapporterades som 0.
    wide.addEventListener("change", evaluate);
    reduced.addEventListener("change", evaluate);
    return () => {
      wide.removeEventListener("change", evaluate);
      reduced.removeEventListener("change", evaluate);
    };
  }, [iSikte]);

  // Vissa webbläsare startar inte uppspelning när src sätts efter montering.
  useEffect(() => {
    if (showVideo) videoRef.current?.play().catch(() => {});
  }, [showVideo]);

  if (!showVideo) {
    return (
      <img
        ref={posterRef}
        src={poster}
        alt={alt}
        className={className}
        style={style}
        loading={lazy ? "lazy" : "eager"}
        fetchPriority={lazy ? "auto" : "high"}
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
      {srcAv1 && <source src={srcAv1} type='video/mp4; codecs="av01.0.08M.08"' />}
      <source src={src} type="video/mp4" />
    </video>
  );
}
