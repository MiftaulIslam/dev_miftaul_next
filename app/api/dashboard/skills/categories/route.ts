import { NextResponse } from "next/server";

import { requireDashboardAuth } from "@/lib/dashboard/api-auth";
import {
  createStackCategory,
  deleteStackCategory,
  listStackCategories,
  updateStackCategory,
} from "@/lib/dashboard/db";

type CategoryPayload = {
  id?: number;
  key?: string;
  label?: string;
  accent?: string;
};

function normalizeId(value: unknown) {
  const id = Number(value);
  return Number.isFinite(id) ? id : null;
}

export async function GET() {
  const unauthorized = await requireDashboardAuth();
  if (unauthorized) return unauthorized;

  const categories = await listStackCategories();
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const unauthorized = await requireDashboardAuth();
  if (unauthorized) return unauthorized;

  const payload = (await request.json().catch(() => null)) as CategoryPayload | null;
  if (!payload?.label || !payload.accent) {
    return NextResponse.json({ error: "Label and accent are required." }, { status: 400 });
  }

  const created = await createStackCategory({
    key: payload.key,
    label: payload.label,
    accent: payload.accent,
  });
  return NextResponse.json(created);
}

export async function PUT(request: Request) {
  const unauthorized = await requireDashboardAuth();
  if (unauthorized) return unauthorized;

  const payload = (await request.json().catch(() => null)) as CategoryPayload | null;
  const id = normalizeId(payload?.id);
  if (!id || !payload?.label || !payload.accent) {
    return NextResponse.json(
      { error: "id, label and accent are required." },
      { status: 400 },
    );
  }

  const updated = await updateStackCategory(id, {
    key: payload.key,
    label: payload.label,
    accent: payload.accent,
  });

  if (!updated) {
    return NextResponse.json({ error: "Category not found." }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(request: Request) {
  const unauthorized = await requireDashboardAuth();
  if (unauthorized) return unauthorized;

  const payload = (await request.json().catch(() => null)) as CategoryPayload | null;
  const id = normalizeId(payload?.id);
  if (!id) {
    return NextResponse.json({ error: "id is required." }, { status: 400 });
  }

  await deleteStackCategory(id);
  return NextResponse.json({ success: true });
}

