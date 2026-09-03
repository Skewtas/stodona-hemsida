import ContentPage from "../components/ContentPage";

export default function SaArbetarVi() {
  return (
    <ContentPage
      slug="sa-arbetar-vi"
      breadcrumb="Så arbetar vi"
      metaTitle="Så arbetar vi – Stodona-metoden | Städning i Stockholm"
      metaDescription="Så fungerar en städning med Stodona: samma team varje gång, tydligt kvalitetssystem, miljövänliga produkter och en personlig kontaktperson. Steg för steg."
      title="Så arbetar vi"
      intro="Vi vill att städning ska kännas enkelt och tryggt. Här är Stodona-metoden – hur vi jobbar från bokning till uppföljning."
      answerHeading="Kort om hur vi arbetar"
      answer={<>Stodona arbetar med <strong className="text-text-primary">fasta team</strong> som lär känna ditt hem, en tydlig städchecklista och miljövänliga produkter. Du får en personlig kontaktperson och vi följer upp kvaliteten löpande. Målet är samma höga standard varje gång – utan att du behöver tänka på det.</>}
      facts={[
        { label: "Team", value: "Samma varje gång" },
        { label: "Produkter", value: "Miljövänliga" },
        { label: "Uppföljning", value: "Löpande kvalitetskontroll" },
        { label: "Kontakt", value: "Personlig kontaktperson" },
      ]}
      sections={[
        {
          heading: "Steg för steg",
          body: (
            <ol className="list-decimal pl-5 space-y-2">
              <li><strong>Boka</strong> – välj tjänst och tid online eller hör av dig, så tar vi fram ett upplägg som passar.</li>
              <li><strong>Matchning</strong> – vi matchar dig med ett team som passar ditt hem och dina önskemål.</li>
              <li><strong>Städning</strong> – vi städar enligt en tydlig checklista, med din feedback som utgångspunkt.</li>
              <li><strong>Uppföljning</strong> – vi stämmer av att du är nöjd och justerar upplägget vid behov.</li>
            </ol>
          ),
        },
        {
          heading: "Samma team varje gång",
          body: <p>Vid regelbunden städning strävar vi alltid efter att samma städare eller team kommer till dig. Det gör att de lär känna ditt hem och dina rutiner – och att kvaliteten blir jämn. Vid sjukdom eller ledighet skickar vi en vikarie så att din städning aldrig blir inställd.</p>,
        },
        {
          heading: "Vårt kvalitetssystem",
          body: <p>Varje städning utgår från en checklista anpassad efter din bostad. Vi följer upp resultatet löpande och tar din feedback på allvar – är något inte perfekt rättar vi till det. Vår nöjd-kund-garanti innebär att vi kommer tillbaka om du inte är nöjd.</p>,
        },
        {
          heading: "Miljövänligt och tryggt",
          body: <p>Vi använder miljövänliga produkter som är skonsamma för hem, barn och husdjur. Alla våra medarbetare är noggrant utvalda, och vi är fullt ansvarsförsäkrade så att du kan känna dig trygg när vi är i ditt hem.</p>,
        },
      ]}
      faq={[
        { q: "Är det samma städare varje gång?", a: "Ja, vid regelbunden städning strävar vi alltid efter samma team. Vid sjukdom eller ledighet skickar vi en vikarie så att städningen inte ställs in." },
        { q: "Vilka produkter använder ni?", a: "Vi använder miljövänliga produkter som är skonsamma för hem, barn och husdjur." },
        { q: "Måste jag vara hemma när ni städar?", a: "Nej. De flesta av våra kunder ger oss en nyckel eller kod så att vi kan städa medan de är på jobbet." },
      ]}
      related={[
        { label: "Kvalitet & trygghet", to: "/kvalitet-och-trygghet" },
        { label: "Hemstädning", to: "/hemstadning" },
        { label: "Om oss", to: "/om-oss" },
      ]}
    />
  );
}
