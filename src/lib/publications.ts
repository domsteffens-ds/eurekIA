// Site public (/accueil, /modeles) : la base « Publications », son schéma et
// la lecture de ses entrées. Règles pures ; l'accès à la base de données est
// dans publications_query.ts. Une entrée paraît sur le site quand sa colonne
// Kanban (Statut) est « Publié ».
import type { EntryRow, Property, SelectOption } from "./properties";
import { cardImage } from "./views";

// Id fixe, comme la racine des bases : la base se retrouve sans dépendre de
// son titre, que l'on peut changer.
export const PUBLICATIONS_ID = "pg_publications0000";
export const PUBLICATIONS_TITLE = "Publications";

export const PUB = {
  type: "pub_type",
  statut: "pub_statut",
  rubrique: "pub_rubrique",
  date: "pub_date",
  lien: "pub_lien",
  source: "pub_source",
  resume: "pub_resume",
  quoi: "pub_quoi",
  pourquoi: "pub_pourquoi",
  intention: "pub_intention",
  niveau: "pub_niveau",
  numero: "pub_numero",
  saison: "pub_saison",
} as const;

export const TYPE = { actu: "t_actu", numero: "t_numero", pratique: "t_pratique", modele: "t_modele" } as const;
export const STATUT = { trier: "s_trier", lire: "s_lire", publier: "s_publier", publie: "s_publie" } as const;

const option = (id: string, name: string, color: SelectOption["color"]): SelectOption => ({ id, name, color });

export const PUBLICATION_PROPERTIES: Property[] = [
  {
    id: PUB.statut,
    name: "Statut",
    type: "select",
    options: [
      option(STATUT.trier, "À trier", "gray"),
      option(STATUT.lire, "À lire", "brown"),
      option(STATUT.publier, "À publier", "yellow"),
      option(STATUT.publie, "Publié", "green"),
    ],
  },
  {
    id: PUB.type,
    name: "Type",
    type: "select",
    options: [
      option(TYPE.actu, "Actualité", "blue"),
      option(TYPE.numero, "Numéro Eurêk IA", "brown"),
      option(TYPE.pratique, "Pratique", "green"),
      option(TYPE.modele, "Modèle Canva", "orange"),
    ],
  },
  {
    id: PUB.rubrique,
    name: "Rubrique",
    type: "select",
    options: [option("r_ia", "IA", "gray"), option("r_numerique", "Numérique", "blue"), option("r_education", "Éducation", "brown")],
  },
  { id: PUB.date, name: "Date", type: "date" },
  { id: PUB.lien, name: "Lien", type: "url" },
  { id: PUB.source, name: "Source", type: "text" },
  { id: PUB.resume, name: "Résumé", type: "text" },
  { id: PUB.quoi, name: "Pratique : quoi", type: "text" },
  { id: PUB.pourquoi, name: "Pratique : pour quoi", type: "text" },
  {
    id: PUB.intention,
    name: "Intention",
    type: "multiselect",
    options: [
      option("i_lire", "Lire", "green"),
      option("i_ecrire", "Écrire", "blue"),
      option("i_cooperer", "Coopérer", "orange"),
      option("i_critique", "Esprit critique", "purple"),
    ],
  },
  { id: PUB.niveau, name: "Niveau", type: "text" },
  { id: PUB.numero, name: "Numéro", type: "number", format: "number" },
  { id: PUB.saison, name: "En ce moment", type: "checkbox" },
];

export const PUBLICATION_VIEWS = [
  { id: "view_kanban", name: "Kanban", kind: "board", group_by: PUB.statut },
  { id: "view_table", name: "Tableau", kind: "table" },
];

export type Label = { id: string; name: string };

export type Publication = {
  id: string;
  title: string;
  type: string;
  rubrique: Label | null;
  date: string;
  lien: string | null;
  source: string;
  resume: string;
  quoi: string;
  pourquoi: string;
  intentions: Label[];
  niveau: string;
  numero: number | null;
  saison: boolean;
  image: string | null;
};

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

// Un lien n'est suivi que s'il part vers le web : jamais de javascript: ni
// d'adresse relative venue d'une saisie.
function webLink(value: unknown): string | null {
  const raw = text(value);
  return /^https?:\/\/[^\s]+$/i.test(raw) ? raw : null;
}

function labelsOf(properties: readonly Property[], propId: string): Map<string, Label> {
  const options = properties.find((prop) => prop.id === propId)?.options ?? [];
  return new Map(options.map((item) => [item.id, { id: item.id, name: item.name }]));
}

// Les entrées publiées, de la plus récente à la plus ancienne. La date saisie
// l'emporte sur la date de création.
export function toPublications(entries: readonly EntryRow[], properties: readonly Property[]): Publication[] {
  const rubriques = labelsOf(properties, PUB.rubrique);
  const intentions = labelsOf(properties, PUB.intention);
  return entries
    .filter((entry) => entry.values[PUB.statut] === STATUT.publie && typeof entry.values[PUB.type] === "string")
    .map((entry) => {
      const v = entry.values;
      const picked = Array.isArray(v[PUB.intention]) ? (v[PUB.intention] as string[]) : [];
      return {
        id: entry.id,
        title: entry.title.trim() || "Sans titre",
        type: v[PUB.type] as string,
        rubrique: rubriques.get(text(v[PUB.rubrique])) ?? null,
        date: /^\d{4}-\d{2}-\d{2}$/.test(text(v[PUB.date])) ? text(v[PUB.date]) : entry.createdAt.slice(0, 10),
        lien: webLink(v[PUB.lien]),
        source: text(v[PUB.source]),
        resume: text(v[PUB.resume]),
        quoi: text(v[PUB.quoi]),
        pourquoi: text(v[PUB.pourquoi]),
        intentions: picked.flatMap((id) => intentions.get(id) ?? []),
        niveau: text(v[PUB.niveau]),
        numero: typeof v[PUB.numero] === "number" ? (v[PUB.numero] as number) : null,
        saison: v[PUB.saison] === true,
        image: cardImage(entry),
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

const MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

// « 2026-11-16 » → « 16 nov. » ; lu sans fuseau, la date est celle saisie.
export function dateCourte(iso: string): string {
  const [, month, day] = iso.split("-").map(Number);
  return `${day} ${MOIS[month - 1] ?? ""}`.trim();
}

// Hôte lisible d'un lien, à défaut de source saisie.
export function hostOf(url: string | null): string {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

// Accès agent : une tâche automatique dépose ses fiches, elle ne publie pas.
// Le passage en « Publié » reste un geste fait à la main dans le Kanban.
// Rend le refus à afficher, ou null ; `values` : valeurs déjà résolues par id.
export function agentPublicationRefusal(dbId: string, values: Record<string, unknown>): string | null {
  if (dbId !== PUBLICATIONS_ID || values[PUB.statut] !== STATUT.publie) return null;
  return "Publication refusée : une fiche se publie à la main, en la glissant dans la colonne « Publié ».";
}

// Fiche déposée sans statut dans « Publications » : elle attend dans « À trier ».
export function withAgentDefaults(dbId: string, values: Record<string, unknown>): Record<string, unknown> {
  if (dbId !== PUBLICATIONS_ID || PUB.statut in values) return values;
  return { ...values, [PUB.statut]: STATUT.trier };
}
