// En-tête et pied communs aux pages du site public. Les images viennent de
// public/vitrine/, que le proxy laisse passer sans session.
import { AUTHOR_NAME } from "@/lib/branding";

const LOGO = "/vitrine/logo.png";

export type Rubrique = "une" | "pratiques";

export function SiteHeader({ current }: { current: Rubrique }) {
  const here = (page: Rubrique) => (current === page ? ({ "aria-current": "page" } as const) : {});
  return (
    <header className="large tete">
      {/* eslint-disable-next-line @next/next/no-img-element -- fichier statique de public/, sans recadrage */}
      <img src={LOGO} alt="" />
      <a className="nom" href="/accueil">
        {AUTHOR_NAME}
      </a>
      <nav aria-label="Rubriques">
        <a href="/accueil#une" {...here("une")}>
          À la une
        </a>
        <a href="/modeles#pratiques" {...here("pratiques")}>
          Pratiques
        </a>
        <a href="/modeles#modeles">Modèles Canva</a>
        <a href="/accueil#nouveautes">Nouveautés</a>
      </nav>
    </header>
  );
}

// tons : les deux bandes fines qui ferment la page, aux couleurs de l'univers.
export function SiteFooter({ tons }: { tons: [string, string] }) {
  return (
    <footer>
      <div className="bandes">
        <div className={`bande fine ${tons[0]}`} />
        <div className={`bande fine ${tons[1]}`} />
      </div>
      <div className="fin large">
        {/* eslint-disable-next-line @next/next/no-img-element -- fichier statique de public/ */}
        <img src={LOGO} alt="" />
        {AUTHOR_NAME} · Eurêk IA · Education Creators
      </div>
    </footer>
  );
}

// Lien si l'adresse existe, simple bloc sinon : une fiche sans lien ne promet
// pas un clic qui ne mène nulle part.
export function MaybeLink({ href, className, children }: { href: string | null; className: string; children: React.ReactNode }) {
  return href ? (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ) : (
    <div className={className}>{children}</div>
  );
}
