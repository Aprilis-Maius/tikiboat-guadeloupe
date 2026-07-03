import type { MetadataRoute } from "next";
import { excursions } from "@/data/excursions";
import { getPublishedPosts } from "@/lib/blog-db";

const BASE = "https://tikiboat.fr";

// Date stable par déploiement (pas de fausse fraîcheur à chaque crawl)
const DEPLOY_DATE = new Date();

function entry(
  path: string,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  priority: number,
  lastModified: Date = DEPLOY_DATE,
): MetadataRoute.Sitemap {
  // Une entrée par locale, avec hreflang croisés (Next les émet en xhtml:link)
  const languages = { fr: BASE + path, en: BASE + "/en" + path };
  return [
    { url: BASE + path,        lastModified, changeFrequency, priority, alternates: { languages } },
    { url: BASE + "/en" + path, lastModified, changeFrequency, priority, alternates: { languages } },
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    ...entry("/",            "weekly",  1),
    ...entry("/excursions",  "weekly",  0.95),
    ...entry("/reservation", "monthly", 0.9),
    ...entry("/avis",        "weekly",  0.75),
    ...entry("/galerie",     "monthly", 0.65),
    ...entry("/contact",     "yearly",  0.6),
  ];

  const excursionPages: MetadataRoute.Sitemap = excursions.flatMap((e) =>
    entry("/excursions/" + e.slug, "weekly", 0.9)
  );

  // Blog : liste + articles publiés (avec leur vraie date de mise à jour)
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const posts = await getPublishedPosts();
    if (posts.length > 0) {
      blogPages = [
        ...entry("/blog", "weekly", 0.7),
        ...posts.flatMap((p) => entry("/blog/" + p.slug, "monthly", 0.65, p.updatedAt)),
      ];
    }
  } catch {} // DB indisponible : sitemap sans le blog plutôt que 500

  return [...staticPages, ...excursionPages, ...blogPages];
}
