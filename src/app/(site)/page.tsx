import type { Metadata } from "next";
import Link from "next/link";
import SiteImage from "@/components/SiteImage";
import { Star, ChevronRight, Anchor, Fish, Utensils, Users, Shield, CheckCircle2, Waves } from "lucide-react";
import { getExcursions } from "@/lib/excursions";
import { reviews } from "@/data/reviews";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Excursions en bateau en Guadeloupe — Tiki Boat",
  description:
    "Tiki Boat : excursions en bateau en Guadeloupe depuis Pointe-à-Pitre. Croisière journée Grand Cul de Sac Marin, coucher de soleil, privatisation. Snorkeling, repas créole, îlets. Note 4,9/5 · Réservez en ligne.",
  alternates: { canonical: "https://tiki-boat.com" },
  openGraph: {
    title: "Tiki Boat — Excursions en bateau en Guadeloupe",
    description:
      "Croisière journée, coucher de soleil, privatisation. Snorkeling, îlets, repas créole. À partir de 55 €. Note 4,9/5.",
    url: "https://tiki-boat.com",
    type: "website",
  },
};

/* ─── Feature icons ─── */
const FEATURES = [
  { icon: Shield,  label: "Sécurité certifiée",    desc: "Capitaine diplômé, équipements homologués" },
  { icon: Users,   label: "Petit comité",           desc: "Maximum 12 passagers par sortie" },
  { icon: Fish,    label: "Snorkeling inclus",      desc: "Masque, tuba et palmes à bord" },
  { icon: Anchor,  label: "Adapté à tous",          desc: "Bébés, enfants, seniors — tout le monde" },
  { icon: Utensils,label: "Repas créole inclus",   desc: "Chef à bord, 100% produits frais" },
  { icon: Waves,   label: "Bar flottant unique",     desc: "Original et unique en Guadeloupe" },
];

export default async function HomePage() {
  const excursions = await getExcursions();
  const topReviews = reviews.slice(0, 3);

  return (
    <>
      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="bg-tiki-ocean min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-center pt-24 pb-12 lg:py-24">

          {/* GAUCHE — Texte (premier dans le DOM = premier sur mobile) */}
          <div className="order-1">
            <p className="text-tiki-gold text-xs font-bold tracking-[0.25em] uppercase mb-6">
              Excursions en bateau · Guadeloupe
            </p>

            <h1 className="font-display font-black text-white leading-[1.06] mb-6"
                style={{ fontSize: "clamp(2.4rem, 4.5vw, 3.75rem)" }}>
              Une journée en mer<br />
              <span className="text-tiki-gold">inoubliable</span><br />
              en Guadeloupe.
            </h1>

            <p className="text-white/55 text-base leading-relaxed mb-10 max-w-sm">
              Snorkeling, îlets sauvages et repas créole les pieds dans l&apos;eau. Une expérience unique dans le Grand Cul de Sac Marin.
            </p>

            <Link href="/reservation"
              className="inline-flex items-center gap-2 bg-tiki-gold hover:bg-tiki-gold-dark text-tiki-ocean font-bold py-4 px-9 rounded-full transition-all hover:scale-105 text-sm shadow-lg shadow-tiki-gold/25 mb-12">
              Réserver maintenant <ChevronRight size={16} />
            </Link>

            <div className="flex gap-12 pt-6 border-t border-white/10">
              {[
                { v: "4.9 ★", l: "Note Google" },
                { v: "500+", l: "Clients satisfaits" },
                { v: "2018", l: "En Guadeloupe" },
              ].map(({ v, l }) => (
                <div key={l}>
                  <div className="text-white font-bold text-xl">{v}</div>
                  <div className="text-white/35 text-xs mt-1">{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* DROITE — Photo (masqué sur mobile) */}
          <div className="order-2 hidden lg:block">
            <div className="relative rounded-2xl overflow-hidden aspect-[3/2] shadow-2xl shadow-black/40 bg-tiki-ocean">
              <SiteImage
                src="/photos/hero.jpg"
                alt="Excursion en bateau Tiki Boat — Grand Cul de Sac Marin, Guadeloupe"
                label="Photo principale du hero"
                fill className="object-contain" priority
              />
            </div>
          </div>

        </div>
      </section>


      {/* ══════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════ */}
      <section className="bg-tiki-ocean-mid py-20">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-14">
            <p className="text-tiki-lagon-light text-xs font-bold tracking-[0.2em] uppercase mb-3">Pourquoi Tiki Boat</p>
            <h2 className="font-display font-black text-white text-3xl sm:text-4xl">
              Une expérience pensée dans les moindres détails
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex flex-col items-start gap-2.5 p-4 sm:p-5 rounded-2xl border border-white/8 hover:border-tiki-gold/40 hover:bg-white/5 transition-all duration-300 group">
                <div className="w-11 h-11 rounded-xl bg-tiki-gold/15 flex items-center justify-center group-hover:bg-tiki-gold/25 transition-colors">
                  <Icon size={20} className="text-tiki-gold" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm mb-0.5">{label}</div>
                  <div className="text-white/45 text-xs leading-relaxed">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          EXCURSIONS
      ══════════════════════════════════════════ */}
      <section className="bg-tiki-ocean py-20">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-14">
            <p className="text-tiki-lagon-light text-xs font-bold tracking-[0.2em] uppercase mb-3">Nos sorties en mer</p>
            <h2 className="font-display font-black text-white text-3xl sm:text-4xl">
              Choisissez votre aventure
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {excursions.map((exc) => (
              <div key={exc.id} className="relative bg-tiki-ocean-mid rounded-2xl overflow-hidden border border-white/8 hover:border-tiki-gold/30 hover:shadow-xl hover:shadow-black/30 transition-all duration-300 hover:-translate-y-1 group flex flex-col">
                {/* Overlay link — toute la carte pointe vers le détail */}
                <Link href={`/excursions/${exc.slug}`} className="absolute inset-0 z-0" aria-label={exc.title} />
                <div className="relative h-52 overflow-hidden">
                  <SiteImage src={exc.images[0]} alt={exc.title}
                    label={exc.title} fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-tiki-ocean-mid/80 to-transparent" />
                  {exc.popular && (
                    <div className="absolute top-3 left-3 bg-tiki-red text-white text-xs font-bold px-3 py-1 rounded-full">
                      Meilleure vente
                    </div>
                  )}
                  {exc.badge && !exc.popular && (
                    <div className="absolute top-3 left-3 bg-tiki-gold/90 text-tiki-ocean text-xs font-bold px-3 py-1 rounded-full">
                      {exc.badge}
                    </div>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-display font-black text-white text-lg leading-tight mb-1">{exc.title}</h3>
                  <p className="text-tiki-cream-dark text-xs mb-2">{exc.duration}</p>
                  <p className="text-white/50 text-sm leading-relaxed mb-5 flex-1 line-clamp-2">{exc.description}</p>
                  <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/8">
                    <div>
                      {exc.pricePrivate ? (
                        <span className="text-tiki-gold font-black text-lg">Sur devis</span>
                      ) : (
                        <div className="flex items-baseline gap-1">
                          <span className="text-tiki-gold font-black text-2xl">{formatPrice(exc.priceAdult)}</span>
                          <span className="text-white/35 text-xs">/ adulte</span>
                        </div>
                      )}
                    </div>
                    <Link href={exc.pricePrivate ? "/contact?type=privatisation" : `/reservation?excursion=${exc.slug}`}
                      className="bg-tiki-gold hover:bg-tiki-gold-dark text-tiki-ocean text-sm font-bold px-5 py-3 rounded-full transition-colors min-h-[44px] flex items-center">
                      {exc.pricePrivate ? "Devis" : "Réserver"}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          INCLUS
      ══════════════════════════════════════════ */}
      <section className="bg-tiki-ocean-mid py-20">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-tiki-lagon-light text-xs font-bold tracking-[0.2em] uppercase mb-3">Tout compris</p>
              <h2 className="font-display font-black text-white text-3xl sm:text-4xl mb-6 leading-tight">
                Zéro mauvaise<br />surprise.
              </h2>
              <p className="text-white/50 text-base leading-relaxed mb-8">
                Le prix affiché est le prix réel. Repas, boissons, snorkeling, guide — tout est inclus dans le tarif.
              </p>
              <ul className="space-y-4">
                {[
                  "Transport bateau aller-retour",
                  "Fond de verre (visite des coraux)",
                  "Masque, tuba et palmes",
                  "Apéritif créole de bienvenue",
                  "Repas créole complet (Chef à bord, 100% frais)",
                  "Boissons à volonté",
                  "Guide naturaliste",
                  "Bar flottant unique en Guadeloupe",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-white/75 text-sm">
                    <CheckCircle2 size={16} className="text-tiki-gold shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative h-80 lg:h-[420px] rounded-2xl overflow-hidden border border-white/10 bg-tiki-ocean">
              <SiteImage
                src="/photos/bateau.jpg"
                alt="Le Tiki Boat"
                label="Photo du Tiki Boat"
                fill className="object-contain"
              />
            </div>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          LAGON
      ══════════════════════════════════════════ */}
      <section className="bg-tiki-ocean py-20">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-72 lg:h-[420px] rounded-2xl overflow-hidden order-2 lg:order-1 border border-white/10">
              <SiteImage
                src="/photos/lagon.jpg"
                alt="Vue aérienne du Grand Cul de Sac Marin"
                label="Photo du Grand Cul de Sac Marin (vue aérienne)"
                fill className="object-cover"
              />
            </div>
            <div className="order-1 lg:order-2">
              <p className="text-tiki-gold text-xs font-bold tracking-[0.2em] uppercase mb-3">Notre terrain de jeu</p>
              <h2 className="font-display font-black text-white text-3xl sm:text-4xl mb-6 leading-tight">
                Le plus grand lagon<br />des Petites Antilles
              </h2>
              <p className="text-white/50 text-base leading-relaxed mb-8">
                Le Grand Cul de Sac Marin est un paradis naturel classé Parc National. Eaux cristallines, biodiversité exceptionnelle, îlets sauvages — notre terrain de jeu exclusif.
              </p>
              <ul className="space-y-3">
                {[
                  "Îlets Caret, Fajou, la Biche, îlet aux oiseaux",
                  "Barrière de corail préservée",
                  "Épave immergée & mangrove",
                  "Rivière salée & fonds marins",
                  "Snorkeling en cœur de Parc National",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-white/65 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-tiki-gold shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          AVIS
      ══════════════════════════════════════════ */}
      <section className="bg-tiki-ocean-mid py-20">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-14">
            <p className="text-tiki-lagon-light text-xs font-bold tracking-[0.2em] uppercase mb-3">Avis clients</p>
            <h2 className="font-display font-black text-white text-3xl sm:text-4xl mb-4">
              Ils l&apos;ont vécu
            </h2>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => <Star key={i} size={18} className="text-tiki-gold fill-tiki-gold" />)}
              <span className="ml-2 font-bold text-white">4.9</span>
              <span className="text-white/35 text-sm ml-1">/ 5 · 100+ avis</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {topReviews.map((review) => (
              <div key={review.id} className="bg-tiki-ocean rounded-2xl p-6 border border-white/8 hover:border-tiki-gold/30 transition-all">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => <Star key={i} size={13} className="text-tiki-gold fill-tiki-gold" />)}
                  <span className="ml-auto text-xs text-white/30 capitalize">{review.platform}</span>
                </div>
                <p className="text-white/65 text-sm leading-relaxed italic mb-5">&ldquo;{review.comment}&rdquo;</p>
                <div className="pt-4 border-t border-white/8">
                  <div className="font-semibold text-tiki-gold text-sm">{review.author}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-4 justify-center mt-10">
            <a href="https://www.tripadvisor.fr/Attraction_Review-g644387-d23475410-Reviews-Tiki_Boat-Le_Gosier_Grande_Terre_Island_Guadeloupe.html"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-white/15 text-white/60 hover:border-tiki-gold hover:text-tiki-gold text-sm font-medium px-5 py-2.5 rounded-full transition-colors">
              Tripadvisor
            </a>
            <a href="https://www.google.com/search?q=tiki+boat+guadeloupe+avis"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-white/15 text-white/60 hover:border-tiki-gold hover:text-tiki-gold text-sm font-medium px-5 py-2.5 rounded-full transition-colors">
              Google Reviews
            </a>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          TARIFS
      ══════════════════════════════════════════ */}
      <section className="bg-tiki-ocean py-20">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-14">
            <p className="text-tiki-lagon-light text-xs font-bold tracking-[0.2em] uppercase mb-3">Tarifs</p>
            <h2 className="font-display font-black text-white text-3xl sm:text-4xl mb-4">
              Transparent. Tout compris.
            </h2>
            <p className="text-white/40 max-w-md mx-auto text-sm">Acompte de 30% à la réservation — solde le jour J.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="border-2 border-tiki-gold/50 rounded-2xl p-7 relative bg-tiki-ocean-mid">
              <div className="absolute -top-3 left-6 bg-tiki-red text-white text-xs font-bold px-3 py-1 rounded-full">
                Meilleure vente
              </div>
              <h3 className="font-display font-black text-white text-xl mb-1">Croisière journée</h3>
              <p className="text-white/35 text-xs mb-6">Grand Cul de Sac Marin — 08h00→17h00</p>
              <div className="space-y-3 mb-7">
                {[["Adulte", "95 €"], ["Enfant 3–12 ans", "55 €"], ["Moins de 3 ans", "Gratuit"]].map(([l, p]) => (
                  <div key={l} className="flex justify-between text-sm border-b border-white/8 pb-3 last:border-0 last:pb-0">
                    <span className="text-white/50">{l}</span>
                    <span className="font-bold text-tiki-gold">{p}</span>
                  </div>
                ))}
              </div>
              <Link href="/reservation?excursion=grand-cul-de-sac-marin"
                className="flex items-center justify-center gap-2 w-full bg-tiki-gold hover:bg-tiki-gold-dark text-tiki-ocean font-bold py-3.5 rounded-xl transition-colors text-sm">
                Réserver cette excursion <ChevronRight size={16} />
              </Link>
            </div>
            <div className="border border-white/15 rounded-2xl p-7 bg-tiki-ocean-mid">
              <h3 className="font-display font-black text-white text-xl mb-1">Privatisation</h3>
              <p className="text-white/35 text-xs mb-6">Anniversaire · EVJF · Mariage · Entreprise</p>
              <div className="space-y-3 mb-7">
                {[["Journée privée", "dès 800 €"], ["Sunset privé", "dès 400 €"]].map(([l, p]) => (
                  <div key={l} className="flex justify-between text-sm border-b border-white/8 pb-3 last:border-0 last:pb-0">
                    <span className="text-white/50">{l}</span>
                    <span className="font-bold text-tiki-gold">{p}</span>
                  </div>
                ))}
              </div>
              <Link href="/contact?type=privatisation"
                className="flex items-center justify-center gap-2 w-full border border-tiki-gold/50 text-tiki-gold hover:bg-tiki-gold/10 font-bold py-3.5 rounded-xl transition-colors text-sm">
                Demander un devis
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          CTA FINAL — fond sombre, simple
      ══════════════════════════════════════════ */}
      <section className="bg-tiki-ocean-mid py-20">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="font-display font-black text-white text-3xl sm:text-4xl mb-4">
            Prêt pour le grand large ?
          </h2>
          <p className="text-white/50 text-base mb-10">
            Réservez maintenant et vivez une journée comme nulle part ailleurs.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/reservation"
              className="inline-flex items-center justify-center gap-2 bg-tiki-gold hover:bg-tiki-gold-dark text-tiki-ocean font-bold py-4 px-10 rounded-full transition-all text-base hover:scale-105">
              Réserver maintenant <ChevronRight size={18} />
            </Link>
            <a href="https://wa.me/590690495848" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border border-white/20 text-white/80 hover:text-white hover:border-white/40 font-medium py-4 px-8 rounded-full transition-all text-sm">
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
