import { BlogPost } from './blogData';

// Area-specific blog articles for local SEO
// Each targets a specific area + service keyword for maximum local search visibility

const areas = [
  { name: 'Bromma', slug: 'bromma', linkSlug: '/bromma' },
  { name: 'Lidingö', slug: 'lidingo', linkSlug: '/lidingo' },
  { name: 'Nacka', slug: 'nacka', linkSlug: '/nacka' },
  { name: 'Ekerö', slug: 'ekero', linkSlug: '/ekero' },
  { name: 'Sundbyberg', slug: 'sundbyberg', linkSlug: '/sundbyberg' },
  { name: 'Solna', slug: 'solna', linkSlug: '/solna' },
  { name: 'Danderyd', slug: 'danderyd', linkSlug: '/danderyd' },
  { name: 'Täby', slug: 'taby', linkSlug: '/taby' },
  { name: 'Sollentuna', slug: 'sollentuna', linkSlug: '/sollentuna' },
  { name: 'Huddinge', slug: 'huddinge', linkSlug: '/huddinge' },
  { name: 'Haninge', slug: 'haninge', linkSlug: '/haninge' },
  { name: 'Järfälla', slug: 'jarfalla', linkSlug: '/jarfalla' },
  { name: 'Östermalm', slug: 'ostermalm', linkSlug: '/ostermalm' },
  { name: 'Södermalm', slug: 'sodermalm', linkSlug: '/sodermalm' },
  { name: 'Vasastan', slug: 'vasastan', linkSlug: '/vasastan' },
  { name: 'Djursholm', slug: 'djursholm', linkSlug: '/djursholm' },
  { name: 'Vaxholm', slug: 'vaxholm', linkSlug: '/vaxholm' },
  { name: 'Upplands Väsby', slug: 'upplands-vasby', linkSlug: '/upplands-vasby' },
  { name: 'Torsplan', slug: 'torsplan', linkSlug: '/torsplan' },
];

function generateAreaArticle(area: { name: string; slug: string; linkSlug: string }, index: number): BlogPost {
  // Cycle through different service focuses for variety
  const services = [
    {
      service: 'Hemstädning',
      serviceSlug: '/hemstadning',
      image: '/stodona_right_image.jpg',
      category: 'Hemstädning',
    },
    {
      service: 'Fönsterputsning',
      serviceSlug: '/fonsterputsning',
      image: '/fonster-stodona.jpg',
      category: 'Fönsterputsning',
    },
    {
      service: 'Flyttstädning',
      serviceSlug: '/flyttstadning',
      image: '/stodona-damm.jpg',
      category: 'Flyttstädning',
    },
  ];

  const s = services[index % 3];
  const dateOffset = index; // Different dates for each article
  const date = `2026-03-${String(Math.max(1, 15 - dateOffset)).padStart(2, '0')}`;

  return {
    slug: `${s.service.toLowerCase().replace('ö', 'o').replace('ä', 'a')}-${area.slug}`,
    title: `${s.service} ${area.name} – Professionell städning med RUT-avdrag`,
    metaDescription: `Boka ${s.service.toLowerCase()} i ${area.name}. Stodona erbjuder professionell städning med RUT-avdrag, samma team varje gång och nöjdhetsgaranti.`,
    excerpt: `Letar du efter ${s.service.toLowerCase()} i ${area.name}? Stodona erbjuder professionell städning med RUT-avdrag och nöjdhetsgaranti.`,
    date,
    category: `${area.name}`,
    readTime: '4 min',
    heroImage: s.image,
    content: `## ${s.service} i ${area.name}

Stodona erbjuder professionell [${s.service.toLowerCase()}](${s.serviceSlug}) i ${area.name} och hela Stockholmsområdet. Vi har hjälpt hundratals kunder i [${area.name}](${area.linkSlug}) att få ett skinande rent hem – och med [RUT-avdrag](/blogg/sa-fungerar-rut-avdrag-2026) betalar du bara hälften.

### Varför välja Stodona i ${area.name}?

**Samma team varje gång** — Dina städare lär känna ditt hem och dina önskemål. Det ger ett bättre resultat och du slipper förklara samma saker om och om igen.

**Ingen bindningstid** — Du bestämmer själv hur ofta du vill ha städning. Pausa eller avsluta när du vill, helt utan krångel.

**Nöjdhetsgaranti** — Inte nöjd? Kontakta oss inom 24 timmar så åtgärdar vi det utan extra kostnad. Läs mer i vår [FAQ](/faq).

**RUT-avdrag** — Vi hanterar all administration med Skatteverket. Du betalar bara 50% av arbetskostnaden direkt på fakturan. Maxbeloppet för RUT är 75 000 kr per person och år.

### Vad ingår i ${s.service.toLowerCase()} i ${area.name}?

${s.service === 'Hemstädning' ? `Vi följer en noggrann checklista vid varje hemstädning:

- ✅ Dammsugning och moppning av alla golv
- ✅ Avtorkning av fria ytor, dörrar och karmar
- ✅ Komplett köksrengöring (diskbänk, spis, vitvaror)
- ✅ Badrumsstädning (toalett, handfat, dusch)
- ✅ Putsning av speglar
- ✅ Tömning av papperskorgar

**Obs:** Vid hemstädning använder vi kundens eget städmaterial. Se vår [hemstädningssida](/hemstadning) för komplett lista.` : s.service === 'Fönsterputsning' ? `Vår fönsterputsning i ${area.name} inkluderar:

- ✅ Putsning av alla fönster insida
- ✅ Putsning av alla fönster utsida
- ✅ Rengöring av fönsterkarmar och bänkar
- ✅ Rändfritt resultat garanterat

Vi tar med alla redskap och material. Se vår [fönsterputsningssida](/fonsterputsning) för mer info.` : `Vår flyttstädning i ${area.name} inkluderar:

- ✅ Samtliga rum: golv, väggar (fläckar), lister, fönster
- ✅ Kök: ugn, spis, fläkt, kyl/frys in- och utvändigt, alla skåp
- ✅ Badrum: avkalkning, golvbrunn, kakel, badrumsskåp
- ✅ Fönsterputsning insida, utsida och mellan glasen
- ✅ 14 dagars kvalitetsgaranti

Vi tar med allt material. Se vår [flyttstädningssida](/flyttstadning) för komplett lista.`}

### Så här bokar du

1. **Gå till** vår [bokningssida](https://boka.stodona.se)
2. **Välj tjänst** och fyll i dina uppgifter
3. **Välj tid** som passar dig
4. **Klart!** Vi bekräftar din bokning direkt

Har du frågor? Kolla vår [FAQ](/faq) eller ring oss på [010-178 01 50](tel:0101780150).

### Andra tjänster i ${area.name}

Vi erbjuder även:
- [Hemstädning i ${area.name}](/hemstadning-${area.slug})
- [Fönsterputsning i ${area.name}](/fonsterputsning-${area.slug})
- [Flyttstädning i ${area.name}](/flyttstadning-${area.slug})
- [Storstädning i ${area.name}](/storstadning-${area.slug})

Se alla våra [tjänster](/) och [områden](${area.linkSlug}) i Stockholm.

[Boka ${s.service.toLowerCase()} i ${area.name}](https://boka.stodona.se) – vi har lediga tider den här veckan!`,
  };
}

export const areaBlogPosts: BlogPost[] = areas.map((area, i) => generateAreaArticle(area, i));
