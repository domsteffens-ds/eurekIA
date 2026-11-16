// Site public, partie serveur : création de la base « Publications », lecture
// de ses entrées publiées et portée de leurs images. Les règles pures sont
// dans publications.ts.
import { and, eq, isNull, sql } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import { pages } from "@/db/schema";
import { createEntry, listEntries } from "./databases";
import { basesRootId } from "./pages";
import { validateProperties } from "./properties";
import {
  PUB,
  PUBLICATION_PROPERTIES,
  PUBLICATION_VIEWS,
  PUBLICATIONS_ID,
  PUBLICATIONS_TITLE,
  STATUT,
  TYPE,
  toPublications,
  type Publication,
} from "./publications";
import { parseConfig, sanitizeViews } from "./views";

// Premières fiches, tirées des visuels fournis : elles montrent le circuit
// (Kanban → site) et se modifient ou se suppriment comme les autres.
const PREMIERES_FICHES: { title: string; values: Record<string, unknown> }[] = [
  {
    title: "Microsoft 365 : fin du gratuit ?",
    values: {
      [PUB.type]: TYPE.numero,
      [PUB.statut]: STATUT.publie,
      [PUB.numero]: 4,
      [PUB.rubrique]: "r_numerique",
      [PUB.resume]:
        "Fin des ventes de la licence A1 en mai 2027, retrait en janvier 2028 lors du renouvellement du contrat de l'école : ce que cela change pour votre établissement.",
    },
  },
  {
    title: "Lire à voix haute :",
    values: {
      [PUB.type]: TYPE.pratique,
      [PUB.statut]: STATUT.publie,
      [PUB.quoi]: "des textes de fluence",
      [PUB.pourquoi]: "pour gagner en aisance",
      [PUB.intention]: ["i_lire"],
    },
  },
  {
    title: "Pour les plus grands :",
    values: {
      [PUB.type]: TYPE.pratique,
      [PUB.statut]: STATUT.publie,
      [PUB.quoi]: "des lectures silencieuses",
      [PUB.pourquoi]: "pour comprendre les textes",
      [PUB.intention]: ["i_lire"],
    },
  },
  {
    title: "Spécial saint Nicolas",
    values: {
      [PUB.type]: TYPE.modele,
      [PUB.statut]: STATUT.publier,
      [PUB.saison]: true,
      [PUB.resume]: "Plus de 40 modèles pour toute l'école.",
    },
  },
];

// Crée la base si elle n'existe pas (démarrage en production, première visite
// en développement). Idempotent : l'id est fixe, une seconde insertion ne fait
// rien, et une base déjà là n'est jamais réécrite.
export async function ensurePublications(): Promise<void> {
  const properties = validateProperties(PUBLICATION_PROPERTIES);
  if (typeof properties === "string") throw new Error(`Schéma des publications invalide : ${properties}`);
  const parentId = await basesRootId();
  const inserted = await db
    .insert(pages)
    .values({
      id: PUBLICATIONS_ID,
      parentId,
      type: "database",
      title: PUBLICATIONS_TITLE,
      icon: "📰",
      dbConfig: { properties, views: sanitizeViews(PUBLICATION_VIEWS, properties) },
    })
    .onConflictDoNothing()
    .returning({ id: pages.id });
  if (!inserted.length) return;
  for (const fiche of PREMIERES_FICHES) await createEntry(PUBLICATIONS_ID, fiche.values, fiche.title);
}

// Les publications visibles, lues en direct à chaque rendu. Base en corbeille
// ou absente : liste vide.
export const loadPublications = cache(async (): Promise<Publication[]> => {
  const select = () =>
    db
      .select({ dbConfig: pages.dbConfig, trashedAt: pages.trashedAt })
      .from(pages)
      .where(and(eq(pages.id, PUBLICATIONS_ID), eq(pages.type, "database")));
  let [base] = await select();
  if (!base) {
    await ensurePublications();
    [base] = await select();
  }
  if (!base || base.trashedAt) return [];
  return toPublications(await listEntries(PUBLICATIONS_ID), parseConfig(base.dbConfig).properties);
});

// Entrées dont les images se servent sans session : celles qui sont publiées.
export async function publicationsReach(): Promise<string[]> {
  const rows = await db
    .select({ id: pages.id })
    .from(pages)
    .where(
      and(
        eq(pages.dbId, PUBLICATIONS_ID),
        eq(pages.type, "entry"),
        isNull(pages.trashedAt),
        sql`${pages.propertyValues} ->> ${PUB.statut} = ${STATUT.publie}`,
      ),
    );
  return rows.map((row) => row.id);
}
