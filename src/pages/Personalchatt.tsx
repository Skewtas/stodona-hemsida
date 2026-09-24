import { Helmet } from "../seo";
import ChatWidget from "../components/ChatWidget";

/**
 * GÖMD sida för Stodonas personal: Camilla-chatten i personalläge, där man
 * kan logga in som valfri kund och se och boka om riktiga bokningar i
 * TimeWave. Grindad med personallösenord i middleware.ts (api/_personal.ts),
 * olänkad, inte i sitemapen och noindex.
 */
export default function Personalchatt() {
  return (
    <div className="bg-bg-primary min-h-[70vh] px-4 py-16">
      <Helmet>
        <title>Personalchatt | Stodona</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="max-w-xl mx-auto">
        <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">Endast för personal</p>
        <h1 className="text-3xl font-serif mt-2">Personalchatt med Camilla</h1>
        <div className="mt-6 space-y-3 text-sm text-text-secondary leading-relaxed">
          <p>Här provar ni Camilla precis som en kund upplever henne. Chatten är öppen nere till höger.</p>
          <p>
            Vill ni se eller ändra en bokning: skriv till exempel <em>"jag vill boka om min städning"</em>, tryck på knappen för att
            identifiera dig och logga in med kundens <strong>kundnummer</strong>.
          </p>
          <p className="rounded-xl bg-amber-100 text-amber-950 px-4 py-3">
            Obs! Det här är riktiga bokningar. En bekräftad ombokning ändras på riktigt i TimeWave, med ditt namn i kommentaren. Flytta bara
            bokningar du vet att du får ändra.
          </p>
        </div>
      </div>
      <ChatWidget lage="personal" />
    </div>
  );
}
