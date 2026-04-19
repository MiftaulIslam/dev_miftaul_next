import { NextResponse } from "next/server";

import { listProjects } from "@/lib/dashboard/db";

export async function GET() {
  try {
    const projects = await listProjects();
    return NextResponse.json(projects);
  } catch {
    return NextResponse.json([]);
  }
}

