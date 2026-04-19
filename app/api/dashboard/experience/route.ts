import { NextResponse } from "next/server";

import { requireDashboardAuth } from "@/lib/dashboard/api-auth";
import {
  createExperience,
  deleteExperience,
  listExperiences,
  updateExperience,
} from "@/lib/dashboard/db";

type ExperiencePayload = {
  id?: number;
  title?: string;
  company?: string;
  location?: string;
  duration?: string;
  type?: string;
  description?: string[];
  tech?: string[];
  current?: boolean;
  accent?: string;
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

function normalizePayload(payload: ExperiencePayload) {
  return {
    title: payload.title?.trim() ?? "",
    company: payload.company?.trim() ?? "",
    location: payload.location?.trim() ?? "",
    duration: payload.duration?.trim() ?? "",
    type: payload.type?.trim() ?? "",
    description: normalizeStringArray(payload.description),
    tech: normalizeStringArray(payload.tech),
    current: Boolean(payload.current),
    accent: payload.accent?.trim() ?? "#3b82f6",
    sortOrder: Number.isFinite(Number(payload.sortOrder)) ? Number(payload.sortOrder) : undefined,
  };
}

export async function GET() {
  const unauthorized = await requireDashboardAuth();
  if (unauthorized) return unauthorized;

  const experiences = await listExperiences();
  return NextResponse.json(experiences);
}

export async function POST(request: Request) {
  const unauthorized = await requireDashboardAuth();
  if (unauthorized) return unauthorized;

  const payload = (await request.json().catch(() => null)) as ExperiencePayload | null;
  if (!payload) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const normalized = normalizePayload(payload);
  if (!normalized.title || !normalized.company) {
    return NextResponse.json({ error: "title and company are required." }, { status: 400 });
  }

  const created = await createExperience(normalized);
  return NextResponse.json(created);
}

export async function PUT(request: Request) {
  const unauthorized = await requireDashboardAuth();
  if (unauthorized) return unauthorized;

  const payload = (await request.json().catch(() => null)) as ExperiencePayload | null;
  const id = normalizeId(payload?.id);
  if (!payload || !id) {
    return NextResponse.json({ error: "id is required." }, { status: 400 });
  }

  const normalized = normalizePayload(payload);
  const updated = await updateExperience(id, normalized);
  if (!updated) {
    return NextResponse.json({ error: "Experience not found." }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(request: Request) {
  const unauthorized = await requireDashboardAuth();
  if (unauthorized) return unauthorized;

  const payload = (await request.json().catch(() => null)) as ExperiencePayload | null;
  const id = normalizeId(payload?.id);
  if (!id) {
    return NextResponse.json({ error: "id is required." }, { status: 400 });
  }

  await deleteExperience(id);
  return NextResponse.json({ success: true });
}

