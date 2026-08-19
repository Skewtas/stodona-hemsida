// Barnvakter som visas på /barnpassning.
// OBS: platshållare – byt ut mot era riktiga barnvakter (namn, foto, bio)
// innan sidan görs publik. Lägg foto i public/ och ange sökvägen i `image`.
export interface Nanny {
  name: string;
  age: number;
  role: string;
  experience: string;
  image?: string; // t.ex. "/barnvakt-amanda.jpg" – tomt = initial-avatar
  languages: string[];
  tags: string[];
  quote: string;
  funFact: string;
}

// ─────────────────────────────────────────────────────────────────────────
// PRISLOGIK – EN ENDA KÄLLA (används av både kundsidan och personal/admin)
// ─────────────────────────────────────────────────────────────────────────
// Alla priser är KUNDENS pris EFTER RUT-avdrag (50 % redan avdraget).
//
//   PROVA PÅ    3 timmar          = 499 kr efter RUT (engång, per familj)
//   FLEX        0 fasta tim/mån   = 269 kr/tim efter RUT
//   MINI        8 tim/mån         = 229 kr/tim  → 1 832 kr/mån
//   FAMILJ      16 tim/mån        = 209 kr/tim  → 3 344 kr/mån   (MEST POPULÄR)
//   FAMILJ PLUS 32+ tim/mån       = 199 kr/tim  → 6 368 kr/mån
//
// EXTRA TIMMAR: debiteras alltid enligt kundens AKTUELLA pakets timpris.
//   Ex: Familj-kund (16 tim, 209 kr/tim) använder 20 tim
//       → alla 20 tim debiteras 209 kr/tim = 4 180 kr.
// Rekommendation via timmar/månad: 0–7 Flex · 8–15 Mini · 16–31 Familj · 32+ Familj Plus
export interface NannyPlan {
  key: "flex" | "mini" | "familj" | "familjplus";
  name: string;
  tagline: string;
  hourly: number; // kr/timme EFTER RUT – den fasta timpris som gäller för paketet
  hoursPerMonth: number; // fasta timmar/månad (0 = ingen fast volym)
  hoursLabel: string; // hur timvolymen visas, t.ex. "Från 32 timmar/månad"
  weekly?: string; // t.ex. "Cirka 4 timmar barnpassning per vecka"
  monthly?: number; // normal månadskostnad EFTER RUT (hourly × hoursPerMonth)
  badge?: string; // t.ex. "MEST POPULÄR"
  featured?: boolean;
  cta: string;
  features: string[];
}

export const NANNY_TRIAL = {
  hours: 3,
  price: 499, // kr efter RUT
  cta: "Prova barnpassning",
};

export const NANNY_PLANS: NannyPlan[] = [
  {
    key: "flex",
    name: "Flex",
    tagline: "För familjer som behöver barnpassning ibland och vill kunna boka vid behov.",
    hourly: 269,
    hoursPerMonth: 0,
    hoursLabel: "Ingen fast månadsvolym",
    cta: "Boka barnpassning",
    features: [
      "Ingen fast månadsvolym",
      "Bokning efter tillgänglighet",
      "Matchning med kvalitetssäkrad barnvakt",
      "Passar kvällar, helger och enstaka tillfällen",
      "Minst 3 timmar per bokning",
    ],
  },
  {
    key: "mini",
    name: "Mini",
    tagline: "Cirka 2 timmar barnpassning per vecka.",
    hourly: 229,
    hoursPerMonth: 8,
    hoursLabel: "8 timmar/månad",
    weekly: "Cirka 2 timmar barnpassning per vecka",
    monthly: 1832,
    cta: "Välj Mini",
    features: [
      "Återkommande barnpassning",
      "Vi eftersträvar samma barnvakt varje gång",
      "Personlig matchning",
      "Möjlighet till hämtning från förskola/skola",
      "Barnpassning hemma",
      "Enklare mellanmål eller mat till barnet i samband med barnpassningen",
      "Extra timmar kan bokas enligt paketets timpris",
    ],
  },
  {
    key: "familj",
    name: "Familj",
    tagline: "Cirka 4 timmar barnpassning per vecka.",
    hourly: 209,
    hoursPerMonth: 16,
    hoursLabel: "16 timmar/månad",
    weekly: "Cirka 4 timmar barnpassning per vecka",
    monthly: 3344,
    badge: "MEST POPULÄR",
    featured: true,
    cta: "Välj Familj",
    features: [
      "Fast återkommande barnvakt",
      "Återkommande schema",
      "Personlig matchning",
      "Hämtning från förskola eller skola",
      "Barnpassning hemma",
      "Mellanmål/enklare middag till barnet",
      "Extra timmar enligt samma timpris",
      "Prioriterad hjälp vid behov av förändringar i schemat",
    ],
  },
  {
    key: "familjplus",
    name: "Familj Plus",
    tagline: "För familjer som behöver regelbunden hjälp en eller flera dagar i veckan.",
    hourly: 199,
    hoursPerMonth: 32,
    hoursLabel: "Från 32 timmar/månad",
    monthly: 6368,
    cta: "Välj Familj Plus",
    features: [
      "Fast barnvakt",
      "Fast återkommande schema",
      "Personlig matchning",
      "Hämtning från förskola/skola",
      "Barnpassning hemma",
      "Mellanmål/enklare middag",
      "Extra timmar enligt samma timpris",
      "Prioriterad kundservice",
      "Vi hjälper i möjligaste mån till med ersättare om ordinarie barnvakt är frånvarande",
    ],
  },
];

export const NANNIES: Nanny[] = [
  {
    name: "Amanda Ek",
    age: 27,
    role: "Förskollärare & barnvakt",
    experience: "8 års erfarenhet",
    languages: ["Svenska", "Engelska"],
    tags: ["Småbarn 0–3 år", "Utelek & äventyr", "Sång & musik"],
    quote:
      "Det finaste jag vet är att se ett barn växa i självförtroende. Jag skapar en trygg och lekfull vardag där nyfikenheten får ta plats.",
    funFact: "Kan somna vilket barn som helst med rätt godnattsaga.",
  },
  {
    name: "Johan Lund",
    age: 31,
    role: "Fritidspedagog & barnvakt",
    experience: "10 års erfarenhet",
    languages: ["Svenska", "Engelska", "Spanska"],
    tags: ["Skolbarn", "Läxhjälp", "Sport & rörelse"],
    quote:
      "Jag tror på struktur med glimten i ögat. Läxorna blir gjorda – och sen bygger vi världens bästa koja.",
    funFact: "Tidigare fotbollstränare för ungdomslag.",
  },
  {
    name: "Sara Nyström",
    age: 24,
    role: "Barnskötare & sjuksköterskestudent",
    experience: "6 års erfarenhet",
    languages: ["Svenska", "Engelska"],
    tags: ["HLR & första hjälpen", "Pyssel & bak", "Rutiner & trygghet"],
    quote:
      "Trygghet är allt. Med lugn, tydliga rutiner och massor av värme får både barn och föräldrar landa.",
    funFact: "Bakar världens bästa mjuka pepparkakor med barnen.",
  },
];
