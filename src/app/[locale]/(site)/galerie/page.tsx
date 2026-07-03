import type { Metadata } from "next";
import { Play } from "lucide-react";
import { getTranslations } from "next-intl/server";

const OG_IMAGE = "https://tikiboat.fr/og.jpg";

const BASE = "https://tikiboat.fr";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === "en";
  const url = isEn ? `${BASE}/en/galerie` : `${BASE}/galerie`;
  return {
    title: isEn ? "Photo & Video Gallery — Tiki Boat Guadeloupe" : "Galerie photos & vidéos — Tiki Boat Guadeloupe",
    description: isEn
      ? "Watch Tiki Boat trips in Guadeloupe on video: Grand Cul de Sac Marin, islets, snorkeling, Creole meal with your feet in the water."
      : "Découvrez en vidéo les excursions Tiki Boat en Guadeloupe : Grand Cul de Sac Marin, îlets, snorkeling, repas créole les pieds dans l'eau.",
    alternates: { canonical: url, languages: { fr: `${BASE}/galerie`, en: `${BASE}/en/galerie` } },
    openGraph: {
      title: isEn ? "Tiki Boat Gallery — Guadeloupe trips on video" : "Galerie Tiki Boat — Excursions en Guadeloupe en vidéo",
      description: isEn
        ? "Experience Tiki Boat before you board. Videos and photos of the islets and lagoon."
        : "Vivez l'expérience Tiki Boat avant de monter à bord. Vidéos et photos des îlets et du lagon.",
      url,
      type: "website",
      locale: isEn ? "en_US" : "fr_FR",
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Excursion Tiki Boat Grand Cul de Sac Marin" }],
    },
    twitter: {
      card: "summary_large_image",
      title: isEn ? "Tiki Boat Gallery — Guadeloupe on video" : "Galerie Tiki Boat — Guadeloupe en vidéo",
      description: isEn
        ? "Videos and photos of boat trips in Guadeloupe."
        : "Vidéos et photos des excursions en bateau en Guadeloupe.",
      images: [OG_IMAGE],
    },
  };
}

export default async function GaleriePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("galerie");

  const videos = [
    {
      youtubeId: "gNaCNE7808o",
      title: locale === "en" ? "A day aboard the Tiki Boat" : "Une journée à bord du Tiki Boat",
      description: locale === "en"
        ? "Discover a full day in the Grand Cul de Sac Marin. 5 minutes to see it all!"
        : "Découvrez une journée complète dans le Grand Cul de Sac Marin. 5 minutes pour tout voir !",
    },
  ];

  return (
    <>
      {/* Header */}
      <section className="pt-32 pb-16 bg-sky-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-tiki-red/10 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="section-title mb-4">{t("title")}</h1>
          <p className="section-subtitle max-w-2xl mx-auto">{t("subtitle")}</p>
        </div>
      </section>

      {/* Videos */}
      <section className="py-16 bg-tiki-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title mb-8">{t("videos")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {videos.map((v) => (
              <div key={v.youtubeId} className="card-dark overflow-hidden p-0">
                <div className="relative aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${v.youtubeId}`}
                    title={v.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Play size={16} className="text-tiki-red" />
                    <h3 className="font-bold text-slate-800">{v.title}</h3>
                  </div>
                  <p className="text-slate-500 text-sm">{v.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social CTA */}
      <section className="py-12 bg-white border-t border-tiki-gold/20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-2xl font-bold text-tiki-gold mb-3">{t("social")}</h2>
          <p className="text-slate-500 mb-6">{t("socialSub")}</p>
          <div className="flex gap-4 justify-center">
            <a href="https://www.instagram.com/tikiboatguadeloupe/" target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm py-2.5 px-6">
              {t("instagram")}
            </a>
            <a href="https://www.facebook.com/tikiboatguadeloupe/?locale=fr_FR" target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm py-2.5 px-6">
              {t("facebook")}
            </a>
            <a href="https://www.youtube.com/@TikiBoatGuadeloupe" target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm py-2.5 px-6">
              {t("youtube")}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
