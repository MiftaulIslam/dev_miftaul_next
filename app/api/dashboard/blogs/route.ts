import { NextResponse } from "next/server";

import { requireDashboardAuth } from "@/lib/dashboard/api-auth";
import { createBlog, deleteBlog, listBlogs, updateBlog } from "@/lib/dashboard/db";
import { slugifyTitle } from "@/lib/dashboard/slugify";

type BlogPayload = {
  id?: number;
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  published?: boolean;
};

function normalizeId(value: unknown) {
  const id = Number(value);
  return Number.isFinite(id) ? id : null;
}

function normalizePayload(payload: BlogPayload) {
  const title = payload.title?.trim() ?? "";
  const slugRaw = payload.slug?.trim() ?? "";
  const slug = slugRaw || slugifyTitle(title);
  return {
    title,
    slug,
    excerpt: payload.excerpt?.trim() ?? "",
    content: payload.content?.trim() ?? "",
    published: Boolean(payload.published),
  };
}

export async function GET() {
  const unauthorized = await requireDashboardAuth();
  if (unauthorized) return unauthorized;

  const blogs = await listBlogs();
  return NextResponse.json(blogs);
}

export async function POST(request: Request) {
  const unauthorized = await requireDashboardAuth();
  if (unauthorized) return unauthorized;

  const payload = (await request.json().catch(() => null)) as BlogPayload | null;
  if (!payload) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const normalized = normalizePayload(payload);
  if (!normalized.title) {
    return NextResponse.json({ error: "title is required." }, { status: 400 });
  }
  if (!normalized.slug) {
    return NextResponse.json({ error: "Could not derive slug from title." }, { status: 400 });
  }

  const created = await createBlog(normalized);
  return NextResponse.json(created);
}

export async function PUT(request: Request) {
  const unauthorized = await requireDashboardAuth();
  if (unauthorized) return unauthorized;

  const payload = (await request.json().catch(() => null)) as BlogPayload | null;
  const id = normalizeId(payload?.id);
  if (!payload || !id) {
    return NextResponse.json({ error: "id is required." }, { status: 400 });
  }

  const normalized = normalizePayload(payload);
  const updated = await updateBlog(id, normalized);
  if (!updated) {
    return NextResponse.json({ error: "Blog not found." }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(request: Request) {
  const unauthorized = await requireDashboardAuth();
  if (unauthorized) return unauthorized;

  const payload = (await request.json().catch(() => null)) as BlogPayload | null;
  const id = normalizeId(payload?.id);
  if (!id) {
    return NextResponse.json({ error: "id is required." }, { status: 400 });
  }

  await deleteBlog(id);
  return NextResponse.json({ success: true });
}

