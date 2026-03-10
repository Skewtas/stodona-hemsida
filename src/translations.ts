import { Lang } from './context/LanguageContext';

type TranslationMap = Record<string, { SV: string; EN: string }>;

const translations: TranslationMap = {
    // ─── LAYOUT: Header Nav ────────────────────────────────────────────
    'nav.hemstadning': { SV: 'Hemstädning', EN: 'Home Cleaning' },
    'nav.storstadning': { SV: 'Storstädning', EN: 'Deep Cleaning' },
    'nav.fonsterputsning': { SV: 'Fönsterputsning', EN: 'Window Cleaning' },
    'nav.flyttstadning': { SV: 'Flyttstädning', EN: 'Move-Out Cleaning' },
    'nav.foretagsstadning': { SV: 'Företagsstädning', EN: 'Office Cleaning' },
    'nav.boka': { SV: 'Boka direkt', EN: 'Book now' },

    // ─── LAYOUT: Footer columns ────────────────────────────────────────
    'footer.services': { SV: 'Tjänster', EN: 'Services' },
    'footer.company': { SV: 'Företag', EN: 'Company' },
    'footer.contact': { SV: 'Kontakt', EN: 'Contact' },
    'footer.hemstadning': { SV: 'Hemstädning', EN: 'Home Cleaning' },
    'footer.flyttstadning': { SV: 'Flyttstädning', EN: 'Move-Out Cleaning' },
    'footer.foretagsstadning': { SV: 'Företagsstädning', EN: 'Office Cleaning' },
    'footer.storstadning': { SV: 'Storstädning', EN: 'Deep Cleaning' },
    'footer.fonsterputsning': { SV: 'Fönsterputsning', EN: 'Window Cleaning' },
    'footer.byggstadning': { SV: 'Byggstädning', EN: 'Post-Construction Cleaning' },
    'footer.omoss': { SV: 'Om oss', EN: 'About us' },
    'footer.priser': { SV: 'Priser', EN: 'Pricing' },
    'footer.kontakt': { SV: 'Kontakt', EN: 'Contact' },
    'footer.kundportalen': { SV: 'Kundportalen', EN: 'Customer Portal' },
    'footer.varvaenvan': { SV: 'Värva en vän', EN: 'Refer a Friend' },
    'footer.visselblasning': { SV: 'Visselblåsning', EN: 'Whistleblowing' },
    'footer.kundportal': { SV: 'Kundportal', EN: 'Customer Portal' },
    'footer.description': {
        SV: 'Professionell hemstädning i Stockholm med strukturerad metod, kvalitetskontroller och nöjda återkommande kunder.',
        EN: 'Professional home cleaning in Stockholm with a structured method, quality controls, and satisfied returning customers.',
    },
    'footer.rights': { SV: 'Alla rättigheter förbehållna.', EN: 'All rights reserved.' },
    'footer.integritetspolicy': { SV: 'Integritetspolicy', EN: 'Privacy Policy' },
    'footer.villkor': { SV: 'Allmänna villkor', EN: 'Terms & Conditions' },
    'footer.cookiepolicy': { SV: 'Cookie Policy', EN: 'Cookie Policy' },
    'footer.sidkarta': { SV: 'Sidkarta', EN: 'Sitemap' },

    // ─── HOME: Hero ────────────────────────────────────────────────────
    'home.hero.title1': { SV: 'Hotellkänsla hemma.', EN: 'Hotel feeling at home.' },
    'home.hero.title2': { SV: 'På riktigt.', EN: 'For real.' },
    'home.hero.subtitle': {
        SV: 'Vi skapar tid för det som verkligen betyder något. Med vår professionella städning får du ett hem som inte bara ser rent ut, utan känns som ett femstjärnigt hotell.',
        EN: 'We create time for what truly matters. With our professional cleaning, your home won\'t just look clean – it will feel like a five-star hotel.',
    },
    'home.hero.cta1': { SV: 'Boka och se pris', EN: 'See price & book' },
    'home.hero.cta2': { SV: 'Boka möte/tele', EN: 'Schedule a call' },
    'home.hero.bullet1': { SV: 'RUT direkt på fakturan', EN: 'RUT tax deduction applied' },
    'home.hero.bullet2': { SV: 'Ingen bindningstid', EN: 'No commitment' },
    'home.hero.bullet3': { SV: 'Samma team när möjligt', EN: 'Same team when possible' },
    'home.hero.bullet4': { SV: 'Populära tider bokas snabbt', EN: 'Popular slots fill fast' },

    // ─── HOME: Booking section ─────────────────────────────────────────
    'home.book.badge': { SV: 'Snabbt & Enkelt', EN: 'Fast & Easy' },
    'home.book.title1': { SV: 'Boka din städning', EN: 'Book your cleaning' },
    'home.book.title2': { SV: 'på 60 sekunder', EN: 'in 60 seconds' },
    'home.book.subtitle': {
        SV: 'Välj tjänst, se ditt pris direkt och boka en tid som passar dig. Inga dolda avgifter, bara ren glädje.',
        EN: 'Choose a service, see your price instantly and book a time that suits you. No hidden fees, just pure joy.',
    },

    // ─── HOME: Insight section ─────────────────────────────────────────
    'home.insight.badge': { SV: 'Insikt & Statistik', EN: 'Insight & Statistics' },
    'home.insight.badge2': { SV: 'Över 500+', EN: 'Over 500+' },
    'home.insight.badge3': { SV: 'nöjda hushåll i Stockholm', EN: 'happy households in Stockholm' },
    'home.insight.title': {
        SV: 'Visste du att städningen är det vi bråkar mest om hemma?',
        EN: 'Did you know that cleaning is what we argue about most at home?',
    },
    'home.insight.title.highlight': { SV: 'mest om', EN: 'most about' },
    'home.insight.p1': {
        SV: 'Enligt en omfattande undersökning av NPA är städning den absolut vanligaste orsaken till konflikter i svenska hushåll.',
        EN: 'According to a comprehensive NPA study, cleaning is the most common source of conflict in Swedish households.',
    },
    'home.insight.p2': {
        SV: 'Vi på Stodona tror att livet är för kort för att bråka om dammråttor.',
        EN: 'At Stodona, we believe life is too short to argue about dust bunnies.',
    },
    'home.insight.p3': {
        SV: 'Låt oss ta hand om det praktiska, så att ni kan fokusera på det som faktiskt betyder något – er tid tillsammans.',
        EN: 'Let us handle the practical stuff, so you can focus on what truly matters – your time together.',
    },
    'home.insight.cta': { SV: 'Boka din harmoni här', EN: 'Book your harmony here' },

    // ─── HOME: Reviews ─────────────────────────────────────────────────
    'home.reviews.title': { SV: 'Vad våra kunder säger', EN: 'What our customers say' },
    'home.reviews.r1.text': {
        SV: '"Har provat flera städbolag tidigare men Stodona är i en klass för sig. Det är verkligen som att komma hem till ett nystädat hotellrum varje torsdag."',
        EN: '"I\'ve tried several cleaning companies before but Stodona is in a class of its own. It really is like coming home to a freshly cleaned hotel room every Thursday."',
    },
    'home.reviews.r1.service': { SV: 'Hemstädning, Vasastan', EN: 'Home Cleaning, Vasastan' },
    'home.reviews.r2.text': {
        SV: '"Otroligt smidigt att boka och resultatet av flyttstädningen var perfekt. Köparen var supernöjd och jag slapp stressen."',
        EN: '"Incredibly easy to book and the move-out cleaning result was perfect. The buyer was thrilled and I avoided all the stress."',
    },
    'home.reviews.r2.service': { SV: 'Flyttstädning, Södermalm', EN: 'Move-Out Cleaning, Södermalm' },
    'home.reviews.r3.text': {
        SV: '"Vi bytte till Stodona för vår företagsstädning och skillnaden är enorm. Personalen är trevlig, noggrann och alltid i tid."',
        EN: '"We switched to Stodona for our office cleaning and the difference is remarkable. Staff are friendly, thorough and always on time."',
    },
    'home.reviews.r3.service': { SV: 'Företagsstädning, City', EN: 'Office Cleaning, City' },

    // ─── HOME: Why Stodona ─────────────────────────────────────────────
    'home.why.title': { SV: 'Varför välja Stodona?', EN: 'Why choose Stodona?' },
    'home.why.subtitle': {
        SV: 'Vi lämnar inget åt slumpen. Vårt kvalitetssystem säkerställer ett perfekt resultat varje gång.',
        EN: 'We leave nothing to chance. Our quality system ensures a perfect result every time.',
    },
    'home.why.q1.title': { SV: 'Kvalitetsgaranti', EN: 'Quality Guarantee' },
    'home.why.q1.text': {
        SV: 'Vi är inte nöjda förrän du är det. Skulle något mot förmodan inte vara perfekt åtgärdar vi det kostnadsfritt inom 24 timmar.',
        EN: 'We\'re not satisfied until you are. If anything isn\'t perfect, we\'ll fix it free of charge within 24 hours.',
    },
    'home.why.q2.title': { SV: 'Strukturerad Metod', EN: 'Structured Method' },
    'home.why.q2.text': {
        SV: 'Vår städning följer en noggrant utarbetad checklista. Varje rum gås igenom systematiskt för att garantera högsta standard.',
        EN: 'Our cleaning follows a carefully developed checklist. Every room is reviewed systematically to guarantee the highest standard.',
    },
    'home.why.q3.title': { SV: 'Utbildad Personal', EN: 'Trained Staff' },
    'home.why.q3.text': {
        SV: 'Alla våra medarbetare genomgår en utbildning, är fullt försäkrade och har kollektivavtalsliknande villkor.',
        EN: 'All our staff complete thorough training, are fully insured and work under collective-agreement-like conditions.',
    },

    // ─── HOME: Services ────────────────────────────────────────────────
    'home.services.title': { SV: 'Våra tjänster', EN: 'Our services' },
    'home.services.subtitle': { SV: 'Skräddarsydda lösningar för ditt hem och företag.', EN: 'Tailored solutions for your home and business.' },
    'home.services.allprices': { SV: 'Se alla priser', EN: 'See all prices' },
    'home.services.readmore': { SV: 'Läs mer', EN: 'Read more' },

    // ─── HOME: Final CTA ───────────────────────────────────────────────
    'home.cta.title': { SV: 'Redo för hotellkänsla hemma?', EN: 'Ready for that hotel feeling at home?' },
    'home.cta.subtitle': { SV: 'Boka din städning idag. Ingen bindningstid, bara ett renare hem.', EN: 'Book your cleaning today. No commitment, just a cleaner home.' },
    'home.cta.btn1': { SV: 'Boka städning direkt', EN: 'Book cleaning now' },
    'home.cta.btn2': { SV: 'Se våra priser', EN: 'See our prices' },
    'home.cta.urgency': { SV: 'Tider fylls snabbt – säkra din tid idag.', EN: 'Slots fill fast – secure your time today.' },

    // ─── HOME: Service areas ───────────────────────────────────────────
    'home.areas.title1': { SV: 'Här har vi', EN: 'Our most' },
    'home.areas.title2': { SV: 'flest kunder', EN: 'popular areas' },
    'home.areas.subtitle': {
        SV: 'Med tusentals nöjda kunder är vi stolta över att vara det ledande städföretaget i dessa områden. Vi täcker stora delar av Stockholm med omnejd.',
        EN: 'With thousands of happy customers, we\'re proud to be the leading cleaning company in these areas. We cover large parts of Stockholm and surroundings.',
    },
};

export function t(key: string, lang: Lang): string {
    const entry = translations[key];
    if (!entry) return key;
    return entry[lang];
}
