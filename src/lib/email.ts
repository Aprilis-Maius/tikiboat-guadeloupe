import { Resend } from "resend";
import { excursions } from "@/data/excursions";

const resend   = new Resend(process.env.RESEND_API_KEY);
const FROM     = "Tiki Boat <onboarding@resend.dev>"; // TODO → reservations@tikiboat.fr après vérif domaine
const ADMIN    = process.env.ADMIN_EMAIL_NOTIF ?? "tikiboatguadeloupe@gmail.com";
const SITE_URL = "https://tiki-boat-iota.vercel.app"; // TODO → https://tikiboat.fr

const LOGO = "https://raw.githubusercontent.com/MaxenceF972/tiki-boat/main/public/logo.png";

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

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function row(label: string, value: string, opts: { bold?: boolean; color?: string; large?: boolean } = {}) {
  return `<tr>
    <td style="padding:7px 0;color:#94a3b8;font-size:13px;width:140px;vertical-align:top;">${label}</td>
    <td style="padding:7px 0;text-align:right;font-size:${opts.large ? "17px" : "13px"};font-weight:${opts.bold ? "700" : "500"};color:${opts.color ?? "#0f172a"};vertical-align:top;">${value}</td>
  </tr>`;
}

function divider() {
  return `<tr><td colspan="2" style="padding:4px 0;"><div style="height:1px;background:#f1f5f9;"></div></td></tr>`;
}

// ─── Génère un fichier ICS ──────────────────────────────────────────────────
function generateICS(data: ReservationData, exc: typeof excursions[0] | undefined): string {
  const [y, m, d] = data.date.split("-").map(Number);
  const parseTime = (t: string) => { const [h, min] = t.replace("h", ":").split(":").map(Number); return { h: h || 0, min: min || 0 }; };
  const dep = parseTime(exc?.departureTime ?? "08:00");
  const ret = parseTime(exc?.returnTime    ?? "17:00");
  const pad = (n: number) => String(n).padStart(2, "0");
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Tiki Boat//FR", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `DTSTART:${y}${pad(m)}${pad(d)}T${pad(dep.h)}${pad(dep.min)}00`,
    `DTEND:${y}${pad(m)}${pad(d)}T${pad(ret.h)}${pad(ret.min)}00`,
    `SUMMARY:Tiki Boat — ${data.excursionTitle}`,
    `DESCRIPTION:${data.excursionTitle}\\nPassagers : ${data.adults + (data.children ?? 0)} pers.\\nContact : +590 690 49 58 48`,
    `LOCATION:${exc?.departurePoint ?? "Marina de Pointe-à-Pitre"}, Guadeloupe`,
    `URL:https://tikiboat.fr`,
    "STATUS:CONFIRMED",
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
}

// ─── Bloc logo réutilisable ─────────────────────────────────────────────────
function logoHeader(subtitle: string, badgeBg = "#16a34a", badgeText = "✅ Réservation confirmée") {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0088cc;border-radius:14px 14px 0 0;">
    <tr>
      <td style="padding:20px 16px 20px 28px;vertical-align:middle;width:55%;">
        <img src="${LOGO}" alt="TIKI BOAT" width="160"
             style="display:block;width:160px;height:auto;max-height:56px;object-fit:contain;" />
      </td>
      <td style="padding:20px 28px 20px 8px;text-align:right;vertical-align:middle;">
        <span style="display:inline-block;background:${badgeBg};color:#fff;font-size:12px;font-weight:700;padding:7px 16px;border-radius:20px;white-space:nowrap;">${badgeText}</span>
        <div style="color:rgba(255,255,255,0.75);font-size:11px;margin-top:6px;white-space:nowrap;">${subtitle}</div>
      </td>
    </tr>
  </table>`;
}

// ─── Email confirmation client ──────────────────────────────────────────────
export async function sendConfirmationEmail(data: ReservationData) {
  const exc       = excursions.find(e => e.slug === data.excursionSlug || e.title === data.excursionTitle);
  const isDeposit = data.paymentType === "deposit";
  const remaining = data.totalPrice - data.depositAmount;
  const included  = exc?.included as string[] | undefined;
  const depTime   = exc?.departureTime ?? "08h00";
  const retTime   = exc?.returnTime    ?? "17h00";
  const depPoint  = exc?.departurePoint ?? "Marina de Pointe-à-Pitre / Le Gosier";
  const icsBase64 = Buffer.from(generateICS(data, exc)).toString("base64");
  const pax       = `${data.adults} adulte${data.adults > 1 ? "s" : ""}${data.children ? ` + ${data.children} enfant${data.children > 1 ? "s" : ""}` : ""}${data.infants ? ` + ${data.infants} bébé${data.infants > 1 ? "s" : ""}` : ""}`;

  const html = `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f9ff;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0f9ff;padding:32px 16px;">
<tr><td align="center">
<table width="580" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;width:100%;">

  <!-- Header avec logo -->
  <tr><td>${logoHeader("Excursions en mer · Guadeloupe")}</td></tr>

  <!-- Corps blanc -->
  <tr><td style="background:#ffffff;padding:32px;">

    <p style="font-size:16px;font-weight:700;color:#0f172a;margin:0 0 6px;">Bonjour ${data.customerName},</p>
    <p style="font-size:14px;color:#64748b;line-height:1.7;margin:0 0 28px;">
      Votre réservation pour <strong style="color:#0f172a;">${data.excursionTitle}</strong> est confirmée. Nous avons hâte de vous accueillir à bord !
    </p>

    <!-- Récap -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;margin-bottom:20px;">
      <tr><td style="padding:16px 20px 10px;">
        <p style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 14px;">📋 Récapitulatif</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          ${row("Excursion", `<strong>${data.excursionTitle}</strong>`)}
          ${divider()}
          ${row("Date", `<strong>${formatDate(data.date)}</strong>`)}
          ${row("Départ", `<strong style="color:#0088cc;">${depTime}</strong>`)}
          ${row("Retour prévu", retTime)}
          ${row("Point de RDV", depPoint)}
          ${divider()}
          ${row("Passagers", pax)}
          ${divider()}
          ${row("Total", `<strong style="color:#d97706;font-size:17px;">${data.totalPrice.toFixed(2)} €</strong>`)}
          ${isDeposit
            ? row("Acompte réglé (30%)", `<span style="color:#16a34a;font-weight:600;">✓ ${data.depositAmount.toFixed(2)} €</span>`) +
              row("Solde à régler le jour J", `<strong style="color:#dc2626;">${remaining.toFixed(2)} €</strong>`)
            : row("Paiement", `<span style="color:#16a34a;font-weight:600;">Intégralement réglé ✓</span>`)}
        </table>
      </td></tr>
    </table>

    <!-- Inclus -->
    ${included?.length ? `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;margin-bottom:20px;">
      <tr><td style="padding:16px 20px;">
        <p style="font-size:10px;font-weight:700;color:#15803d;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 10px;">✅ Ce qui est inclus</p>
        ${included.map(i => `<p style="font-size:13px;color:#166534;margin:3px 0;">• ${i}</p>`).join("")}
      </td></tr>
    </table>` : ""}

    <!-- À apporter -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;margin-bottom:20px;">
      <tr><td style="padding:16px 20px;">
        <p style="font-size:10px;font-weight:700;color:#b45309;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 10px;">🎒 À apporter le jour J</p>
        ${["Crème solaire & lunettes de soleil", "Maillot de bain et serviette", "Chaussures adaptées à l'eau", "Appareil photo (optionnel)", "Bonne humeur ! 🌞"]
          .map(i => `<p style="font-size:13px;color:#92400e;margin:3px 0;">• ${i}</p>`).join("")}
      </td></tr>
    </table>

    ${data.notes ? `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-left:4px solid #3b82f6;background:#eff6ff;border-radius:0 8px 8px 0;margin-bottom:20px;">
      <tr><td style="padding:12px 16px;">
        <p style="font-size:10px;font-weight:700;color:#1d4ed8;margin:0 0 4px;">📝 Votre remarque</p>
        <p style="font-size:13px;color:#1e40af;margin:0;">${data.notes}</p>
      </td></tr>
    </table>` : ""}

    <!-- Contact -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0088cc;border-radius:10px;">
      <tr><td style="padding:18px 20px;">
        <p style="font-size:10px;font-weight:700;color:#F5C842;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 12px;">📞 Une question ?</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:13px;">
          <tr><td style="color:rgba(255,255,255,0.5);padding:4px 0;">Tél / WhatsApp</td><td align="right"><a href="tel:+590690495848" style="color:#F5C842;font-weight:600;text-decoration:none;">+590 690 49 58 48</a></td></tr>
          <tr><td style="color:rgba(255,255,255,0.5);padding:4px 0;">Email</td><td align="right"><a href="mailto:tikiboatguadeloupe@gmail.com" style="color:rgba(255,255,255,0.6);text-decoration:none;">tikiboatguadeloupe@gmail.com</a></td></tr>
        </table>
      </td></tr>
    </table>

  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#e0f2fe;border-radius:0 0 14px 14px;padding:14px 32px;text-align:center;">
    <p style="font-size:11px;color:#94a3b8;margin:0;">Tiki Boat · Marina de Pointe-à-Pitre, Guadeloupe</p>
    <p style="font-size:11px;color:#94a3b8;margin:4px 0 0;">📎 Fichier calendrier joint — cliquez pour ajouter à votre agenda</p>
  </td></tr>

</table>
</td></tr></table>
</body></html>`;

  return resend.emails.send({
    from: FROM,
    to:   data.customerEmail,
    subject: `✅ Réservation confirmée — ${data.excursionTitle} · ${formatDate(data.date)}`,
    html,
    attachments: [{ filename: "tikiboat-reservation.ics", content: icsBase64, contentType: "text/calendar; charset=utf-8; method=PUBLISH" }],
  });
}

// ─── Notification admin ─────────────────────────────────────────────────────
export async function sendAdminNotification(data: ReservationData) {
  const exc       = excursions.find(e => e.slug === data.excursionSlug || e.title === data.excursionTitle);
  const pax       = data.adults + (data.children ?? 0);
  const isDeposit = data.paymentType === "deposit";
  const remaining = data.totalPrice - data.depositAmount;

  const html = `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f0f9ff;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0f9ff;padding:32px 16px;">
<tr><td align="center">
<table width="520" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;width:100%;">

  <!-- Header -->
  <tr><td>${logoHeader(`${data.excursionTitle} · ${formatDate(data.date)}`, isDeposit ? "#d97706" : "#16a34a", isDeposit ? "💰 Acompte reçu" : "✅ Paiement intégral")}</td></tr>

  <!-- Bandeau montant -->
  <tr><td style="background:${isDeposit ? "#d97706" : "#16a34a"};padding:10px 24px;">
    <p style="color:#fff;font-size:13px;font-weight:700;margin:0;">
      ${isDeposit
        ? `Acompte de ${data.depositAmount.toFixed(2)} € encaissé — Solde à récupérer le jour J : <strong>${remaining.toFixed(2)} €</strong>`
        : `Paiement intégral reçu : ${data.totalPrice.toFixed(2)} €`}
    </p>
  </td></tr>

  <!-- Corps -->
  <tr><td style="background:#ffffff;padding:24px;">

    <!-- Client -->
    <p style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 10px;">👤 Client</p>
    <p style="font-size:15px;font-weight:700;color:#0f172a;margin:0 0 4px;">${data.customerName}</p>
    <p style="font-size:13px;margin:0 0 3px;"><a href="tel:${data.customerPhone}" style="color:#0088cc;text-decoration:none;font-weight:600;">${data.customerPhone}</a></p>
    <p style="font-size:13px;margin:0 0 20px;"><a href="mailto:${data.customerEmail}" style="color:#2563eb;text-decoration:none;">${data.customerEmail}</a></p>

    <hr style="border:none;border-top:1px solid #f1f5f9;margin:0 0 20px;" />

    <!-- Réservation -->
    <p style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 10px;">📅 Réservation</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:13px;">
      ${row("Excursion", `<strong>${data.excursionTitle}</strong>`)}
      ${row("Date", `<strong>${formatDate(data.date)}</strong>`)}
      ${row("Horaires", `${exc?.departureTime ?? "08h00"} → ${exc?.returnTime ?? "17h00"}`)}
      ${row("Passagers", `${data.adults} adulte${data.adults > 1 ? "s" : ""}${data.children ? ` + ${data.children} enfant${data.children > 1 ? "s" : ""}` : ""}${data.infants ? ` + ${data.infants} bébé${data.infants > 1 ? "s" : ""}` : ""} <strong>(${pax} pers.)</strong>`)}
    </table>

    <hr style="border:none;border-top:1px solid #f1f5f9;margin:20px 0;" />

    <!-- Paiement -->
    <p style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 10px;">💳 Paiement</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:13px;margin-bottom:20px;">
      ${row("Total", `<strong style="color:#d97706;font-size:17px;">${data.totalPrice.toFixed(2)} €</strong>`)}
      ${isDeposit
        ? row("Acompte reçu", `<span style="color:#16a34a;font-weight:600;">✓ ${data.depositAmount.toFixed(2)} €</span>`) +
          row("Solde à encaisser", `<strong style="color:#dc2626;font-size:15px;">${remaining.toFixed(2)} €</strong>`)
        : row("Statut", `<span style="color:#16a34a;font-weight:600;">Intégralement réglé ✓</span>`)}
      ${data.notes ? row("Notes client", `<em style="color:#64748b;">${data.notes}</em>`) : ""}
    </table>

    <!-- CTA -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td align="center" style="background:#F5C842;border-radius:8px;padding:14px 20px;">
        <a href="${SITE_URL}/admin/reservations" style="color:#0088cc;font-weight:800;font-size:14px;text-decoration:none;">
          Voir la réservation dans l'admin →
        </a>
      </td></tr>
    </table>

  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#e0f2fe;border-radius:0 0 14px 14px;padding:12px 24px;text-align:center;">
    <p style="font-size:11px;color:#94a3b8;margin:0;">Tiki Boat Administration · tikiboat.fr</p>
  </td></tr>

</table>
</td></tr></table>
</body></html>`;

  return resend.emails.send({
    from: FROM,
    to:   ADMIN,
    subject: `🆕 ${data.customerName} — ${data.excursionTitle} — ${formatDate(data.date)} (${pax} pers.)`,
    html,
  });
}
