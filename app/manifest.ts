import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Akshaya Restaurant",
    short_name: "Akshaya",
    description:
      "Akshaya Family Restaurant — authentic Telangana dining, cafe, banquet halls, and outdoor catering in Siddipet.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0b0f14",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
