import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { excursions as staticExcursions } from "@/data/excursions";
import type { Excursion } from "@/types";

export interface DbExcursion {
  id: string; slug: string; title: string; subtitle: string;
  description: string; duration: string; departureTime: string;
  returnTime: string; departurePoint: string; maxPassengers: number;
  priceAdult: number; priceChild: number; pricePrivate: number | null;
  included: string; notIncluded: string; highlights: string;
  images: string; youtubeId: string | null; badge: string | null;
  popular: boolean; isActive: boolean; sortOrder: number;
}

const parse = (json: string): string[] => {
  try { return JSON.parse(json); } catch { return []; }
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
    priceAdultHighSeason: s?.priceAdultHighSeason,
    priceChildHighSeason: s?.priceChildHighSeason,
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
  { revalidate: 10, tags: ["excursions"] }
);

export const getExcursionBySlug = unstable_cache(
  async (slug: string): Promise<Excursion | undefined> => {
    try {
      const row = await prisma.excursion.findUnique({ where: { slug } });
      if (row) return dbToExcursion(row);
    } catch {}
    return staticExcursions.find(e => e.slug === slug);
  },
  ["excursion-by-slug"],
  { revalidate: 10, tags: ["excursions"] }
);
