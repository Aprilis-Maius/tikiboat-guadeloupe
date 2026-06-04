import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendConfirmationEmail, sendAdminNotification } from "@/lib/email";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const testData = {
    customerName:   "Jean Test",
    customerEmail:  "mfortier.prophy@gmail.com",
    customerPhone:  "+590 690 49 58 48",
    excursionTitle: "Croisière Grand Cul de Sac Marin",
    excursionSlug:  "grand-cul-de-sac-marin",
    date:           new Date(Date.now() + 7 * 86_400_000).toISOString().split("T")[0],
    adults:         2,
    children:       1,
    infants:        0,
    totalPrice:     245,
    depositAmount:  73.50,
    paymentType:    "deposit",
    notes:          "Allergie aux crustacés pour 1 adulte",
  };

  const [conf, notif] = await Promise.allSettled([
    sendConfirmationEmail(testData),
    sendAdminNotification(testData),
  ]);

  return NextResponse.json({
    confirmation: conf.status === "fulfilled" ? "✅ envoyé" : `❌ ${(conf as PromiseRejectedResult).reason}`,
    notification: notif.status === "fulfilled" ? "✅ envoyé" : `❌ ${(notif as PromiseRejectedResult).reason}`,
  });
}
