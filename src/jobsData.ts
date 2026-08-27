import type { LucideIcon } from "lucide-react";
import { Home, HardHat, Sparkles, Wind, Baby, Briefcase, Handshake } from "lucide-react";

// Datum då annonserna senast lades ut/uppdaterades. Uppdatera vid ompublicering
// (används i JobPosting-schemat för Google for Jobs).
export const JOBS_POSTED_DATE = "2026-08-27";

export interface Job {
  slug: string;
  title: string;
  icon: LucideIcon;
  image: string;
  short: string; // kort beskrivning på kortet
  type: string; // visas som etikett, t.ex. "Deltid/Heltid"
  employmentType: string; // schema.org: FULL_TIME | PART_TIME | CONTRACTOR ...
  location: string;
  intro: string;
  about: string;
  tasks: string[];
  requirements: string[];
  offer: string[];
}

const OFFER_STANDARD = [
  "Marknadsmässig lön och försäkring",
  "Ordentlig introduktion och upplärning",
  "Ett omtänksamt team som stöttar varandra",
  "Flexibilitet och möjlighet att växa hos oss",
];

export const JOBS: Job[] = [
  {
    slug: "hemstadare",
    title: "Hemstädare",
    icon: Home,
    image: "/stodona_right_image.jpg",
    short: "Skapa hotellkänsla i våra kunders hem. Regelbundna uppdrag, mest dagtid.",
    type: "Deltid/Heltid",
    employmentType: "PART_TIME",
    location: "Stockholm med omnejd",
    intro:
      "Vi söker noggranna och serviceinriktade hemstädare som vill ge våra kunder ett skinande rent hem och lite mer tid över till livet.",
    about:
      "Som hemstädare hos Stodona ansvarar du för regelbunden städning i våra kunders hem. Du arbetar oftast dagtid och följer Stodona-metoden – vårt kvalitetssystem som gör att varje städning håller samma höga standard. Du blir en trygg och återkommande person hos dina kunder.",
    tasks: [
      "Regelbunden hemstädning enligt checklista",
      "Damning, dammsugning och våttorkning av golv",
      "Rengöring av kök och badrum",
      "Se till att kunden känner sig trygg och nöjd",
    ],
    requirements: [
      "Du är noggrann, punktlig och ansvarsfull",
      "Du har öga för detaljer och tar stolthet i ett rent resultat",
      "Du talar svenska eller engelska",
      "Erfarenhet av städning är meriterande men inget krav – vi lär dig",
    ],
    offer: OFFER_STANDARD,
  },
  {
    slug: "byggstadare",
    title: "Byggstädare",
    icon: HardHat,
    image: "/byggstadning.jpg",
    short: "Grov- och finstädning efter bygg och renovering. Varierat och fysiskt.",
    type: "Deltid/Heltid",
    employmentType: "PART_TIME",
    location: "Stockholm med omnejd",
    intro:
      "Gillar du fysiskt arbete med tydligt resultat? Vi söker byggstädare som gör nybyggda och renoverade lokaler inflyttningsklara.",
    about:
      "Som byggstädare arbetar du med grovstädning och finstädning efter byggprojekt och renoveringar. Arbetet är varierat och fysiskt, och du ser direkt resultatet av ditt jobb när dammet är borta och lokalen är redo att tas i bruk.",
    tasks: [
      "Grovstädning och bortforsling av byggdamm",
      "Våttorkning av ytor, väggar och fönster",
      "Finstädning och slutstädning inför inflyttning",
      "Kvalitetskontroll av det färdiga resultatet",
    ],
    requirements: [
      "Du är fysiskt aktiv och gillar att jobba på",
      "Du är noggrann även när det ska gå undan",
      "Du är flexibel med arbetsplatser runt om i Stockholm",
      "B-körkort är meriterande",
    ],
    offer: OFFER_STANDARD,
  },
  {
    slug: "flytt-storstadare",
    title: "Flytt- & storstädare",
    icon: Sparkles,
    image: "/stodona-stad.jpg",
    short: "Djuprengöring och flyttstäd med garanti – för dig som gillar noggrannhet.",
    type: "Deltid/Heltid",
    employmentType: "PART_TIME",
    location: "Stockholm med omnejd",
    intro:
      "Vi söker dig som älskar att djuprengöra och lämna ett hem skinande rent – med vår flyttstädningsgaranti i ryggen.",
    about:
      "Som flytt- och storstädare utför du grundliga djuprengöringar och flyttstädningar. Du arbetar efter en noggrann checklista som säkerställer att bostaden blir godkänd, och du tar stolthet i att lämna varje hem felfritt.",
    tasks: [
      "Flyttstädning enligt checklista med garanti",
      "Storstädning och djuprengöring av hela bostaden",
      "Rengöring av ugn, kyl/frys, skåp och våtutrymmen",
      "Noggrann slutkontroll före överlämning",
    ],
    requirements: [
      "Du är mycket noggrann och uthållig",
      "Du gillar ett fysiskt och resultatinriktat arbete",
      "Du talar svenska eller engelska",
      "Erfarenhet av flytt-/storstädning är meriterande",
    ],
    offer: OFFER_STANDARD,
  },
  {
    slug: "fonsterputsare",
    title: "Fönsterputsare",
    icon: Wind,
    image: "/fonster-stodona.jpg",
    short: "Ge skinande rena fönster året runt, hemma och på företag.",
    type: "Deltid/Heltid",
    employmentType: "PART_TIME",
    location: "Stockholm med omnejd",
    intro:
      "Vi söker fönsterputsare som ger våra kunder rändfria, skinande fönster – både i hem och hos företag.",
    about:
      "Som fönsterputsare hos Stodona putsar du fönster året runt med rätt teknik och utrustning. Du arbetar både i privata hem och i företagslokaler och ser till att utsikten alltid är kristallklar.",
    tasks: [
      "Putsning av fönster in- och utvändigt",
      "Avtorkning av karmar och fönsterbänkar",
      "Arbete i både hem och företagslokaler",
      "Säkert arbete med rätt utrustning",
    ],
    requirements: [
      "Du är noggrann och gillar ett rörligt arbete",
      "Du är bekväm med att arbeta på höjd (stege)",
      "Du är serviceinriktad mot kund",
      "Erfarenhet av fönsterputs är meriterande",
    ],
    offer: OFFER_STANDARD,
  },
  {
    slug: "barnvakt",
    title: "Barnvakt",
    icon: Baby,
    image: "/familj-stodona.jpg",
    short: "Trygg och varm barnpassning i familjers hem.",
    type: "Deltid/Extra",
    employmentType: "PART_TIME",
    location: "Stockholm med omnejd",
    intro:
      "Älskar du barn? Bli barnvakt hos Stodona och ge familjer trygghet i vardagen – flexibelt och meningsfullt.",
    about:
      "Som barnvakt tar du hand om barn i familjers hem med värme, närvaro och ansvar. Du hjälper till med allt från lek och läxor till hämtning och enklare måltider. Alla våra barnvakter är noggrant utvalda och kontrollerade för familjernas trygghet.",
    tasks: [
      "Barnpassning i familjens hem, dag eller kväll",
      "Lek, aktiviteter och läxhjälp",
      "Hämtning och lämning vid behov",
      "Enklare måltider och rutiner",
    ],
    requirements: [
      "Du är minst 18 år och älskar att umgås med barn",
      "Du har erfarenhet av barn (jobb, utbildning, syskon m.m.)",
      "Du är ansvarsfull, trygg och punktlig",
      "Du kan uppvisa utdrag ur belastningsregistret och lämna referenser",
    ],
    offer: [
      "Flexibla tider som passar din vardag",
      "Marknadsmässig lön och försäkring",
      "Utbildning i HLR och första hjälpen för barn",
      "Meningsfullt arbete som gör verklig skillnad",
    ],
  },
  {
    slug: "konsult",
    title: "Konsult",
    icon: Briefcase,
    image: "/kontorsstadning.jpg",
    short: "Uppdrag som konsult inom service och städ – flexibelt upplägg.",
    type: "Uppdrag",
    employmentType: "CONTRACTOR",
    location: "Stockholm med omnejd",
    intro:
      "Vi söker erfarna konsulter inom service och städ för uppdrag hos våra kunder – med flexibelt upplägg.",
    about:
      "Som konsult tar du dig an uppdrag inom service och städ där din erfarenhet gör skillnad. Upplägget är flexibelt och passar dig som vill arbeta självständigt, ofta med större eller återkommande kunduppdrag.",
    tasks: [
      "Självständiga uppdrag hos våra kunder",
      "Kvalitetssäkring och uppföljning",
      "Bidra med din erfarenhet och expertis",
      "Vara en trygg representant för Stodona",
    ],
    requirements: [
      "Du har erfarenhet inom service, städ eller angränsande område",
      "Du är självgående och lösningsorienterad",
      "Du har god kommunikationsförmåga",
      "Eget företag (F-skatt) är meriterande",
    ],
    offer: [
      "Flexibla och varierande uppdrag",
      "Konkurrenskraftig ersättning",
      "Långsiktiga samarbeten",
      "Ett professionellt team i ryggen",
    ],
  },
  {
    slug: "underleverantor",
    title: "Underleverantör",
    icon: Handshake,
    image: "/stodona_left_image.jpg",
    short: "Är ni ett städbolag som vill samarbeta? Bli underleverantör till Stodona.",
    type: "Samarbete",
    employmentType: "OTHER",
    location: "Stockholm med omnejd",
    intro:
      "Driver ni ett seriöst städbolag och vill växa tillsammans med oss? Vi söker pålitliga underleverantörer i Stockholmsområdet.",
    about:
      "Som underleverantör till Stodona utför ni uppdrag åt våra kunder under vårt varumärke och våra kvalitetskrav. Vi söker seriösa, försäkrade och pålitliga partners som delar vår syn på kvalitet och kundnöjdhet.",
    tasks: [
      "Utföra städuppdrag åt Stodonas kunder",
      "Hålla vår kvalitets- och servicenivå",
      "Ha en tydlig och stabil organisation",
      "Kommunicera öppet och professionellt med oss",
    ],
    requirements: [
      "Registrerat företag med F-skatt och ansvarsförsäkring",
      "Erfarenhet av professionell städning",
      "Egen personal med ordnade anställningsvillkor",
      "Kapacitet att ta återkommande uppdrag i Stockholm",
    ],
    offer: [
      "Löpande uppdrag och stabilt samarbete",
      "Tydliga rutiner och schysst betalning",
      "Långsiktig relation med ett växande varumärke",
      "En seriös och professionell partner",
    ],
  },
];

export function getJob(slug: string | undefined): Job | undefined {
  return JOBS.find((j) => j.slug === slug);
}
