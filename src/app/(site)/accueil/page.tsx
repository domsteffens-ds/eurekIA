// Accueil public, tout en Eurêk IA : numéro vedette, actualités repérées sur
// le web, tous les numéros, passerelle vers les pratiques, nouveautés. Lu en
// direct dans la base « Publications » à chaque visite.
import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { MaybeLink, SiteFooter, SiteHeader } from "@/components/site/SiteShell";
import { AUTHOR_NAME } from "@/lib/branding";
import { TYPE, dateCourte, hostOf, type Publication } from "@/lib/publications";
import { loadPublications } from "@/lib/publications_query";

export const metadata: Metadata = {
  title: `${AUTHOR_NAME} · Eurêk IA`,
  description: "L'IA, le numérique et l'école, lus par un instit.",
};

const TONS_NUMERO = ["b-nuit", "b-brun", "b-gris"];
const TYPE_LABELS: Record<string, string> = {
  [TYPE.actu]: "Actualité",
  [TYPE.numero]: "Eurêk IA",
  [TYPE.pratique]: "Pratique",
  [TYPE.modele]: "Modèle",
};
const RUBRIQUE_TON: Record<string, string> = { r_numerique: "num", r_education: "edu" };

export default function AccueilPage() {
  return (
    <Suspense fallback={<p className="page-loading">Chargement…</p>}>
      <Accueil />
    </Suspense>
  );
}

function titreNumero(item: Publication): string {
  return item.numero === null ? "Eurêk IA" : `Eurêk IA n° ${item.numero}`;
}

async function Accueil() {
  await connection();
  const publications = await loadPublications();
  const numeros = publications
    .filter((item) => item.type === TYPE.numero)
    .sort((a, b) => (b.numero ?? 0) - (a.numero ?? 0) || b.date.localeCompare(a.date));
  const actus = publications.filter((item) => item.type === TYPE.actu).slice(0, 6);
  const vedette = numeros[0] ?? null;
  const nouveautes = publications.slice(0, 8);

  return (
    <div className="site eurek">
      <SiteHeader current="une" />

      <div className="bandes hero">
        <div className="bande fine b-gris" />
        <h1 className="bande b-nuit">L&apos;IA, le numérique et l&apos;école, lus par un instit.</h1>
        <p className="bande b-taupe">Une veille pour comprendre, puis des pratiques pour la classe.</p>
        <div className="bande fine b-brun" />
      </div>

      <main>
        <section id="une" className="large">
          <div className="titre">
            <h2 className="eurek-mot" aria-label="Eurêk IA">
              {"Eurêk".split("").map((letter, index) => (
                <span key={index}>{letter}</span>
              ))}{" "}
              <span>I</span>
              <span>A</span>
            </h2>
            <p>À la une</p>
          </div>
          <div className="une-grille">
            {vedette ? (
              <MaybeLink className="vedette" href={vedette.lien}>
                {/* eslint-disable-next-line @next/next/no-img-element -- image de la fiche ou personnage statique */}
                <img src={vedette.image ?? "/vitrine/eurekia.png"} alt="" />
                <div className="bande b-taupe">{vedette.title}</div>
                <p>
                  <strong>{titreNumero(vedette)}.</strong> {vedette.resume}
                </p>
              </MaybeLink>
            ) : (
              <p className="vide">Le prochain numéro d&apos;Eurêk IA arrive bientôt.</p>
            )}
            <div>
              <h3 className="sous-titre">Repéré sur le web</h3>
              {actus.length ? (
                <ul className="fil">
                  {actus.map((item) => (
                    <li key={item.id}>
                      <MaybeLink className="actu" href={item.lien}>
                        <div className="meta">
                          {item.rubrique ? <span className={`rub ${RUBRIQUE_TON[item.rubrique.id] ?? ""}`}>{item.rubrique.name}</span> : null}
                          <span className="source">{item.source || hostOf(item.lien)}</span>
                          <span>{dateCourte(item.date)}</span>
                        </div>
                        <h3>{item.title}</h3>
                        {item.resume ? <p>{item.resume}</p> : null}
                      </MaybeLink>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="vide">Les premières actualités arrivent bientôt.</p>
              )}
            </div>
          </div>
        </section>

        {numeros.length ? (
          <section id="numeros" className="large">
            <div className="titre">
              <h2>Tous les numéros</h2>
              <p>Chaque Eurêk IA, du plus récent au plus ancien.</p>
            </div>
            <div className="numeros">
              {numeros.map((item, index) => (
                <MaybeLink key={item.id} className="numero" href={item.lien}>
                  <div className={`bande n ${TONS_NUMERO[index % TONS_NUMERO.length]}`}>{item.numero === null ? "hors-série" : `n° ${item.numero}`}</div>
                  <div className={`bande ${index === 0 ? "b-taupe" : "b-sable"}`}>{item.title}</div>
                </MaybeLink>
              ))}
            </div>
          </section>
        ) : null}

        <section className="large">
          <a className="porte" href="/modeles">
            <div className="bande b-brun">Envie de passer à la pratique ?</div>
            <div className="bande b-taupe">Pratiques de classe et modèles Canva →</div>
          </a>
        </section>

        {nouveautes.length ? (
          <section id="nouveautes" className="large">
            <div className="titre">
              <h2>Nouveautés</h2>
              <p>Tout ce qui vient d&apos;arriver, dans l&apos;ordre.</p>
            </div>
            <ul className="nouv">
              {nouveautes.map((item) => (
                <li key={item.id}>
                  <time dateTime={item.date}>{dateCourte(item.date)}</time>
                  <span className="type">{TYPE_LABELS[item.type] ?? ""}</span>
                  {item.type === TYPE.pratique || item.type === TYPE.modele ? (
                    <a href="/modeles">{[item.title, item.quoi].filter(Boolean).join(" ")}</a>
                  ) : item.lien ? (
                    <a href={item.lien} target="_blank" rel="noopener noreferrer">
                      {item.title}
                    </a>
                  ) : (
                    <span>{item.title}</span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>

      <SiteFooter tons={["b-taupe", "b-nuit"]} />
    </div>
  );
}
