import { NextResponse } from "next/server";

import { requireDashboardAuth } from "@/lib/dashboard/api-auth";
import { createProject, deleteProject, listProjects, updateProject } from "@/lib/dashboard/db";

type ProjectPayload = {
  id?: number;
  title?: string;
  subtitle?: string;
  role?: string;
  description?: string[];
  image?: string;
  images?: string[];
  tech?: string[];
  github?: string;
  demo?: string;
  featured?: boolean;
  accent?: string;
  tag?: string;
  sortOrder?: number;
};

function normalizeId(value: unknown) {
  const id = Number(value);
  return Number.isFinite(id) ? id : null;
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function normalizePayload(payload: ProjectPayload) {
  return {
    title: payload.title?.trim() ?? "",
    subtitle: payload.subtitle?.trim() ?? "",
    role: payload.role?.trim() ?? "",
    description: normalizeStringArray(payload.description),
    image: payload.image?.trim() ?? "",
    images: normalizeStringArray(payload.images),
    tech: normalizeStringArray(payload.tech),
    github: payload.github?.trim() ?? "#",
    demo: payload.demo?.trim() ?? "#",
    featured: Boolean(payload.featured),
    accent: payload.accent?.trim() ?? "#3b82f6",
    tag: payload.tag?.trim() ?? "",
    sortOrder: Number.isFinite(Number(payload.sortOrder)) ? Number(payload.sortOrder) : undefined,
  };
}

export async function GET() {
  const unauthorized = await requireDashboardAuth();
  if (unauthorized) return unauthorized;

  const projects = await listProjects();
  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  const unauthorized = await requireDashboardAuth();
  if (unauthorized) return unauthorized;

  const payload = (await request.json().catch(() => null)) as ProjectPayload | null;
  if (!payload) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const normalized = normalizePayload(payload);
  if (!normalized.title) {
    return NextResponse.json({ error: "title is required." }, { status: 400 });
  }

  const created = await createProject(normalized);
  return NextResponse.json(created);
}

export async function PUT(request: Request) {
  const unauthorized = await requireDashboardAuth();
  if (unauthorized) return unauthorized;

  const payload = (await request.json().catch(() => null)) as ProjectPayload | null;
  const id = normalizeId(payload?.id);
  if (!payload || !id) {
    return NextResponse.json({ error: "id is required." }, { status: 400 });
  }

  const normalized = normalizePayload(payload);
  const updated = await updateProject(id, normalized);
  if (!updated) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(request: Request) {
  const unauthorized = await requireDashboardAuth();
  if (unauthorized) return unauthorized;

  const payload = (await request.json().catch(() => null)) as ProjectPayload | null;
  const id = normalizeId(payload?.id);
  if (!id) {
    return NextResponse.json({ error: "id is required." }, { status: 400 });
  }

  await deleteProject(id);
  return NextResponse.json({ success: true });
}

