import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import SiteImage from "@/components/SiteImage";
import WaveDivider from "@/components/WaveDivider";
import { ChevronRight, Clock, Users, MapPin } from "lucide-react";
import { getExcursions } from "@/lib/excursions";
import { formatPrice } from "@/lib/utils";
import { getTranslations, getLocale } from "next-intl/server";

const BASE = "https://tikiboat.fr";

export const metadata: Metadata = {
  title: "Excursions en bateau en Guadeloupe — Croisières & Sorties mer",
  description:
    "Toutes nos excursions en bateau en Guadeloupe : croisière journée Grand Cul de Sac Marin (95 €), privatisation sur mesure. Snorkeling, repas créole, îlets. Réservez en ligne.",
  alternates: { canonical: `${BASE}/excursions` },
  openGraph: {
    title: "Excursions en bateau en Guadeloupe | Tiki Boat",
    description: "Croisière journée, privatisation. Snorkeling, îlets, repas créole. À partir de 95 €.",
    url: `${BASE}/excursions`,
    type: "website",
  },
};

export default async function ExcursionsPage() {
  const t = await getTranslations("excursionsPage");
  const locale = await getLocale();
  const excursions = await getExcursions();

  const locStr = (fr: string, en?: string) => locale === "en" && en ? en : fr;
  const locArr = (fr: string[], en?: string[]) => locale === "en" && en ? en : fr;

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

      <WaveDivider topColor="#f0f9ff" bottomColor="#ffffff" />

      {/* Excursions — 1 section sur 2 */}
      {excursions.map((exc, index) => (
        <div key={exc.id}>
          <section className={`py-20 ${index % 2 === 0 ? "bg-white" : "bg-sky-50"}`}>
            <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10">
              <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? "lg:grid-flow-dense" : ""}`}>
                {/* Image */}
                <div className={`relative h-60 sm:h-80 lg:h-[440px] rounded-2xl overflow-hidden border border-slate-200 ${index % 2 === 1 ? "lg:col-start-2" : ""}`}>
                  <SiteImage
                    src={exc.images[0]}
                    alt={exc.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover hover:scale-105 transition-transform duration-500"
                  />
                  {exc.popular && (
                    <div className="absolute top-4 left-4 bg-tiki-red text-white text-xs font-bold px-3 py-1 rounded-full">
                      {locStr(exc.badge ?? (locale === "en" ? "Best seller" : "Meilleure vente"), exc.badgeEn)}
                    </div>
                  )}
                  {!exc.popular && exc.badge && (
                    <div className="absolute top-4 left-4 bg-tiki-gold text-tiki-ocean text-xs font-bold px-3 py-1 rounded-full">
                      {locStr(exc.badge, exc.badgeEn)}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className={index % 2 === 1 ? "lg:col-start-1 lg:row-start-1" : ""}>
                  <div className="flex flex-wrap gap-3 mb-5">
                    <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                      <Clock size={14} className="text-tiki-gold" />
                      {locStr(exc.duration, exc.durationEn)}
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                      <Users size={14} className="text-tiki-gold" />
                      {locale === "en" ? `Max ${exc.maxPassengers} people` : `Max ${exc.maxPassengers} personnes`}
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                      <MapPin size={14} className="text-tiki-gold" />
                      {exc.departurePoint.split("/")[0].trim()}
                    </div>
                  </div>

                  <h2 className="font-display text-3xl sm:text-4xl font-black text-slate-800 mb-3 leading-tight">
                    {exc.title}
                  </h2>
                  <p className="text-tiki-gold text-sm font-medium mb-4">
                    {locStr(exc.subtitle, exc.subtitleEn)}
                  </p>
                  <p className="text-slate-500 mb-7 leading-relaxed">
                    {locStr(exc.description, exc.descriptionEn)}
                  </p>

                  {/* Highlights */}
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-8">
                    {locArr(exc.highlights, exc.highlightsEn).slice(0, 4).map((h) => (
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
                          <span className="text-tiki-gold font-black text-2xl">{t("surDevis")}</span>
                          <div className="text-slate-400 text-xs mt-0.5">{t("aPartirDe")} {formatPrice(exc.pricePrivate)}</div>
                        </div>
                      ) : (
                        <div>
                          <span className="text-tiki-gold font-black text-3xl">{formatPrice(exc.priceAdult)}</span>
                          <span className="text-slate-400 text-sm"> / {locale === "en" ? "adult" : "adulte"}</span>
                          <div className="text-tiki-lagon text-xs font-medium mt-0.5">{t("basseSaison")}</div>
                          <div className="text-slate-400 text-xs">{t("enfant")} : {formatPrice(exc.priceChild)}</div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <Link href={`/excursions/${exc.slug}`}
                        className="border border-slate-200 text-slate-600 hover:border-tiki-gold hover:text-tiki-gold text-sm font-medium px-5 py-3 rounded-full transition-colors min-h-[44px] flex items-center">
                        {t("details")}
                      </Link>
                      <Link
                        href={exc.pricePrivate ? "/contact?type=privatisation" : `/reservation?excursion=${exc.slug}`}
                        className="bg-tiki-gold hover:bg-tiki-gold-dark text-tiki-ocean text-sm font-bold px-6 py-3 rounded-full transition-colors inline-flex items-center gap-1.5 min-h-[44px]">
                        {exc.pricePrivate ? t("demanderDevis") : t("reserver")}
                        <ChevronRight size={15} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          {index < excursions.length - 1 && (
            <WaveDivider
              topColor={index % 2 === 0 ? "#ffffff" : "#f0f9ff"}
              bottomColor={index % 2 === 0 ? "#f0f9ff" : "#ffffff"}
              flip={index % 2 === 1}
            />
          )}
        </div>
      ))}

      <WaveDivider topColor={excursions.length % 2 === 0 ? "#f0f9ff" : "#ffffff"} bottomColor="#ffffff" />

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display font-black text-slate-800 text-2xl sm:text-3xl text-center mb-10">
            {t("faq.title")}
          </h2>
          <div className="space-y-3">
            {(t.raw("faq.items") as { q: string; a: string }[]).map((item) => (
              <details key={item.q} className="group border border-slate-200 rounded-xl bg-white p-5 shadow-sm">
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
