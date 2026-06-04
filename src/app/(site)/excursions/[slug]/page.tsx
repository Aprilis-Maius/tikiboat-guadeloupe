import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import SiteImage from "@/components/SiteImage";
import { Clock, Users, MapPin, CheckCircle2, XCircle, ChevronRight, CalendarDays, Star } from "lucide-react";
import { excursions, getExcursionBySlug } from "@/data/excursions";
import { formatPrice } from "@/lib/utils";

const BASE = "https://tiki-boat.com";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return excursions.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const exc = getExcursionBySlug(slug);
  if (!exc) return {};

  const price = exc.pricePrivate
    ? `À partir de ${exc.pricePrivate} €`
    : `À partir de ${exc.priceAdult} € / adulte`;

  const title = `${exc.title} en Guadeloupe`;
  const description = `${exc.description} ${price}. Départ ${exc.departureTime}, durée : ${exc.duration}. Note 4,9/5 · Réservation en ligne.`;
  const url = `${BASE}/excursions/${slug}`;
  const ogImage = exc.images[0];

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: "Tiki Boat",
      locale: "fr_FR",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${exc.title} — Tiki Boat Guadeloupe`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

function buildJsonLd(exc: NonNullable<ReturnType<typeof getExcursionBySlug>>) {
  const url = `${BASE}/excursions/${exc.slug}`;

  const offers = exc.pricePrivate
    ? {
        "@type": "Offer",
        price: exc.pricePrivate,
        priceCurrency: "EUR",
        description: "Privatisation — tarif sur devis",
        availability: "https://schema.org/InStock",
        url: `${BASE}/contact?type=privatisation`,
      }
    : [
        {
          "@type": "Offer",
          name: "Adulte",
          price: exc.priceAdult,
          priceCurrency: "EUR",
          availability: "https://schema.org/InStock",
          url: `${BASE}/reservation?excursion=${exc.slug}`,
        },
        {
          "@type": "Offer",
          name: "Enfant (3–12 ans)",
          price: exc.priceChild,
          priceCurrency: "EUR",
          availability: "https://schema.org/InStock",
          url: `${BASE}/reservation?excursion=${exc.slug}`,
        },
      ];

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: BASE },
          { "@type": "ListItem", position: 2, name: "Excursions", item: `${BASE}/excursions` },
          { "@type": "ListItem", position: 3, name: exc.title, item: url },
        ],
      },
      {
        "@type": "TouristTrip",
        "@id": `${url}#trip`,
        name: `${exc.title} — Guadeloupe`,
        description: exc.description,
        url,
        image: exc.images,
        provider: { "@id": `${BASE}/#business` },
        touristType: [
          { "@type": "Audience", audienceType: "Famille" },
          { "@type": "Audience", audienceType: "Couple" },
          { "@type": "Audience", audienceType: "Groupe" },
        ],
        itinerary: {
          "@type": "ItemList",
          itemListElement: exc.highlights.map((h, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: h,
          })),
        },
        offers,
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          reviewCount: "100",
          bestRating: "5",
          worstRating: "1",
        },
      },
    ],
  };
}

export default async function ExcursionDetailPage({ params }: Props) {
  const { slug } = await params;
  const excursion = getExcursionBySlug(slug);
  if (!excursion) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(excursion)) }}
      />
      {/* Hero */}
      <section className="relative pt-20">
        <div className="relative h-[60vh] min-h-[400px]">
          <SiteImage
            src={excursion.images[0]}
            alt={excursion.title}
            label={excursion.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 pb-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              {excursion.badge && <div className="badge mb-3 inline-block">{excursion.badge}</div>}
              <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">{excursion.title}</h1>
              <p className="text-white/80 text-xl drop-shadow">{excursion.subtitle}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-tiki-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-10">
              {/* Meta infos */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: Clock, label: "Durée", value: excursion.duration },
                  { icon: CalendarDays, label: "Départ", value: excursion.departureTime },
                  { icon: Users, label: "Capacité", value: `Max ${excursion.maxPassengers}` },
                  { icon: MapPin, label: "Départ", value: excursion.departurePoint.split("/")[0].trim() },
                ].map((item) => (
                  <div key={item.label} className="card-dark text-center py-4">
                    <item.icon className="text-tiki-gold mx-auto mb-2" size={22} />
                    <div className="text-tiki-cream-dark text-xs mb-1">{item.label}</div>
                    <div className="text-tiki-cream font-semibold text-sm">{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div>
                <h2 className="font-display text-2xl font-bold text-tiki-gold mb-4">L&apos;expérience</h2>
                <p className="text-tiki-cream leading-relaxed text-lg">{excursion.description}</p>
              </div>

              {/* Points forts */}
              <div>
                <h2 className="font-display text-2xl font-bold text-tiki-gold mb-4">Au programme</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {excursion.highlights.map((h) => (
                    <div key={h} className="flex items-center gap-3 text-tiki-cream">
                      <CheckCircle2 className="text-tiki-gold shrink-0" size={18} />
                      {h}
                    </div>
                  ))}
                </div>
              </div>

              {/* Inclus / Non inclus */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-tiki-cream text-lg mb-4">Inclus dans le tarif</h3>
                  <ul className="space-y-2">
                    {excursion.included.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-tiki-cream text-sm">
                        <CheckCircle2 className="text-green-400 shrink-0 mt-0.5" size={16} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-tiki-cream text-lg mb-4">Non inclus</h3>
                  <ul className="space-y-2">
                    {excursion.notIncluded.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-tiki-cream-dark text-sm">
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
                  <h2 className="font-display text-2xl font-bold text-tiki-gold mb-4">Voir la vidéo</h2>
                  <div className="relative aspect-video rounded-2xl overflow-hidden border border-tiki-gold/20">
                    <iframe
                      src={`https://www.youtube.com/embed/${excursion.youtubeId}`}
                      title={excursion.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
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
                      <div className="font-display text-3xl font-bold text-tiki-gold mb-1">Sur devis</div>
                      <p className="text-tiki-cream-dark text-sm">à partir de {formatPrice(excursion.pricePrivate)}</p>
                    </div>
                    <div className="space-y-3 mb-6 text-sm text-tiki-cream-dark">
                      <div className="flex justify-between">
                        <span>Durée</span><span className="text-tiki-cream">{excursion.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Capacité</span><span className="text-tiki-cream">Max {excursion.maxPassengers} pers.</span>
                      </div>
                    </div>
                    <Link href="/contact?type=privatisation" className="btn-primary w-full justify-center">
                      Demander un devis
                      <ChevronRight size={16} />
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="mb-6">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-display text-3xl font-bold text-tiki-gold">{formatPrice(excursion.priceAdult)}</span>
                        <span className="text-tiki-cream-dark text-sm">/ adulte</span>
                      </div>
                      <div className="text-tiki-cream-dark text-sm">Enfant (3–12 ans) : {formatPrice(excursion.priceChild)}</div>
                      <div className="text-tiki-cream-dark text-sm">Moins de 3 ans : Gratuit</div>
                    </div>
                    <div className="space-y-3 mb-6 text-sm text-tiki-cream-dark border-t border-tiki-gold/20 pt-4">
                      <div className="flex justify-between">
                        <span>Durée</span><span className="text-tiki-cream">{excursion.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Départ</span><span className="text-tiki-cream">{excursion.departureTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Retour</span><span className="text-tiki-cream">{excursion.returnTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Capacité</span><span className="text-tiki-cream">Max {excursion.maxPassengers} pers.</span>
                      </div>
                    </div>
                    <Link href={`/reservation?excursion=${excursion.slug}`} className="btn-primary w-full justify-center mb-3">
                      Réserver maintenant
                      <ChevronRight size={16} />
                    </Link>
                    <div className="flex items-center gap-2 justify-center text-xs text-tiki-cream-dark">
                      <CheckCircle2 size={14} className="text-tiki-gold" />
                      Acompte de 30% — annulation gratuite
                    </div>
                  </>
                )}

                {/* Reviews mini */}
                <div className="mt-6 pt-6 border-t border-tiki-gold/20">
                  <div className="flex items-center gap-2 justify-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="text-tiki-gold fill-tiki-gold" size={14} />
                    ))}
                    <span className="text-tiki-cream text-sm font-bold ml-1">4.9/5</span>
                  </div>
                  <p className="text-center text-tiki-cream-dark text-xs mt-1">100+ avis vérifiés</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Other excursions */}
      <section className="py-16 bg-tiki-dark-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title mb-8">Autres excursions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {excursions
              .filter((e) => e.slug !== excursion.slug)
              .slice(0, 2)
              .map((exc) => (
                <Link key={exc.id} href={`/excursions/${exc.slug}`} className="group card-dark overflow-hidden p-0">
                  <div className="relative h-48 overflow-hidden">
                    <SiteImage src={exc.images[0]} alt={exc.title} label={exc.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-tiki-dark/80 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <h3 className="font-display text-xl font-bold text-tiki-gold">{exc.title}</h3>
                      <p className="text-tiki-cream-dark text-sm">{exc.subtitle}</p>
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
