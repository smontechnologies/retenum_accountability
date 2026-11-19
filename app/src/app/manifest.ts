import type { MetadataRoute } from "next";

/** Web app manifest (PWA-01). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/app",
    name: "Retenum",
    short_name: "Retenum",
    description: "A shared commercial record: what was agreed, changed, authorised, delivered and paid.",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#ffffff",
    theme_color: "#000000",
    categories: ["business", "finance", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
