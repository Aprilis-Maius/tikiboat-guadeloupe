import type { Metadata } from "next";
import Link from "next/link";
import { Star, Shield, ExternalLink, ChevronRight } from "lucide-react";
import { reviews } from "@/data/reviews";

export const metadata: Metadata = {
  title: "Avis clients",
  description: "Découvrez les avis de nos clients sur Tiki Boat. Plus de 100 avis vérifiés Google et Tripadvisor.",
};

export default function AvisPage() {

  return (
    <>
      {/* Header */}
      <section className="pt-32 pb-16 bg-tiki-dark-2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-tiki-red/10 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="section-title mb-4">Ce que disent nos clients</h1>
          <div className="flex items-center justify-center gap-2 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="text-tiki-gold fill-tiki-gold" size={28} />
            ))}
            <span className="text-white font-bold text-3xl ml-2">4.9/5</span>
          </div>
          <p className="text-tiki-cream-dark text-lg">Basé sur 400+ avis Google & 200+ avis Tripadvisor</p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 bg-tiki-dark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: "4.8★", label: "Note Google" },
              { value: "4.9★", label: "Note Tripadvisor" },
              { value: "100%", label: "Recommandent" },
              { value: "500+", label: "Clients satisfaits" },
            ].map((stat) => (
              <div key={stat.label} className="card-dark text-center py-5">
                <div className="font-display text-2xl font-bold text-tiki-gold">{stat.value}</div>
                <div className="text-tiki-cream-dark text-sm mt-1">{stat.label}</div>
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
                {/* Stars */}
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < review.rating ? "text-tiki-gold fill-tiki-gold" : "text-tiki-cream-dark/30"}
                    />
                  ))}
                  <span className="text-xs text-tiki-cream-dark ml-1 capitalize">{review.platform}</span>
                </div>

                {/* Comment */}
                <p className="text-tiki-cream italic leading-relaxed flex-1 mb-4">
                  &ldquo;{review.comment}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center justify-between pt-4 border-t border-tiki-gold/20">
                  <div>
                    <div className="font-semibold text-tiki-gold">{review.author}</div>
                    <div className="text-tiki-cream-dark text-xs">
                      {new Date(review.date).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
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
          <h2 className="font-display text-2xl font-bold text-tiki-gold mb-4">Voir tous les avis</h2>
          <p className="text-tiki-cream-dark mb-8">Retrouvez l&apos;intégralité de nos avis sur les plateformes officielles.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://www.tripadvisor.fr/Attraction_Review-g644387-d23475410-Reviews-Tiki_Boat-Le_Gosier_Grande_Terre_Island_Guadeloupe.html"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              Tripadvisor
              <ExternalLink size={16} />
            </a>
            <a
              href="https://www.google.com/search?q=tiki+boat+guadeloupe+avis"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              Google Reviews
              <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-tiki-dark-2 border-t border-tiki-gold/20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-2xl font-bold text-tiki-gold mb-3">Prêt à vivre l&apos;aventure ?</h2>
          <p className="text-tiki-cream-dark mb-6">Rejoignez nos centaines de clients satisfaits !</p>
          <Link href="/reservation" className="btn-primary">
            Réserver maintenant
            <ChevronRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
