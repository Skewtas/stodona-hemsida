import { useEffect, useRef } from "react";
import { Helmet } from "../seo";
import {
  CalendarDays,
  CalendarClock,
  CalendarX,
  CalendarPlus,
  ReceiptText,
  History,
  ArrowUpRight,
  ArrowDown,
  Check,
  Smartphone,
  Clock,
  KeyRound,
} from "lucide-react";
import { CHATTPLATS_ID } from "../components/ChatWidget";

/**
 * stodona.se/kundportal – hit leder gubben uppe i hörnet. Ersätter TimeWaves
 * portal: Camilla ligger inbäddad i sidan (ChatWidget ritar samtalet i
 * elementet CHATTPLATS_ID) och korten startar rätt ärende direkt.
 *
 * Bara det chatten faktiskt löser får ett kort – lova inget mer.
 */

const VAL = [
  { ikon: CalendarDays, rubrik: "Mina bokningar", text: "Kommande städningar och vem som kommer.", fraga: "Jag vill se mina kommande städningar" },
  { ikon: CalendarClock, rubrik: "Boka om", text: "Flytta en städning till en tid som passar bättre.", fraga: "Jag vill boka om min städning" },
  { ikon: ReceiptText, rubrik: "Fakturor", text: "Belopp, förfallodag, OCR och bankgiro.", fraga: "Jag vill se mina fakturor" },
  { ikon: History, rubrik: "Utförda städningar", text: "Vilka städningar som är gjorda, och av vem.", fraga: "Jag vill se mina utförda städningar" },
  { ikon: CalendarX, rubrik: "Avboka", text: "Behöver du ställa in ett tillfälle? Camilla hjälper dig.", fraga: "Jag vill avboka min städning" },
  { ikon: CalendarPlus, rubrik: "Boka ny städning", text: "Storstädning, fönsterputs eller något annat.", fraga: "Jag vill boka städning" },
];

/** Det Camilla löser direkt i chatten – bara sådant som faktiskt fungerar. */
const CHATTEN_KAN = [
  "Berättar när din nästa städning är, och vem som kommer",
  "Bokar om eller avbokar åt dig",
  "Tar fram dina fakturor – belopp, OCR och bankgiro",
  "Bekräftar ändringen med SMS direkt",
];

const LOFTEN = [
  { ikon: KeyRound, text: "Inget lösenord att komma ihåg" },
  { ikon: Smartphone, text: "SMS-kod till mobilnumret på ditt kundkort" },
  { ikon: Clock, text: "Öppet dygnet runt" },
];

export default function Kundportal() {
  const plats = useRef<HTMLDivElement>(null);
  const ram = useRef<HTMLDivElement>(null);

  // Talar om för chatten var den ska ritas, och lämnar tillbaka den till
  // hörnet när kunden går vidare till en annan sida.
  useEffect(() => {
    const meddela = (el: HTMLElement | null) => {
      window.dispatchEvent(new CustomEvent("stodona:chatt-plats", { detail: { plats: el } }));
    };
    meddela(plats.current);
    return () => meddela(null);
  }, []);

  function starta(fraga?: string) {
    // På mobilen ligger chatten under korten – ta kunden dit.
    if (!window.matchMedia("(min-width: 1024px)").matches) ram.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (fraga) window.dispatchEvent(new CustomEvent("stodona:chatt", { detail: { fraga } }));
    else window.setTimeout(() => ram.current?.querySelector<HTMLInputElement>("form input:not([type=file])")?.focus({ preventScroll: true }), 500);
  }

  return (
    <div className="relative overflow-clip bg-bg-primary">
      <Helmet>
        <title>Kundportal – dina bokningar och fakturor | Stodona</title>
        <meta
          name="description"
          content="Stodonas kundportal: se dina bokningar, boka om, hitta dina fakturor och få svar direkt av Camilla. Logga in med en SMS-kod – inget lösenord."
        />
        <link rel="canonical" href="https://stodona.se/kundportal" />
      </Helmet>

      {/* Mjukt ljus bakom chatten, så den lyfter från den krämiga botten. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-[-10%] h-[620px] w-[620px] rounded-full bg-accent/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-30%] left-[-15%] h-[520px] w-[520px] rounded-full bg-cta-hover/30 blur-3xl"
      />

      <section className="container-custom relative py-10 md:py-16 lg:py-20">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:gap-14">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-text-primary ring-1 ring-text-primary/10 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
              Kundportal
            </p>
            <h1 className="mt-5 text-4xl leading-[1.08] text-text-primary sm:text-5xl lg:text-[3.5rem]">
              Allt om din städning, <span className="italic text-accent-deep">på ett ställe.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-text-secondary">
              <strong className="font-semibold text-text-primary">Fråga Camilla i chatten, så får du hjälp direkt.</strong> Du slipper
              mejla, ringa och vänta på svar.
            </p>

            <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
              {CHATTEN_KAN.map((text) => (
                <li key={text} className="flex items-start gap-2.5 text-[15px] leading-snug text-text-primary">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-white">
                    <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>

            {/* Mobil: chatten ligger längre ner – en tydlig knapp dit. */}
            <button
              type="button"
              onClick={() => starta()}
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 font-semibold text-white shadow-lg shadow-accent/30 transition-colors hover:bg-accent-deep lg:hidden"
            >
              Ställ din fråga direkt
              <ArrowDown className="h-5 w-5 animate-bounce" aria-hidden="true" />
            </button>

            <p className="mt-8 text-xs font-semibold uppercase tracking-widest text-text-secondary">Eller välj ett ärende</p>

            <ul className="mt-3 grid grid-cols-2 gap-3 sm:gap-4">
              {VAL.map(({ ikon: Ikon, rubrik, text, fraga }) => (
                <li key={rubrik}>
                  <button
                    type="button"
                    onClick={() => starta(fraga)}
                    className="group relative flex h-full w-full flex-col rounded-2xl bg-white p-4 text-left ring-1 ring-text-primary/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-text-primary/10 hover:ring-text-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:p-5"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-bg-primary text-text-primary transition-colors duration-300 group-hover:bg-bg-dark group-hover:text-text-light">
                      <Ikon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="mt-4 block font-semibold text-text-primary">{rubrik}</span>
                    <span className="mt-1 hidden text-sm leading-snug text-text-secondary sm:block">{text}</span>
                    <ArrowUpRight
                      className="absolute right-4 top-4 h-4 w-4 text-text-primary/25 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent-deep"
                      aria-hidden="true"
                    />
                  </button>
                </li>
              ))}
            </ul>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2.5 border-t border-text-primary/10 pt-6 text-sm text-text-secondary">
              {LOFTEN.map(({ ikon: Ikon, text }) => (
                <li key={text} className="flex items-center gap-2">
                  <Ikon className="h-4 w-4 text-accent-deep" aria-hidden="true" />
                  {text}
                </li>
              ))}
            </ul>
          </div>

          {/* Chatten, med en pil som visar var frågan ska skrivas. */}
          <div ref={ram} className="scroll-mt-24 lg:sticky lg:top-36">
            <div className="mb-3 flex items-end justify-center gap-2 lg:justify-start lg:pl-6">
              <p className="font-display text-[1.35rem] italic leading-tight text-accent-deep lg:whitespace-nowrap">Ställ din fråga här – få hjälp direkt</p>
              <svg viewBox="0 0 48 56" className="kundportal-pil h-12 w-10 shrink-0 translate-y-3 text-accent-deep" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 6c20 0 30 12 28 40" />
                <path d="M23 36l11 12 9-14" />
              </svg>
            </div>
          <div className="relative h-[min(640px,74svh)] rounded-[28px] bg-white shadow-2xl shadow-text-primary/15 ring-2 ring-accent/40 lg:h-[min(640px,calc(100vh-14rem))]">
            <div className="absolute inset-0 overflow-hidden rounded-[inherit]" aria-hidden="true">
              <div className="flex items-center gap-3 bg-bg-dark px-4 py-3 text-text-light">
                <img src="/camilla.webp" alt="" width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
                <div>
                  <p className="font-bold leading-tight">Camilla</p>
                  <p className="mt-0.5 text-xs text-text-light/60">Stodonas digitala assistent</p>
                </div>
              </div>
            </div>
            <div id={CHATTPLATS_ID} ref={plats} className="absolute inset-0 rounded-[inherit]" />
          </div>
          </div>
        </div>
      </section>
    </div>
  );
}
