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

// Prisupplägg för barnpassning.
// OBS: EXEMPELPRISER – sätt era egna nivåer. Barnpassning i hemmet är
// RUT-berättigat (50%); `afterRut` visar priset efter avdrag.
export interface NannyPlan {
  name: string;
  tagline: string;
  price: string; // huvudsiffra, t.ex. "6 590 kr"
  unit: string; // t.ex. "/månad" eller "/timme"
  hint: string; // t.ex. "≈ 330 kr/tim"
  afterRut: string; // t.ex. "≈ 3 295 kr/mån efter RUT"
  featured?: boolean;
  features: string[];
}

export const NANNY_PLANS: NannyPlan[] = [
  {
    name: "Flexibel",
    tagline: "När behovet dyker upp",
    price: "395 kr",
    unit: "/timme",
    hint: "Ingen bindningstid",
    afterRut: "≈ 198 kr/tim efter RUT",
    features: [
      "Boka enstaka tillfällen vid behov",
      "Minsta bokning 3 timmar",
      "Kväll & helg möjligt",
      "Perfekt för det oplanerade",
    ],
  },
  {
    name: "Vardag",
    tagline: "För dig som behöver hjälp regelbundet",
    price: "6 590 kr",
    unit: "/månad",
    hint: "20 timmar/månad · ≈ 330 kr/tim",
    afterRut: "≈ 3 295 kr/mån efter RUT",
    featured: true,
    features: [
      "20 timmar barnpassning varje månad",
      "Lägre timpris än tillfällig bokning",
      "Samma trygga barnvakt så ofta som möjligt",
      "Prioriterad bokning",
      "Rulla över oanvända timmar en månad",
    ],
  },
  {
    name: "Familj",
    tagline: "Fast barnvakt i vardagen",
    price: "12 600 kr",
    unit: "/månad",
    hint: "40 timmar/månad · ≈ 315 kr/tim",
    afterRut: "≈ 6 300 kr/mån efter RUT",
    features: [
      "40 timmar barnpassning varje månad",
      "Vårt bästa timpris",
      "Dedikerad fast barnvakt",
      "Prioriterad bokning & flexibel schemaläggning",
      "Personlig kontaktperson hos oss",
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
