-- AlterTable
ALTER TABLE "Excursion" ADD COLUMN     "priceAdultHighSeason" DOUBLE PRECISION,
ADD COLUMN     "priceChildHighSeason" DOUBLE PRECISION;

-- Reprend les tarifs haute saison jusqu'ici codes en dur (src/data/excursions.ts),
-- pour que le comportement du site reste identique et que l'admin affiche
-- les valeurs reelles au lieu de champs vides.
UPDATE "Excursion"
SET "priceAdultHighSeason" = 120, "priceChildHighSeason" = 90
WHERE "slug" = 'grand-cul-de-sac-marin';
