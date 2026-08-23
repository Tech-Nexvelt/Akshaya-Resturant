/**
 * Downloads real food photography from Wikimedia Commons into `public/Images/`.
 *
 *   node scripts/fetch-photos.mjs
 *
 * WHY COMMONS: it is the only large photo source that is both free for commercial
 * use and reachable without an API key. Images from a general web search are
 * copyrighted by default and would expose a commercial restaurant site to takedown
 * notices or licensing invoices.
 *
 * LICENSING OBLIGATION: many Commons photos are CC BY / CC BY-SA, which legally
 * REQUIRE attribution. This script writes `public/Images/CREDITS.md` with the
 * photographer, licence, and source URL for every file it downloads. That file must
 * be surfaced somewhere on the site (a /credits page or the footer) before launch.
 * Files whose licence cannot be determined are rejected rather than guessed at.
 *
 * These are stock photos, NOT Akshaya's food. Replace with real photography of the
 * actual dishes when available — keep the filenames and no code changes are needed.
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "Images");
mkdirSync(OUT, { recursive: true });

const UA = "AkshayaRestaurantSiteBuild/1.0 (https://akshayarestaurant.in; contact via site)";
const API = "https://commons.wikimedia.org/w/api.php";

/**
 * target filename -> Commons search terms (tried in order), plus an optional
 * `avoid` pattern for wrong-but-highly-ranked matches. A first pass returned
 * "Shrimp Biriyani" for mutton and a Korean cider for lime soda; a photo of the
 * wrong dish is worse than no photo, because customers order from it.
 *
 * NOT listed here: `offer-free-delivery` and `offer-first-order`. Every usable
 * Commons match for those carried third-party branding, so they deliberately keep
 * the generated SVG icons from `generate-images.mjs` — brand-safe, and a flat icon
 * suits a promo badge better than a photo anyway.
 */
const TARGETS = {
  "chicken-biryani": { terms: ["chicken biryani", "hyderabadi biryani", "biryani"] },
  "mutton-biryani": {
    terms: ["mutton biryani", "lamb biryani", "goat biryani"],
    avoid: /shrimp|prawn|fish|chicken|egg|vegetable/i,
  },
  "veg-pulao": { terms: ["vegetable pulao", "pulao rice", "pilaf rice indian"] },
  "paneer-butter-masala": { terms: ["paneer butter masala", "shahi paneer", "paneer curry"] },
  "butter-chicken": { terms: ["butter chicken", "murgh makhani", "chicken curry indian"] },
  "dal-tadka": { terms: ["dal tadka", "dal fry", "yellow lentil curry"] },
  "veg-manchurian": { terms: ["gobi manchurian", "manchurian food", "indo chinese food"] },
  "chicken-65": { terms: ["chicken 65", "fried chicken indian", "chicken pakora"] },
  "paneer-tikka": { terms: ["paneer tikka", "grilled paneer", "paneer skewer"] },
  "butter-naan": { terms: ["naan bread", "butter naan", "tandoori naan"], avoid: /garlic/i },
  "garlic-naan": { terms: ["garlic naan", "kulcha bread", "naan flatbread"] },
  "gulab-jamun": { terms: ["gulab jamun"], avoid: /kala|jamoon|rasgulla/i },
  rasmalai: { terms: ["rasmalai", "ras malai dessert"], avoid: /rasgulla/i },
  "masala-coke": { terms: ["cola glass ice", "soft drink glass", "cola drink"] },
  "lime-soda": { terms: ["lemonade glass", "lime juice glass", "nimbu pani"], avoid: /korean|cider|beer|wine|chilseong/i },

  "hero-biryani": { terms: ["hyderabadi biryani", "biryani platter", "biryani pot"] },
  "hero-tandoor": { terms: ["tandoori chicken", "chicken tikka", "grilled chicken indian"] },
  "hero-thali": { terms: ["indian thali", "thali meal", "indian meal platter"] },
  "hero-dessert": { terms: ["indian sweets", "mithai", "gulab jamun bowl"] },

  "offer-biryani-special": { terms: ["biryani rice dish", "biryani"] },
  "offer-combo-meals": { terms: ["indian food platter", "thali meal"] },

  "gallery-interior-1": { terms: ["restaurant interior photograph", "restaurant dining room"] },
  "gallery-interior-2": { terms: ["restaurant dining area", "cafe interior seating"] },
};

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

/** Reject anything we can't positively identify as commercially reusable. */
function isUsable(licence) {
  const l = licence.toLowerCase();
  if (!l) return false;
  if (l.includes("no restrictions") || l.includes("public domain") || l.startsWith("cc0")) return true;
  if (/cc[ -]by([ -]sa)?([ -]\d)?/.test(l)) return true;
  return false;
}

/**
 * Commons titles already claimed by an earlier target. Without this, related
 * searches ("naan bread" / "garlic naan") return the same top hit and two menu
 * items end up showing an identical photo.
 */
const usedTitles = new Set();

/**
 * Titles we must never ship. Two categories:
 *  - Third-party brands. A first pass pulled a Domino's-liveried delivery scooter
 *    and a Chanel gift box; putting a competitor's or a luxury house's trademark on
 *    a restaurant's own commercial site is a legal and credibility problem that the
 *    image licence does nothing to excuse.
 *  - Artworks. Commons ranks paintings highly for "restaurant interior" — a first
 *    pass returned Van Gogh's *Interior of a restaurant* for a gallery photo slot.
 */
const GLOBAL_BLOCK =
  /domino|pizza hut|mcdonald|kfc|burger king|starbucks|subway|chanel|gucci|louis vuitton|coca[- ]?cola company|pepsi|nestl|painting|van gogh|artwork|illustration|drawing|sketch|engraving|lithograph|watercolou?r|museum|logo|advertisement|poster/i;

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
      // Prefer landscape; portraits crop badly into 4:3 cards.
      if (info.width && info.height && info.height > info.width * 1.15) continue;
      usedTitles.add(p.title);
      return {
        title: p.title,
        thumburl: info.thumburl,
        descriptionurl: info.descriptionurl,
        licence,
        artist,
        term,
      };
    }
    await sleep(120);
  }
  return null;
}

const results = [];
const failures = [];

for (const [name, spec] of Object.entries(TARGETS)) {
  try {
    const hit = await findPhoto(spec.terms, spec.avoid);
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
    console.log(`  ok    ${name}  (${(buf.length / 1024).toFixed(0)} KB)  ${hit.licence}`);
    await sleep(180);
  } catch (err) {
    failures.push({ name, reason: String(err.message || err) });
    console.log(`  FAIL  ${name}: ${err.message}`);
  }
}

const credits = `# Image credits

Photographs sourced from [Wikimedia Commons](https://commons.wikimedia.org) by
\`scripts/fetch-photos.mjs\`. **These are stock photos, not Akshaya's own food** —
replace them with real photography of the actual dishes when available.

Several licences below (CC BY, CC BY-SA) **legally require attribution**. This page
must be reachable from the live site — link it from the footer — or the licence terms
are not being met.

| File | Photographer / source | Licence | Original |
|---|---|---|---|
${results
  .map(
    (r) =>
      `| \`${r.name}.jpg\` | ${r.artist} | ${r.licence} | [Commons](${r.descriptionurl}) |`
  )
  .join("\n")}

_Generated ${new Date().toISOString().slice(0, 10)} · ${results.length} files._
`;

writeFileSync(join(OUT, "CREDITS.md"), credits, "utf8");

console.log(`\nDownloaded ${results.length}/${Object.keys(TARGETS).length}`);
if (failures.length) {
  console.log("Failures:");
  for (const f of failures) console.log(`  - ${f.name}: ${f.reason}`);
}
console.log("Wrote public/Images/CREDITS.md");
