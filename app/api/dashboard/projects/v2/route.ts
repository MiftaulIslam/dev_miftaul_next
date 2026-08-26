import { NextResponse } from "next/server";

import { requireDashboardAuth } from "@/lib/dashboard/api-auth";
import {
  createV2Project,
  deleteV2Project,
  listV2Projects,
  updateV2Project,
  type V2ProjectInput,
} from "@/lib/dashboard/db";

/**
 * CRUD for the v2 reel projects.
 *
 * Sits beside `/api/dashboard/projects` rather than extending it, because the
 * two edit different tables with different shapes — see the note on
 * `v2_projects` in `scripts/db/migrate.mjs`.
 *
 * Every handler normalises before it writes. The dashboard form is the only
 * caller today, but a route that trusts its caller is a route that stores
 * `undefined` in a NOT NULL column the first time somebody curls it.
 */

type CasePayload = {
  heading?: string;
  body?: unknown;
};

type V2ProjectPayload = {
  id?: number;
  slug?: string;
  name?: string;
  year?: string;
  discipline?: string;
  role?: string;
  problem?: string;
  outcome?: string;
  tech?: unknown;
  accent?: string;
  plateSrc?: string;
  plateCaption?: string;
  plateFocus?: string;
  linkLive?: string;
  linkSource?: string;
  sortOrder?: number;
  cases?: CasePayload[];
};

function normalizeId(value: unknown) {
  const id = Number(value);
  return Number.isFinite(id) && id > 0 ? id : null;
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => (typeof item === "string" ? item.trim() : "")).filter(Boolean);
}

function normalizeCases(value: CasePayload[] | undefined) {
  if (!Array.isArray(value)) return [];
  return value
    .map((block) => ({
      heading: typeof block?.heading === "string" ? block.heading.trim() : "",
      body: normalizeStringArray(block?.body),
    }))
    // A block with neither a heading nor a paragraph is an empty row the editor
    // left behind, not content. Dropping it here keeps the case sheet from
    // rendering a gap the author cannot see in the form.
    .filter((block) => block.heading || block.body.length);
}

function normalizePayload(payload: V2ProjectPayload): V2ProjectInput {
  return {
    slug: payload.slug?.trim() ?? "",
    name: payload.name?.trim() ?? "",
    year: payload.year?.trim() ?? "",
    discipline: payload.discipline?.trim() ?? "",
    role: payload.role?.trim() ?? "",
    problem: payload.problem?.trim() ?? "",
    outcome: payload.outcome?.trim() ?? "",
    tech: normalizeStringArray(payload.tech),
    accent: payload.accent?.trim() || "#3b82f6",
    plateSrc: payload.plateSrc?.trim() ?? "",
    plateCaption: payload.plateCaption?.trim() ?? "",
    plateFocus: payload.plateFocus?.trim() ?? "",
    linkLive: payload.linkLive?.trim() ?? "",
    linkSource: payload.linkSource?.trim() ?? "",
    sortOrder: Number.isFinite(Number(payload.sortOrder)) ? Number(payload.sortOrder) : undefined,
    cases: normalizeCases(payload.cases),
  };
}

export async function GET() {
  const unauthorized = await requireDashboardAuth();
  if (unauthorized) return unauthorized;

  const projects = await listV2Projects();
  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  const unauthorized = await requireDashboardAuth();
  if (unauthorized) return unauthorized;

  const payload = (await request.json().catch(() => null)) as V2ProjectPayload | null;
  if (!payload) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const normalized = normalizePayload(payload);
  if (!normalized.name) {
    return NextResponse.json({ error: "name is required." }, { status: 400 });
  }

  const created = await createV2Project(normalized);
  return NextResponse.json(created);
}

export async function PUT(request: Request) {
  const unauthorized = await requireDashboardAuth();
  if (unauthorized) return unauthorized;

  const payload = (await request.json().catch(() => null)) as V2ProjectPayload | null;
  const id = normalizeId(payload?.id);
  if (!payload || !id) {
    return NextResponse.json({ error: "id is required." }, { status: 400 });
  }

  const normalized = normalizePayload(payload);
  if (!normalized.name) {
    return NextResponse.json({ error: "name is required." }, { status: 400 });
  }

  const updated = await updateV2Project(id, normalized);
  if (!updated) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(request: Request) {
  const unauthorized = await requireDashboardAuth();
  if (unauthorized) return unauthorized;

  const payload = (await request.json().catch(() => null)) as V2ProjectPayload | null;
  const id = normalizeId(payload?.id);
  if (!id) {
    return NextResponse.json({ error: "id is required." }, { status: 400 });
  }

  await deleteV2Project(id);
  return NextResponse.json({ success: true });
}
