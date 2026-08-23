/**
 * Multi-branch model schema for future restaurant scaling.
 * Supports multi-location management (e.g. Siddipet Main Branch, Highway Drive-thru, etc.).
 */

export interface RestaurantBranch {
  id: string;
  name: string;
  slug: string;
  isMain: boolean;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  geo: {
    lat: number;
    lng: number;
  };
  phone: string;
  email: string;
  openingHours: {
    open: string; // "11:00"
    close: string; // "23:00"
  };
  isActive: boolean;
}

export const MAIN_BRANCH: RestaurantBranch = {
  id: "branch-siddipet-main",
  name: "Akshaya Family Restaurant - Siddipet Main",
  slug: "siddipet-main",
  isMain: true,
  address: {
    street: "Opp. New Bus Stand",
    city: "Siddipet",
    state: "Telangana",
    pincode: "502103",
  },
  geo: {
    lat: 18.1018,
    lng: 78.8520,
  },
  phone: "+91 98765 43210",
  email: "contact@akshayarestaurant.in",
  openingHours: {
    open: "11:00",
    close: "23:00",
  },
  isActive: true,
};
