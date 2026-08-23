/**
 * Generates the restaurant storefront's illustration set into `public/Images/`.
 *
 *   node scripts/generate-images.mjs
 *
 * These are hand-authored flat-vector ILLUSTRATIONS, not photography. They exist so
 * the storefront ships with real, license-clean image files at the correct aspect
 * ratios instead of emoji placeholders. Replace them with real photos of the actual
 * food when available — keep the same filenames and nothing else needs to change.
 *
 * Everything is deterministic: re-running produces byte-identical output.
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "Images");
mkdirSync(OUT, { recursive: true });

const W = 800;
const H = 600;

/** Deterministic pseudo-random so garnish scatter is stable across runs. */
function rng(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

const svg = (defs, body, bg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">
<defs>${defs}</defs>
<rect width="${W}" height="${H}" fill="url(#${bg})"/>
${body}
</svg>`;

const bgGrad = (id, from, to) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient>`;

const radial = (id, from, to) =>
  `<radialGradient id="${id}" cx="0.42" cy="0.36" r="0.72"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></radialGradient>`;

/** Soft shadow under the crockery so it sits on the surface. */
const dropShadow = `<filter id="sh" x="-25%" y="-25%" width="150%" height="150%">
<feDropShadow dx="0" dy="14" stdDeviation="18" flood-color="#7c4a1e" flood-opacity="0.22"/></filter>`;

/** Scatter garnish (coriander flecks, seeds) across the food surface. */
function garnish(seed, cx, cy, rx, ry, items) {
  const r = rng(seed);
  let out = "";
  for (let i = 0; i < items.count; i++) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * 0.86;
    const x = cx + Math.cos(a) * rx * d;
    const y = cy + Math.sin(a) * ry * d;
    const s = items.min + r() * (items.max - items.min);
    out += items.shape(x, y, s, r);
  }
  return out;
}

const leaf = (fill) => (x, y, s, r) =>
  `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(s * 1.7).toFixed(1)}" ry="${s.toFixed(
    1
  )}" fill="${fill}" opacity="${(0.55 + r() * 0.4).toFixed(2)}" transform="rotate(${(
    r() * 180
  ).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;

const dot = (fill) => (x, y, s, r) =>
  `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${s.toFixed(1)}" fill="${fill}" opacity="${(
    0.5 +
    r() * 0.45
  ).toFixed(2)}"/>`;

/* ------------------------------------------------------------------ */
/* Compositions                                                        */
/* ------------------------------------------------------------------ */

/** Curry / gravy in a wide bowl, seen slightly from above. */
function curryBowl({ bg1, bg2, gravy1, gravy2, chunk, chunkEdge, seed, bowl = "#ffffff" }) {
  const defs =
    bgGrad("bg", bg1, bg2) + radial("gravy", gravy1, gravy2) + dropShadow;
  const r = rng(seed);
  let chunks = "";
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + r();
    const d = 0.3 + r() * 0.5;
    const x = 400 + Math.cos(a) * 130 * d;
    const y = 320 + Math.sin(a) * 92 * d;
    const s = 24 + r() * 16;
    chunks += `<rect x="${(x - s / 2).toFixed(1)}" y="${(y - s / 2).toFixed(1)}" width="${s.toFixed(
      1
    )}" height="${s.toFixed(1)}" rx="6" fill="${chunk}" stroke="${chunkEdge}" stroke-width="3" transform="rotate(${(
      r() * 60 -
      30
    ).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
  }
  const body = `
<g filter="url(#sh)">
  <ellipse cx="400" cy="330" rx="245" ry="172" fill="${bowl}"/>
  <ellipse cx="400" cy="322" rx="215" ry="146" fill="#f1e6d8"/>
  <ellipse cx="400" cy="322" rx="196" ry="130" fill="url(#gravy)"/>
</g>
${chunks}
${garnish(seed + 7, 400, 322, 180, 118, { count: 26, min: 3, max: 6, shape: leaf("#2f7d32") })}
<ellipse cx="330" cy="268" rx="52" ry="24" fill="#ffffff" opacity="0.16"/>`;
  return svg(defs, body, "bg");
}

/** Layered rice / biryani heaped on a plate. */
function ricePlate({ bg1, bg2, rice1, rice2, accent, protein, seed, saffron = "#e8a13a" }) {
  const defs = bgGrad("bg", bg1, bg2) + radial("rice", rice1, rice2) + dropShadow;
  const r = rng(seed);
  let grains = "";
  for (let i = 0; i < 150; i++) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * 0.95;
    const x = 400 + Math.cos(a) * 190 * d;
    const y = 318 + Math.sin(a) * 122 * d;
    grains += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="7" ry="3" fill="${
      r() > 0.72 ? saffron : "#fffaf0"
    }" opacity="${(0.4 + r() * 0.5).toFixed(2)}" transform="rotate(${(r() * 180).toFixed(
      0
    )} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
  }
  let pieces = "";
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.6;
    const x = 400 + Math.cos(a) * 108;
    const y = 316 + Math.sin(a) * 66;
    pieces += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="40" ry="30" fill="${protein}" opacity="0.95" transform="rotate(${(
      r() * 50 -
      25
    ).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
  }
  const body = `
<g filter="url(#sh)">
  <ellipse cx="400" cy="336" rx="256" ry="176" fill="#ffffff"/>
  <ellipse cx="400" cy="328" rx="224" ry="150" fill="#efe3d2"/>
  <ellipse cx="400" cy="322" rx="205" ry="134" fill="url(#rice)"/>
</g>
${grains}
${pieces}
${garnish(seed + 3, 400, 320, 185, 118, { count: 22, min: 3, max: 6, shape: leaf("#2f7d32") })}
${garnish(seed + 11, 400, 320, 170, 108, { count: 10, min: 4, max: 7, shape: dot(accent) })}`;
  return svg(defs, body, "bg");
}

/** Fried / grilled pieces stacked on a plate. */
function friedPieces({ bg1, bg2, piece1, piece2, seed, plate = "#ffffff" }) {
  const defs = bgGrad("bg", bg1, bg2) + radial("pc", piece1, piece2) + dropShadow;
  const r = rng(seed);
  let pcs = "";
  const layout = [
    [400, 300, 1.15],
    [318, 340, 1],
    [482, 340, 1],
    [360, 262, 0.85],
    [442, 262, 0.85],
    [400, 366, 0.95],
  ];
  for (const [x, y, k] of layout) {
    const w = 92 * k;
    const h = 74 * k;
    pcs += `<g transform="rotate(${(r() * 40 - 20).toFixed(0)} ${x} ${y})">
      <rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="${26 * k}" fill="url(#pc)" stroke="#a8461c" stroke-width="3"/>
      <rect x="${x - w / 2 + 10}" y="${y - h / 2 + 9}" width="${w * 0.42}" height="${
      h * 0.24
    }" rx="${10 * k}" fill="#ffffff" opacity="0.18"/>
    </g>`;
  }
  const body = `
<g filter="url(#sh)">
  <ellipse cx="400" cy="340" rx="248" ry="168" fill="${plate}"/>
  <ellipse cx="400" cy="334" rx="216" ry="140" fill="#f3e8da"/>
</g>
${pcs}
${garnish(seed + 5, 400, 330, 180, 110, { count: 18, min: 3, max: 6, shape: leaf("#2f7d32") })}
${garnish(seed + 9, 400, 330, 170, 104, { count: 8, min: 5, max: 9, shape: dot("#d64518") })}`;
  return svg(defs, body, "bg");
}

/** Stacked flatbread. */
function flatbread({ bg1, bg2, bread1, bread2, fleck, seed }) {
  const defs = bgGrad("bg", bg1, bg2) + radial("br", bread1, bread2) + dropShadow;
  const body = `
<g filter="url(#sh)">
  <ellipse cx="400" cy="352" rx="242" ry="160" fill="#ffffff"/>
</g>
<g transform="rotate(-8 400 330)">
  <ellipse cx="392" cy="344" rx="196" ry="126" fill="#e8d3ae"/>
  <ellipse cx="400" cy="330" rx="196" ry="126" fill="url(#br)"/>
</g>
${garnish(seed, 400, 326, 168, 104, { count: 30, min: 4, max: 9, shape: dot(fleck) })}
${garnish(seed + 2, 400, 326, 160, 96, { count: 12, min: 3, max: 5, shape: leaf("#3a7d3a") })}
<ellipse cx="330" cy="284" rx="58" ry="26" fill="#ffffff" opacity="0.22"/>`;
  return svg(defs, body, "bg");
}

/** Dessert spheres/discs in syrup. */
function dessertBowl({ bg1, bg2, syrup1, syrup2, ball1, ball2, seed, disc = false }) {
  const defs =
    bgGrad("bg", bg1, bg2) + radial("sy", syrup1, syrup2) + radial("bl", ball1, ball2) + dropShadow;
  const r = rng(seed);
  let balls = "";
  const layout = [
    [400, 300, 1.1],
    [326, 338, 0.95],
    [474, 338, 0.95],
    [400, 364, 0.9],
  ];
  for (const [x, y, k] of layout) {
    balls += disc
      ? `<ellipse cx="${x}" cy="${y}" rx="${58 * k}" ry="${34 * k}" fill="url(#bl)" stroke="#e6c88a" stroke-width="2"/>`
      : `<circle cx="${x}" cy="${y}" r="${46 * k}" fill="url(#bl)" stroke="#8a4a12" stroke-width="2" opacity="0.98"/>
         <ellipse cx="${x - 14 * k}" cy="${y - 16 * k}" rx="${15 * k}" ry="${9 * k}" fill="#ffffff" opacity="0.3"/>`;
  }
  const body = `
<g filter="url(#sh)">
  <ellipse cx="400" cy="336" rx="240" ry="166" fill="#ffffff"/>
  <ellipse cx="400" cy="330" rx="208" ry="138" fill="url(#sy)"/>
</g>
${balls}
${garnish(seed + 4, 400, 330, 170, 100, { count: 12, min: 3, max: 5, shape: dot("#c2410c") })}
${r() > 0.5 ? '<ellipse cx="470" cy="270" rx="34" ry="16" fill="#ffffff" opacity="0.2"/>' : ""}`;
  return svg(defs, body, "bg");
}

/** Tall glass with straw. */
function drinkGlass({ bg1, bg2, liquid1, liquid2, seed, bubbles = "#ffffff", wedge = null }) {
  const defs = bgGrad("bg", bg1, bg2) + bgGrad("lq", liquid1, liquid2) + dropShadow;
  const r = rng(seed);
  let bub = "";
  for (let i = 0; i < 26; i++) {
    const x = 330 + r() * 140;
    const y = 250 + r() * 230;
    bub += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(2 + r() * 5).toFixed(
      1
    )}" fill="${bubbles}" opacity="${(0.25 + r() * 0.45).toFixed(2)}"/>`;
  }
  const body = `
<g filter="url(#sh)">
  <path d="M320 180 L480 180 L462 500 Q400 516 338 500 Z" fill="#ffffff" opacity="0.55"/>
  <path d="M330 222 L470 222 L454 494 Q400 508 346 494 Z" fill="url(#lq)"/>
</g>
${bub}
<rect x="392" y="120" width="16" height="150" rx="8" fill="#e11d48" transform="rotate(12 400 195)"/>
<ellipse cx="400" cy="222" rx="70" ry="16" fill="#ffffff" opacity="0.35"/>
${
  wedge
    ? `<path d="M470 200 a48 48 0 0 1 48 48 Z" fill="${wedge}" stroke="#ffffff" stroke-width="4"/>`
    : ""
}
<path d="M320 180 L480 180 L478 210 L322 210 Z" fill="#ffffff" opacity="0.28"/>`;
  return svg(defs, body, "bg");
}

/** Restaurant interior scene. */
function interior({ bg1, bg2, wall, table, chair, seed }) {
  const defs = bgGrad("bg", bg1, bg2) + dropShadow;
  const r = rng(seed);
  let lamps = "";
  for (let i = 0; i < 3; i++) {
    const x = 200 + i * 200;
    lamps += `<line x1="${x}" y1="0" x2="${x}" y2="96" stroke="#8b6a45" stroke-width="4"/>
    <path d="M${x - 42} 150 L${x + 42} 150 L${x + 26} 96 L${x - 26} 96 Z" fill="#f6c667"/>
    <ellipse cx="${x}" cy="150" rx="42" ry="10" fill="#fde8b0" opacity="0.9"/>`;
  }
  let tables = "";
  for (let i = 0; i < 3; i++) {
    const x = 160 + i * 240;
    const y = 400 + (i % 2) * 26;
    tables += `<ellipse cx="${x}" cy="${y}" rx="96" ry="30" fill="${table}"/>
    <rect x="${x - 8}" y="${y}" width="16" height="86" fill="#8b6a45"/>
    <ellipse cx="${x}" cy="${y + 92}" rx="46" ry="12" fill="#7a5c3c"/>
    <rect x="${x - 150}" y="${y - 34}" width="42" height="76" rx="12" fill="${chair}"/>
    <rect x="${x + 108}" y="${y - 34}" width="42" height="76" rx="12" fill="${chair}"/>`;
  }
  const body = `
<rect width="${W}" height="330" fill="${wall}"/>
<rect y="330" width="${W}" height="270" fill="#c9a87c"/>
${lamps}
<rect x="60" y="196" width="150" height="104" rx="8" fill="#dcc39b" stroke="#a8865c" stroke-width="5"/>
<rect x="590" y="196" width="150" height="104" rx="8" fill="#dcc39b" stroke="#a8865c" stroke-width="5"/>
${tables}
<ellipse cx="400" cy="586" rx="380" ry="26" fill="#00000018"/>`;
  return svg(defs, body, "bg");
}

/** Offer tile: badge-forward graphic. */
function offerTile({ bg1, bg2, icon, accent }) {
  const defs = bgGrad("bg", bg1, bg2) + dropShadow;
  const icons = {
    percent: `<circle cx="400" cy="300" r="132" fill="#ffffff" opacity="0.9"/>
      <text x="400" y="352" font-family="Georgia,serif" font-size="150" font-weight="bold" text-anchor="middle" fill="${accent}">%</text>`,
    combo: `<g filter="url(#sh)"><ellipse cx="400" cy="330" rx="180" ry="118" fill="#ffffff"/>
      <circle cx="330" cy="308" r="52" fill="${accent}"/><circle cx="452" cy="300" r="44" fill="#f6c667"/>
      <ellipse cx="392" cy="380" rx="86" ry="34" fill="#e8d3ae"/></g>`,
    scooter: `<g filter="url(#sh)">
      <circle cx="300" cy="410" r="58" fill="#374151"/><circle cx="300" cy="410" r="26" fill="#9ca3af"/>
      <circle cx="530" cy="410" r="58" fill="#374151"/><circle cx="530" cy="410" r="26" fill="#9ca3af"/>
      <path d="M270 400 Q330 300 420 316 L520 400 Z" fill="${accent}"/>
      <rect x="400" y="240" width="96" height="88" rx="12" fill="#f6c667" stroke="#b58a3c" stroke-width="5"/>
      <path d="M300 400 L360 300 L410 300" stroke="#1f2937" stroke-width="14" fill="none" stroke-linecap="round"/></g>`,
    gift: `<g filter="url(#sh)">
      <rect x="272" y="290" width="256" height="180" rx="14" fill="${accent}"/>
      <rect x="256" y="248" width="288" height="60" rx="12" fill="#ffffff" opacity="0.92"/>
      <rect x="380" y="248" width="40" height="222" fill="#ffffff" opacity="0.85"/>
      <path d="M400 248 q-70 -66 -18 -74 q40 -6 18 74" fill="#ffffff" opacity="0.92"/>
      <path d="M400 248 q70 -66 18 -74 q-40 -6 -18 74" fill="#ffffff" opacity="0.92"/></g>`,
  };
  return svg(defs, icons[icon], "bg");
}

/* ------------------------------------------------------------------ */
/* Manifest                                                            */
/* ------------------------------------------------------------------ */

const files = {
  // ---- Dishes ----
  "paneer-butter-masala": curryBowl({
    bg1: "#fff3e6", bg2: "#ffd9b8", gravy1: "#f4762f", gravy2: "#d1441a",
    chunk: "#fff6e0", chunkEdge: "#e8d4a8", seed: 11,
  }),
  "butter-chicken": curryBowl({
    bg1: "#fff0e2", bg2: "#ffcfa6", gravy1: "#e8622a", gravy2: "#b8360f",
    chunk: "#f0c48a", chunkEdge: "#b8763a", seed: 23,
  }),
  "dal-tadka": curryBowl({
    bg1: "#fffbe8", bg2: "#f5e6a8", gravy1: "#f0c419", gravy2: "#d99b12",
    chunk: "#fde68a", chunkEdge: "#c9a227", seed: 31,
  }),
  "veg-manchurian": curryBowl({
    bg1: "#f7f3ea", bg2: "#e6d9c2", gravy1: "#8a4b22", gravy2: "#5c2f10",
    chunk: "#6b3a17", chunkEdge: "#3d1f08", seed: 43,
  }),
  "chicken-biryani": ricePlate({
    bg1: "#fff4e2", bg2: "#ffd7a8", rice1: "#fff6e6", rice2: "#f0d5a8",
    accent: "#c2410c", protein: "#c96a2e", seed: 5,
  }),
  "mutton-biryani": ricePlate({
    bg1: "#fdefe0", bg2: "#f5c896", rice1: "#fff3dc", rice2: "#e8cb98",
    accent: "#9a3412", protein: "#8a4520", seed: 17,
  }),
  "veg-pulao": ricePlate({
    bg1: "#f4fbf0", bg2: "#d8ecc8", rice1: "#fffdf5", rice2: "#eae4cc",
    accent: "#16a34a", protein: "#7cb342", seed: 29, saffron: "#a3d977",
  }),
  "chicken-65": friedPieces({
    bg1: "#fff0ea", bg2: "#ffc9b0", piece1: "#e8501f", piece2: "#b32d0a", seed: 7,
  }),
  "paneer-tikka": friedPieces({
    bg1: "#fffaea", bg2: "#f7dfa8", piece1: "#f4c05a", piece2: "#d18e22", seed: 19,
  }),
  "butter-naan": flatbread({
    bg1: "#fffaf0", bg2: "#f5e2c0", bread1: "#f7e2ba", bread2: "#e0bd85", fleck: "#b5793a", seed: 13,
  }),
  "garlic-naan": flatbread({
    bg1: "#fdfbf2", bg2: "#eee0c4", bread1: "#f3ddb4", bread2: "#d9b57e", fleck: "#8a6a2f", seed: 37,
  }),
  "gulab-jamun": dessertBowl({
    bg1: "#fff2e0", bg2: "#f7cf9e", syrup1: "#c2761f", syrup2: "#8a4a12",
    ball1: "#a85c1c", ball2: "#6d3208", seed: 3,
  }),
  rasmalai: dessertBowl({
    bg1: "#fffdf2", bg2: "#f7edc8", syrup1: "#fdf6d8", syrup2: "#efdda0",
    ball1: "#fffdf6", ball2: "#f0e4c0", seed: 41, disc: true,
  }),
  "masala-coke": drinkGlass({
    bg1: "#f5f2ef", bg2: "#ddd3c8", liquid1: "#6b3410", liquid2: "#2e1405", seed: 9,
  }),
  "lime-soda": drinkGlass({
    bg1: "#f2fbef", bg2: "#d4eec6", liquid1: "#c8e88a", liquid2: "#8fbf3a",
    seed: 21, wedge: "#a3d977",
  }),

  // ---- Hero slides ----
  "hero-biryani": ricePlate({
    bg1: "#fff6ea", bg2: "#ffd9a8", rice1: "#fff8ec", rice2: "#f0d4a0",
    accent: "#c2410c", protein: "#c96a2e", seed: 101,
  }),
  "hero-tandoor": friedPieces({
    bg1: "#fff0e6", bg2: "#ffc4a0", piece1: "#e0561f", piece2: "#a82c08", seed: 103,
  }),
  "hero-thali": curryBowl({
    bg1: "#fffbe8", bg2: "#f7dca8", gravy1: "#f0a020", gravy2: "#c06810",
    chunk: "#fff6e0", chunkEdge: "#dcc08a", seed: 107,
  }),
  "hero-dessert": dessertBowl({
    bg1: "#fff4e4", bg2: "#f7d0a0", syrup1: "#c98126", syrup2: "#8a4a12",
    ball1: "#ab5f1e", ball2: "#70340a", seed: 109,
  }),

  // ---- Offers ----
  "offer-biryani-special": offerTile({ bg1: "#fff1dd", bg2: "#ffd08a", icon: "percent", accent: "#c2410c" }),
  "offer-combo-meals": offerTile({ bg1: "#ffeee6", bg2: "#ffc0a8", icon: "combo", accent: "#e8622a" }),
  "offer-free-delivery": offerTile({ bg1: "#e8f2ff", bg2: "#b6d4ff", icon: "scooter", accent: "#2563eb" }),
  "offer-first-order": offerTile({ bg1: "#eef0ff", bg2: "#c3caff", icon: "gift", accent: "#4f46e5" }),

  // ---- Gallery ----
  "gallery-interior-1": interior({
    bg1: "#f7e8cf", bg2: "#e0c49a", wall: "#e8d2ad", table: "#a9743f", chair: "#7b4f2a", seed: 201,
  }),
  "gallery-interior-2": interior({
    bg1: "#f4ead8", bg2: "#dcc6a2", wall: "#efdcbc", table: "#b98450", chair: "#8a5c33", seed: 203,
  }),
};

let n = 0;
for (const [name, content] of Object.entries(files)) {
  writeFileSync(join(OUT, `${name}.svg`), content, "utf8");
  n++;
}

console.log(`Wrote ${n} illustrations to public/Images/`);
