/**
 * Fetches the photos the storefront gained after the first `fetch-photos.mjs` run,
 * and APPENDS their attribution rows to `public/Images/CREDITS.md`.
 *
 *   node scripts/fetch-photos-extra.mjs
 *
 * Separate from `fetch-photos.mjs` on purpose: that script rewrites CREDITS.md from
 * only the files it fetched, so a filtered re-run there would silently drop the
 * other 23 attributions — and re-running it whole would re-roll every existing
 * photo for no reason. Same source, same licence rules, same blocklists.
 *
 * NOTE on `offer-family-pack`: the reference design shows a photo of people eating.
 * A Commons licence covers the photographer's copyright, NOT the personality rights
 * of identifiable people pictured — using such a photo in a restaurant's own
 * advertising is a separate legal exposure. This fetches a shared table spread
 * instead, which reads the same on the tile without that problem.
 */

import { writeFileSync, readFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "Images");
mkdirSync(OUT, { recursive: true });

const UA = "AkshayaRestaurantSiteBuild/1.0 (https://akshayarestaurant.in; contact via site)";
const API = "https://commons.wikimedia.org/w/api.php";

const TARGETS = {
  "veg-hakka-noodles": {
    // First pass returned char kway teow — flat rice noodles with visible prawns —
    // for "chow mein". Shipping that under a green veg dot misstates the dish to
    // someone ordering it, so the meat/seafood block here is deliberately wide.
    terms: ["hakka noodles", "vegetable noodles indian", "schezwan noodles", "noodles vegetarian dish"],
    avoid: /kway|teow|char|prawn|shrimp|chicken|egg|beef|pork|meat|seafood|ramen|spaghetti|pasta|soup/i,
  },
  "chicken-tikka": {
    // "chicken tikka masala" is a gravy dish, not the grilled skewers drawn here.
    terms: ["chicken tikka skewer", "chicken tikka", "tandoori chicken kebab", "chicken kebab grilled"],
    avoid: /masala|paneer|vegetarian|soup|curry|pie/i,
  },
  "masala-dosa": {
    terms: ["masala dosa", "dosa south indian", "dosai", "dosa"],
    avoid: /rava|pizza|uttapam|idli/i,
  },
};

/**
 * Files picked by hand because search ranking would not surface them.
 *
 * `veg-hakka-noodles`: two automated passes returned char kway teow (prawns) and an
 * Indo-Chinese table that included chilli chicken — both wrong under a green veg
 * dot. This file is explicitly the veg dish.
 *
 * NOT here: `offer-family-pack`. Every Commons candidate was either raw prep, a
 * canteen tray, or carried third-party branding, so that tile keeps a generated
 * flat illustration (`scripts/generate-offer-art.mjs`) — the same call already made
 * for `offer-free-delivery` and `offer-first-order`.
 */
const EXACT = {
  "veg-hakka-noodles": "File:Hakka Noodles Veg.jpg",
};

/** `node scripts/fetch-photos-extra.mjs veg-hakka-noodles` refetches just that one. */
const only = process.argv.slice(2).filter((a) => !a.startsWith("-"));
if (only.length) {
  for (const k of Object.keys(TARGETS)) if (!only.includes(k)) delete TARGETS[k];
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(params) {
  const url = `${API}?${new URLSearchParams({ ...params, format: "json" })}`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

function readLicence(meta) {
  const name = meta?.LicenseShortName?.value || meta?.License?.value || "";
  const artist = (meta?.Artist?.value || "Unknown")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return { name: name.replace(/<[^>]*>/g, "").trim(), artist };
}

function isUsable(licence) {
  const l = licence.toLowerCase();
  if (!l) return false;
  if (l.includes("no restrictions") || l.includes("public domain") || l.startsWith("cc0")) return true;
  if (/cc[ -]by([ -]sa)?([ -]\d)?/.test(l)) return true;
  return false;
}

/** Same rules as fetch-photos.mjs: no third-party brands, no artworks. */
const GLOBAL_BLOCK =
  /domino|pizza hut|mcdonald|kfc|burger king|starbucks|subway|chanel|gucci|louis vuitton|coca[- ]?cola company|pepsi|nestl|painting|van gogh|artwork|illustration|drawing|sketch|engraving|lithograph|watercolou?r|museum|logo|advertisement|poster/i;

/** Don't re-pick a Commons file some existing image already uses. */
const usedTitles = new Set();
const creditsPath = join(OUT, "CREDITS.md");
const existingCredits = existsSync(creditsPath) ? readFileSync(creditsPath, "utf8") : "";
for (const m of existingCredits.matchAll(/wiki\/(File:[^)]+)\)/g)) {
  usedTitles.add(decodeURIComponent(m[1]).replace(/_/g, " "));
}

async function findPhoto(terms, avoid) {
  for (const term of terms) {
    const data = await api({
      action: "query",
      generator: "search",
      gsrsearch: `filetype:bitmap ${term}`,
      gsrnamespace: "6",
      gsrlimit: "8",
      prop: "imageinfo",
      iiprop: "url|extmetadata|size",
      iiurlwidth: "1000",
    });
    const pages = Object.values(data?.query?.pages || {});
    for (const p of pages) {
      const info = p.imageinfo?.[0];
      if (!info) continue;
      if (usedTitles.has(p.title)) continue;
      if (GLOBAL_BLOCK.test(p.title)) continue;
      if (avoid && avoid.test(p.title)) continue;
      const { name: licence, artist } = readLicence(info.extmetadata);
      if (!isUsable(licence)) continue;
      if (!info.thumburl) continue;
      if (info.width && info.height && info.height > info.width * 1.15) continue;
      usedTitles.add(p.title);
      return { title: p.title, thumburl: info.thumburl, descriptionurl: info.descriptionurl, licence, artist, term };
    }
    await sleep(120);
  }
  return null;
}

const results = [];
const failures = [];

/** Resolve a hand-picked Commons title straight to its imageinfo. */
async function fetchByTitle(title) {
  const data = await api({
    action: "query",
    titles: title,
    prop: "imageinfo",
    iiprop: "url|extmetadata|size",
    iiurlwidth: "1400",
  });
  const p = Object.values(data?.query?.pages || {})[0];
  const info = p?.imageinfo?.[0];
  if (!info) return null;
  const { name: licence, artist } = readLicence(info.extmetadata);
  if (!isUsable(licence)) throw new Error(`licence not usable: ${licence || "unknown"}`);
  return {
    title: p.title,
    thumburl: info.thumburl,
    descriptionurl: info.descriptionurl,
    licence,
    artist,
    term: "hand-picked",
  };
}

for (const [name, spec] of Object.entries(TARGETS)) {
  try {
    const hit = EXACT[name] ? await fetchByTitle(EXACT[name]) : await findPhoto(spec.terms, spec.avoid);
    if (!hit) {
      failures.push({ name, reason: "no usable licensed match" });
      console.log(`  MISS  ${name}`);
      continue;
    }
    const img = await fetch(hit.thumburl, { headers: { "User-Agent": UA } });
    if (!img.ok) throw new Error(`download ${img.status}`);
    const buf = Buffer.from(await img.arrayBuffer());
    writeFileSync(join(OUT, `${name}.jpg`), buf);
    results.push({ name, ...hit, bytes: buf.length });
    console.log(`  ok    ${name}  (${(buf.length / 1024).toFixed(0)} KB)  ${hit.licence}  <- ${hit.title}`);
    await sleep(180);
  } catch (err) {
    failures.push({ name, reason: String(err.message || err) });
    console.log(`  FAIL  ${name}: ${err.message}`);
  }
}

if (results.length) {
  const rows = results
    .map((r) => `| \`${r.name}.jpg\` | ${r.artist} | ${r.licence} | [Commons](${r.descriptionurl}) |`)
    .join("\n");
  // Insert above the trailing "_Generated ..._" footer so the table stays intact.
  const footer = /\n_Generated [^\n]*_\n?$/;
  const merged = footer.test(existingCredits)
    ? existingCredits.replace(
        footer,
        `\n${rows}\n\n_Generated ${new Date().toISOString().slice(0, 10)} · ${
          (existingCredits.match(/^\| `/gm) || []).length + results.length
        } files._\n`
      )
    : `${existingCredits}\n${rows}\n`;
  writeFileSync(creditsPath, merged, "utf8");
  console.log("\nAppended", results.length, "rows to public/Images/CREDITS.md");
}

if (failures.length) {
  console.log("Failures:");
  for (const f of failures) console.log(`  - ${f.name}: ${f.reason}`);
}
