import type { Metadata } from "next";
import Link from "next/link";
import SiteImage from "@/components/SiteImage";
import { ChevronRight, Clock, Users, MapPin } from "lucide-react";
import { excursions } from "@/data/excursions";
import { formatPrice } from "@/lib/utils";

const BASE = "https://tiki-boat.com";

export const metadata: Metadata = {
  title: "Excursions en bateau en Guadeloupe — Croisières & Sorties mer",
  description:
    "Toutes nos excursions en bateau en Guadeloupe : croisière journée Grand Cul de Sac Marin (95 €), coucher de soleil (55 €), privatisation sur mesure. Snorkeling, repas créole, îlets. Réservez en ligne.",
  alternates: { canonical: `${BASE}/excursions` },
  openGraph: {
    title: "Excursions en bateau en Guadeloupe | Tiki Boat",
    description:
      "Croisière journée, coucher de soleil, privatisation. Snorkeling, îlets, repas créole. À partir de 55 €.",
    url: `${BASE}/excursions`,
    type: "website",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: BASE },
        { "@type": "ListItem", position: 2, name: "Excursions", item: `${BASE}/excursions` },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Le repas est-il inclus dans le tarif ?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Oui ! La croisière journée inclut un apéritif créole et un repas complet préparé par notre chef avec 100% de produits frais.",
          },
        },
        {
          "@type": "Question",
          name: "Les excursions en bateau en Guadeloupe sont-elles adaptées aux enfants et aux personnes âgées ?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Absolument. Tiki Boat est conçu pour tous les âges, des bébés aux séniors. Le bateau est stable et sécurisé. Les moins de 3 ans embarquent gratuitement.",
          },
        },
        {
          "@type": "Question",
          name: "Que se passe-t-il en cas de mauvais temps ?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "En cas de conditions météo défavorables, la sortie est reportée ou remboursée intégralement. Votre sécurité prime.",
          },
        },
        {
          "@type": "Question",
          name: "Comment réserver une excursion en bateau en Guadeloupe avec Tiki Boat ?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Réservez en ligne sur ce site (paiement sécurisé), par WhatsApp au +590 690 49 58 48, ou par téléphone. Un acompte de 30% est demandé, annulation gratuite.",
          },
        },
        {
          "@type": "Question",
          name: "Quel est le prix d'une excursion en bateau en Guadeloupe ?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "La croisière journée Grand Cul de Sac Marin est à 95 € par adulte et 55 € par enfant. La croisière coucher de soleil est à 55 € par adulte. La privatisation du bateau est disponible à partir de 800 €.",
          },
        },
        {
          "@type": "Question",
          name: "Où partent les excursions Tiki Boat en Guadeloupe ?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Les excursions partent de la Marina de Pointe-à-Pitre ou du Gosier, en Guadeloupe.",
          },
        },
      ],
    },
  ],
};

export default function ExcursionsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {/* Header */}
      <section className="pt-32 pb-16 bg-tiki-ocean relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-tiki-red/10 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="section-title mb-4">Nos excursions</h1>
          <p className="section-subtitle max-w-2xl mx-auto">
            Croisières, snorkeling, coucher de soleil, privatisation — choisissez l&apos;aventure qui vous correspond.
          </p>
        </div>
      </section>

      {/* Excursions — 1 section sur 2 */}
      {excursions.map((exc, index) => (
        <section
          key={exc.id}
          className={`py-20 ${index % 2 === 0 ? "bg-tiki-ocean-mid" : "bg-tiki-ocean"}`}
        >
          <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10">
            <div
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                index % 2 === 1 ? "lg:grid-flow-dense" : ""
              }`}
            >
              {/* Image */}
              <div
                className={`relative h-60 sm:h-80 lg:h-[440px] rounded-2xl overflow-hidden border border-slate-200 ${
                  index % 2 === 1 ? "lg:col-start-2" : ""
                }`}
              >
                <SiteImage
                  src={exc.images[0]}
                  alt={exc.title}
                  label={exc.title}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
                {exc.popular && (
                  <div className="absolute top-4 left-4 bg-tiki-red text-white text-xs font-bold px-3 py-1 rounded-full">
                    Meilleure vente
                  </div>
                )}
              </div>

              {/* Content */}
              <div className={index % 2 === 1 ? "lg:col-start-1 lg:row-start-1" : ""}>
                <div className="flex flex-wrap gap-3 mb-5">
                  <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                    <Clock size={14} className="text-tiki-gold" />
                    {exc.duration}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                    <Users size={14} className="text-tiki-gold" />
                    Max {exc.maxPassengers} personnes
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                    <MapPin size={14} className="text-tiki-gold" />
                    {exc.departurePoint.split("/")[0].trim()}
                  </div>
                </div>

                <h2 className="font-display text-3xl sm:text-4xl font-black text-slate-800 mb-3 leading-tight">
                  {exc.title}
                </h2>
                <p className="text-tiki-gold text-sm font-medium mb-4">{exc.subtitle}</p>
                <p className="text-slate-500 mb-7 leading-relaxed">{exc.description}</p>

                {/* Highlights */}
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-8">
                  {exc.highlights.slice(0, 4).map((h) => (
                    <li key={h} className="flex items-center gap-2.5 text-sm text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-tiki-gold shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>

                {/* Prix + CTA */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center pt-6 border-t border-slate-200">
                  <div>
                    {exc.pricePrivate ? (
                      <div>
                        <span className="text-tiki-gold font-black text-2xl">Sur devis</span>
                        <div className="text-slate-400 text-xs mt-0.5">à partir de {formatPrice(exc.pricePrivate)}</div>
                      </div>
                    ) : (
                      <div>
                        <span className="text-tiki-gold font-black text-3xl">{formatPrice(exc.priceAdult)}</span>
                        <span className="text-slate-400 text-sm"> / adulte</span>
                        <div className="text-slate-400 text-xs mt-0.5">Enfant : {formatPrice(exc.priceChild)}</div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Link href={`/excursions/${exc.slug}`}
                      className="border border-white/20 text-slate-600 hover:border-tiki-gold hover:text-tiki-gold text-sm font-medium px-5 py-3 rounded-full transition-colors min-h-[44px] flex items-center">
                      Détails
                    </Link>
                    <Link
                      href={exc.pricePrivate ? "/contact?type=privatisation" : `/reservation?excursion=${exc.slug}`}
                      className="bg-tiki-gold hover:bg-tiki-gold-dark text-tiki-ocean text-sm font-bold px-6 py-3 rounded-full transition-colors inline-flex items-center gap-1.5 min-h-[44px]"
                    >
                      {exc.pricePrivate ? "Demander un devis" : "Réserver"}
                      <ChevronRight size={15} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* FAQ */}
      <section className="py-16 bg-tiki-ocean-mid">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display font-black text-slate-800 text-2xl sm:text-3xl text-center mb-10">
            Questions fréquentes
          </h2>
          <div className="space-y-3">
            {[
              {
                q: "Le repas est-il inclus dans le tarif ?",
                a: "Oui ! La croisière journée inclut un apéritif créole et un repas complet préparé par notre chef avec 100% de produits frais.",
              },
              {
                q: "C'est adapté aux enfants et aux personnes âgées ?",
                a: "Absolument. Tiki Boat est conçu pour tous les âges, des bébés aux séniors. Le bateau est stable et sécurisé.",
              },
              {
                q: "Que se passe-t-il en cas de mauvais temps ?",
                a: "En cas de conditions météo défavorables, la sortie est reportée ou remboursée intégralement. Votre sécurité prime.",
              },
              {
                q: "Comment puis-je réserver ?",
                a: "En ligne sur ce site (paiement sécurisé), par WhatsApp au +590 690 49 58 48, ou par téléphone.",
              },
            ].map((item) => (
              <details key={item.q} className="group border border-slate-200 rounded-xl bg-tiki-ocean p-5">
                <summary className="font-semibold text-slate-800 cursor-pointer flex justify-between items-center text-sm">
                  {item.q}
                  <ChevronRight size={16} className="text-tiki-gold group-open:rotate-90 transition-transform shrink-0 ml-3" />
                </summary>
                <p className="text-slate-500 mt-3 text-sm leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
