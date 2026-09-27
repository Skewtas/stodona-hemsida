/**
 * Översätter hela sidan till engelska när besökaren väljer EN – även texter
 * som inte har någon nyckel i translations.ts, och text som dyker upp senare
 * (steg i formulär, popup-rutor, nya sidor).
 *
 * Svensk text i DOM:en samlas in (textnoder och attribut som placeholder, alt,
 * title och aria-label), översätts via /api/oversatt och byts ut på plats.
 * Originalen sparas, så SV återställer allt utan omladdning. React kan skriva
 * tillbaka svensk text när en komponent uppdateras – MutationObservern fångar
 * det och översätter igen.
 *
 * Hoppa över ett område med translate="no" eller data-no-translate, t.ex.
 * chattens meddelanden (Camilla svarar redan på kundens språk).
 */

const ATTRIBUT = ["placeholder", "title", "aria-label", "alt"] as const;
const HOPPA_TAGGAR = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "CODE", "PRE", "SVG", "IFRAME"]);
const LAGRING = "stodona-oversattning-en-v3";
const MAX_I_LAGRING = 4000;
const PER_ANROP = 25;
const TECKEN_PER_ANROP = 6000;
const SAMTIDIGA = 6;

/** Svensk text → engelsk. */
const cache = new Map<string, string>();
/** Allt som inte ska översättas igen: våra egna engelska texter. */
const egnaTexter = new Set<string>();
/** Originalen, så att SV kan återställas. */
const textOriginal = new Map<Text, string>();
/** Nyckeln textnoden översätts med – texten, ibland med sin mening som sammanhang. */
const textNyckel = new Map<Text, string>();
/** Skiljer en textbit från meningen den står i (samma tecken i /api/oversatt). */
const SKILJE = " \u241F ";
const attrOriginal = new Map<Element, Map<string, string>>();

let aktiv = false;
let observer: MutationObserver | null = null;
let vantande = new Set<string>();
let timer: number | null = null;
let titelOriginal: string | null = null;

function lasCache() {
  try {
    const sparat = localStorage.getItem(LAGRING);
    if (sparat) for (const [sv, en] of Object.entries(JSON.parse(sparat) as Record<string, string>)) { cache.set(sv, en); egnaTexter.add(en); }
  } catch { /* privat läge m.m. */ }
}

function sparaCache() {
  try {
    const poster = [...cache.entries()].slice(-MAX_I_LAGRING);
    localStorage.setItem(LAGRING, JSON.stringify(Object.fromEntries(poster)));
  } catch { /* fullt eller blockerat – strunt i det */ }
}

/** Bara text med bokstäver är värd att översätta. */
function behover(text: string): boolean {
  const t = text.trim();
  return t.length > 1 && /\p{L}/u.test(t) && !egnaTexter.has(t) && !/^[\w.+-]+@[\w-]+\.[\w.]+$/.test(t) && !/^https?:\/\//.test(t);
}

function undantagen(el: Element | null): boolean {
  for (let e = el; e; e = e.parentElement) {
    if (HOPPA_TAGGAR.has(e.tagName.toUpperCase())) return true;
    if (e.getAttribute("translate") === "no" || e.hasAttribute("data-no-translate")) return true;
    if ((e as HTMLElement).isContentEditable) return true;
  }
  return false;
}

/** Byter en textnods värde men behåller mellanslag före och efter. */
function sattText(nod: Text, sv: string, en: string) {
  const fore = sv.match(/^\s*/)?.[0] ?? "";
  const efter = sv.match(/\s*$/)?.[0] ?? "";
  const ny = `${fore}${en}${efter}`;
  if (nod.nodeValue !== ny) nod.nodeValue = ny;
}

/**
 * En kort textbit som bara är en del av en mening ("Vanliga" + <span>frågor</span>)
 * översätts med hela den svenska meningen som sammanhang, annars blir det ord
 * för ord. Meningen byggs av originaltexterna, så nyckeln blir densamma även
 * när grannarna redan är översatta.
 */
function sammanhang(nod: Text, t: string): string {
  if (t.length > 80) return "";
  let e = nod.parentElement;
  for (let i = 0; e && i < 3; i++, e = e.parentElement) {
    const delar: string[] = [];
    const gang = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
    for (let n = gang.nextNode() as Text | null; n; n = gang.nextNode() as Text | null) delar.push(textOriginal.get(n) ?? n.nodeValue ?? "");
    const hel = delar.join("").replace(/\s+/g, " ").trim();
    if (hel.length > 400) return "";
    if (hel.length > t.length + 1) return hel;
    if (/^(P|H[1-6]|LI|BUTTON|TD|TH|LABEL|OPTION)$/.test(e.tagName)) return "";
  }
  return "";
}

function behandlaText(nod: Text) {
  const varde = nod.nodeValue ?? "";
  const t = varde.trim();
  if (!behover(t) || undantagen(nod.parentElement)) return;
  textOriginal.set(nod, varde);
  const hel = sammanhang(nod, t);
  const nyckel = hel ? `${t}${SKILJE}${hel}` : t;
  textNyckel.set(nod, nyckel);
  const en = cache.get(nyckel);
  if (en !== undefined) sattText(nod, varde, en);
  else vantande.add(nyckel);
}

function behandlaAttribut(el: Element) {
  if (undantagen(el)) return;
  for (const a of ATTRIBUT) {
    const varde = el.getAttribute(a);
    if (!varde || !behover(varde)) continue;
    const t = varde.trim();
    let org = attrOriginal.get(el);
    if (!org) attrOriginal.set(el, (org = new Map()));
    org.set(a, varde);
    const en = cache.get(t);
    if (en !== undefined) el.setAttribute(a, en);
    else vantande.add(t);
  }
}

function skanna(rot: Node) {
  if (rot.nodeType === Node.TEXT_NODE) return behandlaText(rot as Text);
  if (rot.nodeType !== Node.ELEMENT_NODE) return;
  const el = rot as Element;
  if (undantagen(el)) return;
  behandlaAttribut(el);
  const gang = document.createTreeWalker(el, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  for (let n = gang.nextNode(); n; n = gang.nextNode()) {
    if (n.nodeType === Node.TEXT_NODE) behandlaText(n as Text);
    else behandlaAttribut(n as Element);
  }
}

function tillampa() {
  for (const [nod, sv] of textOriginal) {
    if (!nod.isConnected) { textOriginal.delete(nod); textNyckel.delete(nod); continue; }
    const en = cache.get(textNyckel.get(nod) ?? sv.trim());
    if (en !== undefined) sattText(nod, sv, en);
  }
  for (const [el, attr] of attrOriginal) {
    if (!el.isConnected) { attrOriginal.delete(el); continue; }
    for (const [a, sv] of attr) {
      const en = cache.get(sv.trim());
      if (en !== undefined && el.getAttribute(a) !== en) el.setAttribute(a, en);
    }
  }
  if (titelOriginal) {
    const en = cache.get(titelOriginal.trim());
    if (en) document.title = en;
  }
}

async function hamta(texter: string[]) {
  const svar = await fetch("/api/oversatt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texter }),
  });
  if (!svar.ok) return;
  const data = (await svar.json()) as { oversattningar?: Record<string, string> };
  for (const [sv, en] of Object.entries(data.oversattningar ?? {})) {
    cache.set(sv, en);
    egnaTexter.add(en);
  }
}

async function skickaVantande() {
  timer = null;
  const alla = [...vantande].filter((t) => !cache.has(t));
  vantande = new Set();
  if (!alla.length || !aktiv) return;
  // Dela upp i lagom stora anrop.
  const grupper: string[][] = [];
  let grupp: string[] = [];
  let tecken = 0;
  for (const t of alla) {
    const text = t.slice(0, 4000);
    if (grupp.length >= PER_ANROP || tecken + text.length > TECKEN_PER_ANROP) { grupper.push(grupp); grupp = []; tecken = 0; }
    grupp.push(text);
    tecken += text.length;
  }
  if (grupp.length) grupper.push(grupp);
  for (let i = 0; i < grupper.length; i += SAMTIDIGA) {
    await Promise.all(grupper.slice(i, i + SAMTIDIGA).map((g) => hamta(g).catch(() => {})));
    if (!aktiv) return;
    tillampa();
  }
  sparaCache();
}

function schemalagg() {
  if (vantande.size && timer === null) timer = window.setTimeout(skickaVantande, 60);
}

function vidAndring(andringar: MutationRecord[]) {
  if (!aktiv) return;
  for (const a of andringar) {
    // I <head> bryr vi oss bara om sidtiteln (nedan).
    if (document.head.contains(a.target)) continue;
    if (a.type === "characterData") behandlaText(a.target as Text);
    else if (a.type === "attributes") behandlaAttribut(a.target as Element);
    else a.addedNodes.forEach(skanna);
  }
  if (document.title !== titelOriginal && !egnaTexter.has(document.title)) {
    titelOriginal = document.title;
    if (behover(document.title)) {
      const en = cache.get(document.title.trim());
      if (en) document.title = en;
      else vantande.add(document.title.trim());
    }
  }
  schemalagg();
}

export function startaOversattning() {
  if (aktiv || typeof document === "undefined") return;
  aktiv = true;
  if (!cache.size) lasCache();
  titelOriginal = document.title;
  if (behover(document.title)) {
    const en = cache.get(document.title.trim());
    if (en) document.title = en;
    else vantande.add(document.title.trim());
  }
  skanna(document.body);
  schemalagg();
  observer = new MutationObserver(vidAndring);
  observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: [...ATTRIBUT] });
  // Sidtiteln: sidorna byter ut hela <title>-elementet, så bevaka hela <head>.
  observer.observe(document.head, { childList: true, characterData: true, subtree: true });
}

export function stoppaOversattning() {
  if (!aktiv) return;
  aktiv = false;
  observer?.disconnect();
  observer = null;
  if (timer !== null) { window.clearTimeout(timer); timer = null; }
  vantande = new Set();
  // Återställ bara det vi själva har översatt – text som React redan bytt
  // (t.ex. menyn via translations.ts) lämnas orörd.
  for (const [nod, sv] of textOriginal) {
    const nu = (nod.nodeValue ?? "").trim();
    if (nod.isConnected && nu !== sv.trim() && egnaTexter.has(nu)) nod.nodeValue = sv;
  }
  for (const [el, attr] of attrOriginal) {
    for (const [a, sv] of attr) {
      const nu = (el.getAttribute(a) ?? "").trim();
      if (el.isConnected && nu !== sv.trim() && egnaTexter.has(nu)) el.setAttribute(a, sv);
    }
  }
  textOriginal.clear();
  textNyckel.clear();
  attrOriginal.clear();
  if (titelOriginal && egnaTexter.has(document.title)) document.title = titelOriginal;
}
