/**
 * Fails if `lib/restaurant-data.ts` and `supabase/migrations/0014_seed_menu_catalog.sql`
 * disagree about menu-item identity.
 *
 *   node scripts/check-menu-seed.mjs
 *
 * WHY: `create_order()` joins menu_items on the UUID the API route derives from
 * MENU_ITEM_IDS. If someone adds a dish to the TS catalog and forgets the seed
 * migration, that dish silently fails EVERY checkout it appears in — the RPC
 * raises "One or more items are unavailable or invalid" and the whole cart is
 * rejected, not just the new line. This check turns that into a build-time error.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ts = readFileSync(join(ROOT, "lib", "restaurant-data.ts"), "utf8");
const sql = readFileSync(join(ROOT, "supabase", "migrations", "0014_seed_menu_catalog.sql"), "utf8");

const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";

// --- TS side: the MENU_ITEM_IDS object literal ---
const tsBlock = ts.match(/export const MENU_ITEM_IDS[^{]*\{([\s\S]*?)\n\};/);
if (!tsBlock) {
  console.error("FAIL: could not find MENU_ITEM_IDS in lib/restaurant-data.ts");
  process.exit(1);
}
const tsIds = new Map();
for (const m of tsBlock[1].matchAll(new RegExp(`["']?([a-z0-9-]+)["']?\\s*:\\s*["'](${UUID})["']`, "g"))) {
  tsIds.set(m[1], m[2]);
}

// --- SQL side: ids in the menu_items INSERT (not the categories INSERT) ---
const itemsBlock = sql.slice(sql.indexOf("INSERT INTO menu_items"));
const sqlIds = new Set();
for (const m of itemsBlock.matchAll(new RegExp(`\\('(${UUID})',`, "g"))) {
  sqlIds.add(m[1]);
}

const problems = [];
if (tsIds.size === 0) problems.push("MENU_ITEM_IDS parsed as empty");
if (sqlIds.size === 0) problems.push("no menu_items ids parsed from the seed migration");

for (const [slug, id] of tsIds) {
  if (!sqlIds.has(id)) problems.push(`TS has "${slug}" -> ${id}, but the seed migration does not insert that id`);
}
const tsIdSet = new Set(tsIds.values());
for (const id of sqlIds) {
  if (!tsIdSet.has(id)) problems.push(`seed migration inserts ${id}, but no MENU_ITEM_IDS entry maps to it`);
}

// Duplicate slugs mapping to one id (or vice versa) would break the join too.
if (tsIdSet.size !== tsIds.size) problems.push("two slugs in MENU_ITEM_IDS share the same UUID");

if (problems.length) {
  console.error(`FAIL: menu catalog is out of sync (${problems.length} problem(s))`);
  for (const p of problems) console.error("  - " + p);
  process.exit(1);
}

console.log(`OK: ${tsIds.size} menu items consistent between lib/restaurant-data.ts and 0014_seed_menu_catalog.sql`);
