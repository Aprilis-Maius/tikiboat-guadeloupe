import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales — Tiki Boat Guadeloupe",
  robots: { index: false },
};

export default function MentionsLegalesPage() {
  return (
    <section className="bg-sky-50 min-h-screen pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-5 sm:px-8">
        <h1 className="font-display font-black text-slate-800 text-3xl sm:text-4xl mb-10">Mentions légales</h1>

        <div className="space-y-10 text-slate-600 text-sm leading-relaxed">

          <div>
            <h2 className="text-slate-800 font-bold text-base mb-3">Éditeur du site</h2>
            <p>
              <strong className="text-slate-500">Tiki Boat</strong><br />
              Guadeloupe, France<br />
              Téléphone : +590 690 49 58 48<br />
              Email : tikiboatguadeloupe@gmail.com
            </p>
          </div>

          <div>
            <h2 className="text-slate-800 font-bold text-base mb-3">Hébergement</h2>
            <p>
              Ce site est hébergé par <strong className="text-slate-500">Vercel Inc.</strong><br />
              440 N Barranca Ave #4133, Covina, CA 91723, États-Unis<br />
              <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-tiki-gold hover:underline">vercel.com</a>
            </p>
          </div>

          <div>
            <h2 className="text-slate-800 font-bold text-base mb-3">Propriété intellectuelle</h2>
            <p>
              L&apos;ensemble des contenus présents sur ce site (textes, images, vidéos, logos) est la propriété exclusive de Tiki Boat ou de ses partenaires. Toute reproduction, même partielle, est interdite sans autorisation préalable.
            </p>
          </div>

          <div>
            <h2 className="text-slate-800 font-bold text-base mb-3">Responsabilité</h2>
            <p>
              Tiki Boat s&apos;efforce de maintenir les informations publiées à jour mais ne peut garantir l&apos;exactitude ou l&apos;exhaustivité des contenus. Tiki Boat ne saurait être tenu responsable de tout dommage direct ou indirect lié à l&apos;utilisation de ce site.
            </p>
          </div>

          <div>
            <h2 className="text-slate-800 font-bold text-base mb-3">Cookies</h2>
            <p>
              Ce site peut utiliser des cookies techniques nécessaires à son bon fonctionnement. Aucun cookie publicitaire ou de suivi n&apos;est déposé sans votre consentement.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
