import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import SiteImage from "@/components/SiteImage";
import { Clock, Users, MapPin, CheckCircle2, XCircle, ChevronRight, CalendarDays, Star } from "lucide-react";
import { excursions, getExcursionBySlug } from "@/data/excursions";
import { formatPrice } from "@/lib/utils";

const BASE = "https://tikiboat.fr";

interface Props {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateStaticParams() {
  return excursions.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const exc = getExcursionBySlug(slug);
  if (!exc) return {};
  const url = `${BASE}/excursions/${slug}`;
  return {
    title: `${exc.title} — Guadeloupe`,
    description: exc.description,
    alternates: { canonical: url },
    openGraph: { title: exc.title, description: exc.description, url, type: "website", images: [{ url: exc.images[0], width: 1200, height: 630 }] },
  };
}

export default async function ExcursionDetailPage({ params }: Props) {
  const { slug, locale } = await params;
  const excursion = getExcursionBySlug(slug);
  if (!excursion) notFound();

  const t = await getTranslations("excursionDetail");
  const isEn = locale === "en";

  // Contenu localisé
  const subtitle   = isEn ? (excursion.subtitleEn   ?? excursion.subtitle)   : excursion.subtitle;
  const description = isEn ? (excursion.descriptionEn ?? excursion.description) : excursion.description;
  const duration   = isEn ? (excursion.durationEn   ?? excursion.duration)   : excursion.duration;
  const highlights = isEn ? (excursion.highlightsEn ?? excursion.highlights) : excursion.highlights;
  const included   = isEn ? (excursion.includedEn   ?? excursion.included)   : excursion.included;
  const notIncluded = isEn ? (excursion.notIncludedEn ?? excursion.notIncluded) : excursion.notIncluded;

  const metaCards = [
    { icon: Clock,       label: t("duree"),       value: duration },
    { icon: CalendarDays,label: t("heureDepart"), value: excursion.departureTime },
    { icon: Users,       label: t("capacite"),    value: `Max ${excursion.maxPassengers}` },
    { icon: MapPin,      label: t("pointRdv"),    value: excursion.departurePoint.split("/")[0].trim() },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative pt-20">
        <div className="relative h-[60vh] min-h-[400px]">
          <SiteImage src={excursion.images[0]} alt={excursion.title} label={excursion.title}
            fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 pb-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              {excursion.badge && <div className="badge mb-3 inline-block">{excursion.badge}</div>}
              <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">{excursion.title}</h1>
              <p className="text-white/80 text-xl drop-shadow">{subtitle}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* Main */}
            <div className="lg:col-span-2 space-y-10">

              {/* Meta cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {metaCards.map((item) => (
                  <div key={item.label} className="card-dark text-center py-4">
                    <item.icon className="text-tiki-gold mx-auto mb-2" size={22} />
                    <div className="text-slate-500 text-xs mb-1">{item.label}</div>
                    <div className="text-slate-800 font-semibold text-sm">{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div>
                <h2 className="font-display text-2xl font-bold text-tiki-gold mb-4">{t("lexperience")}</h2>
                <p className="text-slate-800 leading-relaxed text-lg">{description}</p>
              </div>

              {/* Highlights */}
              <div>
                <h2 className="font-display text-2xl font-bold text-tiki-gold mb-4">{t("auProgramme")}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {highlights.map((h) => (
                    <div key={h} className="flex items-center gap-3 text-slate-800">
                      <CheckCircle2 className="text-tiki-gold shrink-0" size={18} />
                      {h}
                    </div>
                  ))}
                </div>
              </div>

              {/* Inclus / Non inclus */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg mb-4">{t("toutCompris")}</h3>
                  <ul className="space-y-2">
                    {included.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-slate-800 text-sm">
                        <CheckCircle2 className="text-green-400 shrink-0 mt-0.5" size={16} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg mb-4">{t("nonInclus")}</h3>
                  <ul className="space-y-2">
                    {notIncluded.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-slate-500 text-sm">
                        <XCircle className="text-tiki-red-light shrink-0 mt-0.5" size={16} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Vidéo */}
              {excursion.youtubeId && (
                <div>
                  <h2 className="font-display text-2xl font-bold text-tiki-gold mb-4">{t("voirVideo")}</h2>
                  <div className="relative aspect-video rounded-2xl overflow-hidden border border-tiki-gold/20">
                    <iframe src={`https://www.youtube.com/embed/${excursion.youtubeId}`}
                      title={excursion.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen className="absolute inset-0 w-full h-full" />
                  </div>
                </div>
              )}
            </div>

            {/* Sticky booking card */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 card-dark border-tiki-gold/40">
                {excursion.pricePrivate ? (
                  <>
                    <div className="text-center mb-6">
                      <div className="font-display text-3xl font-bold text-tiki-gold mb-1">{t("surDevis")}</div>
                      <p className="text-slate-500 text-sm">{t("aPartirDe")} {formatPrice(excursion.pricePrivate)}</p>
                    </div>
                    <div className="space-y-3 mb-6 text-sm text-slate-500">
                      <div className="flex justify-between">
                        <span>{t("duree")}</span><span className="text-slate-800">{duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t("capaciteLabel")}</span><span className="text-slate-800">Max {excursion.maxPassengers}</span>
                      </div>
                    </div>
                    <Link href="/contact?type=privatisation" className="btn-primary w-full justify-center">
                      {t("demanderDevis")} <ChevronRight size={16} />
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="mb-6 space-y-3">
                      <div>
                        <div className="text-xs font-semibold text-tiki-lagon uppercase tracking-wider mb-1">{t("basseSaison")}</div>
                        <div className="flex items-baseline gap-2 mb-0.5">
                          <span className="font-display text-3xl font-bold text-tiki-gold">{formatPrice(excursion.priceAdult)}</span>
                          <span className="text-slate-500 text-sm">/ {t("duree").toLowerCase() === "duration" ? "adult" : "adulte"}</span>
                        </div>
                        <div className="text-slate-500 text-sm">{t("enfant")} : {formatPrice(excursion.priceChild)}</div>
                      </div>
                      {excursion.priceAdultHighSeason && (
                        <div className="border-t border-slate-200 pt-3">
                          <div className="text-xs font-semibold text-tiki-gold uppercase tracking-wider mb-1">{t("hauteSaison")}</div>
                          <div className="flex items-baseline gap-2 mb-0.5">
                            <span className="font-display text-2xl font-bold text-tiki-gold">{formatPrice(excursion.priceAdultHighSeason)}</span>
                            <span className="text-slate-500 text-sm">/ {t("duree").toLowerCase() === "duration" ? "adult" : "adulte"}</span>
                          </div>
                          <div className="text-slate-500 text-sm">{t("enfant")} : {formatPrice(excursion.priceChildHighSeason!)}</div>
                        </div>
                      )}
                      <div className="text-slate-500 text-sm">{t("moinsDe2Ans")}</div>
                    </div>
                    <div className="space-y-3 mb-6 text-sm text-slate-500 border-t border-tiki-gold/20 pt-4">
                      <div className="flex justify-between">
                        <span>{t("duree")}</span><span className="text-slate-800">{duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t("depart")}</span><span className="text-slate-800">{excursion.departureTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t("retour")}</span><span className="text-slate-800">{excursion.returnTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t("capaciteLabel")}</span><span className="text-slate-800">Max {excursion.maxPassengers}</span>
                      </div>
                    </div>
                    <Link href={`/reservation?excursion=${excursion.slug}`} className="btn-primary w-full justify-center mb-3">
                      {t("reserver")} <ChevronRight size={16} />
                    </Link>
                  </>
                )}
                <div className="mt-6 pt-6 border-t border-tiki-gold/20">
                  <div className="flex items-center gap-2 justify-center">
                    {[...Array(5)].map((_, i) => <Star key={i} className="text-tiki-gold fill-tiki-gold" size={14} />)}
                    <span className="text-slate-800 text-sm font-bold ml-1">4.8/5</span>
                  </div>
                  <p className="text-center text-slate-500 text-xs mt-1">600+ avis</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Autres excursions */}
      <section className="py-16 bg-sky-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-slate-800 mb-8">{t("autresExcursions")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {excursions
              .filter((e) => e.slug !== excursion.slug)
              .slice(0, 2)
              .map((exc) => (
                <Link key={exc.id} href={`/excursions/${exc.slug}`} className="group card-dark overflow-hidden p-0">
                  <div className="relative h-48 overflow-hidden">
                    <SiteImage src={exc.images[0]} alt={exc.title} label={exc.title} fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <h3 className="font-display text-xl font-bold text-tiki-gold drop-shadow-lg">{exc.title}</h3>
                      <p className="text-white/90 text-sm drop-shadow">{exc.subtitle}</p>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </>
  );
}
