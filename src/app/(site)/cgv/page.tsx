import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales de Vente — Tiki Boat Guadeloupe",
  robots: { index: false },
};

export default function CGVPage() {
  return (
    <section className="bg-sky-50 min-h-screen pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-5 sm:px-8">
        <h1 className="font-display font-black text-slate-800 text-3xl sm:text-4xl mb-10">Conditions Générales de Vente</h1>

        <div className="space-y-10 text-slate-600 text-sm leading-relaxed">

          <div>
            <h2 className="text-slate-800 font-bold text-base mb-3">1. Objet</h2>
            <p>
              Les présentes CGV régissent les conditions de vente des prestations d&apos;excursions en bateau proposées par Tiki Boat en Guadeloupe. Toute réservation implique l&apos;acceptation pleine et entière des présentes conditions.
            </p>
          </div>

          <div>
            <h2 className="text-slate-800 font-bold text-base mb-3">2. Réservation et acompte</h2>
            <p>
              La réservation est confirmée après versement d&apos;un acompte de <strong className="text-slate-500">30 %</strong> du montant total. Le solde est réglé le jour de l&apos;excursion, avant l&apos;embarquement.
            </p>
          </div>

          <div>
            <h2 className="text-slate-800 font-bold text-base mb-3">3. Tarifs</h2>
            <p>
              Les tarifs affichés sur le site sont en euros TTC et incluent l&apos;ensemble des prestations mentionnées dans la description de chaque excursion (repas, boissons, snorkeling, etc.).
            </p>
          </div>

          <div>
            <h2 className="text-slate-800 font-bold text-base mb-3">4. Annulation par le client</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Annulation <strong className="text-slate-500">plus de 7 jours</strong> avant la date : remboursement intégral de l&apos;acompte.</li>
              <li>Annulation entre <strong className="text-slate-500">3 et 7 jours</strong> avant : remboursement de 50 % de l&apos;acompte.</li>
              <li>Annulation <strong className="text-slate-500">moins de 3 jours</strong> avant : acompte non remboursable.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-slate-800 font-bold text-base mb-3">5. Annulation par Tiki Boat</h2>
            <p>
              En cas d&apos;annulation de notre fait (conditions météorologiques dangereuses, problème technique, force majeure), le client est remboursé intégralement ou une date de report lui est proposée.
            </p>
          </div>

          <div>
            <h2 className="text-slate-800 font-bold text-base mb-3">6. Conditions de participation</h2>
            <p>
              Les participants doivent être en bonne santé et savoir nager ou accepter de porter un gilet de sauvetage. Tiki Boat se réserve le droit de refuser l&apos;embarquement à toute personne présentant un risque pour elle-même ou les autres passagers (état d&apos;ivresse, comportement inapproprié, contre-indication médicale).
            </p>
          </div>

          <div>
            <h2 className="text-slate-800 font-bold text-base mb-3">7. Responsabilité</h2>
            <p>
              Tiki Boat est couvert par une assurance responsabilité civile professionnelle. Les participants sont responsables de leurs biens personnels à bord. Tiki Boat ne saurait être tenu responsable des accidents liés au non-respect des consignes de sécurité.
            </p>
          </div>

          <div>
            <h2 className="text-slate-800 font-bold text-base mb-3">8. Paiement en ligne</h2>
            <p>
              Les paiements en ligne sont sécurisés et traités via <strong className="text-slate-500">Stripe</strong>. Tiki Boat ne stocke aucune donnée bancaire.
            </p>
          </div>

          <div>
            <h2 className="text-slate-800 font-bold text-base mb-3">9. Droit applicable</h2>
            <p>
              Les présentes CGV sont soumises au droit français. En cas de litige, une solution amiable sera recherchée en priorité. À défaut, les tribunaux compétents de Guadeloupe seront seuls compétents.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
