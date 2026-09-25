// Avbokning av ett enskilt städtillfälle i chatten – samma säkra väg som
// ombokningen i _sjalvservice.ts:
//
//  1. forberedAvbokning (verktyg): kontrollerar att bokningen är kundens och
//     räknar avgiften enligt avbokningsreglerna. Ändrar ingenting.
//  2. Kortet i chatten visar tillfället och avgiften. Bara kundens knapp
//     "Bekräfta avbokning" går vidare – aldrig modellen.
//  3. bekraftaAvbokning: samma kontroller igen, avbokar i TimeWave via den
//     gemensamma skrivgränsen (_customerBookingActions: lås, journal,
//     återläsning), kontrollerar att tillfället står som avbokat, skapar en
//     ekonomianteckning vid avgift och bekräftar till kunden (SMS, annars mejl)
//     och till info@stodona.se. Först då säger chatten "Klart".
//
// Avbokningen är avstängd tills SJALVSERVICE_AVBOKNING=true är satt (och alltid
// på i den lokala testvärlden). Avstängd lämnar Camilla över till kundservice.

import * as lagring from './_lagring';
import { bedom } from './_avbokningsregler';
import { avtryck, datumText, sthlmTidpunkt, type Bokning } from './_bokningssystem';
import { bekraftaTillKund, nastaStadning } from './_kundbekraftelse';
import {
  FORSLAG_MINUTER,
  LOGG_NYCKEL,
  TESTLAGE,
  mejlaKundservice,
  slumpId,
  system,
  verifieradKund,
  type Bekraftelse,
  type Utfall,
} from './_sjalvservice';

const PA = process.env.SJALVSERVICE_AVBOKNING === 'true';

function avbokningPa(samtalsId: string): boolean {
  const sys = system(samtalsId);
  return Boolean(sys.avbokaTillfalle && sys.kontrolleraAvbokad && (PA || sys.namn === 'test'));
}

export const AVBOKNING_ID = /^AV-[A-Z0-9]{8}$/;

interface Avbokningsforslag {
  id: string;
  samtalsId: string;
  kundId: string;
  bokningId: string;
  tjanst: string;
  aterkommande: boolean;
  fore: { datum: string; start: string; slut: string; stadare: { id: string; namn: string } };
  avtryck: string;
  regel: string;
  avgiftKr: number;
  timmarKvar: number;
  skal: string;
  skapad: number;
  status: 'vantar' | 'klar' | 'misslyckad';
  svar?: Bekraftelse;
}

const EJ_LEGITIMERAD =
  'Kunden är INTE identifierad, eller så har identifieringen gått ut. Ändra ingenting. Be kunden identifiera sig och avsluta meddelandet med raden [[bankid]].';

// ─── Verktyg: förbered avbokning ─────────────────────────────────────────────

export async function forberedAvbokning(samtalsId: string, indata: { bokningId: string; skal: string }): Promise<string> {
  const kund = await verifieradKund(samtalsId);
  if (!kund) return EJ_LEGITIMERAD;
  if (!avbokningPa(samtalsId)) {
    return 'Avbokning går inte att göra i chatten just nu. Säg att kundservice kontrollerar avbokningen och återkommer, och lämna över med eskalera_till_kundservice – med bokningen och kundens skäl. Säg aldrig att den är avbokad.';
  }
  const sys = system(samtalsId);
  const bokning = await sys.hamtaBokning(indata.bokningId);
  if (!bokning || bokning.kundId !== kund.kundId) return 'Bokningen finns inte bland kundens bokningar. Hämta kundens bokningar med hamta_bokningar och fråga vilken som avses.';
  if (bokning.ejAndringsbar) {
    return `Det här tillfället kan inte avbokas i chatten (${bokning.ejAndringsbar}). Säg det vänligt och lämna över till kundservice.`;
  }

  const bed = bedom(bokning.tjanst, sthlmTidpunkt(bokning.datum, bokning.start), bokning.prisKr);
  if (!Number.isFinite(bed.timmarKvar) || bed.timmarKvar <= 0) {
    return 'Städningen har redan börjat eller passerat och kan inte avbokas i chatten. Lämna över till kundservice.';
  }
  const f: Avbokningsforslag = {
    id: slumpId('AV'),
    samtalsId,
    kundId: kund.kundId,
    bokningId: bokning.id,
    tjanst: bokning.tjanst,
    aterkommande: bokning.aterkommande,
    fore: { datum: bokning.datum, start: bokning.start, slut: bokning.slut, stadare: bokning.stadare },
    avtryck: avtryck(bokning),
    regel: bed.regel.id,
    avgiftKr: bed.avgiftKr,
    timmarKvar: bed.timmarKvar,
    skal: indata.skal.slice(0, 200),
    skapad: Date.now(),
    status: 'vantar',
  };
  await lagring.spara(`sjalv:forslag:${f.id}`, f, 24 * 3600);

  return [
    `Sammanfattningen är klar: avbokning av ${bokning.tjanst.toLowerCase()} ${datumText(bokning.datum)} kl. ${bokning.start}–${bokning.slut} med ${bokning.stadare.namn}${bokning.aterkommande ? ' (bara det här tillfället – övriga städningar är kvar)' : ''}.`,
    bed.avgiftKr > 0
      ? `Avgift enligt villkoren: ${bed.avgiftKr} kr (avbokningen görs inom avbokningsfristen, ${bed.regel.beskrivning}). Avgiften kommer SIST i meningen, t.ex. "… Observera att avbokningen kostar ${bed.avgiftKr} kr enligt avbokningsvillkoren."`
      : 'Avgift: 0 kr. Nämn den inte.',
    `Skriv EN kort mening, till exempel "Här är en sammanfattning – tryck Bekräfta avbokning om allt stämmer." och avsluta med den här raden exakt: [[bekrafta:${f.id}]]`,
    'Kortet visar tillfället, avgiften och knapparna. Upprepa inte allt i texten.',
    'Du kan INTE avboka själv. Det görs först när kunden trycker på Bekräfta avbokning, och då svarar systemet kunden direkt. Säg aldrig att bokningen är avbokad.',
    `Sammanfattningen gäller i ${FORSLAG_MINUTER} minuter.`,
  ].join('\n');
}

// ─── Kortet i chatten ────────────────────────────────────────────────────────

export interface Avbokningskort {
  typ: 'avbokning';
  id: string;
  tjanst: string;
  fore: { datum: string; tid: string; stadare: string };
  bara_detta_tillfalle: boolean;
  avgiftKr: number;
  avgiftText: string;
  status: 'vantar' | 'klar' | 'misslyckad' | 'utgangen';
  lasläge: boolean;
}

export async function hamtaAvbokningskort(samtalsId: string, id: string): Promise<Avbokningskort | null> {
  const kund = await verifieradKund(samtalsId);
  const f = await lagring.hamta<Avbokningsforslag>(`sjalv:forslag:${id}`);
  if (!f || f.samtalsId !== samtalsId || (kund && kund.kundId !== f.kundId)) return null;
  const utgangen = f.status === 'vantar' && (!kund || Date.now() - f.skapad > FORSLAG_MINUTER * 60000);
  return {
    typ: 'avbokning',
    id: f.id,
    tjanst: f.tjanst,
    fore: { datum: datumText(f.fore.datum), tid: `${f.fore.start}–${f.fore.slut}`, stadare: f.fore.stadare.namn },
    bara_detta_tillfalle: f.aterkommande,
    avgiftKr: f.avgiftKr,
    avgiftText:
      f.avgiftKr > 0
        ? `Städningen börjar om ${Math.max(0, Math.floor(f.timmarKvar))} timmar och ligger inom avbokningsfristen. Enligt villkoren debiteras ${f.avgiftKr} kr för avbokningen.`
        : 'Avbokningen görs i god tid och kostar ingenting.',
    status: utgangen ? 'utgangen' : f.status,
    lasläge: !system(samtalsId).kanSkriva,
  };
}

// ─── Bekräfta avbokning (bara från knappen) ──────────────────────────────────

const KUNDSERVICE_VAL = '[[val: Ja, hjälp mig via kundservice | Nej tack]]';

export async function bekraftaAvbokning(samtalsId: string, id: string, utfortAv: string | null = null, origin = ''): Promise<Bekraftelse> {
  const bekraftadTid = new Date().toISOString();
  const kund = await verifieradKund(samtalsId);
  if (!kund) return { utfall: 'EJ_LEGITIMERAD', text: 'Din identifiering har gått ut, så ingenting är ändrat. Identifiera dig igen så fortsätter vi.\n[[bankid]]' };

  const nyckel = `sjalv:forslag:${id}`;
  const f = await lagring.hamta<Avbokningsforslag>(nyckel);
  if (!f || f.samtalsId !== samtalsId || f.kundId !== kund.kundId) {
    return { utfall: 'OGILTIGT_FORSLAG', text: 'Jag hittar inte den sammanfattningen längre, så ingenting är ändrat. Vill du att jag tar fram den igen?\n[[val: Ja, avboka städningen | Nej, behåll bokningen]]' };
  }
  if (f.status !== 'vantar' && f.svar) return f.svar;
  if (Date.now() - f.skapad > FORSLAG_MINUTER * 60000) {
    return { utfall: 'UTGANGET', text: 'Sammanfattningen hann gå ut, så ingenting är ändrat.', fortsatt: 'Sammanfattningen för avbokningen gick ut. Hämta bokningen igen och ta fram en ny sammanfattning med forbered_avbokning om kunden fortfarande vill avboka.' };
  }
  if (!avbokningPa(samtalsId)) {
    return { utfall: 'SKRIVNING_AV', text: `Avbokning går inte att göra i chatten just nu, så ingenting är ändrat. Vill du att kundservice hjälper dig?\n${KUNDSERVICE_VAL}` };
  }
  if (!(await lagring.lasa(`sjalv:las:${f.bokningId}`, 60))) {
    return { utfall: 'PAGAR_REDAN', text: 'Avbokningen håller redan på att genomföras. Vänta ett ögonblick.' };
  }

  const sys = system(samtalsId);
  const vem = utfortAv ? `personalen: ${utfortAv}` : 'kunden själv (inloggad med SMS-kod)';
  const logg = { ekonomi: '', mejl: '', sms: '' };
  const tillfalle = `${datumText(f.fore.datum)} kl. ${f.fore.start}–${f.fore.slut}`;
  const beskrivning = `Kund ${f.kundId} (${kund.namn}), bokning ${f.bokningId} (${f.tjanst}) ${tillfalle} med ${f.fore.stadare.namn} (${f.fore.stadare.id}). Skäl: ${f.skal || 'inget angivet'}.`;

  const avsluta = async (utfall: Utfall, text: string, systemsvar: string, verifierad: boolean): Promise<Bekraftelse> => {
    const svar: Bekraftelse = { utfall, text };
    await lagring.spara(nyckel, { ...f, status: utfall === 'SUCCESS' ? 'klar' : 'misslyckad', svar }, 24 * 3600);
    const post = {
      tid: new Date().toISOString(),
      kanal: 'chatbot',
      system: sys.namn,
      samtalsId,
      kundId: f.kundId,
      bokningId: f.bokningId,
      forslagId: f.id,
      anstalldFore: `${f.fore.stadare.id} ${f.fore.stadare.namn}`,
      anstalldEfter: '–',
      fore: `${f.fore.datum} ${f.fore.start}-${f.fore.slut}`,
      efter: 'AVBOKAD',
      regel: f.regel,
      avgiftKr: f.avgiftKr,
      kundenBekraftade: bekraftadTid,
      systemsvar,
      verifierad,
      utfall,
      forturUtanAnstalld: [],
      mejl: logg.mejl,
      utfortAv: utfortAv ?? 'kunden',
      ekonomi: logg.ekonomi || undefined,
      sms: logg.sms || undefined,
      skal: f.skal,
    };
    console.log(`[självservice] ${JSON.stringify(post)}`);
    await lagring.laggTillILista(LOGG_NYCKEL, post, 5000).catch((fel) => console.error('avbokning: loggen kunde inte sparas', fel));
    await lagring.taBort(`sjalv:las:${f.bokningId}`);
    return svar;
  };

  const ejVerifierad = async (orsak: string) => {
    const text = `KONTROLLERA: oklart om avbokningen i chatten gick igenom. ${beskrivning} ${orsak}`;
    await sys.skapaArende('Chatten: kontrollera avbokning', text).catch(() => {});
    logg.mejl = await mejlaKundservice('KONTROLLERA: avbokning i chatten', text).catch((fel) => `MEJLET MISSLYCKADES: ${String(fel)}`);
    return avsluta('EJ_VERIFIERAD', `Jag kunde inte bekräfta att avbokningen gick igenom, så jag vill inte säga att den är klar. Jag har bett kundservice kontrollera bokningen. Vill du att de också hör av sig till dig?\n${KUNDSERVICE_VAL}`, orsak, false);
  };

  try {
    // 1. Bokningen ska vara kundens och se ut som när sammanfattningen gjordes.
    const bokning: Bokning | null = await sys.hamtaBokning(f.bokningId);
    if (!bokning || bokning.kundId !== kund.kundId || avtryck(bokning) !== f.avtryck) {
      return avsluta('BOKNINGEN_ANDRAD', 'Bokningen har ändrats sedan jag tog fram sammanfattningen, så jag har inte avbokat något. Jag hämtar dina bokningar igen.', 'ingen skrivning: avtrycket skilde sig', false);
    }
    // 2. Samma avgift som kunden såg.
    const bed = bedom(bokning.tjanst, sthlmTidpunkt(bokning.datum, bokning.start), bokning.prisKr);
    if (bed.avgiftKr !== f.avgiftKr) {
      return avsluta('VILLKOR_ANDRADE', `Villkoren hann ändras medan du tittade: avbokningen kostar nu ${bed.avgiftKr} kr enligt avbokningsreglerna. Ingenting är ändrat.\n[[val: Visa ny sammanfattning | Behåll min bokning]]`, `ingen skrivning: avgift ${f.avgiftKr} → ${bed.avgiftKr}`, false);
    }
    if (!sys.kanSkriva) {
      return avsluta('SKRIVNING_AV', `TESTLÄGE: allt är kontrollerat, men chatten skriver inte till TimeWave ännu. Ingenting är ändrat; din städning ${tillfalle} är kvar.`, 'ingen skrivning: läsläge', false);
    }

    // 3. Avboka just det här tillfället.
    const skrivning = await sys.avbokaTillfalle!(bokning);
    if (skrivning.ok === false) {
      if (skrivning.osaker) return ejVerifierad(skrivning.fel);
      return avsluta('SYSTEMFEL', `Jag kunde tyvärr inte avboka just nu. Din städning ${tillfalle} är kvar. Vill du att kundservice hjälper dig?\n${KUNDSERVICE_VAL}`, skrivning.fel, false);
    }
    // 4. Läs tillbaka: tillfället ska uttryckligen stå som avbokat.
    if (!(await sys.kontrolleraAvbokad!(bokning))) return ejVerifierad(`Systemet svarade OK (${skrivning.referens}) men tillfället står inte som avbokat.`);

    // 5. Avgift för sen avbokning: ekonomianteckning i TimeWave, annars mejl till ekonomin.
    if (f.avgiftKr > 0) {
      const rubrik = `Avgift sen avbokning ${f.avgiftKr} kr – ska faktureras`;
      const text = [
        `Sen avbokning via Stodonas chatt (${vem}).`,
        `Kund: ${kund.namn} (kund ${f.kundId}).`,
        `Tillfälle: ${f.tjanst}, ${tillfalle} med ${f.fore.stadare.namn} – avbokat.`,
        `Avbokningen gjordes ${Math.max(0, Math.floor(f.timmarKvar))} timmar före start, inom avbokningsfristen (regel ${f.regel}).`,
        `Avgift enligt villkoren: ${f.avgiftKr} kr (50 % av tillfällets kostnad). Kunden informerades och bekräftade i chatten ${bekraftadTid.slice(0, 16).replace('T', ' ')} UTC.`,
      ].join('\n');
      const anteckning = sys.skapaEkonomianteckning
        ? await sys.skapaEkonomianteckning(f.kundId, rubrik, text).catch((fel) => ({ ok: false as const, fel: String(fel) }))
        : { ok: false as const, fel: 'systemet saknar ekonomianteckningar' };
      if (anteckning.ok === true) {
        logg.ekonomi = 'ekonomianteckning skapad i TimeWave';
      } else {
        logg.ekonomi = `ekonomianteckning misslyckades (${anteckning.fel.slice(0, 120)}) – mejlad till info@`;
        logg.mejl = await mejlaKundservice(`FAKTURERA: ${rubrik} (chatten)`, `Ekonomianteckningen kunde inte skapas i TimeWave – lägg in avgiften manuellt.\n\n${text}`).catch((fel) => `MEJLET MISSLYCKADES: ${String(fel)}`);
      }
    }

    // 6. Bekräftelse till kunden (SMS, annars mejl) och sammanfattning till info@.
    const nasta = await nastaStadning(sys, f.kundId);
    const avgiftRad = f.avgiftKr > 0 ? ` Enligt villkoren debiteras ${f.avgiftKr} kr för avbokningen.` : '';
    const ovriga = f.aterkommande ? ' Dina övriga städningar är kvar som vanligt.' : '';
    const kvitto = await bekraftaTillKund(
      sys,
      f.kundId,
      {
        sms: `Hej! Din städning ${tillfalle} är avbokad.${avgiftRad}${nasta ? ` ${nasta}` : ''} Frågor? Hör av dig via kundportalen stodona.twportal.se eller chatten på www.stodona.se. Hälsningar Stodona`,
        amne: `Din städning ${datumText(f.fore.datum)} är avbokad`,
        mejl: `Hej!\n\nDin städning (${f.tjanst}) ${tillfalle} med ${f.fore.stadare.namn} är avbokad.${ovriga}${avgiftRad}${nasta ? `\n\n${nasta}` : ''}`,
      },
      origin,
      TESTLAGE
    );
    logg.sms = kvitto.logg;
    const sammanfattning = [
      `Avbokning genomförd i chatten av ${vem}.`,
      '',
      `Kund: ${kund.namn} (kund ${f.kundId})`,
      `Tjänst: ${f.tjanst}`,
      `Avbokat tillfälle: ${tillfalle}, ${f.fore.stadare.namn}${f.aterkommande ? ' (bara det här tillfället – serien är kvar)' : ''}`,
      `Skäl: ${f.skal || 'inget angivet'}`,
      `Avgift: ${f.avgiftKr > 0 ? `${f.avgiftKr} kr – ${logg.ekonomi}` : '0 kr'}`,
      `Bekräftelse till kunden: ${kvitto.logg}`,
      `TimeWave: ${skrivning.referens}, verifierad som avbokad`,
    ].join('\n');
    const mejl = await mejlaKundservice(`${kvitto.kanal ? '' : 'KONTAKTA KUNDEN – ingen bekräftelse gick fram: '}Avbokning via chatten – ${kund.namn} (kund ${f.kundId})`, sammanfattning).catch(
      (fel) => `MEJLET MISSLYCKADES: ${String(fel)}`
    );
    logg.mejl = logg.mejl ? `${logg.mejl}\n\n---\n\n${mejl}` : mejl;

    const text = [
      'Klart! ✓ Din städning är avbokad.',
      `${tillfalle.replace(/^./, (c) => c.toUpperCase())} med ${f.fore.stadare.namn}.`,
      f.avgiftKr > 0 ? `Enligt villkoren debiteras ${f.avgiftKr} kr för avbokningen.` : '',
      nasta || (f.aterkommande ? 'Dina övriga städningar är kvar som vanligt.' : ''),
      kvitto.kanal === 'sms' ? 'Du får också en bekräftelse med SMS.' : kvitto.kanal === 'mejl' ? 'Du får också en bekräftelse med mejl.' : '',
    ]
      .filter(Boolean)
      .join('\n');
    return avsluta('SUCCESS', text, `OK ${skrivning.referens}`, true);
  } catch (fel) {
    console.error('avbokning: avbröts', fel);
    return ejVerifierad(`undantag: ${String(fel).slice(0, 200)}`);
  }
}
