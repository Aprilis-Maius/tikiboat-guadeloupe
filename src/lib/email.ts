import { Resend } from "resend";
import { excursions } from "@/data/excursions";

const resend = new Resend(process.env.RESEND_API_KEY);

// TODO: remplacer par "Tiki Boat <reservations@tiki-boat.com>" une fois tiki-boat.com vérifié sur Resend
const FROM  = "Tiki Boat <onboarding@resend.dev>";
const ADMIN = process.env.ADMIN_EMAIL_NOTIF ?? "contact@tiki-boat.com";

export interface ReservationData {
  customerName:   string;
  customerEmail:  string;
  customerPhone:  string;
  excursionTitle: string;
  excursionSlug?: string;
  date:           string;
  adults:         number;
  children:       number;
  infants?:       number;
  totalPrice:     number;
  depositAmount:  number;
  paymentType:    string;
  notes?:         string;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

// ─── Génère un fichier ICS (invitation calendrier) ─────────────────────────
function generateICS(data: ReservationData, exc: typeof excursions[0] | undefined): string {
  const [y, m, d] = data.date.split("-").map(Number);

  const parseTime = (t: string) => {
    const [h, min] = t.replace("h", ":").split(":").map(Number);
    return { h: h || 0, min: min || 0 };
  };

  const dep = parseTime(exc?.departureTime ?? "08:00");
  const ret = parseTime(exc?.returnTime    ?? "17:00");

  const pad = (n: number) => String(n).padStart(2, "0");
  const dtStart = `${y}${pad(m)}${pad(d)}T${pad(dep.h)}${pad(dep.min)}00`;
  const dtEnd   = `${y}${pad(m)}${pad(d)}T${pad(ret.h)}${pad(ret.min)}00`;

  const included = exc ? (exc.included as string[]).slice(0, 5).join(", ") : "";

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Tiki Boat//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:Tiki Boat — ${data.excursionTitle}`,
    `DESCRIPTION:Réservation au nom de ${data.customerName}\\nPassagers : ${data.adults + (data.children ?? 0)} pers.\\n${included ? `Inclus : ${included}` : ""}\\nContact : +590 690 49 58 48`,
    `LOCATION:${exc?.departurePoint ?? "Marina de Pointe-à-Pitre / Le Gosier"}, Guadeloupe`,
    `URL:https://tiki-boat.com`,
    `ORGANIZER;CN=Tiki Boat:mailto:reservations@tiki-boat.com`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

// ─── Email de confirmation client — version complète ──────────────────────
export async function sendConfirmationEmail(data: ReservationData) {
  const exc       = excursions.find(e => e.slug === data.excursionSlug || e.title === data.excursionTitle);
  const isDeposit = data.paymentType === "deposit";
  const remaining = data.totalPrice - data.depositAmount;
  const included  = exc?.included as string[] | undefined;
  const depTime   = exc?.departureTime ?? "08h00";
  const retTime   = exc?.returnTime    ?? "17h00";
  const depPoint  = exc?.departurePoint ?? "Marina de Pointe-à-Pitre / Le Gosier";

  const icsContent = generateICS(data, exc);
  const icsBase64  = Buffer.from(icsContent).toString("base64");

  const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{margin:0;padding:0;background:#f0f4f8;font-family:'Helvetica Neue',Arial,sans-serif}a{color:inherit}</style>
</head>
<body>
<div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

  <!-- Header -->
  <div style="background:#0A1E2E;padding:32px 40px;text-align:center;">
    <div style="font-size:32px;font-weight:900;color:#F5C842;letter-spacing:-1px;">TIKI BOAT</div>
    <div style="color:rgba(255,255,255,0.45);font-size:12px;margin-top:4px;letter-spacing:0.15em;text-transform:uppercase;">Excursions en mer · Guadeloupe</div>
  </div>

  <!-- Bannière verte -->
  <div style="background:#16a34a;padding:14px 40px;text-align:center;">
    <div style="color:#fff;font-weight:700;font-size:15px;">✅ Votre réservation est confirmée !</div>
  </div>

  <!-- Corps -->
  <div style="padding:36px 40px;">
    <p style="font-size:16px;color:#111;margin:0 0 8px;">Bonjour <strong>${data.customerName}</strong>,</p>
    <p style="font-size:14px;color:#555;line-height:1.7;margin:0 0 28px;">
      Nous avons bien reçu votre réservation pour <strong>${data.excursionTitle}</strong>.<br>
      Préparez-vous pour une journée inoubliable en mer ! 🌊
    </p>

    <!-- Encadré principal -->
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:24px;margin-bottom:24px;">
      <div style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:16px;">📋 Récapitulatif</div>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:5px 0;color:#64748b;">Excursion</td><td style="padding:5px 0;text-align:right;font-weight:600;color:#0f172a;">${data.excursionTitle}</td></tr>
        <tr><td style="padding:5px 0;color:#64748b;">Date</td><td style="padding:5px 0;text-align:right;font-weight:700;color:#0f172a;text-transform:capitalize;">${formatDate(data.date)}</td></tr>
        <tr><td style="padding:5px 0;color:#64748b;">Départ</td><td style="padding:5px 0;text-align:right;font-weight:600;color:#0f172a;">${depTime}</td></tr>
        <tr><td style="padding:5px 0;color:#64748b;">Retour prévu</td><td style="padding:5px 0;text-align:right;color:#0f172a;">${retTime}</td></tr>
        <tr><td style="padding:5px 0;color:#64748b;">Point de départ</td><td style="padding:5px 0;text-align:right;color:#0f172a;">${depPoint}</td></tr>
        <tr><td style="padding:5px 0;color:#64748b;">Passagers</td><td style="padding:5px 0;text-align:right;color:#0f172a;">${data.adults} adulte${data.adults > 1 ? "s" : ""}${data.children ? ` + ${data.children} enfant${data.children > 1 ? "s" : ""}` : ""}${data.infants ? ` + ${data.infants} bébé${data.infants > 1 ? "s" : ""}` : ""}</td></tr>
        <tr style="border-top:1px solid #e2e8f0;">
          <td style="padding:10px 0 5px;color:#64748b;">Total</td>
          <td style="padding:10px 0 5px;text-align:right;font-weight:800;color:#F5C842;font-size:18px;">${data.totalPrice.toFixed(2)} €</td>
        </tr>
        ${isDeposit ? `
        <tr><td style="padding:3px 0;color:#64748b;font-size:13px;">Acompte réglé (30%)</td><td style="padding:3px 0;text-align:right;color:#16a34a;font-weight:600;font-size:13px;">✓ ${data.depositAmount.toFixed(2)} €</td></tr>
        <tr>
          <td style="padding:3px 0;font-size:13px;font-weight:700;color:#b45309;">Solde à régler le jour J</td>
          <td style="padding:3px 0;text-align:right;font-weight:800;color:#b45309;font-size:14px;">${remaining.toFixed(2)} €</td>
        </tr>` : `
        <tr><td style="padding:3px 0;color:#64748b;font-size:13px;">Paiement</td><td style="padding:3px 0;text-align:right;color:#16a34a;font-weight:600;font-size:13px;">Intégralement réglé ✓</td></tr>`}
      </table>
    </div>

    <!-- Ce qui est inclus -->
    ${included && included.length > 0 ? `
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin-bottom:24px;">
      <div style="font-size:11px;font-weight:700;color:#15803d;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:12px;">✅ Ce qui est inclus</div>
      ${included.map(item => `<div style="font-size:13px;color:#166534;padding:3px 0;">• ${item}</div>`).join("")}
    </div>` : ""}

    <!-- Ce qu'il faut apporter -->
    <div style="background:#fefce8;border:1px solid #fde68a;border-radius:12px;padding:20px;margin-bottom:24px;">
      <div style="font-size:11px;font-weight:700;color:#b45309;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:12px;">🎒 Ce qu'il faut apporter</div>
      ${["Crème solaire et lunettes de soleil", "Tenue de bain et serviette", "Chaussures adaptées à l'eau", "Appareil photo (optionnel)", "Bonne humeur ! 🌞"]
        .map(item => `<div style="font-size:13px;color:#92400e;padding:3px 0;">• ${item}</div>`).join("")}
    </div>

    ${data.notes ? `
    <div style="background:#eff6ff;border-left:3px solid #3b82f6;padding:12px 16px;border-radius:0 8px 8px 0;margin-bottom:24px;">
      <div style="font-size:11px;font-weight:700;color:#1d4ed8;margin-bottom:4px;">📝 Votre remarque</div>
      <div style="font-size:13px;color:#1e40af;">${data.notes}</div>
    </div>` : ""}

    <!-- Contact -->
    <div style="background:#0A1E2E;border-radius:12px;padding:20px 24px;color:#fff;">
      <div style="font-size:12px;font-weight:700;color:#F5C842;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:12px;">📞 Contact & Informations</div>
      <table style="width:100%;font-size:13px;">
        <tr><td style="color:rgba(255,255,255,0.5);padding:4px 0;">Téléphone / WhatsApp</td><td style="text-align:right;color:#fff;font-weight:600;"><a href="tel:+590690495848" style="color:#F5C842;">+590 690 49 58 48</a></td></tr>
        <tr><td style="color:rgba(255,255,255,0.5);padding:4px 0;">Email</td><td style="text-align:right;color:#fff;"><a href="mailto:contact@tiki-boat.com" style="color:rgba(255,255,255,0.7);">contact@tiki-boat.com</a></td></tr>
        <tr><td style="color:rgba(255,255,255,0.5);padding:4px 0;">Site web</td><td style="text-align:right;"><a href="https://tiki-boat.com" style="color:#F5C842;">tiki-boat.com</a></td></tr>
      </table>
    </div>
  </div>

  <!-- Footer -->
  <div style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
    <p style="font-size:11px;color:#94a3b8;margin:0;">Tiki Boat · Marina de Pointe-à-Pitre, Guadeloupe 97110</p>
    <p style="font-size:11px;color:#94a3b8;margin:4px 0 0;">Cet email confirme votre réservation — conservez-le précieusement.</p>
  </div>
</div>
</body>
</html>`;

  return resend.emails.send({
    from: FROM,
    to:   data.customerEmail,
    subject: `✅ Réservation confirmée — ${data.excursionTitle} · ${formatDate(data.date)}`,
    html,
    attachments: [{
      filename:    "tikiboat-reservation.ics",
      content:     icsBase64,
      contentType: "text/calendar; charset=utf-8; method=PUBLISH",
    }],
  });
}

// ─── Notification admin ─────────────────────────────────────────────────────
export async function sendAdminNotification(data: ReservationData) {
  const pax       = data.adults + (data.children ?? 0);
  const isDeposit = data.paymentType === "deposit";
  const exc       = excursions.find(e => e.slug === data.excursionSlug || e.title === data.excursionTitle);

  const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Helvetica Neue',Arial,sans-serif;">
<div style="max-width:520px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
  <div style="background:#0A1E2E;padding:18px 28px;display:flex;align-items:center;gap:12px;">
    <span style="font-size:20px;">🆕</span>
    <div>
      <div style="color:#F5C842;font-weight:700;font-size:15px;">Nouvelle réservation</div>
      <div style="color:rgba(255,255,255,0.4);font-size:12px;">${data.excursionTitle} · ${formatDate(data.date)}</div>
    </div>
  </div>
  <div style="padding:24px 28px;">
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:5px 0;color:#64748b;width:130px;">Client</td><td style="padding:5px 0;font-weight:700;color:#0f172a;">${data.customerName}</td></tr>
      <tr><td style="padding:5px 0;color:#64748b;">Téléphone</td><td style="padding:5px 0;"><a href="tel:${data.customerPhone}" style="color:#0A1E2E;font-weight:600;">${data.customerPhone}</a></td></tr>
      <tr><td style="padding:5px 0;color:#64748b;">Email</td><td style="padding:5px 0;"><a href="mailto:${data.customerEmail}" style="color:#0A1E2E;">${data.customerEmail}</a></td></tr>
      <tr style="border-top:1px solid #f1f5f9;">
        <td style="padding:8px 0 5px;color:#64748b;">Excursion</td><td style="padding:8px 0 5px;font-weight:600;">${data.excursionTitle}</td>
      </tr>
      <tr><td style="padding:5px 0;color:#64748b;">Date</td><td style="padding:5px 0;font-weight:700;text-transform:capitalize;">${formatDate(data.date)}</td></tr>
      <tr><td style="padding:5px 0;color:#64748b;">Départ</td><td style="padding:5px 0;">${exc?.departureTime ?? "08h00"} → ${exc?.returnTime ?? "17h00"}</td></tr>
      <tr><td style="padding:5px 0;color:#64748b;">Passagers</td><td style="padding:5px 0;">${data.adults} adulte${data.adults > 1 ? "s" : ""}${data.children ? ` + ${data.children} enfant${data.children > 1 ? "s" : ""}` : ""}${data.infants ? ` + ${data.infants} bébé${data.infants > 1 ? "s" : ""}` : ""} <strong>(${pax} pers.)</strong></td></tr>
      <tr style="border-top:1px solid #f1f5f9;">
        <td style="padding:8px 0 4px;color:#64748b;">Total</td>
        <td style="padding:8px 0 4px;font-weight:800;color:#F5C842;font-size:18px;">${data.totalPrice.toFixed(2)} €</td>
      </tr>
      <tr>
        <td style="padding:4px 0;color:#64748b;font-size:13px;">Paiement</td>
        <td style="padding:4px 0;font-weight:600;font-size:13px;color:${isDeposit ? "#b45309" : "#16a34a"};">
          ${isDeposit ? `Acompte ${data.depositAmount.toFixed(2)} € — reste <strong>${(data.totalPrice - data.depositAmount).toFixed(2)} € à encaisser</strong>` : "Intégralement réglé ✓"}
        </td>
      </tr>
      ${data.notes ? `<tr><td style="padding:5px 0;color:#64748b;">Notes</td><td style="padding:5px 0;color:#555;font-style:italic;">${data.notes}</td></tr>` : ""}
    </table>
    <div style="margin-top:20px;padding-top:16px;border-top:1px solid #f1f5f9;">
      <a href="https://tiki-boat.com/admin/reservations" style="display:inline-block;background:#F5C842;color:#0A1E2E;font-weight:700;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:13px;">Voir dans l'admin →</a>
    </div>
  </div>
</div>
</body>
</html>`;

  return resend.emails.send({
    from: FROM,
    to:   ADMIN,
    subject: `🆕 ${data.customerName} — ${data.excursionTitle} — ${formatDate(data.date)} (${pax} pers.)`,
    html,
  });
}
