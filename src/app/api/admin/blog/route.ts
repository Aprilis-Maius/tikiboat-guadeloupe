import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const toSlug = (title: string) =>
  title.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");


export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const posts = await prisma.blogPost.findMany({ orderBy: [{ sortOrder: "asc" }, { date: "desc" }] });
    return NextResponse.json(posts);
  } catch (err) {
    console.error("[GET /api/admin/blog]", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const count = await prisma.blogPost.count();
  const slug = body.slug || toSlug(body.title);
  const post = await prisma.blogPost.create({
    data: {
      slug,
      title:       body.title,
      excerpt:     body.excerpt     ?? "",
      category:    body.category    ?? "Guide",
      date:        body.date        ?? new Date().toISOString().split("T")[0],
      readTime:    Number(body.readTime ?? 5),
      coverImage:  body.coverImage  ?? "/photos/blog.jpg",
      coverLabel:  body.coverLabel  ?? "",
      keywords:    body.keywords    ?? "",
      content:     body.content     ?? "",
      isPublished: body.isPublished ?? true,
      sortOrder:   count,
    },
  });
  return NextResponse.json(post);
}

export async function PATCH(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, ...data } = await req.json();
  if (data.readTime !== undefined) data.readTime = Number(data.readTime);
  if (data.sortOrder !== undefined) data.sortOrder = Number(data.sortOrder);
  const post = await prisma.blogPost.update({ where: { id }, data });
  return NextResponse.json(post);
}

export async function DELETE(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await prisma.blogPost.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
