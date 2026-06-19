import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidateTag, revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session ?? null;
}

/* Helpers */
const toSlug = (title: string) =>
  title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const excursions = await prisma.excursion.findMany({ orderBy: { sortOrder: "asc" } });
    return NextResponse.json(excursions);
  } catch (err) {
    console.error("[GET /api/admin/excursions]", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();

  const count = await prisma.excursion.count();
  const slug = body.slug || toSlug(body.title);

  const excursion = await prisma.excursion.create({
    data: {
      slug,
      title:         body.title,
      subtitle:      body.subtitle ?? "",
      description:   body.description ?? "",
      duration:      body.duration ?? "Journée complète",
      departureTime: body.departureTime ?? "08h00",
      returnTime:    body.returnTime ?? "17h00",
      departurePoint: body.departurePoint ?? "Marina de Pointe-à-Pitre / Le Gosier",
      maxPassengers: Number(body.maxPassengers ?? 12),
      priceAdult:    Number(body.priceAdult ?? 0),
      priceChild:    Number(body.priceChild ?? 0),
      pricePrivate:  body.pricePrivate ? Number(body.pricePrivate) : null,
      included:      body.included ?? "[]",
      notIncluded:   body.notIncluded ?? "[]",
      highlights:    body.highlights ?? "[]",
      images:        body.images ?? "[]",
      youtubeId:     body.youtubeId ?? null,
      badge:         body.badge ?? null,
      popular:       body.popular ?? false,
      isActive:      body.isActive ?? true,
      sortOrder:     count,
    },
  });
  return NextResponse.json(excursion);
}

export async function PATCH(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, ...data } = await req.json();

  // Coerce numeric fields
  if (data.maxPassengers !== undefined) data.maxPassengers = Number(data.maxPassengers);
  if (data.priceAdult    !== undefined) data.priceAdult    = Number(data.priceAdult);
  if (data.priceChild    !== undefined) data.priceChild    = Number(data.priceChild);
  if (data.pricePrivate  !== undefined) data.pricePrivate  = data.pricePrivate ? Number(data.pricePrivate) : null;
  if (data.sortOrder     !== undefined) data.sortOrder     = Number(data.sortOrder);

  const excursion = await prisma.excursion.update({ where: { id }, data });
  revalidateTag("excursions");
  revalidatePath("/[locale]/excursions/[slug]", "page");
  revalidatePath("/[locale]/excursions", "page");
  revalidatePath("/[locale]", "page");
  return NextResponse.json(excursion);
}

export async function DELETE(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await prisma.excursion.delete({ where: { id } });
  revalidateTag("excursions");
  revalidatePath("/[locale]/excursions/[slug]", "page");
  revalidatePath("/[locale]/excursions", "page");
  revalidatePath("/[locale]", "page");
  return NextResponse.json({ ok: true });
}
