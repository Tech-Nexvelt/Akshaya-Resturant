/**
 * Generates the three testimonial avatars into `public/Images/`.
 *
 *   node scripts/generate-avatars.mjs
 *
 * These are deliberately STYLIZED flat-vector portraits, not photographs. The
 * reviews are illustrative copy, so a photoreal headshot would read as a real
 * named customer who does not exist — an illustration cannot be mistaken that way.
 * (This replaced three photoreal stock portraits borrowed from `public/banquet/`,
 * one of which was a couple standing in for a single male reviewer.)
 *
 * Square 400x400 so the circular `rounded-full` frame in ReviewsCarousel crops
 * cleanly at any size. Deterministic: re-running produces byte-identical output.
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "Images");
mkdirSync(OUT, { recursive: true });

const S = 400;

/**
 * One flat-vector bust. Everything is driven off the palette so the three read as
 * one set: same framing, same light source, same shoulder line.
 */
function avatar({ id, bgFrom, bgTo, skin, skinShade, hair, hairDark, garment, garmentDark, extras = "" }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" width="${S}" height="${S}" role="img">
<defs>
<linearGradient id="bg-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${bgFrom}"/><stop offset="1" stop-color="${bgTo}"/></linearGradient>
<linearGradient id="cloth-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${garment}"/><stop offset="1" stop-color="${garmentDark}"/></linearGradient>
<clipPath id="frame-${id}"><rect width="${S}" height="${S}"/></clipPath>
</defs>
<g clip-path="url(#frame-${id})">
  <rect width="${S}" height="${S}" fill="url(#bg-${id})"/>

  <!-- shoulders / bust -->
  <path d="M200 268 c-64 0 -116 40 -132 96 -4 14 -6 26 -6 36 h276 c0 -10 -2 -22 -6 -36 -16 -56 -68 -96 -132 -96 z" fill="url(#cloth-${id})"/>
  <!-- collar shadow -->
  <path d="M200 268 c-20 0 -39 4 -55 12 l55 40 55 -40 c-16 -8 -35 -12 -55 -12 z" fill="${garmentDark}" opacity="0.55"/>

  <!-- neck -->
  <path d="M175 232 h50 v40 c0 14 -50 14 -50 0 z" fill="${skinShade}"/>

  <!-- head -->
  <ellipse cx="200" cy="176" rx="66" ry="76" fill="${skin}"/>
  <!-- ears -->
  <ellipse cx="134" cy="182" rx="11" ry="15" fill="${skinShade}"/>
  <ellipse cx="266" cy="182" rx="11" ry="15" fill="${skinShade}"/>

  <!-- hair (base cap) -->
  <path d="M200 96 c-44 0 -70 30 -70 68 0 10 2 20 5 27 3 -22 8 -36 15 -43 14 -14 34 -18 50 -18 16 0 36 4 50 18 7 7 12 21 15 43 3 -7 5 -17 5 -27 0 -38 -26 -68 -70 -68 z" fill="${hair}"/>

  <!-- brows -->
  <path d="M168 164 q14 -8 28 -1" stroke="${hairDark}" stroke-width="7" fill="none" stroke-linecap="round"/>
  <path d="M204 163 q14 -7 28 1" stroke="${hairDark}" stroke-width="7" fill="none" stroke-linecap="round"/>

  <!-- eyes -->
  <circle cx="180" cy="184" r="6.5" fill="#1f2937"/>
  <circle cx="220" cy="184" r="6.5" fill="#1f2937"/>
  <circle cx="182" cy="182" r="2.2" fill="#ffffff"/>
  <circle cx="222" cy="182" r="2.2" fill="#ffffff"/>

  <!-- nose + smile -->
  <path d="M200 192 q-5 12 2 16" stroke="${skinShade}" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M182 218 q18 15 36 0" stroke="#9a3412" stroke-width="6" fill="none" stroke-linecap="round"/>

  ${extras}
</g>
</svg>`;
}

const people = [
  {
    file: "avatar-rahul.svg",
    id: "rahul",
    // short cropped hair, deep-blue kurta
    bgFrom: "#dbeafe",
    bgTo: "#bfdbfe",
    skin: "#c68642",
    skinShade: "#a86f34",
    hair: "#1f2937",
    hairDark: "#111827",
    garment: "#2563eb",
    garmentDark: "#1d4ed8",
    extras: `
  <!-- mandarin collar -->
  <path d="M168 288 l32 24 32 -24" stroke="#eff6ff" stroke-width="7" fill="none" stroke-linejoin="round"/>`,
  },
  {
    file: "avatar-priya.svg",
    id: "priya",
    // long hair falling past the shoulders, emerald blouse
    bgFrom: "#fee2e2",
    bgTo: "#fecaca",
    skin: "#d19a6a",
    skinShade: "#b57f52",
    hair: "#221a16",
    hairDark: "#140f0d",
    garment: "#059669",
    garmentDark: "#047857",
    extras: `
  <!-- long hair behind the shoulders -->
  <path d="M136 168 c-14 44 -18 96 -14 132 h34 c-10 -44 -12 -92 -6 -124 z" fill="#221a16"/>
  <path d="M264 168 c14 44 18 96 14 132 h-34 c10 -44 12 -92 6 -124 z" fill="#221a16"/>
  <!-- centre parting -->
  <path d="M200 98 v34" stroke="#140f0d" stroke-width="5" stroke-linecap="round"/>
  <!-- earrings -->
  <circle cx="134" cy="200" r="6" fill="#f59e0b"/>
  <circle cx="266" cy="200" r="6" fill="#f59e0b"/>
  <!-- dupatta edge -->
  <path d="M150 306 q50 22 100 0" stroke="#fbbf24" stroke-width="8" fill="none" stroke-linecap="round"/>`,
  },
  {
    file: "avatar-arjun.svg",
    id: "arjun",
    // beard + glasses, warm amber shirt
    bgFrom: "#fef3c7",
    bgTo: "#fde68a",
    skin: "#b87333",
    skinShade: "#9a5f2a",
    hair: "#312620",
    hairDark: "#1c1512",
    garment: "#b45309",
    garmentDark: "#92400e",
    extras: `
  <!-- beard, drawn under the jaw and around the mouth -->
  <path d="M137 186 c-3 42 22 82 63 82 41 0 66 -40 63 -82 -6 30 -14 48 -26 56 -10 -12 -22 -18 -37 -18 -15 0 -27 6 -37 18 -12 -8 -20 -26 -26 -56 z" fill="#312620"/>
  <path d="M182 206 q18 -8 36 0" stroke="#312620" stroke-width="8" fill="none" stroke-linecap="round"/>
  <!-- glasses -->
  <circle cx="180" cy="184" r="21" fill="none" stroke="#374151" stroke-width="5"/>
  <circle cx="220" cy="184" r="21" fill="none" stroke="#374151" stroke-width="5"/>
  <path d="M201 184 h-2" stroke="#374151" stroke-width="5" stroke-linecap="round"/>
  <path d="M159 181 l-22 -4" stroke="#374151" stroke-width="5" stroke-linecap="round"/>
  <path d="M241 181 l22 -4" stroke="#374151" stroke-width="5" stroke-linecap="round"/>
  <!-- shirt placket -->
  <path d="M200 300 v56" stroke="${"#92400e"}" stroke-width="6" stroke-linecap="round"/>`,
  },
];

for (const p of people) {
  writeFileSync(join(OUT, p.file), avatar(p), "utf8");
  console.log("wrote", p.file);
}
console.log(`\n${people.length} avatars written to public/Images/`);
