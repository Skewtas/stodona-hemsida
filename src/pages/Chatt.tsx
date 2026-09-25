import { useEffect } from "react";
import { Helmet } from "../seo";
import { CalendarPlus, CalendarClock, UserRound, MessageCircleQuestion, MessageCircle } from "lucide-react";

/**
 * stodona.se/chatt – sidan att hänvisa kunder till. Första vyn ska räcka:
 * rubrik, en mening och knappar som startar chatten med rätt fråga
 * (händelsen "stodona:chatt" som ChatWidget lyssnar på).
 *
 * Bara det chatten löser direkt får en knapp – lova inget mer. Avbokning görs
 * inte i chatten än, så den har ingen egen knapp.
 */

function oppnaChatt(fraga?: string) {
  window.dispatchEvent(new CustomEvent("stodona:chatt", { detail: { fraga } }));
}

const VAL = [
  { ikon: CalendarPlus, text: "Boka städning", fraga: "Jag vill boka städning" },
  { ikon: CalendarClock, text: "Boka om", fraga: "Jag vill boka om min städning" },
  { ikon: UserRound, text: "Vem kommer nästa gång?", fraga: "Vem kommer nästa gång och när?" },
  { ikon: MessageCircleQuestion, text: "Ställ en fråga", fraga: undefined },
];

export default function Chatt() {
  // På datorn öppnas chatten direkt – där får den plats bredvid sidan.
  useEffect(() => {
    if (!window.matchMedia("(min-width: 768px)").matches) return;
    const id = window.setTimeout(() => oppnaChatt(), 700);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div className="bg-bg-primary">
      <Helmet>
        <title>Chatta med Stodona – boka och boka om direkt</title>
        <meta
          name="description"
          content="Slipp mejla, ringa och vänta. Boka städning, boka om och se vem som kommer nästa gång – direkt i chatten, dygnet runt."
        />
        <link rel="canonical" href="https://stodona.se/chatt" />
      </Helmet>

      <section className="px-4 pt-10 pb-14 md:pt-16 md:pb-20">
        <div className="max-w-xl mx-auto text-center">
          <img
            src="/camilla.webp"
            alt="Camilla på Stodonas kundservice"
            width={72}
            height={72}
            className="mx-auto w-[72px] h-[72px] rounded-full object-cover ring-4 ring-white shadow-md"
          />
          <h1 className="mt-5 text-4xl md:text-5xl font-serif text-text-primary">Lös det direkt här</h1>
          <p className="mt-3 text-lg text-text-secondary">Slipp mejla, ringa och vänta på svar.</p>

          <ul className="mt-8 grid grid-cols-2 gap-3">
            {VAL.map(({ ikon: Ikon, text, fraga }) => (
              <li key={text}>
                <button
                  type="button"
                  onClick={() => oppnaChatt(fraga)}
                  className="w-full h-full min-h-[104px] flex flex-col items-center justify-center gap-2 rounded-2xl bg-white px-3 py-5 shadow-sm ring-1 ring-text-primary/10 hover:ring-text-primary/50 hover:shadow-md transition-all"
                >
                  <Ikon className="w-7 h-7 text-text-primary" aria-hidden="true" />
                  <span className="font-bold text-text-primary leading-tight">{text}</span>
                </button>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => oppnaChatt()}
            className="mt-6 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-bg-dark text-text-light font-medium shadow-lg hover:bg-accent hover:text-text-primary transition-colors"
          >
            <MessageCircle className="w-5 h-5" aria-hidden="true" />
            Starta chatten
          </button>

          <p className="mt-5 text-sm text-text-secondary">Svar direkt, dygnet runt. Du loggar in med en kod via SMS.</p>
        </div>
      </section>
    </div>
  );
}
