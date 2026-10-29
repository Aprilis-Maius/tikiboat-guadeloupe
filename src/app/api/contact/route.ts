import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = process.env.EMAIL_FROM ?? "Tiki Boat <onboarding@resend.dev>";
const TO     = process.env.ADMIN_EMAIL_NOTIF ?? "tikiboatguadeloupe@gmail.com";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
}

export async function POST(req: NextRequest) {
  try {
    // 3 messages / 10 min par IP — bloque le spam qui brûle le quota Resend
    const limit = rateLimit(`contact:${clientIp(req)}`, 3, 10 * 60 * 1000);
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Trop de messages envoyés. Réessayez dans quelques minutes ou contactez-nous sur WhatsApp." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
      );
    }

    const body = await req.json() as Record<string, unknown>;

    // Bornage serveur des longueurs (le formulaire n'en impose aucune)
    const name    = String(body.name    ?? "").trim().slice(0, 120);
    const email   = String(body.email   ?? "").trim().slice(0, 200);
    const phone   = String(body.phone   ?? "").trim().slice(0, 40);
    // Sans \r\n : le sujet part dans l'en-tête Subject de l'email
    const subject = String(body.subject ?? "").replace(/[\r\n]/g, "").trim().slice(0, 150);
    const message = String(body.message ?? "").trim().slice(0, 5000);

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Adresse email invalide" }, { status: 400 });
    }

    const safeName    = esc(name);
    const safeEmail   = esc(email);
    const safePhone   = esc(phone);
    const safeSubject = esc(subject);
    const safeMessage = esc(message);

    const { error } = await resend.emails.send({
      from: FROM,
      to:   TO,
      replyTo: email,
      subject: `[Contact Tiki Boat] ${safeSubject || "Nouveau message"}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h2 style="color:#0088cc;margin-bottom:16px">Nouveau message — Tiki Boat</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 0;color:#64748b;font-size:14px;width:120px">Nom</td><td style="padding:8px 0;font-size:14px;font-weight:600">${safeName}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Email</td><td style="padding:8px 0;font-size:14px"><a href="mailto:${safeEmail}" style="color:#0088cc">${safeEmail}</a></td></tr>
            ${safePhone ? `<tr><td style="padding:8px 0;color:#64748b;font-size:14px">Téléphone</td><td style="padding:8px 0;font-size:14px">${safePhone}</td></tr>` : ""}
            ${safeSubject ? `<tr><td style="padding:8px 0;color:#64748b;font-size:14px">Sujet</td><td style="padding:8px 0;font-size:14px">${safeSubject}</td></tr>` : ""}
          </table>
          <div style="margin-top:20px;padding:16px;background:#f8fafc;border-radius:8px;font-size:14px;line-height:1.6;white-space:pre-wrap">${safeMessage}</div>
          <p style="margin-top:24px;font-size:12px;color:#94a3b8">Répondre directement à cet email pour contacter ${safeName}.</p>
        </div>
      `,
    });

    // Resend v6 ne lève pas d'exception sur une erreur d'API : elle arrive dans `error`
    if (error) {
      console.error("[POST /api/contact] Resend", error);
      return NextResponse.json(
        { error: "L'envoi a échoué. Réessayez dans un instant ou contactez-nous directement sur WhatsApp." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/contact]", err);
    return NextResponse.json({ error: "Échec de l'envoi" }, { status: 500 });
  }
}
