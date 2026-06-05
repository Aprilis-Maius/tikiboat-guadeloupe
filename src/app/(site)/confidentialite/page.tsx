import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Tiki Boat Guadeloupe",
  robots: { index: false },
};

export default function ConfidentialitePage() {
  return (
    <section className="bg-sky-50 min-h-screen pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-5 sm:px-8">
        <h1 className="font-display font-black text-slate-800 text-3xl sm:text-4xl mb-10">Politique de confidentialité</h1>

        <div className="space-y-10 text-slate-600 text-sm leading-relaxed">

          <div>
            <h2 className="text-slate-800 font-bold text-base mb-3">1. Responsable du traitement</h2>
            <p>
              <strong className="text-slate-500">Tiki Boat</strong> — tikiboatguadeloupe@gmail.com — est responsable du traitement de vos données personnelles collectées via ce site.
            </p>
          </div>

          <div>
            <h2 className="text-slate-800 font-bold text-base mb-3">2. Données collectées</h2>
            <p>Nous collectons les données suivantes lors d&apos;une réservation ou d&apos;une prise de contact :</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Nom et prénom</li>
              <li>Adresse e-mail</li>
              <li>Numéro de téléphone</li>
              <li>Informations de réservation (date, nombre de personnes, excursion choisie)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-slate-800 font-bold text-base mb-3">3. Finalités du traitement</h2>
            <p>Vos données sont utilisées exclusivement pour :</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Gérer votre réservation et vous envoyer une confirmation</li>
              <li>Vous contacter en cas de modification ou d&apos;annulation</li>
              <li>Répondre à vos demandes de contact</li>
            </ul>
          </div>

          <div>
            <h2 className="text-slate-800 font-bold text-base mb-3">4. Durée de conservation</h2>
            <p>
              Vos données sont conservées pendant <strong className="text-slate-500">3 ans</strong> à compter de votre dernière interaction avec Tiki Boat, puis supprimées.
            </p>
          </div>

          <div>
            <h2 className="text-slate-800 font-bold text-base mb-3">5. Partage des données</h2>
            <p>
              Vos données ne sont jamais vendues ni cédées à des tiers. Elles peuvent être transmises à nos prestataires techniques (Stripe pour le paiement, Vercel pour l&apos;hébergement) dans le seul but d&apos;assurer le service.
            </p>
          </div>

          <div>
            <h2 className="text-slate-800 font-bold text-base mb-3">6. Vos droits (RGPD)</h2>
            <p>
              Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Droit d&apos;accès à vos données</li>
              <li>Droit de rectification</li>
              <li>Droit à l&apos;effacement (« droit à l&apos;oubli »)</li>
              <li>Droit d&apos;opposition au traitement</li>
              <li>Droit à la portabilité</li>
            </ul>
            <p className="mt-3">
              Pour exercer ces droits, contactez-nous à : <a href="mailto:tikiboatguadeloupe@gmail.com" className="text-tiki-gold hover:underline">tikiboatguadeloupe@gmail.com</a>
            </p>
          </div>

          <div>
            <h2 className="text-slate-800 font-bold text-base mb-3">7. Cookies</h2>
            <p>
              Ce site utilise uniquement des cookies techniques indispensables à son fonctionnement (session, sécurité). Aucun cookie publicitaire ou de pistage tiers n&apos;est utilisé.
            </p>
          </div>

          <div>
            <h2 className="text-slate-800 font-bold text-base mb-3">8. Contact et réclamation</h2>
            <p>
              Pour toute question relative à vos données personnelles, écrivez-nous à <a href="mailto:tikiboatguadeloupe@gmail.com" className="text-tiki-gold hover:underline">tikiboatguadeloupe@gmail.com</a>. Vous avez également le droit d&apos;introduire une réclamation auprès de la <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-tiki-gold hover:underline">CNIL</a>.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
