import { NextResponse } from "next/server";

import { requireDashboardAuth } from "@/lib/dashboard/api-auth";
import { createV2SkillItem, deleteV2SkillItem, updateV2SkillItem } from "@/lib/dashboard/db";

/**
 * Individual skills inside a v2 section.
 *
 * `title` is the one-line role shown beside the name in the reel. `weight` is
 * clamped to 0..1 because it feeds an icon size and a sort order, and a value
 * outside that range would silently distort the row it belongs to.
 *
 * There is no `years` field, on purpose — it is not modelled on either version.
 */

type ItemPayload = {
  id?: number;
  sectionId?: number;
  name?: string;
  title?: string;
  icon?: string;
  note?: string;
  weight?: number;
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

function normalizeWeight(value: unknown) {
  const weight = Number(value);
  if (!Number.isFinite(weight)) return 0.55;
  return Math.min(Math.max(weight, 0), 1);
}

export async function POST(request: Request) {
  const unauthorized = await requireDashboardAuth();
  if (unauthorized) return unauthorized;

  const payload = (await request.json().catch(() => null)) as ItemPayload | null;
  const sectionId = normalizeId(payload?.sectionId);
  if (!sectionId || !payload?.name?.trim()) {
    return NextResponse.json({ error: "sectionId and name are required." }, { status: 400 });
  }

  const created = await createV2SkillItem({
    sectionId,
    name: payload.name.trim(),
    title: payload.title ?? "",
    icon: payload.icon ?? "",
    note: payload.note ?? "",
    weight: normalizeWeight(payload.weight),
    sortOrder: normalizeOrder(payload.sortOrder),
  });
  return NextResponse.json(created);
}

export async function PUT(request: Request) {
  const unauthorized = await requireDashboardAuth();
  if (unauthorized) return unauthorized;

  const payload = (await request.json().catch(() => null)) as ItemPayload | null;
  const id = normalizeId(payload?.id);
  if (!id || !payload?.name?.trim()) {
    return NextResponse.json({ error: "id and name are required." }, { status: 400 });
  }

  const updated = await updateV2SkillItem(id, {
    name: payload.name.trim(),
    title: payload.title ?? "",
    icon: payload.icon ?? "",
    note: payload.note ?? "",
    weight: normalizeWeight(payload.weight),
    sortOrder: normalizeOrder(payload.sortOrder),
  });

  if (!updated) {
    return NextResponse.json({ error: "Skill not found." }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(request: Request) {
  const unauthorized = await requireDashboardAuth();
  if (unauthorized) return unauthorized;

  const payload = (await request.json().catch(() => null)) as ItemPayload | null;
  const id = normalizeId(payload?.id);
  if (!id) {
    return NextResponse.json({ error: "id is required." }, { status: 400 });
  }

  await deleteV2SkillItem(id);
  return NextResponse.json({ success: true });
}
