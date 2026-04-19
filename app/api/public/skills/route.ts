import { NextResponse } from "next/server";

import { listStackCategories } from "@/lib/dashboard/db";

export async function GET() {
  try {
    const skills = await listStackCategories();
    return NextResponse.json(skills);
  } catch {
    return NextResponse.json([]);
  }
}

