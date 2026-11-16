// Pratiques et modèles Canva, aux couleurs d'Instit en short. Les pratiques
// se filtrent par intention (lien ?intention=…, lu au serveur, sans
// JavaScript) ; les modèles cochés « En ce moment » ferment la page.
import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { MaybeLink, SiteFooter, SiteHeader } from "@/components/site/SiteShell";
import { AUTHOR_NAME } from "@/lib/branding";
import { TYPE, type Label, type Publication } from "@/lib/publications";
import { loadPublications } from "@/lib/publications_query";

export const metadata: Metadata = {
  title: `Pratiques et modèles · ${AUTHOR_NAME}`,
  description: "Des pratiques de classe et les modèles Canva pour les mettre en route.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

// Trois bandes par carte, comme les carrousels ; la teinte tourne d'une carte
// à l'autre.
const TONS_PRATIQUE = [
  ["b-ocre", "b-sauge", "b-olive"],
  ["b-marine", "b-ciel", "b-bordeaux"],
  ["b-corail", "b-peche", "b-bordeaux"],
  ["b-marine", "b-soleil", "b-olive"],
];
const TONS_VIGNETTE = [
  ["b-ciel", "b-marine", "b-soleil"],
  ["b-ocre", "b-sauge", "b-olive"],
  ["b-peche", "b-corail", "b-bordeaux"],
];

export default function ModelesPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<p className="page-loading">Chargement…</p>}>
      <Modeles searchParams={searchParams} />
    </Suspense>
  );
}

function Modele({ item, index }: { item: Publication; index: number }) {
  const tons = TONS_VIGNETTE[index % TONS_VIGNETTE.length];
  return (
    <article className="modele">
      {item.image ? (
        // eslint-disable-next-line @next/next/no-img-element -- média de la fiche, servi par /api/media
        <img src={item.image} alt="" />
      ) : (
        <div className="vignette" aria-hidden="true">
          {tons.map((ton) => (
            <span key={ton} className={ton} />
          ))}
        </div>
      )}
      <div className="texte">
        <h3>{item.title}</h3>
        {item.resume ? <p>{item.resume}</p> : null}
        {item.lien ? (
          <a className="bouton" href={item.lien} target="_blank" rel="noopener noreferrer">
            Utiliser le modèle
          </a>
        ) : null}
      </div>
    </article>
  );
}

async function Modeles({ searchParams }: { searchParams: SearchParams }) {
  await connection();
  const [publications, params] = await Promise.all([loadPublications(), searchParams]);
  const pratiques = publications.filter((item) => item.type === TYPE.pratique);
  const modeles = publications.filter((item) => item.type === TYPE.modele);
  const permanents = modeles.filter((item) => !item.saison);
  const saison = modeles.filter((item) => item.saison);

  // Seules les intentions réellement portées par une pratique publiée.
  const intentions = new Map<string, Label>();
  for (const item of pratiques) for (const label of item.intentions) intentions.set(label.id, label);
  const wanted = typeof params.intention === "string" && intentions.has(params.intention) ? params.intention : null;
  const shown = wanted ? pratiques.filter((item) => item.intentions.some((label) => label.id === wanted)) : pratiques;

  return (
    <div className="site">
      <SiteHeader current="pratiques" />

      <div className="bandes hero">
        <div className="bande fine b-ciel" />
        <h1 className="bande b-marine">Des pratiques de classe, pas une liste d&apos;applications.</h1>
        <p className="bande b-peche">Et les modèles Canva pour les mettre en route dès lundi.</p>
        <div className="bande fine b-soleil" />
      </div>

      <main>
        <section id="pratiques" className="large">
          <div className="titre">
            <h2>Pratiques pédagogiques et numériques</h2>
            <p>On part de l&apos;intention, l&apos;outil vient après.</p>
          </div>
          {intentions.size > 1 ? (
            <nav className="puces" aria-label="Filtrer par intention">
              <a href="/modeles#pratiques" aria-current={wanted === null}>
                Toutes
              </a>
              {[...intentions.values()].map((label) => (
                <a key={label.id} href={`/modeles?intention=${label.id}#pratiques`} aria-current={wanted === label.id}>
                  {label.name}
                </a>
              ))}
            </nav>
          ) : null}
          {shown.length ? (
            <div className="grille">
              {shown.map((item, index) => {
                const tons = TONS_PRATIQUE[index % TONS_PRATIQUE.length];
                const pied = [item.intentions.map((label) => label.name).join(" · "), item.niveau, item.resume].filter(Boolean);
                return (
                  <MaybeLink key={item.id} className="pratique" href={item.lien}>
                    <div className="bandes">
                      <div className={`bande ${tons[0]}`}>{item.title}</div>
                      {item.quoi ? <div className={`bande ${tons[1]}`}>{item.quoi}</div> : null}
                      {item.pourquoi ? <div className={`bande ${tons[2]}`}>{item.pourquoi}</div> : null}
                    </div>
                    {pied.length ? <p className="pied">{pied.join(" · ")}</p> : null}
                  </MaybeLink>
                );
              })}
            </div>
          ) : (
            <p className="vide">Les premières pratiques arrivent bientôt.</p>
          )}
        </section>

        <section id="modeles" className="large">
          <div className="titre">
            <h2>Modèles Canva</h2>
            <p>Utilisables toute l&apos;année, prêts à copier et à adapter.</p>
          </div>
          {permanents.length ? (
            <div className="grille">
              {permanents.map((item, index) => (
                <Modele key={item.id} item={item} index={index} />
              ))}
            </div>
          ) : (
            <p className="vide">Les premiers modèles arrivent bientôt.</p>
          )}
        </section>

        {saison.length ? (
          <div className="saison" id="saison">
            <section className="large">
              <div className="titre">
                <h2>En ce moment</h2>
                <p>Les modèles de saison.</p>
              </div>
              <div className="grille">
                {saison.map((item, index) => (
                  <Modele key={item.id} item={item} index={index + 2} />
                ))}
              </div>
            </section>
          </div>
        ) : null}
      </main>

      <SiteFooter tons={["b-corail", "b-bordeaux"]} />
    </div>
  );
}
