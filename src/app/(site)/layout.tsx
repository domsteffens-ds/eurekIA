import { Patrick_Hand } from "next/font/google";
import "./site.css";

// Site public (/accueil, /modeles), hors coquille de l'app : ni barre
// latérale ni onglets. Tout son style vit sous .site (site.css) ; chaque page
// pose elle-même .site, avec ou sans .eurek, autour de son contenu.
const patrick = Patrick_Hand({ weight: "400", subsets: ["latin"], variable: "--font-patrick" });

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <div className={patrick.variable}>{children}</div>;
}
