import { NextResponse } from "next/server";

import { requireDashboardAuth } from "@/lib/dashboard/api-auth";
import { createStackTool, deleteStackTool, updateStackTool } from "@/lib/dashboard/db";

type ToolPayload = {
  id?: number;
  categoryId?: number;
  name?: string;
  color?: string;
  iconName?: string;
};

function normalizeId(value: unknown) {
  const id = Number(value);
  return Number.isFinite(id) ? id : null;
}

export async function POST(request: Request) {
  const unauthorized = await requireDashboardAuth();
  if (unauthorized) return unauthorized;

  const payload = (await request.json().catch(() => null)) as ToolPayload | null;
  const categoryId = normalizeId(payload?.categoryId);
  if (!categoryId || !payload?.name || !payload.color) {
    return NextResponse.json(
      { error: "categoryId, name and color are required." },
      { status: 400 },
    );
  }

  const created = await createStackTool({
    categoryId,
    name: payload.name,
    color: payload.color,
    iconName: payload.iconName ?? "",
  });
  return NextResponse.json(created);
}

export async function PUT(request: Request) {
  const unauthorized = await requireDashboardAuth();
  if (unauthorized) return unauthorized;

  const payload = (await request.json().catch(() => null)) as ToolPayload | null;
  const id = normalizeId(payload?.id);
  if (!id || !payload?.name || !payload.color) {
    return NextResponse.json({ error: "id, name and color are required." }, { status: 400 });
  }

  const updated = await updateStackTool(id, {
    name: payload.name,
    color: payload.color,
    iconName: payload.iconName ?? "",
  });
  if (!updated) {
    return NextResponse.json({ error: "Tool not found." }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(request: Request) {
  const unauthorized = await requireDashboardAuth();
  if (unauthorized) return unauthorized;

  const payload = (await request.json().catch(() => null)) as ToolPayload | null;
  const id = normalizeId(payload?.id);
  if (!id) {
    return NextResponse.json({ error: "id is required." }, { status: 400 });
  }

  await deleteStackTool(id);
  return NextResponse.json({ success: true });
}

