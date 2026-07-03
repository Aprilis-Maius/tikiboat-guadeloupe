import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(price);
}

// Parse "YYYY-MM-DD" en date locale à midi — évite le décalage d'un jour
// pour les fuseaux négatifs (Guadeloupe UTC-4) : new Date("2026-07-10")
// serait minuit UTC, affiché "9 juillet" en heure locale.
export function parseDateSafe(dateString: string): Date {
  const [y, m, d] = dateString.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 12, 0, 0);
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(parseDateSafe(dateString));
}

export function formatShortDate(dateString: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parseDateSafe(dateString));
}

// "YYYY-MM-DD" du jour en heure locale (pas UTC)
export function todayYMD(): string {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
}

export function calculateTotal(adults: number, children: number, priceAdult: number, priceChild: number): number {
  return adults * priceAdult + children * priceChild;
}

export function calculateDeposit(total: number, depositPercent = 30): number {
  return Math.ceil((total * depositPercent) / 100);
}

// Haute saison : 31 octobre → 30 avril
export function isHighSeason(dateStr: string): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr + "T12:00:00");
  const month = d.getMonth() + 1; // 1-12
  const day   = d.getDate();
  if (month >= 11 || month <= 4) return true;       // Nov→Avr entiers
  if (month === 10 && day >= 31) return true;        // 31 oct
  return false;
}

export function getSeasonalPrices(
  dateStr: string,
  priceAdult: number,
  priceChild: number,
  priceAdultHighSeason?: number,
  priceChildHighSeason?: number,
): { priceAdult: number; priceChild: number; isHigh: boolean } {
  const isHigh = isHighSeason(dateStr);
  return {
    priceAdult: isHigh && priceAdultHighSeason ? priceAdultHighSeason : priceAdult,
    priceChild: isHigh && priceChildHighSeason ? priceChildHighSeason : priceChild,
    isHigh,
  };
}
