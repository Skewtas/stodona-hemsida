import ContentPage from "../components/ContentPage";

// Mejlet kunden skickar när anmälan är gjord. Vi ber aldrig om personnummer
// här – banken har redan det, och det ska inte ligga i en mejlkorg hos oss.
const CONFIRM_MAIL =
  "mailto:info@stodona.se" +
  "?subject=" + encodeURIComponent("E-faktura anmäld i min internetbank") +
  "&body=" + encodeURIComponent(
    "Hej!\n\nJag har nu anmält Stodona som e-fakturautställare i min internetbank. " +
    "Ni får gärna byta över mig till e-faktura.\n\n" +
    "Namn:\nAdress för städningen:\nBank:\nDatum för anmälan:\n\nVänliga hälsningar\n"
  );

export default function EFaktura() {
  return (
    <ContentPage
      slug="e-faktura"
      breadcrumb="E-faktura"
      metaTitle="Så kopplar du på e-faktura | Stodona"
      metaDescription="Vill du få fakturan från Stodona direkt i internetbanken? Anmäl Stodona som e-fakturautställare i din bank, bekräfta till oss – så byter vi över dig. Tar cirka fem minuter."
      title="Så kopplar du på e-faktura"
      intro="Med e-faktura kommer fakturan färdigifylld direkt till din internetbank – inget papper, inga OCR-nummer att knappa in. Du gör anmälan i banken, vi gör resten."
      answerHeading="Kort om hur det går till"
      answer={<>E-faktura startas alltid <strong className="text-text-primary">i din internetbank</strong> – vi kan inte göra det åt dig. Logga in i banken, anmäl <strong className="text-text-primary">Stodona AB</strong> som e-fakturautställare och <strong className="text-text-primary">mejla oss när det är klart</strong>. Då ändrar vi i vårt faktureringssystem, och från nästa faktura hittar du den i internetbanken i stället för i mejlkorgen.</>}
      facts={[
        { label: "Var anmäler du?", value: "I din internetbank" },
        { label: "Du behöver", value: "BankID och ditt personnummer" },
        { label: "Tar ungefär", value: "5 minuter" },
        { label: "Gäller från", value: "Nästa faktura efter bekräftelsen" },
      ]}
      sections={[
        {
          heading: "Steg 1 – Anmäl e-faktura i din internetbank",
          body: (
            <>
              <p>Logga in på din internetbank eller bankapp med BankID. Menyerna heter olika saker i olika banker, men vägen är i princip densamma:</p>
              <div className="bg-bg-primary rounded-3xl p-6 md:p-8 border border-text-primary/5 not-prose">
                <ol className="space-y-3 text-base">
                  <li><strong className="text-text-primary">1.</strong> Gå till <strong>Betala &amp; överföra</strong> (kan heta <em>Betalningar</em> eller <em>Räkningar</em>).</li>
                  <li><strong className="text-text-primary">2.</strong> Välj <strong>E-faktura</strong> och sedan <strong>Anmäl ny e-faktura</strong> eller <strong>Sök e-fakturaföretag</strong>.</li>
                  <li><strong className="text-text-primary">3.</strong> Sök på <strong>Stodona</strong> och välj <strong>Stodona AB</strong> (org.nr 559201-1059).</li>
                  <li><strong className="text-text-primary">4.</strong> Godkänn anmälan med BankID.</li>
                </ol>
              </div>
              <p className="text-base">Har du Swedbank, Sparbankerna eller Nordea kan du i stället se valet <strong>”Ja till e-faktura”</strong>. Slår du på det får du automatiskt e-faktura från alla anslutna företag – inklusive oss – utan att söka upp oss separat.</p>
            </>
          ),
        },
        {
          heading: "Steg 2 – Uppgifterna banken frågar efter",
          body: (
            <>
              <p>Banken använder ditt <strong>personnummer</strong> för att adressera fakturan till rätt person, så anmälan behöver göras av den som fakturan står på i dag. Utöver det brukar banken fråga efter namn, adress och e-postadress.</p>
              <p>Frågar banken efter ett <strong>kundnummer eller referens</strong> hittar du det längst upp på din senaste faktura från oss. Är du osäker – hör av dig, så letar vi upp det åt dig.</p>
              <p className="text-base">Vi ber dig <strong>aldrig</strong> om ditt personnummer, BankID eller bankuppgifter via mejl eller telefon. Får du ett sådant meddelande som ser ut att komma från oss: hör av dig innan du svarar.</p>
            </>
          ),
        },
        {
          heading: "Steg 3 – Bekräfta till oss",
          body: (
            <>
              <p>Det här steget är viktigt: <strong>anmälan i banken räcker inte</strong> för att vi ska börja skicka e-faktura. Vi behöver ändra betalsättet på dig manuellt i vårt faktureringssystem, och det gör vi när du hört av dig.</p>
              <div className="bg-bg-dark text-text-light rounded-3xl p-6 md:p-8 not-prose">
                <p className="text-text-light/80 mb-5 text-base">Skicka ett kort mejl när anmälan är gjord – klicka på knappen så är det mesta redan ifyllt.</p>
                <a href={CONFIRM_MAIL} className="btn-primary bg-cta-hover text-text-primary hover:bg-white px-7 py-3.5 inline-flex items-center gap-2">
                  Bekräfta att jag anmält e-faktura
                </a>
                <p className="text-text-light/60 text-sm mt-5">Eller mejla info@stodona.se / ring 010-178 01 50.</p>
              </div>
            </>
          ),
        },
        {
          heading: "Vad händer sedan?",
          body: (
            <>
              <p>Vi markerar dig som e-fakturakund i vårt system. Nästa faktura landar då direkt i din internetbank, färdigifylld med belopp, mottagare och förfallodatum – du behöver bara godkänna den.</p>
              <p>Allt annat är som vanligt: <strong>RUT-avdraget dras direkt på fakturan</strong>, betalningstiden är tio dagar för privatpersoner och specifikationen över utförda städtillfällen finns kvar på fakturan.</p>
              <p className="text-base">Skulle du av någon anledning inte kunna ta emot e-fakturan får du automatiskt en vanlig faktura i stället – du riskerar alltså aldrig att missa en faktura.</p>
            </>
          ),
        },
        {
          heading: "Om något inte fungerar",
          body: (
            <>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Hittar du oss inte i banken?</strong> Sök på enbart ”Stodona” – vissa banker kräver att du skriver hela namnet, andra visar bara företag du redan fått faktura från. Hör av dig så hjälper vi dig vidare.</li>
                <li><strong>Fick du ändå en vanlig faktura?</strong> Anmälan behöver hinna registreras hos banken, och vi behöver din bekräftelse. Ligger den kvar efter nästa fakturaomgång – mejla oss.</li>
                <li><strong>Vill du sluta med e-faktura?</strong> Det avanmäler du själv i internetbanken, när du vill. Säg gärna till oss också, så byter vi tillbaka betalsättet direkt.</li>
              </ul>
            </>
          ),
        },
        {
          heading: "Är du företagskund?",
          body: (
            <p>Den här guiden gäller privatpersoner och e-faktura via internetbanken. För företag skickas e-faktura i stället till ert ekonomisystem – hör av dig till <strong>info@stodona.se</strong> med ert organisationsnummer och hur ni tar emot fakturor, så ordnar vi det.</p>
          ),
        },
      ]}
      faq={[
        { q: "Kostar e-faktura något?", a: "Nej. E-faktura är kostnadsfritt för dig, både hos oss och i din internetbank." },
        { q: "Är e-faktura samma sak som autogiro?", a: "Nej. Med e-faktura godkänner du varje faktura själv i internetbanken innan pengarna dras. Med autogiro dras beloppet automatiskt. E-faktura ger dig alltså kvar kontrollen över varje betalning." },
        { q: "Är e-faktura samma sak som faktura via e-post?", a: "Nej. En faktura via e-post är en PDF som du själv måste betala manuellt. En e-faktura kommer färdigifylld i din internetbank – du behöver bara godkänna den." },
        { q: "Vad händer med RUT-avdraget?", a: "Ingenting förändras. RUT-avdraget dras direkt på fakturan precis som tidigare, oavsett om du får den som e-faktura, per post eller via e-post." },
        { q: "Varför måste jag bekräfta till er när jag redan anmält mig i banken?", a: "För att vi behöver ändra betalsättet på ditt kundkort i vårt faktureringssystem. Vi ser inte alltid din anmälan i tid, och utan ändringen fortsätter fakturan gå ut på det gamla sättet." },
        { q: "Hur lång tid tar det innan e-fakturan börjar gälla?", a: "Anmälan i banken tar bara några minuter. Från det att du bekräftat till oss gäller e-faktura från nästa fakturaomgång." },
      ]}
      related={[
        { label: "Villkor", to: "/villkor" },
        { label: "Städabonnemang", to: "/stadabonnemang" },
        { label: "RUT-avdrag", to: "/rut-avdrag" },
        { label: "Kontakt", to: "/kontakt" },
      ]}
      ctaHeading="Har du anmält e-faktura?"
      ctaText="Mejla oss en rad så byter vi över dig – sedan kommer fakturan direkt till din internetbank."
      ctaPrimary={{ label: "Bekräfta till oss", href: CONFIRM_MAIL }}
    />
  );
}
