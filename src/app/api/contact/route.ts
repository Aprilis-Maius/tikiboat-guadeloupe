import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = process.env.EMAIL_FROM ?? "Tiki Boat <onboarding@resend.dev>";
const TO     = process.env.ADMIN_EMAIL_NOTIF ?? "tikiboatguadeloupe@gmail.com";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, message } = body as Record<string, string>;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }

    const safeName    = esc(String(name));
    const safeEmail   = esc(String(email));
    const safePhone   = esc(String(phone ?? ""));
    const safeSubject = esc(String(subject ?? ""));
    const safeMessage = esc(String(message));

    await resend.emails.send({
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

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/contact]", err);
    return NextResponse.json({ error: "Échec de l'envoi" }, { status: 500 });
  }
}
