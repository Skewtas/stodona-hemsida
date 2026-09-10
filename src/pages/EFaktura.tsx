import ContentPage from "../components/ContentPage";

// Mejlet kunden skickar när anmälan är gjord. Kundnummer och fakturamejladress
// är det vi behöver för att hitta rätt kund. Vi ber aldrig om personnummer här.
const CONFIRM_MAIL =
  "mailto:info@stodona.se" +
  "?subject=" + encodeURIComponent("E-faktura anmäld i min internetbank") +
  "&body=" + encodeURIComponent(
    "Hej! Jag har anmält e-faktura i min internetbank.\n\n" +
    "Kundnummer:\nMejladress fakturan går till i dag:\nNamn:\n"
  );

export default function EFaktura() {
  return (
    <ContentPage
      slug="e-faktura"
      breadcrumb="E-faktura"
      metaTitle="Så här kopplar du på e-faktura | Stodona"
      metaDescription="Anmäl Stodona AB i din internetbank, ange kundnummer och den mejladress fakturan går till i dag – och mejla oss att det är klart. Tar fem minuter."
      title="Så här kopplar du på e-faktura"
      intro="Tre steg: du anmäler i din internetbank, vi byter över dig. Tar ungefär fem minuter."
      answerHeading="Kort om hur det går till"
      answer={<>Anmäl <strong className="text-text-primary">Stodona AB</strong> i din internetbank, ange ditt <strong className="text-text-primary">kundnummer</strong> och den <strong className="text-text-primary">mejladress fakturan går till i dag</strong>. Mejla oss sedan att det är klart – då byter vi över dig, och nästa faktura kommer direkt till internetbanken.</>}
      facts={[
        { label: "Var", value: "I din internetbank" },
        { label: "Ha framme", value: "Kundnummer och fakturamejladress" },
        { label: "Tar", value: "5 minuter" },
        { label: "Gäller från", value: "Nästa faktura" },
      ]}
      sections={[
        {
          heading: "1. Anmäl i din internetbank",
          body: (
            <>
              <ol className="list-decimal pl-6 space-y-2 marker:font-bold marker:text-text-primary">
                <li>Gå till <strong>Betala &amp; överföra</strong> → <strong>E-faktura</strong> → <strong>Anmäl ny</strong>.</li>
                <li>Sök på <strong>Stodona</strong> och välj <strong>Stodona AB</strong> (org.nr 559201-1059).</li>
                <li>Ange ditt <strong>kundnummer</strong> och din <strong>fakturamejladress</strong>.</li>
                <li>Signera med BankID.</li>
              </ol>
              <p className="text-base">Har du Swedbank, Sparbankerna eller Nordea kan du i stället slå på <strong>”Ja till e-faktura”</strong> – då kommer våra fakturor med automatiskt.</p>
            </>
          ),
        },
        {
          heading: "2. Uppgifterna du behöver",
          body: (
            <div className="bg-bg-primary rounded-3xl p-6 md:p-8 border border-text-primary/5 not-prose">
              <dl className="space-y-4 text-base">
                <div>
                  <dt className="font-bold text-text-primary">Kundnummer</dt>
                  <dd className="text-text-secondary">Står överst på din senaste faktura från oss.</dd>
                </div>
                <div>
                  <dt className="font-bold text-text-primary">Fakturamejladress</dt>
                  <dd className="text-text-secondary">Den adress du får fakturan på i dag – skriv den precis som den ser ut.</dd>
                </div>
              </dl>
            </div>
          ),
        },
        {
          heading: "3. Bekräfta till oss",
          body: (
            <>
              <p>Anmälan i banken räcker inte – vi byter betalsätt manuellt. Mejla ditt <strong>kundnummer</strong> och din <strong>fakturamejladress</strong>, så är du klar.</p>
              <div className="not-prose">
                <a href={CONFIRM_MAIL} className="btn-primary px-7 py-3.5 inline-flex items-center gap-2">
                  Bekräfta till oss
                </a>
                <p className="text-text-secondary text-sm mt-3">info@stodona.se · 010-178 01 50</p>
              </div>
            </>
          ),
        },
        {
          heading: "Bra att veta",
          body: (
            <ul className="list-disc pl-6 space-y-2">
              <li>RUT-avdraget dras på fakturan som vanligt.</li>
              <li>Du godkänner varje faktura själv i banken – det är inte autogiro.</li>
              <li>Kan du inte ta emot e-fakturan får du en vanlig faktura automatiskt.</li>
              <li>Du avanmäler när du vill i internetbanken.</li>
              <li>Företagskund? Mejla ert org.nr till info@stodona.se, så löser vi det.</li>
            </ul>
          ),
        },
      ]}
      faq={[
        { q: "Var hittar jag mitt kundnummer?", a: "Överst på din senaste faktura från oss. Hittar du inte fakturan – mejla info@stodona.se så letar vi upp numret." },
        { q: "Vilken mejladress ska jag ange?", a: "Den adress du får dina fakturor på i dag. Det är den vi hittar rätt kund med i faktureringssystemet." },
        { q: "Varför måste jag bekräfta när jag redan anmält mig i banken?", a: "För att vi byter betalsätt manuellt i vårt faktureringssystem. Utan din bekräftelse fortsätter fakturan gå ut på det gamla sättet." },
        { q: "Kostar e-faktura något?", a: "Nej, det är kostnadsfritt." },
        { q: "När börjar det gälla?", a: "Från nästa faktura efter att du bekräftat till oss." },
      ]}
      related={[
        { label: "Villkor", to: "/villkor" },
        { label: "RUT-avdrag", to: "/rut-avdrag" },
        { label: "Kontakt", to: "/kontakt" },
      ]}
      heroImage={{
        src: "/samarbete-hero.jpg",
        alt: "Tre kvinnor i ett möte vid ett bord med utsikt över Stockholm",
        position: "center",
        layout: "split",
      }}
      ctaHeading="Har du anmält e-faktura?"
      ctaText="Mejla ditt kundnummer och fakturamejladress, så byter vi över dig."
      ctaPrimary={{ label: "Bekräfta till oss", href: CONFIRM_MAIL }}
    />
  );
}
