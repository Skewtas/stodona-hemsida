import ContentPage from "../components/ContentPage";

// Priserna nedan är hämtade direkt ur bokningssystemets prismotor
// (boka.stodona.se) för hemstädning i Stockholm, per städtillfälle, inkl. moms
// och efter RUT-avdrag. Bindningstiden styr priset: utan bindning tillkommer
// 10 %, 3 månader 6 %, 6 månader 3 % och 12 månader är grundpriset.
const PRICE_ROWS = [
  { sqm: "45 kvm", none: "941 kr", m3: "906 kr", m6: "881 kr", m12: "855 kr", saving: "2 236 kr" },
  { sqm: "70 kvm", none: "1 255 kr", m3: "1 208 kr", m6: "1 175 kr", m12: "1 140 kr", saving: "2 990 kr" },
  { sqm: "100 kvm", none: "1 412 kr", m3: "1 358 kr", m6: "1 322 kr", m12: "1 283 kr", saving: "3 354 kr" },
  { sqm: "140 kvm", none: "1 726 kr", m3: "1 660 kr", m6: "1 616 kr", m12: "1 568 kr", saving: "4 108 kr" },
];

function PriceTable() {
  return (
    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
      <table className="w-full min-w-[560px] text-base border-collapse">
        <caption className="sr-only">
          Pris per städtillfälle för hemstädning varannan vecka, efter RUT-avdrag, beroende på bindningstid
        </caption>
        <thead>
          <tr className="text-left border-b-2 border-text-primary/10">
            <th scope="col" className="py-3 pr-4 font-bold">Bostad</th>
            <th scope="col" className="py-3 pr-4 font-medium text-text-secondary">Utan bindning</th>
            <th scope="col" className="py-3 pr-4 font-medium text-text-secondary">3 mån</th>
            <th scope="col" className="py-3 pr-4 font-medium text-text-secondary">6 mån</th>
            <th scope="col" className="py-3 pr-4 font-bold">12 mån</th>
            <th scope="col" className="py-3 font-medium text-text-secondary">Du sparar</th>
          </tr>
        </thead>
        <tbody>
          {PRICE_ROWS.map((r) => (
            <tr key={r.sqm} className="border-b border-text-primary/5">
              <th scope="row" className="py-3 pr-4 font-bold text-text-primary text-left">{r.sqm}</th>
              <td className="py-3 pr-4 text-text-secondary">{r.none}</td>
              <td className="py-3 pr-4 text-text-secondary">{r.m3}</td>
              <td className="py-3 pr-4 text-text-secondary">{r.m6}</td>
              <td className="py-3 pr-4 font-bold text-text-primary">{r.m12}</td>
              <td className="py-3 font-medium text-cta-hover">{r.saving}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Stadabonnemang() {
  return (
    <ContentPage
      slug="stadabonnemang"
      breadcrumb="Städabonnemang"
      metaTitle="Städabonnemang i Stockholm – lägre pris med bindningstid | Stodona"
      metaDescription="Med städabonnemang hos Stodona får du lägre pris per städning. Välj 3, 6 eller 12 månaders bindningstid – 12 månader ger lägsta priset. Samma team varje gång, RUT dras direkt."
      title="Städabonnemang"
      intro="Städar du regelbundet? Då kan du binda din städning och betala mindre för varje städtillfälle. Du väljer själv hur länge – eller om du hellre står helt fritt."
      answerHeading="Kort om städabonnemang"
      answer={
        <>
          Ett städabonnemang betyder att du bokar återkommande hemstädning och binder dig i{" "}
          <strong className="text-text-primary">3, 6 eller 12 månader</strong> – i utbyte mot ett lägre pris per
          städning. Utan bindning tillkommer 10 % på priset, 3 månader ger 6 % påslag, 6 månader 3 %, och{" "}
          <strong className="text-text-primary">12 månader ger vårt lägsta pris</strong>. För en 70 kvm bostad som
          städas varannan vecka blir det 1 140 kr i stället för 1 255 kr per städning – 2 990 kr lägre över året.
          Du väljer bindningstid direkt i bokningen, och abonnemanget löper vidare med en månads uppsägningstid
          när bindningstiden är slut.
        </>
      }
      facts={[
        { label: "Bindningstid", value: "3, 6 eller 12 månader" },
        { label: "Lägsta pris", value: "12 månaders bindning" },
        { label: "Utan bindning", value: "10 % påslag – alltid möjligt" },
        { label: "Uppsägning", value: "1 månad efter bindningstiden" },
      ]}
      sections={[
        {
          heading: "Så fungerar det",
          body: (
            <ol className="list-decimal pl-5 space-y-2">
              <li>Välj <strong>hemstädning</strong> och hur ofta du vill ha den – varje vecka, varannan, var tredje eller var fjärde vecka.</li>
              <li>Fyll i bostadens storlek och adress så räknar vi fram priset direkt.</li>
              <li>Välj bindningstid: ingen, 3, 6 eller 12 månader. Du ser exakt vad varje alternativ kostar och sparar innan du bestämmer dig.</li>
              <li>Klart. Samma team kommer tillbaka på din tid, och RUT-avdraget dras direkt på fakturan.</li>
            </ol>
          ),
        },
        {
          heading: "Vad kostar ett städabonnemang?",
          body: (
            <>
              <p>
                Priserna nedan gäller hemstädning <strong>varannan vecka</strong> och är per städtillfälle, inklusive
                moms och efter RUT-avdrag. Kolumnen längst till höger visar vad du sparar under ett år med
                12 månaders bindning jämfört med att stå utan bindning.
              </p>
              <PriceTable />
              <p className="text-sm">
                Städar du varje vecka blir besparingen större – för 70 kvm varje vecka kostar städningen 1 048 kr i
                stället för 1 153 kr, vilket ger 5 460 kr lägre kostnad över ett år. Ditt exakta pris beror på
                bostadens storlek och hur ofta du städar, och räknas fram direkt i bokningen.
              </p>
            </>
          ),
        },
        {
          heading: "Vad ingår i abonnemanget?",
          body: (
            <>
              <p>Exakt samma städning som vanligt – abonnemanget påverkar bara priset, inte innehållet:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Dammsugning och fuktmoppning av alla golv</li>
                <li>Avtorkning av ytor, dörrar och strömbrytare</li>
                <li>Kök: bänkar, spishäll, mikro samt vitvaror och luckor utvändigt</li>
                <li>Badrum: toalett, handfat, dusch, badkar, kranar och skåp utvändigt</li>
                <li>Spegelputs och tömning av papperskorgar</li>
                <li>Samma team varje gång och 100 % nöjdgaranti</li>
              </ul>
              <p>
                Vill du lägga till ugnsrengöring, fönsterputsning eller balkongstädning går det bra att göra vid
                enskilda tillfällen – det påverkar inte abonnemanget.
              </p>
            </>
          ),
        },
        {
          heading: "Vad händer efter bindningstiden?",
          body: (
            <p>
              Abonnemanget löper vidare automatiskt med samma pris och{" "}
              <strong>en månads uppsägningstid</strong>. Du behöver alltså inte göra något för att fortsätta, och
              inte binda om dig igen. Vill du sluta säger du upp med en månads varsel. Enstaka städtillfällen kan
              du alltid avboka kostnadsfritt fram till 48 timmar innan, precis som vanligt.
            </p>
          ),
        },
        {
          heading: "Passar abonnemang alla?",
          body: (
            <>
              <p>
                Nej, och det ska det inte behöva göra. Abonnemanget lönar sig om du vet att du vill ha regelbunden
                städning under en längre period. Är du osäker – ny i bostaden, osäker på hur ofta du behöver hjälp,
                eller vill testa oss först – boka utan bindning. Det kostar 10 % mer per gång, men du står helt
                fritt och kan gå över till abonnemang när du vet att det fungerar.
              </p>
              <p>
                Driver du företag? Företagsstädning tecknar vi som avtal utifrån lokal, ytor och städfrekvens –{" "}
                <a href="/kontakt" className="text-cta-hover underline underline-offset-2">hör av dig</a> så räknar
                vi på det.
              </p>
            </>
          ),
        },
      ]}
      faq={[
        {
          q: "Vad är ett städabonnemang?",
          a: "Ett städabonnemang är återkommande hemstädning där du binder dig i 3, 6 eller 12 månader och får ett lägre pris per städtillfälle. Utan bindning tillkommer 10 % på priset.",
        },
        {
          q: "Hur mycket billigare blir det med abonnemang?",
          a: "12 månaders bindning ger vårt lägsta pris – cirka 9 % lägre per städning än utan bindning. För 70 kvm varannan vecka betyder det 1 140 kr i stället för 1 255 kr per gång, alltså 2 990 kr lägre kostnad över ett år.",
        },
        {
          q: "Måste jag binda mig för att boka städning?",
          a: "Nej. Du kan alltid boka helt utan bindningstid. Då tillkommer 10 % på priset jämfört med vårt lägsta abonnemangspris.",
        },
        {
          q: "Vad händer när bindningstiden går ut?",
          a: "Abonnemanget fortsätter automatiskt till samma pris med en månads uppsägningstid. Du behöver inte binda om dig.",
        },
        {
          q: "Kan jag avboka en enskild städning i abonnemanget?",
          a: "Ja. Enskilda tillfällen avbokar du kostnadsfritt fram till 48 timmar innan, precis som vid vanlig bokning.",
        },
        {
          q: "Gäller RUT-avdraget på abonnemang?",
          a: "Ja. RUT-avdraget på 50 % av arbetskostnaden dras direkt på fakturan, och priserna vi visar är redan efter avdrag.",
        },
      ]}
      ctaText="Välj din bindningstid direkt i bokningen – du ser priset och besparingen innan du bekräftar."
      related={[
        { label: "Hemstädning", to: "/hemstadning" },
        { label: "Priser", to: "/priser" },
        { label: "RUT-avdrag", to: "/rut-avdrag" },
        { label: "Avbokning", to: "/avbokning" },
      ]}
    />
  );
}
