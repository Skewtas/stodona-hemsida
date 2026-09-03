import ContentPage from "../components/ContentPage";

export default function Avbokning() {
  return (
    <ContentPage
      slug="avbokning"
      breadcrumb="Avbokning"
      metaTitle="Avbokningsvillkor för städning | Stodona"
      metaDescription="Så fungerar avbokning och ombokning hos Stodona: avboka kostnadsfritt senast 48 timmar innan städtillfället. Ingen bindningstid, en kalendermånads uppsägning."
      title="Avbokning & ombokning"
      intro="Livet är oförutsägbart – planer ändras. Här är våra enkla och tydliga villkor för att avboka eller omboka en städning."
      answerHeading="Kort om avbokning"
      answer={<>Du kan avboka eller omboka en städning <strong className="text-text-primary">kostnadsfritt senast 48 timmar</strong> innan städtillfället börjar. Hör du av dig senare än så kan vi behöva debitera för det bokade tillfället, eftersom tiden reserverats för dig. Våra abonnemang är helt obundna och sägs upp med en kalendermånads varsel.</>}
      facts={[
        { label: "Avboka senast", value: "48 timmar innan" },
        { label: "Bindningstid", value: "Ingen" },
        { label: "Uppsägning", value: "En kalendermånad" },
        { label: "Reklamation", value: "Inom 24 timmar" },
      ]}
      sections={[
        {
          heading: "Avboka eller omboka ett tillfälle",
          body: <p>Behöver du ändra en inbokad städning? Hör av dig till din kontaktperson eller kundtjänst <strong>senast 48 timmar innan</strong> tillfället börjar, så bokar vi om utan kostnad. Vid avbokning närmare inpå kan vi behöva ta betalt för den reserverade tiden – men hör alltid av dig, så hittar vi en lösning.</p>,
        },
        {
          heading: "Säga upp eller pausa abonnemang",
          body: <p>Våra abonnemang är helt obundna. Vill du avsluta återkommande städning sker uppsägning med <strong>en kalendermånads varsel</strong>. Du kan också pausa din städning, till exempel under semestern – hör bara av dig i god tid.</p>,
        },
        {
          heading: "Om du inte är nöjd",
          body: <p>Skulle något inte bli som du önskat, kontakta oss <strong>inom 24 timmar</strong> efter avslutat arbete. Då kommer vi tillbaka och rättar till det utan extra kostnad, enligt vår nöjd-kund-garanti.</p>,
        },
      ]}
      faq={[
        { q: "Hur sent kan jag avboka en städning?", a: "Kostnadsfritt senast 48 timmar innan städtillfället börjar. Vid senare avbokning kan vi behöva debitera för den reserverade tiden." },
        { q: "Har ni bindningstid?", a: "Nej, våra abonnemang är helt obundna. Uppsägning sker med en kalendermånads varsel." },
        { q: "Kan jag pausa min städning?", a: "Ja, du kan pausa din återkommande städning, till exempel under semestern. Hör av dig i god tid så löser vi det." },
      ]}
      related={[
        { label: "Kvalitet & trygghet", to: "/kvalitet-och-trygghet" },
        { label: "Villkor", to: "/villkor" },
        { label: "Kontakt", to: "/kontakt" },
      ]}
    />
  );
}
