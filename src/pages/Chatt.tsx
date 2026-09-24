import { useEffect } from "react";
import { Helmet } from "../seo";
import { CalendarPlus, CalendarClock, UserRound, CalendarX, Sparkles, ReceiptText, Camera, MessageCircle, ShieldCheck } from "lucide-react";

/**
 * stodona.se/chatt – en sida att hänvisa kunder till när de ska chatta med
 * Camilla. Varje kort öppnar chatten med en färdig fråga (händelsen
 * "stodona:chatt" som ChatWidget lyssnar på). På datorn öppnas chatten direkt.
 *
 * Allt som står här ska chatten kunna göra på riktigt – lova inget mer.
 * Avbokning görs inte i chatten: Camilla föreslår en ny tid, och vill kunden
 * avboka helt tar kundservice det vidare.
 */

function oppnaChatt(fraga?: string) {
  window.dispatchEvent(new CustomEvent("stodona:chatt", { detail: { fraga } }));
}

const KORT = [
  {
    ikon: CalendarPlus,
    rubrik: "Boka städning",
    text: "Få pris direkt, se lediga tider och få bokningen ifylld – du bekräftar bara med personnummer för RUT.",
    fraga: "Jag vill boka städning",
  },
  {
    ikon: CalendarClock,
    rubrik: "Boka om din städning",
    text: "Flytta ett tillfälle till en annan dag. Du får två lediga tider direkt och en bekräftelse med SMS.",
    fraga: "Jag vill boka om min städning",
  },
  {
    ikon: UserRound,
    rubrik: "Se vem som kommer nästa gång",
    text: "Se dina kommande städningar – dag, tid och vilken städare som kommer.",
    fraga: "Vem kommer nästa gång och när?",
  },
  {
    ikon: CalendarX,
    rubrik: "Avboka",
    text: "Camilla visar först två nya tider. Vill du hellre avboka tar kundservice det vidare direkt.",
    fraga: "Jag vill avboka min städning",
  },
  {
    ikon: Sparkles,
    rubrik: "Vad ingår?",
    text: "Frågor om hemstädning, storstädning, flyttstädning, fönsterputs och våra andra tjänster.",
    fraga: "Vad ingår?",
  },
  {
    ikon: ReceiptText,
    rubrik: "Faktura, RUT och betalning",
    text: "Hur RUT-avdraget fungerar, e-faktura och frågor om din faktura.",
    fraga: "Jag har en fråga om min faktura",
  },
  {
    ikon: Camera,
    rubrik: "Något blev inte bra",
    text: "Berätta och bifoga gärna bilder direkt i chatten – vi löser det enligt vår nöjd-kund-garanti.",
    fraga: "Något blev inte bra vid min senaste städning",
  },
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
        <title>Chatta med Stodona – boka, boka om och se din nästa städning</title>
        <meta
          name="description"
          content="Chatta med Camilla på Stodona: boka städning, boka om, se vem som kommer nästa gång och få svar direkt – dygnet runt."
        />
        <link rel="canonical" href="https://stodona.se/chatt" />
      </Helmet>

      <section className="px-4 pt-14 pb-10 md:pt-20">
        <div className="max-w-3xl mx-auto text-center">
          <img
            src="/camilla.webp"
            alt="Camilla på Stodonas kundservice"
            width={96}
            height={96}
            className="mx-auto w-24 h-24 rounded-full object-cover ring-4 ring-white shadow-lg"
          />
          <p className="mt-5 text-xs font-bold uppercase tracking-widest text-text-secondary">Svar direkt – dygnet runt</p>
          <h1 className="mt-2 text-4xl md:text-5xl font-serif text-text-primary">Chatta med oss</h1>
          <p className="mt-4 text-lg text-text-secondary max-w-xl mx-auto">
            Camilla är Stodonas digitala assistent. Hon hjälper dig att boka, boka om och hålla koll på dina städningar – utan att du
            behöver vänta i telefonkö.
          </p>
          <button
            type="button"
            onClick={() => oppnaChatt()}
            className="mt-8 inline-flex items-center gap-2 px-7 py-4 rounded-full bg-bg-dark text-text-light font-medium text-base shadow-lg hover:bg-accent hover:text-text-primary transition-colors"
          >
            <MessageCircle className="w-5 h-5" aria-hidden="true" />
            Starta chatten
          </button>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-serif text-text-primary text-center">Det här kan Camilla hjälpa dig med</h2>
          <p className="mt-2 text-sm text-text-secondary text-center">Tryck på det du vill ha hjälp med – chatten startar direkt.</p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {KORT.map(({ ikon: Ikon, rubrik, text, fraga }) => (
              <li key={rubrik}>
                <button
                  type="button"
                  onClick={() => oppnaChatt(fraga)}
                  className="w-full h-full text-left rounded-2xl bg-white p-5 shadow-sm ring-1 ring-text-primary/10 hover:ring-text-primary/40 hover:shadow-md transition-all"
                >
                  <Ikon className="w-6 h-6 text-text-primary" aria-hidden="true" />
                  <span className="block mt-3 font-bold text-text-primary">{rubrik}</span>
                  <span className="block mt-1 text-sm text-text-secondary leading-relaxed">{text}</span>
                  <span className="block mt-3 text-sm font-medium text-text-primary underline underline-offset-4">Fråga Camilla →</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="max-w-3xl mx-auto rounded-3xl bg-white p-6 md:p-8 shadow-sm ring-1 ring-text-primary/10">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 shrink-0 text-text-primary" aria-hidden="true" />
            <div>
              <h2 className="text-xl font-serif text-text-primary">Säkert när det gäller dina bokningar</h2>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                För att se eller ändra dina bokningar identifierar du dig med en kod som vi skickar med SMS till mobilnumret du har
                registrerat hos oss. Koden gäller i tio minuter, och Camilla ber dig aldrig om personnummer eller koden i chatten.
                Innan något ändras ser du en sammanfattning och bekräftar själv – och du får en bekräftelse med SMS.
              </p>
            </div>
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-text-secondary">
          Du kan också nå oss via{" "}
          <a href="https://stodona.twportal.se" className="underline underline-offset-4 hover:text-text-primary" target="_blank" rel="noopener noreferrer">
            kundportalen
          </a>
          .
        </p>
      </section>
    </div>
  );
}
