import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

const BASE = "https://tikiboat.fr";

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: "Tiki Boat — Excursions en bateau en Guadeloupe",
    template: "%s | Tiki Boat Guadeloupe",
  },
  icons: { icon: "/favicon.png", shortcut: "/favicon.png", apple: "/favicon.png" },
  alternates: {
    canonical: BASE,
    languages: { "fr": BASE, "en": `${BASE}/en` },
  },
  twitter: { site: "@tikiboatguadeloupe" },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "TouristInformationCenter"],
  "@id": `${BASE}/#business`,
  name: "Tiki Boat",
  url: BASE,
  telephone: "+590690495848",
  email: "tikiboatguadeloupe@gmail.com",
  image: [`${BASE}/logo.png`, `${BASE}/photos/grandculdesacmarin-excursion.png`],
  logo: `${BASE}/logo.png`,
  priceRange: "€€",
  currenciesAccepted: "EUR",
  paymentAccepted: "Cash, Credit Card",
  description: "Excursions en bateau en Guadeloupe dans le Grand Cul de Sac Marin. Snorkeling, repas créole, îlets. Privatisation sur mesure.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Marina de Pointe-à-Pitre",
    addressLocality: "Pointe-à-Pitre",
    addressRegion: "Guadeloupe",
    postalCode: "97110",
    addressCountry: "GP",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "16.2352",
    longitude: "-61.5332",
  },
  sameAs: [
    "https://www.instagram.com/tikiboatguadeloupe/",
    "https://www.facebook.com/tikiboatguadeloupe/",
    "https://www.youtube.com/@TikiBoatGuadeloupe",
    "https://www.tripadvisor.fr/Attraction_Review-g147374-d25868775-Reviews-Tiki_Boat_Guadeloupe-Guadeloupe.html",
  ],
  aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", reviewCount: "600", bestRating: "5" },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Excursions en mer Guadeloupe",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "TouristTrip",
          name: "Croisière Grand Cul de Sac Marin",
          description: "Journée complète dans le plus grand lagon des Petites Antilles. Snorkeling, repas créole, îlets.",
        },
        price: "95",
        priceCurrency: "EUR",
      },
    ],
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "fr" | "en")) notFound();

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      {children}
    </NextIntlClientProvider>
  );
}
