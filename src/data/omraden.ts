// Lokala profiler för ortssidorna (/solna, /taby …).
//
// Syftet är att varje ortssida ska säga något som bara gäller den orten – i
// stället för samma text med ortsnamnet utbytt. Här står därför bara sådant
// som går att kontrollera: vilka bostadstyper som är vanliga i området och
// vad det betyder för städningen. Priserna hämtas ur prices.generated.ts
// (bokningssystemets prismotor), aldrig härifrån.
//
// Skriv ALDRIG in kundantal, "vi städar här varje vecka", lokala omdömen eller
// liknande utan underlag – se bokningsdatan i Bokis först.

export interface Omradesprofil {
  /** Vilka bostäder som är vanliga i området. */
  bostader: string;
  /** Vad det betyder för städningen – praktiskt, inte säljande. */
  tips: string;
  /** Två vanliga bostadsstorlekar som prisexemplen räknas på (måste finnas i prislistan). */
  sqm: [number, number];
  /** Närliggande orter vi också har sidor för (path i SERVICE_AREAS). */
  grannar: string[];
}

export const OMRADESPROFILER: Record<string, Omradesprofil> = {
  ekero: {
    bostader: "På Ekerö och Mälaröarna bor de flesta i villa eller radhus, ofta i två plan och med större ytor än i innerstaden.",
    tips: "I ett hus med flera plan, trappa och groventré tar städningen längre tid än i en lägenhet med samma yta. Ange hela boytan när du bokar, så stämmer både tid och pris från första gången.",
    sqm: [110, 140],
    grannar: ["bromma"],
  },
  lidingo: {
    bostader: "Lidingö har båda delarna: lägenheter i Larsberg, Baggeby och Torsvik, och villor och radhus i områden som Sticklinge, Brevik och Killinge.",
    tips: "Många hus på ön har stora fönsterpartier mot vattnet. Fönsterputs ingår inte i hemstädningen, men går att boka till samma dag.",
    sqm: [85, 140],
    grannar: ["ostermalm", "danderyd"],
  },
  nacka: {
    bostader: "I Nacka ligger lägenheterna tätt i Sickla, Nacka strand och Järla sjö, medan Saltsjö-Boo och Älta mest består av villor och radhus.",
    tips: "Bor du i hus i flera plan räknas hela boytan. I de nyare lägenheterna i Sickla är det ofta badrummen och de stora glasytorna som tar mest tid.",
    sqm: [70, 110],
    grannar: ["sodermalm", "tyreso"],
  },
  sundbyberg: {
    bostader: "Sundbyberg är tätbebyggt och består nästan bara av lägenheter – äldre hus kring centrum och mycket nybyggt i Ursvik och Stora Ursvik.",
    tips: "För en mindre lägenhet räcker det ofta med städning varannan vecka. Var tredje eller var fjärde vecka går också att välja om du mest vill ha hjälp med kök och badrum.",
    sqm: [45, 70],
    grannar: ["solna", "bromma"],
  },
  solna: {
    bostader: "Solna är hemmaplan för oss – Stodonas kontor ligger på Sommarvägen 5. Här bor de flesta i lägenhet, från äldre hus i Råsunda, Huvudsta och Hagalund till nybyggt i Arenastaden och Järvastaden.",
    tips: "I nybyggda lägenheter med öppen planlösning syns damm och fläckar på golven snabbt. För en tvåa eller trea brukar varannan vecka passa bra.",
    sqm: [45, 70],
    grannar: ["sundbyberg", "vasastan", "torsplan"],
  },
  ostermalm: {
    bostader: "På Östermalm dominerar sekelskifteshusen: stora våningar med högt i tak, stuckatur, parkett och höga fönster.",
    tips: "Äldre trägolv och parkett ska fuktmoppas med nästan torr mopp. Har du ömtåliga ytor – berätta det för kundservice eller i chatten, så följer det med till din städare.",
    sqm: [70, 110],
    grannar: ["vasastan", "lidingo"],
  },
  vasastan: {
    bostader: "Vasastan består till största delen av lägenheter i hus från sekelskiftet och 1920-talet – många ettor och tvåor, men också större våningar kring Vasaparken och Odenplan.",
    tips: "Äldre hus har ofta spröjsade fönster och djupa fönsternischer som samlar damm. Fönsterbrädorna torkas vid varje städning; själva fönsterputsen bokas separat.",
    sqm: [45, 65],
    grannar: ["torsplan", "ostermalm", "solna"],
  },
  torsplan: {
    bostader: "Runt Torsplan och i Hagastaden är nästan allt nybyggt: lägenheter med öppen planlösning, stora glaspartier och ofta två badrum.",
    tips: "Stora glasytor och blanka köksluckor visar fingeravtryck direkt. De torkas av vid varje städning, och fönsterputs går att lägga till när det behövs.",
    sqm: [45, 70],
    grannar: ["vasastan", "solna"],
  },
  sodermalm: {
    bostader: "Södermalm är blandat: äldre hus med mindre lägenheter kring Mariatorget och Sofo, och nyare kvarter mot Hammarbyhamnen och Rosenlund.",
    tips: "I en liten lägenhet går det fort att städa – men kök och badrum tar lika lång tid oavsett yta. Därför skiljer det mindre i pris mellan en etta och en tvåa än man kan tro.",
    sqm: [45, 65],
    grannar: ["nacka", "vasastan"],
  },
  haninge: {
    bostader: "I Haninge bor man i lägenhet i Handen, Brandbergen och nya Vega, och i villa eller radhus i Västerhaninge, Tungelsta och Vendelsö.",
    tips: "För barnfamiljer i radhus brukar varje eller varannan vecka passa bäst. Ange hela boytan, även övervåningen, så stämmer tiden.",
    sqm: [70, 110],
    grannar: ["huddinge", "tyreso"],
  },
  huddinge: {
    bostader: "Huddinge har stora villa- och radhusområden i Stuvsta, Segeltorp och Trångsund, och lägenheter kring Huddinge centrum och Flemingsberg.",
    tips: "I ett hus med flera plan och två badrum är det badrummen och trappan som tar mest tid. Ange hela boytan när du bokar, så stämmer både tid och pris.",
    sqm: [85, 140],
    grannar: ["haninge"],
  },
  bromma: {
    bostader: "Bromma är villor och radhus i Äppelviken, Ålsten, Nockeby och Höglandet – och lägenheter i Alvik, Traneberg, Abrahamsberg och Mariehäll.",
    tips: "Många av villorna är från 1920- och 30-talen, med trägolv och flera plan. Ange hela boytan när du bokar, så stämmer både tid och pris.",
    sqm: [70, 140],
    grannar: ["sundbyberg", "solna", "ekero"],
  },
  djursholm: {
    bostader: "Djursholm består nästan helt av villor, många av dem stora och äldre, i flera plan och med många rum.",
    tips: "I ett stort hus i flera plan tar trappor, badrum och golvytor mest tid. Har du önskemål om vad som ska prioriteras – berätta det för kundservice eller i chatten, så följer det med till din städare.",
    sqm: [140, 150],
    grannar: ["danderyd", "taby"],
  },
  taby: {
    bostader: "Täby har villor och radhus i Näsbypark, Viggbyholm och Gribbylund, och lägenheter i Täby centrum och det nybyggda Täby park.",
    tips: "För ett radhus brukar varannan vecka passa bra. Väljer du varje vecka blir priset per gång lägre.",
    sqm: [85, 140],
    grannar: ["danderyd", "djursholm", "vaxholm"],
  },
  danderyd: {
    bostader: "I Danderyd bor de flesta i villa – i Stocksund, Enebyberg och centrala Danderyd – medan lägenheterna ligger samlade kring Mörby centrum.",
    tips: "Större villor har ofta flera badrum och mycket golvyta. Ange hela boytan när du bokar, så stämmer både tid och pris från första gången.",
    sqm: [110, 150],
    grannar: ["djursholm", "taby", "lidingo"],
  },
  jarfalla: {
    bostader: "Järfälla sträcker sig från lägenheterna i Jakobsberg och Kallhäll till radhusen och villorna i Viksjö – och det helt nybyggda Barkarbystaden.",
    tips: "I nybyggda lägenheter är det ofta byggdamm kvar det första året. Det brukar räcka med vanlig hemstädning varannan vecka för att hålla det borta.",
    sqm: [70, 110],
    grannar: ["sollentuna", "sundbyberg"],
  },
  tyreso: {
    bostader: "Tyresö är villor och radhus i Trollbäcken och Tyresö strand, och lägenheter kring Tyresö centrum i Bollmora.",
    tips: "Med hus nära skog och vatten dras mer grus och barr in i hallen. Golven dammsugs och moppas vid varje städning.",
    sqm: [85, 110],
    grannar: ["nacka", "haninge"],
  },
  sollentuna: {
    bostader: "Sollentuna har villaområden i Helenelund, Edsviken, Häggvik och Rotebro, och lägenheter i Tureberg och Edsberg.",
    tips: "Ange hela boytan när du bokar, även källarplan som används. Då stämmer både tid och pris från början.",
    sqm: [85, 140],
    grannar: ["jarfalla", "upplands-vasby", "danderyd"],
  },
  vaxholm: {
    bostader: "I Vaxholm finns äldre trähus i de centrala kvarteren och villor på Resarö och Rindö.",
    tips: "Äldre trähus har ofta trägolv och snickerier som ska torkas med lätt fuktad duk. Berätta om huset för kundservice eller i chatten, så vet städaren vad som gäller.",
    sqm: [85, 110],
    grannar: ["taby"],
  },
  "upplands-vasby": {
    bostader: "Upplands Väsby har lägenheter kring centrum och stationen, och radhus och villor i Runby, Odenslunda och Bollstanäs.",
    tips: "För ett radhus i två plan räknas hela boytan, även övervåningen.",
    sqm: [70, 110],
    grannar: ["sollentuna"],
  },
};
