import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Star, Shield, ExternalLink, ChevronRight } from "lucide-react";
import { reviews } from "@/data/reviews";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  alternates: { canonical: "https://tikiboat.fr/avis" },
  openGraph: { url: "https://tikiboat.fr/avis", type: "website" },
  title: "Avis clients",
  description: "Découvrez les avis de nos clients sur Tiki Boat. Plus de 100 avis vérifiés Google et Tripadvisor.",
};

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function AvisPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("avis");

  const stats = locale === "en"
    ? [
        { value: "4.8★", label: "Google score" },
        { value: "4.9★", label: "Tripadvisor" },
        { value: "100%", label: "Would recommend" },
        { value: "500+", label: "Happy guests" },
      ]
    : [
        { value: "4.8★", label: "Note Google" },
        { value: "4.9★", label: "Note Tripadvisor" },
        { value: "100%", label: "Recommandent" },
        { value: "500+", label: "Clients satisfaits" },
      ];

  return (
    <>
      {/* Header */}
      <section className="pt-32 pb-16 bg-sky-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-tiki-red/10 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="section-title mb-4">{t("title")}</h1>
          <div className="flex items-center justify-center gap-2 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="text-tiki-gold fill-tiki-gold" size={28} />
            ))}
            <span className="text-slate-800 font-bold text-3xl ml-2">4.9/5</span>
          </div>
          <p className="text-slate-500 text-lg">{t("subtitle")}</p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 bg-tiki-dark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="card-dark text-center py-5">
                <div className="font-display text-2xl font-bold text-tiki-gold">{stat.value}</div>
                <div className="text-slate-500 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews grid */}
      <section className="py-12 bg-tiki-dark-2">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div key={review.id} className="card-dark flex flex-col">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className={i < review.rating ? "text-tiki-gold fill-tiki-gold" : "text-slate-500/30"} />
                  ))}
                  <span className="text-xs text-slate-500 ml-1 capitalize">{review.platform}</span>
                </div>
                <p className="text-slate-800 italic leading-relaxed flex-1 mb-4">
                  &ldquo;{review.comment}&rdquo;
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-tiki-gold/20">
                  <div>
                    <div className="font-semibold text-tiki-gold">{review.author}</div>
                    <div className="text-slate-500 text-xs">
                      {new Date(review.date).toLocaleDateString(locale === "en" ? "en-GB" : "fr-FR", { month: "long", year: "numeric" })}
                    </div>
                  </div>
                  <Shield className="text-tiki-gold/40" size={18} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* External platforms */}
      <section className="py-16 bg-tiki-dark">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-2xl font-bold text-tiki-gold mb-4">{t("readMore")}</h2>
          <p className="text-slate-500 mb-8">
            {locale === "en"
              ? "Find all our reviews on official platforms."
              : "Retrouvez l'intégralité de nos avis sur les plateformes officielles."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://www.tripadvisor.fr/Attraction_Review-g644387-d23475410-Reviews-Tiki_Boat-Le_Gosier_Grande_Terre_Island_Guadeloupe.html"
              target="_blank" rel="noopener noreferrer" className="btn-secondary">
              {t("tripadvisor")} <ExternalLink size={16} />
            </a>
            <a href="https://www.google.com/search?q=tiki+boat+guadeloupe+avis"
              target="_blank" rel="noopener noreferrer" className="btn-secondary">
              {t("google")} <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-sky-50 border-t border-tiki-gold/20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-2xl font-bold text-tiki-gold mb-3">
            {locale === "en" ? "Ready for the adventure?" : "Prêt à vivre l'aventure ?"}
          </h2>
          <p className="text-slate-500 mb-6">
            {locale === "en" ? "Join our hundreds of happy guests!" : "Rejoignez nos centaines de clients satisfaits !"}
          </p>
          <Link href="/reservation" className="btn-primary">
            {locale === "en" ? "Book now" : "Réserver maintenant"}
            <ChevronRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
