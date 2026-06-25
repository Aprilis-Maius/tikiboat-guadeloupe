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

  const ops = Object.entries(body).map(([id, value]) =>
    prisma.siteContent.upsert({
      where:  { id },
      update: { value },
      create: { id, value },
    })
  );

  await prisma.$transaction(ops);
  return NextResponse.json({ ok: true });
}
