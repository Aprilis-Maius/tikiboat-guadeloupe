import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import SiteImage from "@/components/SiteImage";
import { Star, ChevronRight, Anchor, Fish, Utensils, Users, Shield, CheckCircle2, Waves } from "lucide-react";
import WaveDivider from "@/components/WaveDivider";
import { getExcursions } from "@/lib/excursions";
import { reviews } from "@/data/reviews";
import { formatPrice } from "@/lib/utils";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("home");
  const excursions = await getExcursions();
  const locStr = (fr: string, en?: string) => locale === "en" && en ? en : fr;
  const topReviews = reviews.slice(0, 3);

  const FEATURES = [
    { icon: Shield,   key: "securite" },
    { icon: Users,    key: "comite" },
    { icon: Fish,     key: "snorkeling" },
    { icon: Anchor,   key: "adapte" },
    { icon: Utensils, key: "repas" },
    { icon: Waves,    key: "bar" },
  ] as const;

  const INCLUS_ITEMS = t.raw("inclus.items") as string[];
  const LAGON_ITEMS  = t.raw("lagon.items")  as string[];

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-screen flex flex-col">
        <SiteImage
          src="/photos/grandculdesacmarin-excursion.png"
          alt="Excursion en bateau Tiki Boat — Grand Cul de Sac Marin, Guadeloupe"
          fill className="object-cover object-center" priority sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />

        <div className="relative flex-1 flex items-center max-w-7xl mx-auto w-full px-6 sm:px-10 lg:px-16 pt-20">
          <div className="w-full flex items-center justify-between gap-12">

            {/* Texte */}
            <div className="max-w-xl">
              <h1 className="font-display font-black text-white leading-[1.08] mb-6"
                  style={{ fontSize: "clamp(2rem, 3.8vw, 3.6rem)", textShadow: "0 2px 24px rgba(0,0,0,0.7)" }}>
                {t("hero.title1")}<span className="text-tiki-gold">{t("hero.titleHighlight")}</span>{t("hero.title2")}
              </h1>
              <p className="text-white/90 text-base leading-relaxed mb-10 max-w-md"
                 style={{ textShadow: "0 1px 12px rgba(0,0,0,0.8)" }}>
                {t("hero.subtitle")}
              </p>
              <Link href="/reservation"
                className="inline-flex items-center gap-2 bg-tiki-gold hover:bg-tiki-gold-dark text-tiki-ocean font-bold py-4 px-9 rounded-full transition-all hover:scale-105 text-sm shadow-lg shadow-black/30">
                {t("hero.cta")} <ChevronRight size={16} />
              </Link>
            </div>

            {/* Mini-cartes excursions desktop */}
            <div className="hidden lg:flex flex-col gap-2.5 w-80 xl:w-96 shrink-0">
              <p className="text-white/70 text-xs uppercase tracking-[0.2em] mb-1">{t("excursions.badge")}</p>
              {excursions.map((exc) => (
                <Link key={exc.id} href={`/excursions/${exc.slug}`}
                  className="flex items-center justify-between px-4 py-3.5 rounded-xl bg-white/10 hover:bg-white/18 backdrop-blur-md border border-slate-200 hover:border-tiki-gold/50 transition-all group">
                  <div>
                    <div className="text-white font-bold text-sm group-hover:text-tiki-gold transition-colors">{exc.title}</div>
                    <div className="text-slate-400 text-xs mt-0.5">{locStr(exc.duration, exc.durationEn)}</div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <div className="text-tiki-gold font-black text-base">
                      {exc.pricePrivate ? t("excursions.surDevis") : formatPrice(exc.priceAdult)}
                    </div>
                    {!exc.pricePrivate && <div className="text-slate-400 text-xs">{t("hero.perAdult")}</div>}
                  </div>
                </Link>
              ))}
            </div>

          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg viewBox="0 0 1440 70" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"
            className="block w-full" style={{ height: "clamp(40px, 5vw, 70px)" }}>
            <path d="M0,35 C240,70 480,0 720,35 C960,70 1200,0 1440,35 L1440,70 L0,70 Z" fill="#ffffff" />
          </svg>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-white py-16 overflow-hidden">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative hidden lg:block h-[480px]">
              <div className="absolute top-0 left-0 w-[75%] aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border border-slate-200">
                <SiteImage src="/photos/grandculdesacmarin-excursion.png" alt="Excursion Tiki Boat"
                  label="Excursion lagon" fill className="object-cover" />
              </div>
              <div className="absolute bottom-0 right-0 w-[60%] aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border border-slate-200">
                <SiteImage src="/photos/lagon.jpg" alt="Grand Cul de Sac Marin"
                  label="Lagon Guadeloupe" fill className="object-cover" />
              </div>
            </div>
            <div>
              <p className="text-tiki-gold text-xs font-bold tracking-[0.2em] uppercase mb-3">{t("features.badge")}</p>
              <h2 className="font-display font-black text-slate-800 text-3xl sm:text-4xl mb-4 leading-tight">
                {t("features.title")}
              </h2>
              <p className="text-slate-500 text-base leading-relaxed mb-8">{t("features.subtitle")}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {FEATURES.map(({ icon: Icon, key }) => (
                  <div key={key} className="flex flex-col items-center text-center gap-2.5 p-4 rounded-2xl bg-white/5 hover:bg-white/8 border border-slate-200 hover:border-tiki-gold/30 transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-tiki-gold/15 flex items-center justify-center group-hover:bg-tiki-gold/25 transition-colors">
                      <Icon size={18} className="text-tiki-gold" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-xs mb-0.5 leading-tight">{t(`features.items.${key}.label`)}</div>
                      <div className="text-slate-400 text-xs leading-relaxed hidden sm:block">{t(`features.items.${key}.desc`)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <WaveDivider topColor="#ffffff" bottomColor="#f0f9ff" />

      {/* EXCURSIONS */}
      <section className="bg-sky-50 py-16">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-14">
            <p className="text-tiki-lagon text-xs font-bold tracking-[0.2em] uppercase mb-3">{t("excursions.badge")}</p>
            <h2 className="font-display font-black text-slate-800 text-3xl sm:text-4xl">{t("excursions.title")}</h2>
          </div>
          <div className={
            excursions.length === 1 ? "max-w-md mx-auto" :
            excursions.length === 2 ? "grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto" :
            excursions.length === 4 ? "grid grid-cols-1 md:grid-cols-2 gap-6" :
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          }>
            {excursions.map((exc) => (
              <div key={exc.id} className="relative bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-tiki-gold/30 hover:shadow-xl hover:shadow-black/30 transition-all duration-300 hover:-translate-y-1 group flex flex-col">
                <Link href={`/excursions/${exc.slug}`} className="absolute inset-0 z-0" aria-label={exc.title} />
                <div className="relative h-52 overflow-hidden">
                  <SiteImage src={exc.images[0]} alt={exc.title} fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  {exc.popular && (
                    <div className="absolute top-3 left-3 bg-tiki-red text-white text-xs font-bold px-3 py-1 rounded-full">
                      {t("tarifs.meilleureVente")}
                    </div>
                  )}
                  {exc.badge && !exc.popular && (
                    <div className="absolute top-3 left-3 bg-tiki-gold/90 text-tiki-ocean text-xs font-bold px-3 py-1 rounded-full">
                      {locStr(exc.badge, exc.badgeEn)}
                    </div>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-display font-black text-slate-800 text-lg leading-tight mb-1">{exc.title}</h3>
                  <p className="text-slate-500 text-xs mb-2">{locStr(exc.duration, exc.durationEn)}</p>
                  <p className="text-slate-500 text-sm leading-relaxed mb-5 flex-1 line-clamp-2">{locStr(exc.description, exc.descriptionEn)}</p>
                  <div className="relative z-10 flex items-center justify-between pt-4 border-t border-slate-200">
                    <div>
                      {exc.pricePrivate ? (
                        <span className="text-tiki-gold font-black text-lg">{t("excursions.surDevis")}</span>
                      ) : (
                        <div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-tiki-gold font-black text-2xl">{formatPrice(exc.priceAdult)}</span>
                            <span className="text-slate-400 text-xs">{t("excursions.perAdult")}</span>
                          </div>
                          <div className="text-slate-400 text-xs mt-0.5">{t("excursions.basseSaison")}</div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/excursions/${exc.slug}`}
                        className="border border-slate-200 text-slate-600 hover:border-tiki-gold hover:text-slate-800 text-sm font-medium px-4 py-3 rounded-full transition-colors min-h-[44px] flex items-center">
                        {t("excursions.details")}
                      </Link>
                      <Link href={exc.pricePrivate ? "/contact?type=privatisation" : `/reservation?excursion=${exc.slug}`}
                        className="bg-tiki-gold hover:bg-tiki-gold-dark text-tiki-ocean text-sm font-bold px-4 py-3 rounded-full transition-colors min-h-[44px] flex items-center">
                        {exc.pricePrivate ? t("excursions.devis") : t("excursions.reserver")}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WaveDivider topColor="#f0f9ff" bottomColor="#ffffff" flip />

      {/* INCLUS */}
      <section className="bg-white py-16">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <p className="text-tiki-lagon text-xs font-bold tracking-[0.2em] uppercase mb-3">{t("inclus.badge")}</p>
          <h2 className="font-display font-black text-slate-800 text-3xl sm:text-4xl mb-6 leading-tight">
            {t("inclus.title")}
          </h2>
          <p className="text-slate-500 text-base leading-relaxed mb-10">{t("inclus.subtitle")}</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left mb-10">
            {INCLUS_ITEMS.map((item) => (
              <li key={item} className="flex items-center gap-3 text-slate-700 text-sm">
                <CheckCircle2 size={16} className="text-tiki-gold shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-center gap-4">
            <a href="https://www.instagram.com/tikiboatguadeloupe/" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-200 text-slate-600 hover:border-tiki-gold hover:text-tiki-gold transition-all text-sm font-medium">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              Instagram
            </a>
            <a href="https://www.tripadvisor.fr/Attraction_Review-g147374-d25868775-Reviews-Tiki_Boat_Guadeloupe-Guadeloupe.html" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-200 text-slate-600 hover:border-tiki-gold hover:text-tiki-gold transition-all text-sm font-medium">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 0a12 12 0 100 24A12 12 0 0012 0zm0 2.182a9.818 9.818 0 110 19.636A9.818 9.818 0 0112 2.182zm-5.018 5.454a3.273 3.273 0 100 6.546 3.273 3.273 0 000-6.546zm10.036 0a3.273 3.273 0 100 6.546 3.273 3.273 0 000-6.546zM6.982 9a1.636 1.636 0 110 3.273A1.636 1.636 0 016.982 9zm10.036 0a1.636 1.636 0 110 3.273 1.636 1.636 0 010-3.273zM12 14.727c-1.527 0-2.945.48-4.1 1.295a6.545 6.545 0 008.2 0A6.872 6.872 0 0012 14.727z"/></svg>
              Tripadvisor
            </a>
          </div>
        </div>
      </section>

      <WaveDivider topColor="#ffffff" bottomColor="#f0f9ff" />

      {/* LAGON */}
      <section className="bg-sky-50 py-16">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-72 lg:h-[420px] rounded-2xl overflow-hidden order-2 lg:order-1 border border-slate-200">
              <SiteImage src="/photos/lagon.jpg" alt="Vue aérienne du Grand Cul de Sac Marin"
                label="Grand Cul de Sac Marin" fill className="object-cover" />
            </div>
            <div className="order-1 lg:order-2">
              <p className="text-tiki-gold text-xs font-bold tracking-[0.2em] uppercase mb-3">{t("lagon.badge")}</p>
              <h2 className="font-display font-black text-slate-800 text-3xl sm:text-4xl mb-6 leading-tight">
                {t("lagon.title")}
              </h2>
              <p className="text-slate-500 text-base leading-relaxed mb-8">{t("lagon.subtitle")}</p>
              <ul className="space-y-3">
                {LAGON_ITEMS.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-slate-600 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-tiki-gold shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <WaveDivider topColor="#f0f9ff" bottomColor="#ffffff" flip />

      {/* AVIS */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-14">
            <p className="text-tiki-lagon text-xs font-bold tracking-[0.2em] uppercase mb-3">{t("avis.badge")}</p>
            <h2 className="font-display font-black text-slate-800 text-3xl sm:text-4xl mb-4">{t("avis.title")}</h2>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => <Star key={i} size={18} className="text-tiki-gold fill-tiki-gold" />)}
              <span className="ml-2 font-bold text-slate-800">4.9</span>
              <span className="text-slate-400 text-sm ml-1">{t("avis.rating")}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {topReviews.map((review) => (
              <div key={review.id} className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-tiki-gold/30 transition-all">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => <Star key={i} size={13} className="text-tiki-gold fill-tiki-gold" />)}
                  <span className="ml-auto text-xs text-slate-400 capitalize">{review.platform}</span>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed italic mb-5">&ldquo;{review.comment}&rdquo;</p>
                <div className="pt-4 border-t border-slate-200">
                  <div className="font-semibold text-tiki-gold text-sm">{review.author}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-4 justify-center mt-10">
            <a href="https://www.tripadvisor.fr/Attraction_Review-g644387-d23475410-Reviews-Tiki_Boat-Le_Gosier_Grande_Terre_Island_Guadeloupe.html"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-slate-200 text-slate-600 hover:border-tiki-gold hover:text-tiki-gold text-sm font-medium px-5 py-2.5 rounded-full transition-colors">
              {t("avis.tripadvisor")}
            </a>
            <a href="https://www.google.com/search?q=tiki+boat+guadeloupe+avis"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-slate-200 text-slate-600 hover:border-tiki-gold hover:text-tiki-gold text-sm font-medium px-5 py-2.5 rounded-full transition-colors">
              {t("avis.google")}
            </a>
          </div>
        </div>
      </section>

      <WaveDivider topColor="#ffffff" bottomColor="#f0f9ff" />

      {/* TARIFS */}
      <section className="bg-sky-50 py-16">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-14">
            <p className="text-tiki-lagon text-xs font-bold tracking-[0.2em] uppercase mb-3">{t("tarifs.badge")}</p>
            <h2 className="font-display font-black text-slate-800 text-3xl sm:text-4xl mb-4">{t("tarifs.title")}</h2>
            <p className="text-slate-400 max-w-md mx-auto text-sm">{t("tarifs.subtitle")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="border-2 border-tiki-gold/50 rounded-2xl p-7 relative bg-white">
              <div className="absolute -top-3 left-6 bg-tiki-red text-white text-xs font-bold px-3 py-1 rounded-full">
                {t("tarifs.meilleureVente")}
              </div>
              <h3 className="font-display font-black text-slate-800 text-xl mb-1">{t("tarifs.croisiereTitle")}</h3>
              <p className="text-slate-400 text-xs mb-6">{t("tarifs.croisiereHoraires")}</p>
              <div className="space-y-3 mb-7">
                {[
                  [t("tarifs.adulte"), "95 €"],
                  [t("tarifs.enfant"), "55 €"],
                  [t("tarifs.moinsDe3Ans"), t("tarifs.gratuit")],
                ].map(([l, p]) => (
                  <div key={l} className="flex justify-between text-sm border-b border-slate-200 pb-3 last:border-0 last:pb-0">
                    <span className="text-slate-500">{l}</span>
                    <span className="font-bold text-tiki-gold">{p}</span>
                  </div>
                ))}
              </div>
              <Link href="/reservation?excursion=grand-cul-de-sac-marin"
                className="flex items-center justify-center gap-2 w-full bg-tiki-gold hover:bg-tiki-gold-dark text-tiki-ocean font-bold py-3.5 rounded-xl transition-colors text-sm">
                {t("tarifs.reserver")} <ChevronRight size={16} />
              </Link>
            </div>
            <div className="border border-slate-200 rounded-2xl p-7 bg-white">
              <h3 className="font-display font-black text-slate-800 text-xl mb-1">{t("tarifs.privatisationTitle")}</h3>
              <p className="text-slate-400 text-xs mb-6">{t("tarifs.privatisationSubtitle")}</p>
              <div className="space-y-3 mb-7">
                {[[t("tarifs.journeePrivee"), "dès 800 €"]].map(([l, p]) => (
                  <div key={l} className="flex justify-between text-sm border-b border-slate-200 pb-3 last:border-0 last:pb-0">
                    <span className="text-slate-500">{l}</span>
                    <span className="font-bold text-tiki-gold">{p}</span>
                  </div>
                ))}
              </div>
              <Link href="/contact?type=privatisation"
                className="flex items-center justify-center gap-2 w-full border border-tiki-gold/50 text-tiki-gold hover:bg-tiki-gold/10 font-bold py-3.5 rounded-xl transition-colors text-sm">
                {t("tarifs.demanderDevis")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <WaveDivider topColor="#f0f9ff" bottomColor="#ffffff" flip />

      {/* CTA */}
      <section className="bg-white py-16">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="font-display font-black text-slate-800 text-3xl sm:text-4xl mb-4">{t("cta.title")}</h2>
          <p className="text-slate-500 text-base mb-10">{t("cta.subtitle")}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/reservation"
              className="inline-flex items-center justify-center gap-2 bg-tiki-gold hover:bg-tiki-gold-dark text-tiki-ocean font-bold py-4 px-10 rounded-full transition-all text-base hover:scale-105">
              {t("cta.reserver")} <ChevronRight size={18} />
            </Link>
            <a href="https://wa.me/590690495848" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border border-slate-300 text-slate-700 hover:text-slate-800 hover:border-tiki-gold font-medium py-4 px-8 rounded-full transition-all text-sm">
              {t("cta.whatsapp")}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
