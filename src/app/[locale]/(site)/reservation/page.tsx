import type { Metadata } from "next";
import BookingForm from "@/components/BookingForm";

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

export default function ReservationPage() {
  return (
    <>
      {/* Header */}
      <section className="pt-32 pb-10 bg-sky-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-tiki-red/10 to-transparent" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="section-title mb-4">Réservez votre aventure</h1>
          <p className="section-subtitle max-w-xl mx-auto">
            Choisissez votre excursion, votre date et procédez au paiement sécurisé.
          </p>
          <div className="mt-5 inline-flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-left max-w-xl mx-auto">
            <span className="text-lg leading-none mt-0.5">⏳</span>
            <p className="text-amber-800 text-sm leading-relaxed">
              <strong>Confirmation sous 24-48h.</strong> Votre réservation est en attente de validation selon le remplissage du bateau.
            </p>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-12 bg-white min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <BookingForm />
        </div>
      </section>
    </>
  );
}
