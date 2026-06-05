import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Bebas_Neue, Poppins } from "next/font/google";
import "../globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

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
    languages: {
      "fr": BASE,
      "en": `${BASE}/en`,
    },
  },
  twitter: { site: "@tikiboatguadeloupe" },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": BASE + "/#business",
  name: "Tiki Boat",
  url: BASE,
  telephone: "+590690495848",
  email: "tikiboatguadeloupe@gmail.com",
  image: BASE + "/logo.png",
  priceRange: "€€",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Pointe-à-Pitre",
    addressRegion: "Guadeloupe",
    addressCountry: "GP",
  },
  aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", reviewCount: "100", bestRating: "5" },
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
    <html lang={locale} className={`scroll-smooth ${bebasNeue.variable} ${poppins.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
