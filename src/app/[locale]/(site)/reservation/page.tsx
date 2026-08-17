import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import BookingForm from "@/components/BookingForm";
import { getExcursions } from "@/lib/excursions";

const BASE = "https://tikiboat.fr";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === "en";
  const url = isEn ? `${BASE}/en/reservation` : `${BASE}/reservation`;
  return {
    title: isEn ? "Book a Boat Trip" : "Réserver une excursion",
    description: isEn
      ? "Book your Tiki Boat trip online. Secure payment, instant recap email, confirmation within 24h."
      : "Réservez votre excursion Tiki Boat en ligne. Paiement sécurisé, email récapitulatif immédiat, confirmation sous 24h.",
    alternates: { canonical: url, languages: { fr: `${BASE}/reservation`, en: `${BASE}/en/reservation` } },
    openGraph: { url, type: "website" },
  };
}

export default async function ReservationPage() {
  const t = await getTranslations("reservationPage");
  // Tarifs et horaires viennent de la DB pour que l'admin puisse les modifier.
  const excursions = await getExcursions();
  return (
    <>
      {/* Header */}
      <section className="pt-32 pb-10 bg-sky-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-tiki-red/10 to-transparent" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="section-title mb-4">{t("title")}</h1>
          <p className="section-subtitle max-w-xl mx-auto">
            {t("subtitle")}
          </p>
          <div className="mt-5 inline-flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-left max-w-xl mx-auto">
            <span className="text-lg leading-none mt-0.5">⏳</span>
            <p className="text-amber-800 text-sm leading-relaxed">
              {t.rich("notice", { strong: (chunks) => <strong>{chunks}</strong> })}
            </p>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-12 bg-white min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <BookingForm excursions={excursions} />
        </div>
      </section>
    </>
  );
}
