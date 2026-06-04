import { Resend } from "resend";
import { excursions } from "@/data/excursions";

const resend   = new Resend(process.env.RESEND_API_KEY);
const FROM     = "Tiki Boat <onboarding@resend.dev>"; // TODO → reservations@tiki-boat.com après vérif domaine
const ADMIN    = process.env.ADMIN_EMAIL_NOTIF ?? "contact@tiki-boat.com";
const BASE_URL = process.env.NEXTAUTH_URL?.replace("http://localhost:3000", "https://tiki-boat-iota.vercel.app") ?? "https://tiki-boat-iota.vercel.app";
const LOGO     = `${BASE_URL}/logo.png`;

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
    `URL:https://tiki-boat.com`,
    "STATUS:CONFIRMED",
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
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

  const html = `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<div style="max-width:580px;margin:32px auto;">

  <!-- Header -->
  <div style="background:#0A1E2E;border-radius:16px 16px 0 0;padding:28px 36px;text-align:center;">
    <img src="${LOGO}" alt="Tiki Boat" height="52" style="height:52px;width:auto;margin-bottom:12px;" />
    <div style="display:inline-block;background:#16a34a;color:#fff;font-size:13px;font-weight:700;padding:6px 16px;border-radius:20px;margin-top:4px;">
      ✅ Réservation confirmée
    </div>
  </div>

  <!-- Corps -->
  <div style="background:#ffffff;padding:32px 36px;">

    <p style="font-size:16px;color:#0f172a;margin:0 0 6px;font-weight:600;">Bonjour ${data.customerName},</p>
    <p style="font-size:14px;color:#64748b;line-height:1.7;margin:0 0 28px;">
      Votre réservation pour <strong style="color:#0f172a;">${data.excursionTitle}</strong> est confirmée.<br>
      Nous avons hâte de vous accueillir à bord ! 🌊
    </p>

    <!-- Carte infos principales -->
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px 24px;margin-bottom:20px;">
      <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:14px;">📋 Récapitulatif</div>
      <table style="width:100%;border-collapse:collapse;">
        ${row("Excursion", `<strong>${data.excursionTitle}</strong>`)}
        ${divider()}
        ${row("Date", `<strong style="text-transform:capitalize;">${formatDate(data.date)}</strong>`, { bold: true })}
        ${row("Départ", depTime, { bold: true, color: "#0A1E2E" })}
        ${row("Retour prévu", retTime)}
        ${row("Point de RDV", depPoint)}
        ${divider()}
        ${row("Passagers", `${data.adults} adulte${data.adults > 1 ? "s" : ""}${data.children ? ` + ${data.children} enfant${data.children > 1 ? "s" : ""}` : ""}${data.infants ? ` + ${data.infants} bébé${data.infants > 1 ? "s" : ""}` : ""}`)}
        ${divider()}
        ${row("Total", `<strong style="color:#F5C842;font-size:18px;">${data.totalPrice.toFixed(2)} €</strong>`)}
        ${isDeposit
          ? row("Acompte réglé (30%)", `<span style="color:#16a34a;font-weight:600;">✓ ${data.depositAmount.toFixed(2)} €</span>`) +
            row("Solde à régler le jour J", `<strong style="color:#d97706;">${remaining.toFixed(2)} €</strong>`)
          : row("Paiement", `<span style="color:#16a34a;font-weight:600;">Intégralement réglé ✓</span>`)}
      </table>
    </div>

    <!-- Ce qui est inclus -->
    ${included?.length ? `
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:18px 24px;margin-bottom:20px;">
      <div style="font-size:11px;font-weight:700;color:#15803d;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:10px;">✅ Ce qui est inclus</div>
      <div style="display:grid;gap:4px;">${included.map(i => `<div style="font-size:13px;color:#166534;">• ${i}</div>`).join("")}</div>
    </div>` : ""}

    <!-- Ce qu'il faut apporter -->
    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:18px 24px;margin-bottom:20px;">
      <div style="font-size:11px;font-weight:700;color:#b45309;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:10px;">🎒 À apporter le jour J</div>
      <div style="display:grid;gap:4px;">${["Crème solaire & lunettes de soleil", "Maillot de bain et serviette", "Chaussures adaptées à l'eau", "Appareil photo (optionnel)", "Bonne humeur ! 🌞"].map(i => `<div style="font-size:13px;color:#92400e;">• ${i}</div>`).join("")}</div>
    </div>

    ${data.notes ? `
    <div style="background:#eff6ff;border-left:4px solid #3b82f6;padding:12px 16px;border-radius:0 8px 8px 0;margin-bottom:20px;">
      <div style="font-size:11px;font-weight:700;color:#1d4ed8;margin-bottom:4px;">📝 Votre remarque</div>
      <div style="font-size:13px;color:#1e40af;">${data.notes}</div>
    </div>` : ""}

    <!-- Contact -->
    <div style="background:#0A1E2E;border-radius:12px;padding:18px 24px;">
      <div style="font-size:11px;font-weight:700;color:#F5C842;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:12px;">📞 Une question ?</div>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <tr><td style="color:rgba(255,255,255,0.5);padding:4px 0;">Tél / WhatsApp</td><td style="text-align:right;"><a href="tel:+590690495848" style="color:#F5C842;font-weight:600;text-decoration:none;">+590 690 49 58 48</a></td></tr>
        <tr><td style="color:rgba(255,255,255,0.5);padding:4px 0;">Email</td><td style="text-align:right;"><a href="mailto:contact@tiki-boat.com" style="color:rgba(255,255,255,0.6);text-decoration:none;">contact@tiki-boat.com</a></td></tr>
        <tr><td style="color:rgba(255,255,255,0.5);padding:4px 0;">Site</td><td style="text-align:right;"><a href="https://tiki-boat.com" style="color:#F5C842;text-decoration:none;">tiki-boat.com</a></td></tr>
      </table>
    </div>
  </div>

  <!-- Footer -->
  <div style="background:#e2e8f0;border-radius:0 0 16px 16px;padding:16px 36px;text-align:center;">
    <p style="font-size:11px;color:#94a3b8;margin:0;">Tiki Boat · Marina de Pointe-à-Pitre, Guadeloupe · tiki-boat.com</p>
    <p style="font-size:11px;color:#94a3b8;margin:4px 0 0;">📎 Un fichier calendrier est joint à cet email — cliquez dessus pour ajouter la sortie à votre agenda.</p>
  </div>
</div>
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
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<div style="max-width:520px;margin:32px auto;">

  <!-- Header -->
  <div style="background:#0A1E2E;border-radius:16px 16px 0 0;padding:22px 28px;display:table;width:100%;box-sizing:border-box;">
    <div style="display:table-cell;vertical-align:middle;width:60px;">
      <img src="${LOGO}" alt="Tiki Boat" height="40" style="height:40px;width:auto;" />
    </div>
    <div style="display:table-cell;vertical-align:middle;padding-left:14px;">
      <div style="color:#F5C842;font-weight:800;font-size:15px;">🆕 Nouvelle réservation</div>
      <div style="color:rgba(255,255,255,0.45);font-size:12px;margin-top:2px;text-transform:capitalize;">${data.excursionTitle} · ${formatDate(data.date)}</div>
    </div>
  </div>

  <!-- Bandeau paiement -->
  <div style="background:${isDeposit ? "#d97706" : "#16a34a"};padding:10px 28px;">
    <span style="color:#fff;font-size:13px;font-weight:700;">
      ${isDeposit ? `💰 Acompte de ${data.depositAmount.toFixed(2)} € — Solde à encaisser : ${remaining.toFixed(2)} €` : `✅ Paiement intégral reçu — ${data.totalPrice.toFixed(2)} €`}
    </span>
  </div>

  <!-- Corps -->
  <div style="background:#fff;padding:24px 28px;">

    <!-- Client -->
    <div style="margin-bottom:20px;">
      <div style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:10px;">👤 Client</div>
      <div style="font-size:15px;font-weight:700;color:#0f172a;margin-bottom:6px;">${data.customerName}</div>
      <div style="font-size:13px;margin-bottom:3px;"><a href="tel:${data.customerPhone}" style="color:#0A1E2E;text-decoration:none;font-weight:600;">${data.customerPhone}</a></div>
      <div style="font-size:13px;"><a href="mailto:${data.customerEmail}" style="color:#3b82f6;text-decoration:none;">${data.customerEmail}</a></div>
    </div>

    <div style="height:1px;background:#f1f5f9;margin-bottom:20px;"></div>

    <!-- Réservation -->
    <div style="margin-bottom:20px;">
      <div style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:10px;">📅 Réservation</div>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        ${row("Excursion", `<strong>${data.excursionTitle}</strong>`)}
        ${row("Date", `<strong style="text-transform:capitalize;">${formatDate(data.date)}</strong>`)}
        ${row("Horaires", `${exc?.departureTime ?? "08h00"} → ${exc?.returnTime ?? "17h00"}`)}
        ${row("Passagers", `${data.adults} adulte${data.adults > 1 ? "s" : ""}${data.children ? ` + ${data.children} enfant${data.children > 1 ? "s" : ""}` : ""}${data.infants ? ` + ${data.infants} bébé${data.infants > 1 ? "s" : ""}` : ""} <strong>(${pax} pers.)</strong>`)}
      </table>
    </div>

    <div style="height:1px;background:#f1f5f9;margin-bottom:20px;"></div>

    <!-- Paiement -->
    <div style="margin-bottom:24px;">
      <div style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:10px;">💳 Paiement</div>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        ${row("Total", `<strong style="color:#F5C842;font-size:17px;">${data.totalPrice.toFixed(2)} €</strong>`)}
        ${isDeposit
          ? row("Acompte reçu", `<span style="color:#16a34a;font-weight:600;">✓ ${data.depositAmount.toFixed(2)} €</span>`) +
            row("Solde à encaisser", `<strong style="color:#d97706;font-size:15px;">${remaining.toFixed(2)} €</strong>`)
          : row("Statut", `<span style="color:#16a34a;font-weight:600;">Intégralement réglé ✓</span>`)}
        ${data.notes ? row("Notes client", `<em style="color:#64748b;">${data.notes}</em>`) : ""}
      </table>
    </div>

    <!-- CTA -->
    <a href="${BASE_URL}/admin/reservations" style="display:block;background:#F5C842;color:#0A1E2E;font-weight:800;font-size:14px;text-align:center;padding:14px 20px;border-radius:10px;text-decoration:none;">
      Voir la réservation dans l'admin →
    </a>
  </div>

  <!-- Footer -->
  <div style="background:#e2e8f0;border-radius:0 0 16px 16px;padding:12px 28px;text-align:center;">
    <p style="font-size:11px;color:#94a3b8;margin:0;">Tiki Boat Administration · tiki-boat.com</p>
  </div>
</div>
</body></html>`;

  return resend.emails.send({
    from: FROM,
    to:   ADMIN,
    subject: `🆕 ${data.customerName} — ${data.excursionTitle} — ${formatDate(data.date)} (${pax} pers.)`,
    html,
  });
}
