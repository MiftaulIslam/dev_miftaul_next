import { NextResponse } from "next/server";

import { listExperiences } from "@/lib/dashboard/db";

export async function GET() {
  try {
    const experiences = await listExperiences();
    return NextResponse.json(experiences);
  } catch {
    return NextResponse.json([]);
  }
}

