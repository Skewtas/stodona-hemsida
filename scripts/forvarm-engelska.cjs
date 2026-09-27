// Förvärmer den engelska översättningen: besöker varje sida i sitemap.xml med
// språket satt till EN och väntar tills översättningen är klar. Översättningarna
// sparas då i KV, så riktiga besökare får dem direkt.
//
//   node --env-file=.env.local scripts/forvarm-engelska.cjs [https://www.stodona.se]

const puppeteer = require('puppeteer-core');
const os = require('os');
const path = require('path');
const fs = require('fs');

const BAS = process.argv[2] || 'https://www.stodona.se';

(async () => {
  const xml = await (await fetch(`${BAS}/sitemap.xml`)).text();
  const sidor = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  // Installerade Chrome, med en tillfällig profil (rör aldrig den vanliga).
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    userDataDir: fs.mkdtempSync(path.join(os.tmpdir(), 'forvarm-')),
  });
  const page = await browser.newPage();
  // Den interna nyckeln skickas BARA till översättningen (går förbi taket per IP) – aldrig till andra adresser.
  const nyckel = process.env.SMS_INTERN_NYCKEL;
  if (nyckel) {
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (req.url().startsWith(`${BAS}/api/oversatt`)) req.continue({ headers: { ...req.headers(), 'x-intern-nyckel': nyckel } });
      else req.continue();
    });
  }
  await page.goto(BAS, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.setItem('stodona-sprak', 'EN'));

  let klara = 0;
  for (const sida of sidor) {
    try {
      await page.goto(BAS + sida, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await new Promise((r) => setTimeout(r, 1500));
      // Scrolla igenom sidan så att allt som laddas vid scroll också syns.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
      });
      // Sajten hämtar data i bakgrunden hela tiden, så vänta i stället tills
      // antalet svenska textbitar slutat minska (högst 25 s).
      const rakna = () => page.evaluate(() => {
        const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let n, antal = 0;
        while ((n = w.nextNode())) if (/[åäö]/i.test(n.nodeValue) && !n.parentElement.closest('[data-no-translate],script,style')) antal++;
        return antal;
      });
      let kvar = await rakna();
      for (let i = 0, lika = 0; i < 25 && kvar > 0 && lika < 4; i++) {
        await new Promise((r) => setTimeout(r, 1000));
        const ny = await rakna();
        lika = ny === kvar ? lika + 1 : 0;
        kvar = ny;
      }
      klara++;
      console.log(`${klara}/${sidor.length} ${sida} – ${kvar} textbitar med åäö kvar`);
    } catch (fel) {
      console.log(`FEL ${sida}: ${String(fel).slice(0, 100)}`);
    }
  }
  await browser.close();
})();
