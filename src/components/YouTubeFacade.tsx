"use client";

import { useState } from "react";
import { Play } from "lucide-react";

interface Props {
  youtubeId: string;
  title: string;
  poster?: string; // image locale optionnelle ; sinon dégradé de marque
}

/**
 * Façade "click-to-load" pour les vidéos YouTube.
 * Conformité RGPD/CNIL : aucune requête vers YouTube (donc aucun cookie tiers)
 * tant que l'utilisateur n'a pas cliqué pour lancer la vidéo. Au clic, on charge
 * l'iframe en mode "privacy-enhanced" (youtube-nocookie.com).
 */
export default function YouTubeFacade({ youtubeId, title, poster }: Props) {
  const [loaded, setLoaded] = useState(false);

  if (loaded) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setLoaded(true)}
      aria-label={`Lire la vidéo : ${title}`}
      className="group absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tiki-gold focus-visible:ring-inset"
    >
      {poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-tiki-ocean via-tiki-ocean-mid to-tiki-lagon" />
      )}
      <span aria-hidden="true" className="absolute inset-0 bg-black/40 group-hover:bg-black/25 transition-colors" />
      <span
        aria-hidden="true"
        className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full bg-tiki-red text-white shadow-lg transition-transform group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      >
        <Play size={28} className="ml-1 fill-white" />
      </span>
    </button>
  );
}
