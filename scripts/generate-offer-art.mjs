/**
 * Generates the flat-illustration offer tiles into `public/Images/`.
 *
 *   node scripts/generate-offer-art.mjs
 *
 * `offer-free-delivery.svg` and `offer-first-order.svg` already exist from
 * `generate-images.mjs`; this adds `offer-family-pack.svg` on the same reasoning.
 * Three automated Commons passes for a "family pack" photo returned, in order: a
 * half-eaten canteen tray with a CamelBak-branded cup in frame, raw colocasia
 * leaves mid-prep, and a Christmas dinner aboard a Royal Navy frigate. A flat icon
 * is brand-safe, on-message, and suits a promo badge better than a weak photo.
 *
 * 800x600 with the same blue field as the sibling offer tiles so the four cards
 * read as one row. Deterministic: re-running produces byte-identical output.
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "Images");
mkdirSync(OUT, { recursive: true });

const W = 800;
const H = 600;

/** Small side bowl of curry, placed around the central platter. */
const bowl = (cx, cy, r, rim, fill) => `
  <ellipse cx="${cx}" cy="${cy + r * 0.12}" rx="${r}" ry="${r * 0.82}" fill="${rim}"/>
  <ellipse cx="${cx}" cy="${cy}" rx="${r * 0.78}" ry="${r * 0.62}" fill="${fill}"/>
  <ellipse cx="${cx - r * 0.22}" cy="${cy - r * 0.16}" rx="${r * 0.24}" ry="${r * 0.14}" fill="#ffffff" opacity="0.22"/>`;

/** Coriander fleck. */
const herb = (x, y, s) =>
  `<ellipse cx="${x}" cy="${y}" rx="${s}" ry="${s * 0.55}" fill="#2f7d32" opacity="0.85"/>`;

const familyPack = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e8f2ff"/><stop offset="1" stop-color="#b6d4ff"/></linearGradient>
  <radialGradient id="rice" cx="0.42" cy="0.34" r="0.72"><stop offset="0" stop-color="#fde8b8"/><stop offset="1" stop-color="#e8c07a"/></radialGradient>
  <filter id="sh" x="-25%" y="-25%" width="150%" height="150%">
    <feDropShadow dx="0" dy="14" stdDeviation="18" flood-color="#7c4a1e" flood-opacity="0.22"/>
  </filter>
</defs>
<rect width="${W}" height="${H}" fill="url(#bg)"/>

<g filter="url(#sh)">
  <!-- shared platter -->
  <ellipse cx="400" cy="330" rx="248" ry="196" fill="#ffffff"/>
  <ellipse cx="400" cy="330" rx="226" ry="176" fill="#f4f6f8"/>

  <!-- central biryani mound -->
  <ellipse cx="400" cy="322" rx="128" ry="100" fill="url(#rice)"/>
  <!-- fried onion strands -->
  <path d="M330 300 q28 -16 58 -6" stroke="#b5762f" stroke-width="7" fill="none" stroke-linecap="round"/>
  <path d="M400 288 q30 -12 60 2" stroke="#b5762f" stroke-width="7" fill="none" stroke-linecap="round"/>
  <path d="M350 344 q40 14 84 2" stroke="#c98a3c" stroke-width="7" fill="none" stroke-linecap="round"/>
  <!-- saffron patches -->
  <ellipse cx="366" cy="322" rx="26" ry="17" fill="#f0a93c" opacity="0.55"/>
  <ellipse cx="440" cy="336" rx="22" ry="14" fill="#e8912c" opacity="0.5"/>
  ${herb(372, 296, 9)}${herb(424, 306, 8)}${herb(398, 350, 9)}${herb(348, 328, 7)}${herb(452, 316, 7)}

  <!-- four shared bowls around the platter -->
  ${bowl(212, 250, 56, "#ffffff", "#c0402c")}
  ${bowl(588, 250, 56, "#ffffff", "#e8a33a")}
  ${bowl(212, 420, 56, "#ffffff", "#3f7d3a")}
  ${bowl(588, 420, 56, "#ffffff", "#f3ece0")}
</g>

<!-- "family / sharing" mark: four place settings implied by stacked plates -->
<g opacity="0.9">
  <circle cx="400" cy="118" r="34" fill="#2563eb"/>
  <circle cx="400" cy="107" r="11" fill="#ffffff"/>
  <path d="M383 134 c0 -11 8 -18 17 -18 c9 0 17 7 17 18 z" fill="#ffffff"/>
  <circle cx="344" cy="128" r="24" fill="#2563eb" opacity="0.72"/>
  <circle cx="344" cy="120" r="8" fill="#ffffff"/>
  <path d="M332 140 c0 -8 5 -13 12 -13 c7 0 12 5 12 13 z" fill="#ffffff"/>
  <circle cx="456" cy="128" r="24" fill="#2563eb" opacity="0.72"/>
  <circle cx="456" cy="120" r="8" fill="#ffffff"/>
  <path d="M444 140 c0 -8 5 -13 12 -13 c7 0 12 5 12 13 z" fill="#ffffff"/>
</g>
</svg>`;

writeFileSync(join(OUT, "offer-family-pack.svg"), familyPack, "utf8");
console.log("wrote offer-family-pack.svg");
