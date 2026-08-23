export const brand = {
  name: "Akshaya",
  fullName: "Akshaya Family Restaurant",
  tagline: "A Legacy of Flavor Since 2007",
  location: "Siddipet, Telangana",
  address: "Opp. New Bus Stand, Siddipet, Telangana",
  since: 2007,
  stats: [
    { label: "Years of Legacy", value: "18+" },
    { label: "Five Star Reviews", value: "4.8k+" },
    { label: "Signature Dishes", value: "150+" },
  ],
};

export type ServiceKey = "restaurant" | "cafe" | "banquet" | "catering";

export const services: {
  key: ServiceKey;
  title: string;
  description: string;
  phone: string;
  meta: string;
}[] = [
  {
    key: "restaurant",
    title: "The Restaurant",
    description:
      "Authentic multi-cuisine dining rooted in Telangana tradition, plated with modern precision for family gatherings and quiet evenings alike.",
    phone: "96668 78787",
    meta: "Authentic Multi-Cuisine",
  },
  {
    key: "cafe",
    title: "The Cafe",
    description:
      "A slower corner of Akshaya — hand-pulled coffee, shakes, and light bites for guests who want to linger a while longer.",
    phone: "80195 35353",
    meta: "Coffee, Shakes & Snacks",
  },
  {
    key: "banquet",
    title: "Banquet Halls",
    description:
      "Air-conditioned halls built for milestones — engagements, birthdays, and corporate gatherings from 50 to 200 guests.",
    phone: "90556 46464",
    meta: "50–200 PAX Capacity",
  },
  {
    key: "catering",
    title: "Outdoor Catering",
    description:
      "The full Akshaya kitchen, at your venue. We cater weddings, receptions, and ceremonies within a 50km radius of Siddipet.",
    phone: "96668 78787",
    meta: "Weddings & Ceremonies",
  },
];

export type MenuCategory = "Biryani" | "Kababs" | "Curries" | "Cafe" | "Desserts";

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  price: number;
  description: string;
  spice: 0 | 1 | 2 | 3;
}

export const menuCategories: MenuCategory[] = ["Biryani", "Kababs", "Curries", "Cafe", "Desserts"];

export const menuItems: MenuItem[] = [
  {
    id: "special-mutton-biryani",
    name: "Special Mutton Biryani",
    category: "Biryani",
    price: 450,
    description: "Slow-dum-cooked basmati layered with tender mutton and a whisper of saffron.",
    spice: 2,
  },
  {
    id: "mirchi-palav",
    name: "Mirchi Palav",
    category: "Biryani",
    price: 280,
    description: "Fragrant rice tempered with green chilli, coriander, and roasted spice.",
    spice: 3,
  },
  {
    id: "chicken-dum-biryani",
    name: "Chicken Dum Biryani",
    category: "Biryani",
    price: 320,
    description: "A Siddipet classic — sealed and slow-cooked for a smoky, layered finish.",
    spice: 2,
  },
  {
    id: "miriyala-kabab",
    name: "Miriyala Kabab",
    category: "Kababs",
    price: 320,
    description: "Black pepper-crusted kababs, char-grilled and rested in warm ghee.",
    spice: 2,
  },
  {
    id: "hariyali-kabab",
    name: "Hariyali Kabab",
    category: "Kababs",
    price: 300,
    description: "Mint and coriander marinated kabab, finished over open flame.",
    spice: 1,
  },
  {
    id: "gongura-mutton",
    name: "Gongura Mutton",
    category: "Curries",
    price: 380,
    description: "Tangy sorrel leaf curry simmered with slow-braised mutton, a Telangana heirloom recipe.",
    spice: 3,
  },
  {
    id: "natukodi-curry",
    name: "Natu Kodi Curry",
    category: "Curries",
    price: 340,
    description: "Free-range country chicken in a slow-reduced red gravy.",
    spice: 3,
  },
  {
    id: "filter-coffee",
    name: "Akshaya Filter Coffee",
    category: "Cafe",
    price: 60,
    description: "South Indian filter coffee, poured tableside from brass to steel.",
    spice: 0,
  },
  {
    id: "cold-coffee-shake",
    name: "Cold Coffee Shake",
    category: "Cafe",
    price: 120,
    description: "Espresso, cream, and ice — whipped thick, served long.",
    spice: 0,
  },
  {
    id: "double-ka-meetha",
    name: "Double Ka Meetha",
    category: "Desserts",
    price: 150,
    description: "Saffron-soaked bread pudding, finished with reduced milk and pistachio.",
    spice: 0,
  },
  {
    id: "qubani-ka-meetha",
    name: "Qubani Ka Meetha",
    category: "Desserts",
    price: 160,
    description: "Stewed apricot dessert, a Telangana table tradition, served warm with cream.",
    spice: 0,
  },
];

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  tone: [string, string];
}

export const galleryItems: GalleryItem[] = [
  { id: "grand-hall", title: "The Grand Hall", category: "Architecture", tone: ["#2a1f14", "#c9a15a"] },
  { id: "culinary-art", title: "Culinary Art", category: "Kitchen", tone: ["#1a1410", "#e8c37e"] },
  { id: "lounge", title: "The Lounge", category: "Interiors", tone: ["#12181f", "#8a94a3"] },
  { id: "private-suite", title: "Private Suite", category: "Banquets", tone: ["#1f150f", "#c9a15a"] },
  { id: "evening-view", title: "Evening View", category: "Ambience", tone: ["#0d1219", "#e8c37e"] },
  { id: "craft-service", title: "Table Craft", category: "Service", tone: ["#191310", "#c9a15a"] },
];

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  context: string;
}

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    quote: "The mutton biryani alone is worth the drive — and the whole family had room to celebrate.",
    name: "Rajesh K.",
    context: "Family Dinner",
  },
  {
    id: "t2",
    quote: "Booked the banquet hall for our daughter's birthday. Every plate came out hot, on time, unhurried.",
    name: "Sravani G.",
    context: "Banquet Celebration",
  },
  {
    id: "t3",
    quote: "Eighteen years in and it still tastes like the first visit. That consistency is rare.",
    name: "Anil M.",
    context: "Longtime Guest",
  },
];
