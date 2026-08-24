/**
 * Restaurant storefront content — menu, categories, offers, reviews, and fee config.
 *
 * Separate from `lib/data.ts` (which backs the older cinematic marketing sections)
 * because this models what the ordering UI actually needs: veg/non-veg marking,
 * bestseller flags, and per-item imagery.
 *
 * IMAGERY: entries point at files in `public/Images`. Most are licensed Wikimedia
 * Commons photographs fetched by `scripts/fetch-photos.mjs` /
 * `scripts/fetch-photos-extra.mjs`; a few tiles are flat SVG illustrations from
 * `scripts/generate-images.mjs` / `generate-offer-art.mjs` where no brand-safe photo
 * existed. All are stock, NOT Akshaya's own food — replace the files with real
 * photography when available, keep the filenames, and no code changes are needed.
 * Attribution for the CC BY / CC BY-SA files lives in `public/Images/CREDITS.md`
 * and is linked from the storefront footer, which the licences require.
 */

export type RestaurantCategory =
  | "Bestsellers"
  | "Biryani"
  | "Starters"
  | "Main Course"
  | "South Indian"
  | "Chinese"
  | "Breads"
  | "Desserts"
  | "Beverages";

/** Sidebar order. "All Categories" is a filter, not a category. */
export const categoryFilters = [
  "All Categories",
  "Bestsellers",
  "Biryani",
  "Starters",
  "Main Course",
  "Breads",
  "Desserts",
  "Beverages",
] as const;

export type CategoryFilter = (typeof categoryFilters)[number];

export interface Dish {
  id: string;
  name: string;
  price: number;
  mrp?: number;
  category: RestaurantCategory;
  isVeg: boolean;
  isBestseller?: boolean;
  isSpicy?: boolean;
  description?: string;
  image: string;
  tint: string;
}

/**
 * Order matters: Leading 6 dishes match the spec grid exactly:
 * 1. Paneer Butter Masala (₹199, Veg)
 * 2. Chicken Biryani (₹299, Non-veg, Bestseller)
 * 3. Veg Pulao (₹159, Veg)
 * 4. Chicken 65 (₹189, Non-veg)
 * 5. Butter Naan (₹49, Veg)
 * 6. Gulab Jamun (₹79, Veg)
 */
export const dishes: Dish[] = [
  {
    id: "paneer-butter-masala",
    name: "Paneer Butter Masala",
    price: 199,
    mrp: 220,
    category: "Main Course",
    isVeg: true,
    description: "Cottage cheese in a silky tomato-cashew gravy.",
    image: "/Images/paneer-butter-masala.jpg",
    tint: "from-orange-100 to-red-100",
  },
  {
    id: "chicken-biryani",
    name: "Chicken Biryani",
    price: 299,
    mrp: 329,
    category: "Biryani",
    isVeg: false,
    isBestseller: true,
    isSpicy: true,
    description: "Dum-cooked basmati layered with marinated chicken and saffron.",
    image: "/Images/chicken-biryani.jpg",
    tint: "from-amber-100 to-orange-200",
  },
  {
    id: "veg-pulao",
    name: "Veg Pulao",
    price: 159,
    category: "Biryani",
    isVeg: true,
    description: "Fragrant rice tossed with garden vegetables and whole spices.",
    image: "/Images/veg-pulao.jpg",
    tint: "from-lime-100 to-emerald-100",
  },
  {
    id: "chicken-65",
    name: "Chicken 65",
    price: 189,
    mrp: 210,
    category: "Starters",
    isVeg: false,
    isBestseller: true,
    isSpicy: true,
    description: "Fiery South Indian fried chicken with curry leaf and chilli.",
    image: "/Images/chicken-65.jpg",
    tint: "from-red-100 to-orange-200",
  },
  {
    id: "butter-naan",
    name: "Butter Naan",
    price: 49,
    mrp: 55,
    category: "Breads",
    isVeg: true,
    description: "Tandoor-baked leavened bread brushed with fresh butter.",
    image: "/Images/butter-naan.jpg",
    tint: "from-amber-50 to-yellow-100",
  },
  {
    id: "gulab-jamun",
    name: "Gulab Jamun",
    price: 79,
    category: "Desserts",
    isVeg: true,
    description: "Warm milk dumplings soaked in cardamom sugar syrup.",
    image: "/Images/gulab-jamun.jpg",
    tint: "from-amber-100 to-orange-200",
  },
];

export interface Offer {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description?: string;
  discountValue?: number;
  code?: string;
  image: string;
  tint: string;
  wash: string;
  type: "dine-in" | "takeaway" | "general";
  is_active: boolean;
  expiry_date: string;
}

export const offers: Offer[] = [
  {
    id: "biryani-special",
    badge: "20% OFF",
    title: "Biryani Special",
    subtitle: "On all biryanis & rice items",
    description: "Enjoy flat 20% discount on all authentic Telangana & Dum biryanis.",
    discountValue: 20,
    code: "AKSHAYA20",
    image: "/Images/offer-biryani-special.jpg",
    tint: "from-amber-100 to-orange-200",
    wash: "bg-white",
    type: "general",
    is_active: true,
    expiry_date: "2026-12-31T23:59:59Z",
  },
  {
    id: "combo-meals",
    badge: "15% OFF",
    title: "Combo Family Feast",
    subtitle: "On orders above ₹499",
    description: "Get 15% discount on family curry and biryani combo meal packs.",
    discountValue: 15,
    code: "COMBO15",
    image: "/Images/offer-combo-meals.jpg",
    tint: "from-orange-100 to-red-100",
    wash: "bg-white",
    type: "takeaway",
    is_active: true,
    expiry_date: "2026-11-30T23:59:59Z",
  },
  {
    id: "dine-in-special",
    badge: "COMPLIMENTARY DESSERT",
    title: "Dine-In Special",
    subtitle: "Freshly prepared for dining",
    description: "Special complimentary Gulab Jamun dessert on all dine-in orders above ₹350.",
    discountValue: 10,
    code: "DINE10",
    image: "/Images/offer-combo-meals.jpg",
    tint: "from-sky-100 to-blue-100",
    wash: "bg-white",
    type: "dine-in",
    is_active: true,
    expiry_date: "2026-10-15T23:59:59Z",
  },
  {
    id: "first-order",
    badge: "10% OFF",
    title: "Welcome First Order",
    subtitle: "For new guest orders",
    description: "Flat 10% instant discount on your first online order with Akshaya.",
    discountValue: 10,
    code: "FIRST10",
    image: "/Images/offer-first-order.svg",
    tint: "from-rose-100 to-orange-100",
    wash: "bg-white",
    type: "general",
    is_active: true,
    expiry_date: "2027-01-01T00:00:00Z",
  },
  {
    id: "weekend-tandoor",
    badge: "25% OFF",
    title: "Weekend Tandoor Delight",
    subtitle: "On all kababs & starters",
    description: "Get 25% OFF on all juicy chicken and paneer kababs every weekend.",
    discountValue: 25,
    code: "KABAB25",
    image: "/Images/chicken-65.jpg",
    tint: "from-red-100 to-orange-200",
    wash: "bg-white",
    type: "dine-in",
    is_active: true,
    expiry_date: "2026-12-15T23:59:59Z",
  },
  {
    id: "takeaway-express",
    badge: "FLAT ₹50 OFF",
    title: "Takeaway Express",
    subtitle: "On quick takeaway pickups",
    description: "Enjoy ₹50 instant savings on any takeaway pickup order above ₹300.",
    discountValue: 12,
    code: "PICKUP50",
    image: "/Images/offer-combo-meals.jpg",
    tint: "from-sky-100 to-indigo-100",
    wash: "bg-white",
    type: "takeaway",
    is_active: true,
    expiry_date: "2026-09-30T23:59:59Z",
  },
];

/** Filter helper: Returns only active offers whose expiry_date is in the future */
export function getActiveOffers(allOffers: Offer[] = offers): Offer[] {
  const now = new Date();
  return allOffers.filter((offer) => {
    if (!offer.is_active) return false;
    const expiry = new Date(offer.expiry_date);
    return expiry > now;
  });
}

export interface Review {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  quote: string;
}

export const reviews: Review[] = [
  {
    id: "rohit",
    name: "Rohit Kumar",
    avatar: "/Images/avatar-rahul.svg",
    rating: 5,
    quote: "The biryani was simply amazing! Perfect flavors and great portion sizes. Highly recommended.",
  },
  {
    id: "priya",
    name: "Priya Sharma",
    avatar: "/Images/avatar-priya.svg",
    rating: 5,
    quote: "Loved the food and service. Chicken 65 is a must try! Will definitely order again.",
  },
  {
    id: "vikram",
    name: "Vikram Reddy",
    avatar: "/Images/avatar-arjun.svg",
    rating: 5,
    quote: "Best restaurant in town! Fresh, hot and prepared right on time.",
  },
];

export const galleryShots = [
  { id: "interior-1", image: "/Images/gallery-interior-1.jpg", tint: "from-amber-100 to-orange-200", alt: "Restaurant interior dining area" },
  { id: "chicken-65", image: "/Images/chicken-65.jpg", tint: "from-red-100 to-orange-200", alt: "Signature Chicken 65 platter" },
  { id: "interior-2", image: "/Images/gallery-interior-2.jpg", tint: "from-stone-100 to-amber-100", alt: "Restaurant interior seating" },
  { id: "gulab-jamun", image: "/Images/gulab-jamun.jpg", tint: "from-orange-100 to-amber-200", alt: "Fresh Gulab Jamun dessert" },
  { id: "roasted-chicken", image: "/Images/hero-tandoor.jpg", tint: "from-amber-100 to-red-200", alt: "Tandoori roasted chicken" },
];

/**
 * ⚠️ CHECKOUT-BLOCKING while a delivery fee is actually charged.
 *
 * `create_order()` derives `orders.total` from menu prices alone, and the payment
 * drift guard rejects any payment whose amount differs from `orders.total`. So any
 * cart that pays subtotal + fee fails with AMOUNT_MISMATCH. Before real payments
 * run, the RPC must add the same fee server-side — never trust these client
 * constants for the charged amount.
 *
 * FREE_DELIVERY_ABOVE was `null`, which meant the "Free Delivery — on all orders
 * above ₹299" tile in `offers` was advertising something the code never honoured:
 * every order was charged ₹40 regardless of value. Set to 299 so the advertised
 * offer is the behaviour. Side benefit: for the carts most likely to check out
 * (> ₹299) the fee is now 0, so the displayed total equals `orders.total` and the
 * drift guard above is not tripped.
 *
 * Changing this number means changing the offer copy in `offers` to match.
 */
export const DELIVERY_FEE = 0;
export const FREE_DELIVERY_ABOVE: number | null = null;

export interface CartLineLike {
  id: string;
  price: number;
  quantity: number;
}

/** Sum of (mrp - price) across the cart — the "You saved" line. */
export function calculateSavings(lines: CartLineLike[]) {
  return lines.reduce((sum, line) => {
    const dish = dishes.find((d) => d.id === line.id);
    if (!dish?.mrp) return sum;
    return sum + (dish.mrp - dish.price) * line.quantity;
  }, 0);
}

export function calculateFees(subtotal: number) {
  return { deliveryFee: 0, packagingFee: 0, total: subtotal };
}

export const restaurantNav = [
  { label: "Home", href: "#home" },
  { label: "Menu", href: "#menu" },
  { label: "Offers", href: "#offers" },
  { label: "Reviews", href: "#reviews" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
];

/** Hero art. The copper-bowl biryani is the reference design's hero exactly. */
export const heroImage = {
  src: "/restaurant/hero-dish.png",
  tint: "from-amber-50 via-orange-50 to-amber-100",
  alt: "Signature Telangana chicken biryani in a copper bowl with raita and curry",
};

export const contactInfo = {
  address: ["Hitech City, Hyderabad, Telangana - 500081"],
  phone: "+91 98765 43210",
  hours: "Mon - Sun: 11:00 AM - 11:30 PM",
  mapQuery: "Hitech City, Hyderabad, Telangana 500081",
};


/**
 * Stable database identity for every catalog item.
 *
 * WHY THIS EXISTS: `create_order()` joins `menu_items` on
 * `(elem->>'menu_item_id')::UUID`. The storefront and cart key everything by
 * human-readable slug (`"chicken-biryani"`), so a cart posted straight to the RPC
 * matched zero rows and every real checkout failed. Rather than leak UUIDs into
 * the UI, the API route translates slug -> UUID server-side through this map.
 *
 * These are UUIDv5 values derived from `menu_item:<slug>` under the fixed
 * namespace 6f0c9a2e-1c3b-4f7a-9c2d-3a5b7e9d1f40, so they are reproducible rather
 * than arbitrary. `supabase/migrations/0014_seed_menu_catalog.sql` inserts exactly
 * these ids; `scripts/check-menu-seed.mjs` fails if the two ever drift apart.
 *
 * Adding a dish means adding it here AND to that migration.
 */
export const MENU_ITEM_IDS: Record<string, string> = {
  "chicken-biryani": "f3621d29-c5ca-5832-89f1-ac29474de50e",
  "paneer-butter-masala": "2187026e-f64d-5ac3-9c23-302e6314d488",
  "chicken-65": "b125fa68-8efd-56a1-a4c8-48523d9d46e2",
  "gobi-manchurian": "05f4f089-3565-53bc-af10-de2b70bc4f5c",
  "butter-naan": "45d3a480-59ae-5fd5-bb98-9ab4b95bdeda",
  "veg-hakka-noodles": "3c1b4c7f-d408-5739-a3cb-e1ce0a25c4be",
  "chicken-tikka": "afc4fc32-b4ca-538f-9555-37918a7c37d5",
  "masala-dosa": "08cf2cd3-eef2-5bc4-81ec-55a70ebe03d6",
  "mutton-biryani": "85968fb0-bea5-51fe-afd9-1f45c4d3c826",
  "veg-pulao": "ef0439d8-abe4-5a46-b7ee-e0f62726c148",
  "paneer-tikka": "37c9d721-12fc-5948-8d9d-3989df205ea8",
  "butter-chicken": "107666f8-a162-5c67-aba6-5287d0231be3",
  "dal-tadka": "2ab5d740-6051-5550-8886-aa4b27e91cdf",
  "garlic-naan": "23eeb2b8-f03f-5202-89ac-25ed3ee804dd",
  "gulab-jamun": "7ca08d81-8c0d-502a-a823-a04ab8972e3e",
  rasmalai: "76838cfd-b312-552b-96cc-12faf53052ca",
  "masala-coke": "4b3073cb-cbe0-5f9a-ab3f-f11e0ffeb828",
};

/** Slug -> menu_items.id, or undefined for anything not in the catalog. */
export function menuItemUuid(slug: string): string | undefined {
  return MENU_ITEM_IDS[slug];
}
