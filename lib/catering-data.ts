export interface CateringPackage {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  isPopular?: boolean;
  features: string[];
}

export const cateringPackages: CateringPackage[] = [
  {
    id: "basic",
    title: "Basic Package",
    subtitle: "Great for Small Gatherings",
    price: 249,
    features: [
      "Welcome Drink",
      "2 Starters",
      "2 Main Course (Veg)",
      "1 Rice & 1 Bread",
      "1 Dessert",
      "Salad & Pickle",
    ],
  },
  {
    id: "standard",
    title: "Standard Package",
    subtitle: "Best for Medium Gatherings",
    price: 349,
    isPopular: true,
    features: [
      "Welcome Drink",
      "3 Starters",
      "2 Main Course (Veg + Non-Veg)",
      "1 Rice, 2 Breads",
      "2 Desserts",
      "Salad, Pickle & Papad",
    ],
  },
  {
    id: "premium",
    title: "Premium Package",
    subtitle: "Perfect for Large Celebrations",
    price: 499,
    features: [
      "Welcome Drink",
      "4 Starters",
      "3 Main Course (Veg + Non-Veg)",
      "1 Rice, 2 Breads",
      "3 Desserts",
      "Salad, Pickle, Papad & Raita",
    ],
  },
];

export const cateringPills = [
  { icon: "Utensils", label: "Minimum 50 Plates" },
  { icon: "Edit3", label: "Customizable Menu" },
  { icon: "ShieldCheck", label: "Best Quality Ingredients" },
  { icon: "UserCheck", label: "Trained & Uniformed Staff" },
];

export const cateringFeatures = [
  {
    id: "multi-cuisine",
    title: "Multi-Cuisine Options",
    description: "Wide range of cuisines crafted by expert chefs.",
    icon: "UtensilsCrossed",
  },
  {
    id: "hygiene",
    title: "Hygienic Preparation",
    description: "Strict hygiene standards with quality ingredients.",
    icon: "ShieldCheck",
  },
  {
    id: "on-time",
    title: "On-Time Setup & Service",
    description: "Punctual setup to make your event stress-free.",
    icon: "Truck",
  },
  {
    id: "custom-menu",
    title: "Custom Menus",
    description: "Personalised menus tailored to your preferences.",
    icon: "Sliders",
  },
];

export const cateringCategories = [
  { id: "starters", title: "Starters", count: "20+ Items", image: "/Images/chicken-65.jpg", tint: "from-red-100 to-orange-200" },
  { id: "main-course", title: "Main Course", count: "30+ Items", image: "/Images/paneer-butter-masala.jpg", tint: "from-orange-100 to-red-100" },
  { id: "desserts", title: "Desserts", count: "15+ Items", image: "/Images/gulab-jamun.jpg", tint: "from-amber-100 to-orange-200" },
  { id: "beverages", title: "Beverages", count: "10+ Items", image: "/Images/masala-coke.jpg", tint: "from-stone-200 to-stone-300" },
];

export const cateringEventTypes = [
  {
    id: "wedding",
    title: "Wedding Catering",
    description: "Grand menus for your special day.",
    image: "/Images/catering/event-wedding.png",
    icon: "Heart",
  },
  {
    id: "corporate",
    title: "Corporate Catering",
    description: "Professional service for meetings & events.",
    image: "/Images/catering/event-corporate.png",
    icon: "Building2",
  },
  {
    id: "birthday",
    title: "Birthday Parties",
    description: "Delicious food for memorable celebrations.",
    image: "/Images/catering/event-birthday.png",
    icon: "PartyPopper",
  },
  {
    id: "outdoor",
    title: "Outdoor Events",
    description: "Perfect catering for any outdoor occasion.",
    image: "/Images/catering/quote-outdoor.png",
    icon: "Sun",
  },
];

export const cateringReviews = [
  {
    id: "rohit-priya",
    name: "Rohit & Priya",
    subtext: "Hyderabad",
    avatar: "/Images/avatar-priya.svg",
    rating: 5,
    quote: "The food was amazing and the service was exceptional! Akshaya Catering made our wedding truly unforgettable.",
  },
  {
    id: "vikram",
    name: "Vikram Reddy",
    subtext: "Microsoft India",
    avatar: "/Images/avatar-vikram.svg",
    rating: 5,
    quote: "Perfect food, perfect presentation and on-time service. Highly recommended for corporate events.",
  },
  {
    id: "ananya",
    name: "Ananya Devi",
    subtext: "Hyderabad",
    avatar: "/Images/avatar-rahul.svg",
    rating: 5,
    quote: "Our guests loved every dish. Great taste, hygiene and professional team!",
  },
];

export const cateringGalleryShots = [
  { id: "g1", image: "/Images/chicken-65.jpg", alt: "Catering starter platter" },
  { id: "g2", image: "/Images/chicken-tikka.jpg", alt: "Plated skewers" },
  { id: "g3", image: "/Images/gallery-interior-1.jpg", alt: "Buffet chafing dishes setup" },
  { id: "g4", image: "/Images/gallery-interior-2.jpg", alt: "Banquet dining setup" },
  { id: "g5", image: "/Images/gulab-jamun.jpg", alt: "Dessert station" },
];

export const cateringContact = {
  phone: "+91 98765 43210",
  email: "info@akshaya.com",
  address: "Plot No. 12, Main Road, Hyderabad, Telangana - 500001",
  hours: "Mon - Sun: 9:00 AM - 10:30 PM",
  mapQuery: "Akshaya Catering Hyderabad",
};
