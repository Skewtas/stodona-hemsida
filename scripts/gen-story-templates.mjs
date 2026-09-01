// Genererar nedladdningsbara story-mallar (1080×1920 PNG) i Stodonas stil för
// influencersidan. Kör: bun scripts/gen-story-templates.mjs
// Skriver till public/story/ + en zip med allt ("Ladda ner alla").
import sharp from "sharp";
import JSZip from "jszip";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUB = join(ROOT, "public");
const OUT = join(PUB, "story");

const W = 1080, H = 1920;
const INK = "#151515", MUTED = "#4a453e", BG = "#f4f1eb", ACCENT = "#c8b6a6", DARK = "#1a1a1a";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function lines(arr, { x, y, lh, size, fill, weight = "700", family = "Georgia, 'Times New Roman', serif", anchor = "start" }) {
  return `<text font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${arr
    .map((l, i) => `<tspan x="${x}" y="${y + i * lh}">${esc(l)}</tspan>`)
    .join("")}</text>`;
}

// Vit footer-bar med plats för loggan (komponeras in separat) + reklammärkning + länk.
function footer(darkOnLight = true) {
  return `
    <rect x="40" y="1660" width="1000" height="216" rx="36" fill="rgba(255,255,255,0.94)" stroke="rgba(21,21,21,0.06)"/>
    ${lines(["Reklam i samarbete med @stodona.se"], { x: 300, y: 1748, lh: 0, size: 30, fill: MUTED, weight: "600", family: "Helvetica, Arial, sans-serif" })}
    ${lines(["www.stodona.se"], { x: 300, y: 1800, lh: 0, size: 38, fill: INK, weight: "700", family: "Helvetica, Arial, sans-serif" })}
  `;
}

function topScrim(strength = 0.6) {
  return `<defs><linearGradient id="ts" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="rgba(0,0,0,${strength})"/>
    <stop offset="0.5" stop-color="rgba(0,0,0,0)"/></linearGradient></defs>
    <rect x="0" y="0" width="${W}" height="960" fill="url(#ts)"/>`;
}

// Mallarna
const T = [
  {
    id: "fore", cat: "Före", file: "stodona-story-fore.png", photo: "stodona_left_image.jpg",
    svg: () => `${topScrim(0.62)}${lines(["Idag kommer", "@stodona.se"], { x: 80, y: 230, lh: 108, size: 92, fill: "#fff" })}${footer()}`,
  },
  {
    id: "under", cat: "Under", file: "stodona-story-under.png", photo: "stodona-damm.jpg",
    svg: () => `${topScrim(0.62)}${lines(["Stodona tar hand", "om hemmet medan", "jag får tid till annat."], { x: 80, y: 210, lh: 96, size: 74, fill: "#fff" })}${footer()}`,
  },
  {
    id: "efter", cat: "Efter", file: "stodona-story-efter.png", photo: "stodona-stad.jpg",
    svg: () => `${topScrim(0.6)}${lines(["Den bästa känslan –", "ett helt nystädat hem."], { x: 80, y: 220, lh: 100, size: 80, fill: "#fff" })}${footer()}`,
  },
  {
    id: "rekommendation", cat: "Efter", file: "stodona-story-rekommendation.png", photo: "stodona_right_image.jpg",
    svg: () => `${topScrim(0.62)}${lines(["Så nöjd med", "resultatet från", "@stodona.se"], { x: 80, y: 220, lh: 104, size: 84, fill: "#fff" })}${footer()}`,
  },
  {
    id: "fore-efter", cat: "Före och efter", file: "stodona-story-fore-efter.png", color: BG,
    svg: () => `
      <rect x="60" y="150" width="960" height="640" rx="28" fill="none" stroke="${ACCENT}" stroke-width="4" stroke-dasharray="16 14"/>
      <rect x="60" y="830" width="960" height="640" rx="28" fill="none" stroke="${ACCENT}" stroke-width="4" stroke-dasharray="16 14"/>
      ${lines(["FÖRE"], { x: 90, y: 250, lh: 0, size: 44, fill: ACCENT, family: "Helvetica, Arial, sans-serif", weight: "800" })}
      ${lines(["EFTER"], { x: 90, y: 930, lh: 0, size: 44, fill: ACCENT, family: "Helvetica, Arial, sans-serif", weight: "800" })}
      ${lines(["Lägg in dina egna", "före- och efterbilder"], { x: 540, y: 470, lh: 56, size: 40, fill: MUTED, family: "Helvetica, Arial, sans-serif", weight: "600", anchor: "middle" })}
      ${footer()}`,
  },
  {
    id: "video-omslag", cat: "Under", file: "stodona-story-video-omslag.png", photo: "stodona-stad.jpg", darken: 0.45,
    svg: () => `
      <circle cx="540" cy="720" r="96" fill="rgba(255,255,255,0.92)"/>
      <path d="M512 668 L586 720 L512 772 Z" fill="${INK}"/>
      ${lines(["Se hur Stodona", "förvandlar mitt hem"], { x: 540, y: 980, lh: 84, size: 66, fill: "#fff", anchor: "middle" })}
      ${footer()}`,
  },
  {
    id: "minimalistisk", cat: "Lägg till egen text", file: "stodona-story-minimalistisk.png", color: BG,
    svg: () => `
      <rect x="0" y="0" width="${W}" height="${H}" fill="${BG}"/>
      <circle cx="880" cy="300" r="220" fill="${ACCENT}" opacity="0.25"/>
      ${lines(["Din text här"], { x: 80, y: 900, lh: 0, size: 92, fill: INK })}
      <rect x="84" y="960" width="120" height="6" rx="3" fill="${ACCENT}"/>
      ${lines(["Skriv din egen känsla om städningen."], { x: 84, y: 1030, lh: 0, size: 34, fill: MUTED, weight: "500", family: "Helvetica, Arial, sans-serif" })}
      ${footer()}`,
  },
  {
    id: "citat", cat: "Lägg till egen text", file: "stodona-story-citat.png", color: DARK,
    svg: () => `
      <rect x="0" y="0" width="${W}" height="${H}" fill="${DARK}"/>
      <circle cx="200" cy="1500" r="280" fill="${ACCENT}" opacity="0.18"/>
      ${lines(["”"], { x: 80, y: 520, lh: 0, size: 320, fill: ACCENT })}
      ${lines(["Din rekommendation", "här."], { x: 80, y: 760, lh: 96, size: 74, fill: "#fff" })}
      ${lines(["– Ditt namn / @dittkonto"], { x: 84, y: 940, lh: 0, size: 34, fill: "rgba(255,255,255,0.7)", weight: "500", family: "Helvetica, Arial, sans-serif" })}
      ${footer()}`,
  },
  {
    id: "neutral-1", cat: "Lägg till egen text", file: "stodona-story-neutral-1.png", photo: "stodona-stad.jpg", darken: 0.15,
    svg: () => `${footer()}`,
  },
  {
    id: "neutral-2", cat: "Lägg till egen text", file: "stodona-story-neutral-2.png", photo: "fonster-stodona.jpg", darken: 0.15,
    svg: () => `${footer()}`,
  },
];

async function build() {
  await mkdir(OUT, { recursive: true });
  const logo = await sharp(join(PUB, "logotyp.png")).resize({ height: 48 }).png().toBuffer();
  const logoMeta = await sharp(logo).metadata();

  // Prominent logga högst upp: färgversion (för ljus bakgrund) + vit silhuett
  // (för foto/mörk bakgrund, via dest-in på en vit platta).
  const TOP_H = 60;
  const logoTopColor = await sharp(join(PUB, "logotyp.png")).resize({ height: TOP_H }).png().toBuffer();
  const { width: topW } = await sharp(logoTopColor).metadata();
  const logoTopWhite = await sharp({ create: { width: topW, height: TOP_H, channels: 4, background: "#ffffff" } })
    .composite([{ input: logoTopColor, blend: "dest-in" }])
    .png()
    .toBuffer();

  const zip = new JSZip();

  for (const t of T) {
    let base;
    if (t.photo) {
      base = sharp(join(PUB, t.photo)).resize(W, H, { fit: "cover", position: "centre" });
      if (t.darken) {
        const veil = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="rgba(0,0,0,${t.darken})"/></svg>`);
        base = sharp(await base.composite([{ input: veil }]).png().toBuffer());
      }
    } else {
      base = sharp({ create: { width: W, height: H, channels: 4, background: t.color || BG } });
    }
    const overlay = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${t.svg()}</svg>`);
    // Vit logga på foto/mörk bakgrund, färgad på ljus bakgrund.
    const topWhite = !!t.photo || t.color === DARK;
    const composites = [
      { input: overlay, top: 0, left: 0 },
      // Prominent logga högst upp (centrerad)
      { input: topWhite ? logoTopWhite : logoTopColor, top: 70, left: Math.round((W - topW) / 2) },
      // Liten logga i footer-baren (vänsterjusterad)
      { input: logo, top: 1660 + Math.round((216 - 48) / 2), left: 96 },
    ];
    const png = await sharp(await base.png().toBuffer()).composite(composites).png({ quality: 90 }).toBuffer();
    await writeFile(join(OUT, t.file), png);
    zip.file(t.file, png);
    console.log("✓", t.file, `(${(png.length / 1024).toFixed(0)} kB)`);
  }

  const zipBuf = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  await writeFile(join(OUT, "stodona-story-material.zip"), zipBuf);
  console.log("✓ stodona-story-material.zip", `(${(zipBuf.length / 1024).toFixed(0)} kB)`, "logo", logoMeta.width + "x" + logoMeta.height);
}

build().catch((e) => { console.error(e); process.exit(1); });
