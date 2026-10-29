import { prisma } from "@/lib/prisma";

// Export JSON de toutes les tables (cron hebdomadaire + sauvegarde manuelle).
// Restauration : scripts/restore-backup.ts
export async function exportDatabase() {
  return {
    exportedAt:   new Date().toISOString(),
    excursions:   await prisma.excursion.findMany(),
    blogPosts:    await prisma.blogPost.findMany(),
    galleryItems: await prisma.galleryItem.findMany(),
    siteContent:  await prisma.siteContent.findMany(),
    availability: await prisma.availability.findMany(),
    reservations: await prisma.reservation.findMany(),
  };
}
