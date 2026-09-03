import ContentPage from "../components/ContentPage";

export default function RutAvdrag() {
  return (
    <ContentPage
      slug="rut-avdrag"
      breadcrumb="RUT-avdrag"
      metaTitle="RUT-avdrag för städning i Stockholm | Stodona"
      metaDescription="Så fungerar RUT-avdrag för städning: du betalar bara 50 % av arbetskostnaden och Stodona sköter all administration mot Skatteverket. Guide + vanliga frågor."
      title="RUT-avdrag för städning"
      intro="Med RUT-avdraget blir professionell städning halva priset. Här förklarar vi exakt hur det fungerar – och hur Stodona sköter allt åt dig."
      answerHeading="Kort om RUT-avdrag"
      answer={<>RUT-avdrag är en skattereduktion för hushållsnära tjänster. För städning betalar du <strong className="text-text-primary">bara 50 % av arbetskostnaden</strong> – resten drar Stodona av direkt på fakturan och ansöker om från Skatteverket. Du behöver alltså inte göra något själv. Avdraget gäller privatpersoner för bland annat hemstädning, flyttstädning, storstädning och fönsterputsning.</>}
      facts={[
        { label: "Avdrag", value: "50 % av arbetskostnaden" },
        { label: "Tak", value: "Upp till 75 000 kr/person/år" },
        { label: "Gäller", value: "Privatpersoner" },
        { label: "Administration", value: "Stodona sköter allt" },
      ]}
      sections={[
        {
          heading: "Vad är RUT-avdrag?",
          body: (
            <>
              <p>RUT står för Rengöring, Underhåll och Tvätt. Det är en skattereduktion som gör att du som privatperson får dra av 50 % av <strong>arbetskostnaden</strong> för hushållsnära tjänster. Avdraget dras direkt på fakturan, så du ser det halverade priset redan när du bokar.</p>
              <p>Reduktionen gäller upp till 75 000 kr per person och år. Bor ni två vuxna i hushållet kan ni dela på tjänsterna och därmed utnyttja två tak.</p>
            </>
          ),
        },
        {
          heading: "Vilka städtjänster ger RUT-avdrag?",
          body: (
            <ul className="list-disc pl-5 space-y-1">
              <li>Hemstädning – regelbunden eller enstaka</li>
              <li>Flyttstädning</li>
              <li>Storstädning</li>
              <li>Fönsterputsning</li>
              <li>Byggstädning (för privatpersoner efter renovering)</li>
            </ul>
          ),
        },
        {
          heading: "Vem kan använda RUT-avdraget?",
          body: (
            <p>Du kan använda RUT om du har fyllt 18 år, är folkbokförd och betalar tillräckligt med skatt i Sverige, samt själv står för kostnaden för tjänsten i din bostad. Företag och bostadsrättsföreningar omfattas inte av RUT (för trapphus och lokaler gäller andra upplägg – kontakta oss så guidar vi rätt).</p>
          ),
        },
        {
          heading: "Så sköter Stodona RUT-avdraget",
          body: (
            <p>Du behöver inte fylla i något eller kontakta Skatteverket. Vi drar av dina 50 % direkt på fakturan och begär resterande belopp från Skatteverket åt dig. Skulle du redan ha nått ditt tak för året fakturerar vi bara mellanskillnaden – vi hör alltid av oss innan.</p>
          ),
        },
      ]}
      faq={[
        { q: "Hur mycket är RUT-avdraget för städning?", a: "Du betalar 50 % av arbetskostnaden. Resterande 50 % drar Stodona av direkt på fakturan och ansöker om från Skatteverket." },
        { q: "Måste jag ansöka om RUT-avdraget själv?", a: "Nej. Stodona sköter hela administrationen. Avdraget syns redan på din faktura – du behöver inte göra något." },
        { q: "Vilka städtjänster ger RUT-avdrag?", a: "Hemstädning, flyttstädning, storstädning, fönsterputsning och byggstädning för privatpersoner." },
        { q: "Vad händer om jag når taket för RUT?", a: "Då fakturerar vi mellanskillnaden utan avdrag för den delen. Vi hör alltid av oss först. Kontrollera ditt aktuella tak hos Skatteverket." },
      ]}
      related={[
        { label: "Hemstädning", to: "/hemstadning" },
        { label: "Flyttstädning", to: "/flyttstadning" },
        { label: "Priser", to: "/priser" },
      ]}
    />
  );
}
