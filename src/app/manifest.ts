import type { MetadataRoute } from "next";

// Manifeste de la PWA, servi à /manifest.webmanifest (convention de Next).
// Le partage natif part en GET vers /share : tout tient dans l'adresse, qui
// survit à une reconnexion, là où le corps d'un POST se perdrait.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Instit en short",
    short_name: "Instit en short",
    description: "Pages, bases et veille, auto-hébergées",
    lang: "fr",
    // Ouverture de l'icône installée sur la capture du Vide-cerveau, le geste
    // du téléphone ; TabsBridge applique la même règle à la racine en onglet.
    start_url: "/inbox",
    scope: "/",
    display: "standalone",
    background_color: "#efe9df",
    theme_color: "#efe9df",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    share_target: {
      action: "/share",
      method: "GET",
      // Sans effet en GET, mais Chrome signale son absence à la lecture.
      enctype: "application/x-www-form-urlencoded",
      params: { title: "title", text: "text", url: "url" },
    },
  };
}
