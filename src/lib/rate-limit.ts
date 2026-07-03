// Rate limiter en mémoire — par instance serverless.
// Sur Vercel, chaque lambda chaude garde sa Map : ce n'est pas une garantie
// absolue multi-instances, mais ça bloque efficacement les boucles de spam
// (qui tapent en rafale la même instance chaude).

const buckets = new Map<string, number[]>();
const MAX_KEYS = 5000; // borne mémoire

export function rateLimit(key: string, maxRequests: number, windowMs: number): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();
  const windowStart = now - windowMs;

  // Purge opportuniste si trop de clés
  if (buckets.size > MAX_KEYS) {
    for (const [k, times] of buckets) {
      if (times.every((t) => t < windowStart)) buckets.delete(k);
    }
  }

  const times = (buckets.get(key) ?? []).filter((t) => t >= windowStart);
  if (times.length >= maxRequests) {
    const oldest = Math.min(...times);
    return { ok: false, retryAfterSec: Math.ceil((oldest + windowMs - now) / 1000) };
  }
  times.push(now);
  buckets.set(key, times);
  return { ok: true, retryAfterSec: 0 };
}

export function clientIp(req: Request): string {
  // Vercel place l'IP réelle en tête de x-forwarded-for
  const fwd = req.headers.get("x-forwarded-for");
  return fwd ? fwd.split(",")[0].trim() : "unknown";
}
