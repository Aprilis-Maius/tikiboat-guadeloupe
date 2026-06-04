import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "Tiki Boat <reservations@tiki-boat.com>";
const ADMIN = process.env.ADMIN_EMAIL_NOTIF ?? "contact@tiki-boat.com";

interface ReservationData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  excursionTitle: string;
  date: string;
  adults: number;
  children: number;
  infants?: number;
  totalPrice: number;
  depositAmount: number;
  paymentType: string;
  notes?: string;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

// ─── Email de confirmation au client ───────────────────────────────────────
export async function sendConfirmationEmail(data: ReservationData) {
  const isDeposit = data.paymentType === "deposit";
  const remaining = data.totalPrice - data.depositAmount;
  const pax = data.adults + (data.children ?? 0);

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Arial,sans-serif;">
<div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

  <!-- Header -->
  <div style="background:#0A1E2E;padding:32px 40px;text-align:center;">
    <h1 style="color:#F5C842;font-size:28px;font-weight:900;margin:0;letter-spacing:-0.5px;">TIKI BOAT</h1>
    <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:6px 0 0;">Excursions en Guadeloupe</p>
  </div>

  <!-- Confirmation banner -->
  <div style="background:#16a34a;padding:16px 40px;text-align:center;">
    <p style="color:#ffffff;font-weight:700;font-size:16px;margin:0;">✅ Réservation confirmée !</p>
  </div>

  <!-- Body -->
  <div style="padding:36px 40px;">
    <p style="font-size:16px;color:#1a1a1a;margin:0 0 24px;">Bonjour <strong>${data.customerName}</strong>,</p>
    <p style="font-size:15px;color:#444;line-height:1.6;margin:0 0 28px;">
      Votre réservation pour <strong>${data.excursionTitle}</strong> est bien confirmée. Nous avons hâte de vous accueillir à bord !
    </p>

    <!-- Récap -->
    <div style="background:#f8f9fa;border-radius:12px;padding:24px;margin-bottom:28px;">
      <h3 style="font-size:13px;font-weight:700;color:#666;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 16px;">Détails de votre réservation</h3>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#666;font-size:14px;">Excursion</td><td style="padding:6px 0;text-align:right;font-weight:600;color:#1a1a1a;font-size:14px;">${data.excursionTitle}</td></tr>
        <tr><td style="padding:6px 0;color:#666;font-size:14px;">Date</td><td style="padding:6px 0;text-align:right;font-weight:600;color:#1a1a1a;font-size:14px;text-transform:capitalize;">${formatDate(data.date)}</td></tr>
        <tr><td style="padding:6px 0;color:#666;font-size:14px;">Passagers</td><td style="padding:6px 0;text-align:right;font-weight:600;color:#1a1a1a;font-size:14px;">${pax} personne${pax > 1 ? "s" : ""}</td></tr>
        <tr style="border-top:1px solid #e5e7eb;">
          <td style="padding:10px 0 4px;color:#666;font-size:14px;">Total</td>
          <td style="padding:10px 0 4px;text-align:right;font-weight:700;color:#F5C842;font-size:16px;">${data.totalPrice.toFixed(2)} €</td>
        </tr>
        ${isDeposit ? `
        <tr><td style="padding:4px 0;color:#666;font-size:13px;">Acompte réglé (30%)</td><td style="padding:4px 0;text-align:right;color:#16a34a;font-weight:600;font-size:13px;">${data.depositAmount.toFixed(2)} €</td></tr>
        <tr><td style="padding:4px 0;color:#b45309;font-size:13px;font-weight:600;">Solde à régler le jour J</td><td style="padding:4px 0;text-align:right;color:#b45309;font-weight:700;font-size:14px;">${remaining.toFixed(2)} €</td></tr>
        ` : `
        <tr><td style="padding:4px 0;color:#16a34a;font-size:13px;">Paiement</td><td style="padding:4px 0;text-align:right;color:#16a34a;font-weight:600;font-size:13px;">Intégralement réglé ✓</td></tr>
        `}
      </table>
    </div>

    ${data.notes ? `<div style="background:#fffbeb;border-left:3px solid #F5C842;padding:12px 16px;border-radius:0 8px 8px 0;margin-bottom:24px;"><p style="font-size:13px;color:#78350f;margin:0;"><strong>Votre note :</strong> ${data.notes}</p></div>` : ""}

    <!-- Contact -->
    <p style="font-size:14px;color:#555;margin:0 0 8px;">Une question ? Contactez-nous :</p>
    <p style="margin:0;"><a href="tel:+590690495848" style="color:#0A1E2E;font-weight:600;font-size:14px;">📞 +590 690 49 58 48</a></p>
    <p style="margin:4px 0 0;"><a href="https://wa.me/590690495848" style="color:#16a34a;font-weight:600;font-size:14px;">💬 WhatsApp</a></p>
  </div>

  <!-- Footer -->
  <div style="background:#f8f9fa;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
    <p style="font-size:12px;color:#999;margin:0;">Tiki Boat · Marina de Pointe-à-Pitre, Guadeloupe</p>
    <p style="font-size:12px;color:#999;margin:4px 0 0;">contact@tiki-boat.com · tiki-boat.com</p>
  </div>
</div>
</body>
</html>`;

  return resend.emails.send({
    from: FROM,
    to: data.customerEmail,
    subject: `✅ Réservation confirmée — ${data.excursionTitle} le ${formatDate(data.date)}`,
    html,
  });
}

// ─── Notification admin ─────────────────────────────────────────────────────
export async function sendAdminNotification(data: ReservationData) {
  const pax = data.adults + (data.children ?? 0);
  const isDeposit = data.paymentType === "deposit";

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Arial,sans-serif;">
<div style="max-width:520px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
  <div style="background:#0A1E2E;padding:20px 28px;">
    <h2 style="color:#F5C842;margin:0;font-size:16px;">🆕 Nouvelle réservation</h2>
  </div>
  <div style="padding:24px 28px;">
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:5px 0;color:#666;width:140px;">Client</td><td style="padding:5px 0;font-weight:600;color:#1a1a1a;">${data.customerName}</td></tr>
      <tr><td style="padding:5px 0;color:#666;">Téléphone</td><td style="padding:5px 0;"><a href="tel:${data.customerPhone}" style="color:#0A1E2E;">${data.customerPhone}</a></td></tr>
      <tr><td style="padding:5px 0;color:#666;">Email</td><td style="padding:5px 0;"><a href="mailto:${data.customerEmail}" style="color:#0A1E2E;">${data.customerEmail}</a></td></tr>
      <tr style="border-top:1px solid #f0f0f0;"><td style="padding:8px 0 5px;color:#666;">Excursion</td><td style="padding:8px 0 5px;font-weight:600;">${data.excursionTitle}</td></tr>
      <tr><td style="padding:5px 0;color:#666;">Date</td><td style="padding:5px 0;font-weight:600;text-transform:capitalize;">${formatDate(data.date)}</td></tr>
      <tr><td style="padding:5px 0;color:#666;">Passagers</td><td style="padding:5px 0;">${data.adults} adulte${data.adults > 1 ? "s" : ""}${data.children ? ` + ${data.children} enfant${data.children > 1 ? "s" : ""}` : ""}${data.infants ? ` + ${data.infants} bébé${data.infants > 1 ? "s" : ""}` : ""} (${pax} pers.)</td></tr>
      <tr style="border-top:1px solid #f0f0f0;"><td style="padding:8px 0 5px;color:#666;">Total</td><td style="padding:8px 0 5px;font-weight:700;color:#F5C842;font-size:16px;">${data.totalPrice.toFixed(2)} €</td></tr>
      <tr><td style="padding:5px 0;color:#666;">Paiement</td><td style="padding:5px 0;color:${isDeposit ? "#b45309" : "#16a34a"};font-weight:600;">${isDeposit ? `Acompte ${data.depositAmount.toFixed(2)} € — solde ${(data.totalPrice - data.depositAmount).toFixed(2)} €` : "Total réglé ✓"}</td></tr>
      ${data.notes ? `<tr><td style="padding:5px 0;color:#666;">Notes</td><td style="padding:5px 0;font-style:italic;color:#555;">${data.notes}</td></tr>` : ""}
    </table>
    <div style="margin-top:20px;padding-top:16px;border-top:1px solid #f0f0f0;">
      <a href="https://tiki-boat.com/admin/reservations" style="display:inline-block;background:#0A1E2E;color:#F5C842;font-weight:700;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:13px;">Voir dans l'admin →</a>
    </div>
  </div>
</div>
</body>
</html>`;

  return resend.emails.send({
    from: FROM,
    to: ADMIN,
    subject: `🆕 Nouvelle résa — ${data.customerName} — ${data.excursionTitle} (${formatDate(data.date)})`,
    html,
  });
}
