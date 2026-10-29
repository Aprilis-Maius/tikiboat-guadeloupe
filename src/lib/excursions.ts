import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { excursions as staticExcursions } from "@/data/excursions";
import type { Excursion } from "@/types";

export interface DbExcursion {
  id: string; slug: string; title: string; subtitle: string;
  description: string; duration: string; departureTime: string;
  returnTime: string; departurePoint: string; maxPassengers: number;
  priceAdult: number; priceChild: number; pricePrivate: number | null;
  priceAdultHighSeason: number | null; priceChildHighSeason: number | null;
  included: string; notIncluded: string; highlights: string;
  images: string; youtubeId: string | null; badge: string | null;
  popular: boolean; isActive: boolean; sortOrder: number;
}

// Tolère une valeur mal formée en base (null, objet, nombres…) : une page
// d'excursion qui plante, c'est tout le site qui renvoie une erreur
const parse = (json: string): string[] => {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v.filter((s): s is string => typeof s === "string") : [];
  } catch { return []; }
};

export function dbToExcursion(e: DbExcursion): Excursion {
  const s = staticExcursions.find(x => x.slug === e.slug);
  return {
    id:             e.id,
    slug:           e.slug,
    title:          e.title,
    subtitle:       e.subtitle,
    description:    e.description,
    duration:       e.duration,
    departureTime:  e.departureTime,
    returnTime:     e.returnTime,
    departurePoint: e.departurePoint,
    maxPassengers:  e.maxPassengers,
    // Les prix viennent de la DB : c'est la seule source que l'admin peut
    // modifier. Le statique ne sert plus que de secours quand la DB est
    // injoignable (cf. le catch de getExcursions / getExcursionBySlug).
    priceAdult:     e.priceAdult,
    priceChild:     e.priceChild,
    pricePrivate:   e.pricePrivate ?? undefined,
    included:       parse(e.included),
    notIncluded:    parse(e.notIncluded),
    highlights:     parse(e.highlights),
    images:         parse(e.images),
    youtubeId:      e.youtubeId ?? undefined,
    badge:          e.badge ?? undefined,
    popular:        e.popular,
    // Pas de repli sur le statique ici : un champ vidé dans l'admin signifie
    // « aucune majoration haute saison », et doit donc rester vide.
    priceAdultHighSeason: e.priceAdultHighSeason ?? undefined,
    priceChildHighSeason: e.priceChildHighSeason ?? undefined,
    subtitleEn:     s?.subtitleEn,
    descriptionEn:  s?.descriptionEn,
    durationEn:     s?.durationEn,
    highlightsEn:   s?.highlightsEn,
    includedEn:     s?.includedEn,
    notIncludedEn:  s?.notIncludedEn,
    badgeEn:        s?.badgeEn,
  };
}

export const getExcursions = unstable_cache(
  async (): Promise<Excursion[]> => {
    try {
      const rows = await prisma.excursion.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      });
      if (rows.length > 0) return rows.map(dbToExcursion);
    } catch {}
    return staticExcursions;
  },
  ["excursions-list"],
  // 1h : le tag "excursions" est déjà revalidé par l'admin à chaque modif —
  // pas besoin de re-hit la DB toutes les 10 s.
  { revalidate: 3600, tags: ["excursions"] }
);

export const getExcursionBySlug = unstable_cache(
  async (slug: string): Promise<Excursion | undefined> => {
    try {
      const row = await prisma.excursion.findUnique({ where: { slug } });
      // Excursion masquée par l'admin : ni page, ni réservation
      if (row) return row.isActive ? dbToExcursion(row) : undefined;
    } catch {}
    return staticExcursions.find(e => e.slug === slug);
  },
  ["excursion-by-slug"],
  { revalidate: 3600, tags: ["excursions"] }
);

// Toutes les excursions (statiques + DB) : le bateau est partagé, un blocage
// ou une jauge du jour s'applique à chacune
export async function getAllExcursionSlugs(): Promise<string[]> {
  const rows = await prisma.excursion.findMany({ select: { slug: true } });
  return Array.from(new Set([...staticExcursions.map(e => e.slug), ...rows.map(e => e.slug)]));
}
