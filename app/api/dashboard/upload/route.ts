import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { requireDashboardAuth } from "@/lib/dashboard/api-auth";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]);

export async function POST(request: Request) {
  const unauthorized = await requireDashboardAuth();
  if (unauthorized) return unauthorized;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 5MB)." }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "Unsupported image type." }, { status: 400 });
  }

  const original = file.name || "upload";
  const extFromName = original.includes(".") ? original.split(".").pop()!.toLowerCase() : "";
  const extMap: Record<string, string> = {
    jpeg: "jpg",
    jpg: "jpg",
    png: "png",
    webp: "webp",
    gif: "gif",
    svg: "svg",
  };
  let ext = extFromName.replace(/[^a-z0-9]/g, "");
  if (file.type === "image/svg+xml") ext = "svg";
  else if (file.type === "image/jpeg") ext = "jpg";
  else if (file.type === "image/png") ext = "png";
  else if (file.type === "image/webp") ext = "webp";
  else if (file.type === "image/gif") ext = "gif";
  if (!extMap[ext]) ext = "png";

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);

  const url = `/uploads/${filename}`;
  return NextResponse.json({ url });
}
