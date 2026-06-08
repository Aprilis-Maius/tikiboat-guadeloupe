import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding excursions...");

  const excursions = [
    {
      slug: "grand-cul-de-sac-marin",
      title: "Croisière Grand Cul de Sac Marin",
      subtitle: "Journée complète inoubliable",
      description:
        "Embarquez pour une journée extraordinaire et unique en Guadeloupe dans le Grand Cul de Sac Marin, le plus grand lagon des Petites Antilles. Fonds marins au fond de verre, snorkeling en cœur de Parc National, épave, mangrove, rivière salée — et repas créole 100% frais servi les pieds dans l'eau autour de notre bar flottant, original et unique en Guadeloupe.",
      duration: "Journée complète",
      departureTime: "08h00",
      returnTime: "17h00",
      departurePoint: "Marina de Pointe-à-Pitre / Le Gosier",
      maxPassengers: 12,
      priceAdult: 95,
      priceChild: 55,
      pricePrivate: null,
      included: JSON.stringify([
        "Transport bateau aller-retour",
        "Fond de verre (visite des coraux)",
        "Masque, tuba et palmes",
        "Apéritif de bienvenue",
        "Repas créole complet (100% produits frais)",
        "Boissons",
        "Guide naturaliste",
      ]),
      notIncluded: JSON.stringify(["Transport jusqu'au point de départ"]),
      highlights: JSON.stringify([
        "Bar flottant unique en Guadeloupe",
        "Fonds marins avec fond de verre du bateau",
        "Snorkeling en cœur de Parc National",
        "Îlets Caret, Fajou, la Biche, îlet aux oiseaux",
        "Barrière de corail & épave",
        "Mangrove & rivière salée",
        "Repas créole 100% frais — Chef à bord",
        "Adapté bébés & séniors",
      ]),
      images: JSON.stringify([
        "/photos/grandculdesacmarin-excursion.png",
        "/photos/grandculdesacmarin-excursion.png",
      ]),
      youtubeId: "gNaCNE7808o",
      badge: "Coup de cœur",
      popular: true,
      isActive: true,
      sortOrder: 0,
    },
    {
      slug: "privatisation",
      title: "Privatisation du Bateau",
      subtitle: "Votre événement sur mesure",
      description:
        "Réservez le Tiki Boat en exclusivité pour vos moments uniques : anniversaire, EVJF/EVG, mariage, team building, sunset privé. Programme 100% sur mesure, départ où vous voulez — Guadeloupe, Les Saintes, Marie-Galante. On s'occupe de tout.",
      duration: "Sur mesure",
      departureTime: "Au choix",
      returnTime: "Au choix",
      departurePoint: "Au choix",
      maxPassengers: 12,
      priceAdult: 0,
      priceChild: 0,
      pricePrivate: 800,
      included: JSON.stringify([
        "Bateau en exclusivité",
        "Capitaine et équipage",
        "Programme personnalisé",
        "Décorations sur demande",
        "Repas/boissons personnalisés",
      ]),
      notIncluded: JSON.stringify(["Options spéciales sur devis"]),
      highlights: JSON.stringify([
        "Anniversaire", "EVJF / EVG", "Mariage", "Team building", "Sunset privé", "Sur mesure",
      ]),
      images: JSON.stringify([
        "/photos/bateau.jpg",
        "/photos/bateau.jpg",
      ]),
      youtubeId: null,
      badge: "Sur mesure",
      popular: false,
      isActive: true,
      sortOrder: 2,
    },
  ];

  for (const exc of excursions) {
    await prisma.excursion.upsert({
      where: { slug: exc.slug },
      update: exc,
      create: exc,
    });
    console.log(`  ✓ ${exc.title}`);
  }

  console.log("✓ Seed terminé");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
