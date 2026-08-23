# Prerendering (SSG) – måste aktiveras i en miljö med webbläsare

## Varför
Stodona.se är en client-side-renderad React/Vite-SPA. `dist/index.html` har en
tom `<body>` – allt innehåll ritas av JavaScript. Sökrobotar som **inte** kör JS
(ChatGPT/OAI-SearchBot, Perplexity, till stor del Bingbot) ser därför inget
sidinnehåll att läsa eller citera. Detta är det enskilt största SEO/GEO-hindret.

Delvis åtgärdat: kärn-entiteten (LocalBusiness/WebSite + org.nr) ligger nu
statiskt i `index.html`, så företaget syns för alla botar. Det som återstår är
**per-sida-innehållet** (tjänstesidor, blogg) – det kräver prerendering.

## Varför det inte gjordes automatiskt
Prerendering kräver en headless-webbläsare (Chromium via Puppeteer). Den kunde
inte laddas ner/köras i utvecklingsmiljön, och att koppla in det overifierat
riskerar att haverera Vercel-bygget. Det måste därför aktiveras och verifieras
där en webbläsare finns (lokalt eller i CI/Vercel-bygget).

## Rekommenderad metod: react-snap (postbuild)
1. Installera:
   ```
   bun add -d react-snap
   ```
2. `package.json` – lägg till postbuild och reactSnap-config:
   ```jsonc
   "scripts": {
     "build": "vite build",
     "postbuild": "react-snap"
   },
   "reactSnap": {
     "source": "dist",
     "minifyHtml": { "collapseWhitespace": false },
     "puppeteerArgs": ["--no-sandbox", "--disable-setuid-sandbox"],
     "include": ["/", "/hemstadning", "/flyttstadning", "/storstadning",
       "/fonsterputsning", "/foretagsstadning", "/byggstadning",
       "/trappstadning", "/priser", "/om-oss", "/kontakt", "/faq",
       "/recensioner", "/blogg"]
   }
   ```
   (Lägg medvetet INTE med de dolda nanny-sidorna – de ska förbli noindex.)
3. `src/main.tsx` – hydrera istället för att montera om när prerenderat innehåll finns:
   ```ts
   import { hydrateRoot, createRoot } from "react-dom/client";
   const root = document.getElementById("root")!;
   if (root.hasChildNodes()) hydrateRoot(root, <App/>);
   else createRoot(root).render(<App/>);
   ```
4. Verifiera efter `bun run build`:
   - `dist/hemstadning/index.html` ska innehålla synlig H1/brödtext i källan.
   - Korrekt per-sida `<title>` och meta i källan.
   - Inga hydration-varningar i konsolen.

## Alternativ
- **vite-plugin-prerender** (finns redan i package.json) – samma Puppeteer-krav.
- **Migrera till ett SSG/SSR-ramverk** (t.ex. vite-react-ssg / Next) – störst
  arbete men mest robust långsiktigt.

## Vercel
Vercel-bygget kan köra Puppeteer, men Chromium-nedladdning måste tillåtas
(`PUPPETEER_SKIP_DOWNLOAD` får inte vara satt) och `--no-sandbox` krävs.
Testa i en preview-deploy innan produktion.
