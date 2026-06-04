import type { Metadata } from "next";
import BookingForm from "@/components/BookingForm";

export const metadata: Metadata = {
  title: "Réserver une excursion",
  description:
    "Réservez votre excursion Tiki Boat en ligne. Paiement sécurisé, confirmation instantanée par email.",
};

export default function ReservationPage() {
  return (
    <>
      {/* Header */}
      <section className="pt-32 pb-10 bg-tiki-dark-2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-tiki-red/10 to-transparent" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="section-title mb-4">Réservez votre aventure</h1>
          <p className="section-subtitle max-w-xl mx-auto">
            Choisissez votre excursion, votre date et procédez au paiement sécurisé. Confirmation instantanée par email.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="py-12 bg-tiki-dark min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <BookingForm />
        </div>
      </section>
    </>
  );
}
