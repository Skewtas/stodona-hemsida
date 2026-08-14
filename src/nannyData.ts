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
