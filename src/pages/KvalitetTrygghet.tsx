import ContentPage from "../components/ContentPage";

export default function KvalitetTrygghet() {
  return (
    <ContentPage
      slug="kvalitet-och-trygghet"
      breadcrumb="Kvalitet & trygghet"
      metaTitle="Kvalitet & trygghet – nöjd-kund-garanti | Stodona"
      metaDescription="Nöjd-kund-garanti, ansvarsförsäkring och tydlig kvalitetsuppföljning. Så säkerställer Stodona att din städning blir bra – och vad som händer om du inte är nöjd."
      title="Kvalitet & trygghet"
      intro="Att släppa in någon i sitt hem kräver tillit. Här förklarar vi våra garantier, vår försäkring och vad som gör Stodona till ett tryggt val."
      answerHeading="Kort om vår kvalitet och trygghet"
      answer={<>Stodona lämnar en <strong className="text-text-primary">nöjd-kund-garanti</strong>: är du inte nöjd kommer vi tillbaka och rättar till det utan extra kostnad. Vi är fullt <strong className="text-text-primary">ansvarsförsäkrade</strong>, så om något mot förmodan går sönder ersätter vi det. Bakom företaget står Stodona AB (org.nr 559201-1059) i Solna, med 4,9/5 i snittbetyg.</>}
      facts={[
        { label: "Garanti", value: "Nöjd-kund-garanti" },
        { label: "Försäkring", value: "Ansvarsförsäkrade" },
        { label: "Företag", value: "Stodona AB" },
        { label: "Betyg", value: "4,9 / 5" },
      ]}
      sections={[
        {
          heading: "Vad händer om du inte är nöjd?",
          body: <p>Om du inte är nöjd med en städning vill vi veta det. Hör av dig inom 24 timmar efter avslutat arbete, så kommer vi tillbaka och rättar till det som blev fel – utan extra kostnad. Det är kärnan i vår nöjd-kund-garanti. Vi ser varje synpunkt som en chans att bli bättre.</p>,
        },
        {
          heading: "Försäkring och ansvar",
          body: <p>Stodona är fullt ansvarsförsäkrat. Skulle olyckan vara framme och något gå sönder under städningen ersätter vi det givetvis. Alla våra medarbetare är noggrant utvalda och arbetar under trygga anställningsvillkor.</p>,
        },
        {
          heading: "Vem står bakom Stodona?",
          body: <p>Bakom tjänsten står <strong>Stodona AB</strong>, org.nr 559201-1059, med adress Sommarvägen 5, 169 31 Solna. Vi är ett aktivt städbolag i Stockholm med kunder i hela regionen och ett snittbetyg på 4,9 av 5. Du når oss alltid via telefon eller e-post – med en riktig människa i andra änden.</p>,
        },
        {
          heading: "Trygg i ditt hem",
          body: <p>Vi hanterar nycklar och koder säkert och strävar efter samma trygga ansikte varje gång vid regelbunden städning. Du behöver inte vara hemma – de flesta kunder ger oss en nyckel eller kod och möter ett rent hem när de kommer tillbaka.</p>,
        },
      ]}
      faq={[
        { q: "Vad händer om jag inte är nöjd med städningen?", a: "Hör av dig inom 24 timmar efter avslutat arbete, så kommer vi tillbaka och rättar till det utan extra kostnad. Det är vår nöjd-kund-garanti." },
        { q: "Är Stodona försäkrat?", a: "Ja, vi är fullt ansvarsförsäkrade. Går något sönder under städningen ersätter vi det." },
        { q: "Vem står bakom Stodona?", a: "Stodona AB, org.nr 559201-1059, med adress Sommarvägen 5, 169 31 Solna. Ett aktivt städbolag i Stockholm med 4,9/5 i snittbetyg." },
        { q: "Måste jag vara hemma när ni städar?", a: "Nej. De flesta kunder ger oss en nyckel eller kod så att vi kan städa medan de är borta." },
      ]}
      related={[
        { label: "Så arbetar vi", to: "/sa-arbetar-vi" },
        { label: "Recensioner", to: "/recensioner" },
        { label: "Avbokningsvillkor", to: "/avbokning" },
      ]}
    />
  );
}
