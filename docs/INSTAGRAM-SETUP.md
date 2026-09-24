# Instagram – aktivering av Camilla

Status 2026-09-24: förberedd koppling, ännu inte aktiverad mot Meta.

## Kod och projekt

- Vercel: `ranis-projects-088ff04d/stodona-hemsida`.
- Befintlig Meta-app: `Stodona.se`, app-id `1115375241439792`.
- Instagram-konto i företagets resurser: `stodona.se`.
- Den befintliga Instagram-implementationen kopierades från det opublicerade arbetet i `/Users/mikaela/Stodona-hemsida` till grenen `codex/instagram-camilla`. Originalmappen ändrades inte.
- Grundversion: `337df09`; integrationsversion: `b5b4256`.

## Inställningar

Sparade i Vercels produktionsmiljö:

- `INSTAGRAM_CHAT=test`
- `IG_VERIFY_TOKEN` (hemligt värde)
- `KANAL_INTERN_NYCKEL` (hemligt värde, 48 tecken)

Återstår:

1. Kontrollera Instagram API med Instagram-inloggning i Meta-appen och anslut rätt konto.
2. Spara `IG_APP_SECRET` och en giltig långlivad `IG_ACCESS_TOKEN` i samma Vercel-projekt. Lägg aldrig nycklar i Git.
3. Publicera integrationen på sajtens slutliga adress. Kontrollera verifieringsanropets exakta URL utan att följa omdirigeringar.
4. Registrera `/api/instagram` med samma verifieringstoken och prenumerera på `messages` för kontot.
5. Skicka ett DM från testkontot och hämta dess Instagram-scoped id ur Vercels logg. Spara i `IG_TESTARE` och bygg om så miljövariablerna används.
6. Stäng av automatiska svar och bortasvar i Meta Business Suite.
7. Prova riktigt DM, snabbsvar, personalövertagande och felhantering. Byt först därefter till `INSTAGRAM_CHAT=pa` och bygg om.

`CRON_SECRET`, chattens modellnyckel och KV-inställningarna finns redan i produktionsmiljön. Instagram-token förnyas enligt cron-inställningen i `vercel.json`.

## Utförd verifiering

- Typkontroll godkänd i originalprojektet.
- `node --import tsx --test scripts/instagram.test.ts scripts/booking-actions.test.ts`: 13 godkända tester.
- Instagram-testet använder lokal minneslagring och ett ersatt modellanrop. Det kontrollerar verifieringsanrop, signaturkrav, testkonton, dubbletter, snabbsvar, egna ekon och personalövertagande. Det skickar inget externt.
- Den byggda Vercel-versionens verifieringsanrop returnerade exakt challenge-text med HTTP 200, utan omdirigering.
- Ett riktigt Instagram-DM och Metas godkännande är **inte** verifierade ännu.

Den förberedda Vercel-versionen är byggd utan automatisk domänkoppling (`--prod --skip-domain`): https://stodona-hemsida-9t22kpo17-ranis-projects-088ff04d.vercel.app . Den ändrar alltså inte vilken version `stodona.se` visar. Live-adressen `/api/instagram` returnerar fortfarande HTML. Grenen behöver integreras i `main` och versionen publiceras innan Meta registreras mot sajtens adress. Metas inställningssida blev tom i Comet under konfigureringen; kontokopplingen kunde därför inte slutföras.
