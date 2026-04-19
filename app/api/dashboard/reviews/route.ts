import { NextResponse } from "next/server";

import { requireDashboardAuth } from "@/lib/dashboard/api-auth";
import { createReview, deleteReview, listReviews, updateReview } from "@/lib/dashboard/db";

type ReviewPayload = {
  id?: number;
  clientName?: string;
  clientRole?: string;
  quote?: string;
  rating?: number;
  featured?: boolean;
};

function normalizeId(value: unknown) {
  const id = Number(value);
  return Number.isFinite(id) ? id : null;
}

function normalizePayload(payload: ReviewPayload) {
  const rating = Number(payload.rating);
  return {
    clientName: payload.clientName?.trim() ?? "",
    clientRole: payload.clientRole?.trim() ?? "",
    quote: payload.quote?.trim() ?? "",
    rating: Number.isFinite(rating) ? Math.max(1, Math.min(5, rating)) : 5,
    featured: Boolean(payload.featured),
  };
}

export async function GET() {
  const unauthorized = await requireDashboardAuth();
  if (unauthorized) return unauthorized;

  const reviews = await listReviews();
  return NextResponse.json(reviews);
}

export async function POST(request: Request) {
  const unauthorized = await requireDashboardAuth();
  if (unauthorized) return unauthorized;

  const payload = (await request.json().catch(() => null)) as ReviewPayload | null;
  if (!payload) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const normalized = normalizePayload(payload);
  if (!normalized.clientName || !normalized.quote) {
    return NextResponse.json(
      { error: "clientName and quote are required." },
      { status: 400 },
    );
  }

  const created = await createReview(normalized);
  return NextResponse.json(created);
}

export async function PUT(request: Request) {
  const unauthorized = await requireDashboardAuth();
  if (unauthorized) return unauthorized;

  const payload = (await request.json().catch(() => null)) as ReviewPayload | null;
  const id = normalizeId(payload?.id);
  if (!payload || !id) {
    return NextResponse.json({ error: "id is required." }, { status: 400 });
  }

  const normalized = normalizePayload(payload);
  const updated = await updateReview(id, normalized);
  if (!updated) {
    return NextResponse.json({ error: "Review not found." }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(request: Request) {
  const unauthorized = await requireDashboardAuth();
  if (unauthorized) return unauthorized;

  const payload = (await request.json().catch(() => null)) as ReviewPayload | null;
  const id = normalizeId(payload?.id);
  if (!id) {
    return NextResponse.json({ error: "id is required." }, { status: 400 });
  }

  await deleteReview(id);
  return NextResponse.json({ success: true });
}

