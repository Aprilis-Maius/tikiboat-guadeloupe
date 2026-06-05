import type { Metadata } from "next";
import SiteImage from "@/components/SiteImage";
import { Play } from "lucide-react";

export const metadata: Metadata = {
  alternates: { canonical: "https://tikiboat.fr/galerie" },
  openGraph: { url: "https://tikiboat.fr/galerie", type: "website" },
  title: "Galerie photos & vidéos",
  description: "Découvrez en images les excursions Tiki Boat en Guadeloupe. Photos et vidéos des îlets, du snorkeling, et du repas créole.",
};

const photos = [
  { src: "/photos/galerie-01.jpg", alt: "Le Tiki Boat en mer", category: "Bateau" },
  { src: "/photos/galerie-02.jpg", alt: "Eaux turquoise du lagon", category: "Mer & Lagon" },
  { src: "/photos/galerie-03.jpg", alt: "Snorkeling sur le récif corallien", category: "Snorkeling" },
  { src: "/photos/galerie-04.jpg", alt: "Vue sur la mer des Caraïbes", category: "Mer & Lagon" },
  { src: "/photos/galerie-05.jpg", alt: "Coucher de soleil en mer", category: "Coucher de soleil" },
  { src: "/photos/galerie-06.jpg", alt: "Îlet du Grand Cul de Sac Marin", category: "Îlets" },
  { src: "/photos/galerie-07.jpg", alt: "Plage et mer turquoise", category: "Îlets" },
  { src: "/photos/galerie-08.jpg", alt: "Poissons tropicaux en snorkeling", category: "Snorkeling" },
  { src: "/photos/galerie-09.jpg", alt: "Repas créole les pieds dans l'eau", category: "Repas" },
  { src: "/photos/galerie-10.jpg", alt: "Vue aérienne du lagon", category: "Mer & Lagon" },
  { src: "/photos/galerie-11.jpg", alt: "Bateau Tiki Boat au mouillage", category: "Bateau" },
  { src: "/photos/galerie-12.jpg", alt: "Mangrove et rivière salée", category: "Mangrove" },
];

const videos = [
  {
    youtubeId: "gNaCNE7808o",
    title: "Une journée à bord du Tiki Boat",
    description: "Découvrez une journée complète dans le Grand Cul de Sac Marin — 5 minutes pour tout voir !",
  },
];

export default function GaleriePage() {
  return (
    <>
      {/* Header */}
      <section className="pt-32 pb-16 bg-sky-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-tiki-red/10 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

          <h1 className="section-title mb-4">Notre galerie</h1>
          <p className="section-subtitle max-w-2xl mx-auto">
            Les plus belles images de nos excursions — îlets, snorkeling, repas créole, coucher de soleil.
          </p>
        </div>
      </section>

      {/* Videos */}
      <section className="py-16 bg-tiki-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title mb-8">Vidéos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {videos.map((v) => (
              <div key={v.youtubeId} className="card-dark overflow-hidden p-0">
                <div className="relative aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${v.youtubeId}`}
                    title={v.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Play size={16} className="text-tiki-red" />
                    <h3 className="font-bold text-slate-800">{v.title}</h3>
                  </div>
                  <p className="text-slate-500 text-sm">{v.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Photo grid */}
      <section className="py-16 bg-tiki-dark-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title mb-8">Photos</h2>
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {photos.map((photo, i) => (
              <div key={i} className="relative overflow-hidden rounded-xl border border-tiki-gold/10 hover:border-tiki-gold/40 transition-all duration-300 group break-inside-avoid">
                <div className="relative aspect-[3/2]">
                  <SiteImage
                    src={photo.src}
                    alt={photo.alt}
                    label={`${photo.category} — ${photo.alt}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-tiki-dark/80 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <span className="badge text-xs">{photo.category}</span>
                  <p className="text-slate-800 text-sm mt-1">{photo.alt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social CTA */}
      <section className="py-12 bg-white border-t border-tiki-gold/20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-2xl font-bold text-tiki-gold mb-3">Suivez nos aventures</h2>
          <p className="text-slate-500 mb-6">
            Retrouvez encore plus de photos et vidéos sur nos réseaux sociaux. Taguez-nous dans vos photos !
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="https://www.instagram.com/tikiboatguadeloupe/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-sm py-2.5 px-6"
            >
              Instagram
            </a>
            <a
              href="https://www.facebook.com/tikiboatguadeloupe/?locale=fr_FR"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-sm py-2.5 px-6"
            >
              Facebook
            </a>
            <a
              href="https://www.youtube.com/@TikiBoatGuadeloupe"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-sm py-2.5 px-6"
            >
              YouTube
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
