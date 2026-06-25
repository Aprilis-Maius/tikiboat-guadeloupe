import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";


export async function GET(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await prisma.siteContent.findMany();
  const content: Record<string, string> = {};
  items.forEach((item) => { content[item.id] = item.value; });
  return NextResponse.json(content);
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as Record<string, string>;

  // Seules les clés déjà en base peuvent être mises à jour (pas de création de nouvelles clés)
  const existingKeys = (await prisma.siteContent.findMany({ select: { id: true } })).map(r => r.id);
  const ops = Object.entries(body)
    .filter(([id, value]) => existingKeys.includes(id) && typeof value === "string" && value.length <= 100000)
    .map(([id, value]) => prisma.siteContent.update({ where: { id }, data: { value } }));

  await prisma.$transaction(ops);
  return NextResponse.json({ ok: true });
}
