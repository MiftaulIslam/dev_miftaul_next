import { NextResponse } from "next/server";

import { requireDashboardAuth } from "@/lib/dashboard/api-auth";
import {
  createV2SkillSection,
  deleteV2SkillSection,
  listV2SkillSections,
  updateV2SkillSection,
} from "@/lib/dashboard/db";

/**
 * Sections of the v2 skills reel.
 *
 * Mirrors the shape of `/api/dashboard/skills/categories` so the two panels read
 * the same way, but against the v2 tables — which carry the authored copy
 * (subtitle, description, layer) the v1 stack does not model.
 */

type SectionPayload = {
  id?: number;
  key?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  layer?: string;
  accent?: string;
  sortOrder?: number;
};

function normalizeId(value: unknown) {
  const id = Number(value);
  return Number.isFinite(id) ? id : null;
}

function normalizeOrder(value: unknown) {
  const order = Number(value);
  return Number.isFinite(order) ? Math.trunc(order) : 0;
}

export async function GET() {
  const unauthorized = await requireDashboardAuth();
  if (unauthorized) return unauthorized;

  const sections = await listV2SkillSections();
  return NextResponse.json(sections);
}

export async function POST(request: Request) {
  const unauthorized = await requireDashboardAuth();
  if (unauthorized) return unauthorized;

  const payload = (await request.json().catch(() => null)) as SectionPayload | null;
  if (!payload?.title?.trim()) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  const created = await createV2SkillSection({
    key: payload.key,
    title: payload.title.trim(),
    subtitle: payload.subtitle ?? "",
    description: payload.description ?? "",
    layer: payload.layer ?? "",
    accent: payload.accent ?? "#60a5fa",
    sortOrder: normalizeOrder(payload.sortOrder),
  });
  return NextResponse.json(created);
}

export async function PUT(request: Request) {
  const unauthorized = await requireDashboardAuth();
  if (unauthorized) return unauthorized;

  const payload = (await request.json().catch(() => null)) as SectionPayload | null;
  const id = normalizeId(payload?.id);
  if (!id || !payload?.title?.trim()) {
    return NextResponse.json({ error: "id and title are required." }, { status: 400 });
  }

  const updated = await updateV2SkillSection(id, {
    key: payload.key,
    title: payload.title.trim(),
    subtitle: payload.subtitle ?? "",
    description: payload.description ?? "",
    layer: payload.layer ?? "",
    accent: payload.accent ?? "#60a5fa",
    sortOrder: normalizeOrder(payload.sortOrder),
  });

  if (!updated) {
    return NextResponse.json({ error: "Section not found." }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(request: Request) {
  const unauthorized = await requireDashboardAuth();
  if (unauthorized) return unauthorized;

  const payload = (await request.json().catch(() => null)) as SectionPayload | null;
  const id = normalizeId(payload?.id);
  if (!id) {
    return NextResponse.json({ error: "id is required." }, { status: 400 });
  }

  await deleteV2SkillSection(id);
  return NextResponse.json({ success: true });
}
