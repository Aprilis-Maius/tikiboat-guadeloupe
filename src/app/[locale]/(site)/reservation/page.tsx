import type { Metadata } from "next";
import BookingForm from "@/components/BookingForm";

export const metadata: Metadata = {
  alternates: { canonical: "https://tikiboat.fr/reservation" },
  openGraph: { url: "https://tikiboat.fr/reservation", type: "website" },
  title: "Réserver une excursion",
  description:
    "Réservez votre excursion Tiki Boat en ligne. Paiement sécurisé, confirmation instantanée par email.",
};

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
              <strong>Confirmation sous 24-48h.</strong> Votre réservation est en attente de validation selon le remplissage du bateau. Votre acompte n&apos;est débité qu&apos;à la confirmation.
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
