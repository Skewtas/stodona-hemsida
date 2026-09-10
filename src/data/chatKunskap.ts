// Chattbotens kunskap: sajtens egna sidor + priserna ur prismotorn + Stodonas
// egna riktlinjer för hur vi kommunicerar.
//
// Sidtexterna genereras av scripts/build-chat-kb.mjs och ska inte ändras för
// hand – ändra sidan i stället och kör om skriptet. Riktlinjerna nedan skrivs
// däremot för hand.

import { SIDINNEHALL } from "./chatKunskap.generated";
import { PRISER_VARANNAN_VECKA, PRISER_VARJE_VECKA, type Prisrad } from "./prices.generated";

/**
 * Stodonas egna regler för hur vi pratar med kunder. Fyll på här – allt som
 * står i den här strängen väger tyngre än sidtexterna när boten svarar.
 */
export const RIKTLINJER = `Ton: varm, rak och konkret. Du är en kollega på Stodona, inte en säljare.
Duande. Inga utropstecken i rad, inga emojis, inga överdrifter som "fantastiskt" eller "helt otroligt".
Lova aldrig något vi inte kan hålla. Är du osäker säger du det och lotsar till kundtjänst.
Prata om priser efter RUT-avdrag, eftersom det är det kunden faktiskt betalar.`;

function prisrader(rader: Prisrad[]): string {
  return rader
    .map((r) => `${r.sqm} kvm: ${r.utanBindning} kr utan bindning, ${r.m3} kr vid 3 mån, ${r.m6} kr vid 6 mån, ${r.m12} kr vid 12 mån`)
    .join("\n");
}

/** Priserna som ett block till systemprompten. */
export function priserSomText(): string {
  return [
    "Hemstädning, per städtillfälle, inklusive moms och EFTER RUT-avdrag.",
    "Varannan vecka:",
    prisrader(PRISER_VARANNAN_VECKA),
    "Varje vecka:",
    prisrader(PRISER_VARJE_VECKA),
    "Längre bindningstid ger lägre pris per tillfälle. Exakt pris får kunden i bokningen på https://boka.stodona.se.",
  ].join("\n");
}

/** Sidorna på stodona.se som ett block till systemprompten. */
export function sidinnehallSomText(): string {
  return SIDINNEHALL.map((s) => `### ${s.titel} — https://stodona.se${s.rutt}\n${s.text}`).join("\n\n");
}
