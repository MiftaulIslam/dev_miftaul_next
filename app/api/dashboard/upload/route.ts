import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

import { requireDashboardAuth } from "@/lib/dashboard/api-auth";

/**
 * Dashboard image uploads.
 *
 * Writes to Vercel Blob, not to `public/uploads/`. The filesystem version of
 * this route could not work once deployed, for two independent reasons: the
 * deployment filesystem is read-only outside `/tmp`, so `writeFile` threw
 * `EROFS` and the handler returned a bare 500 with an empty body; and even on a
 * writable disk the file would live on one ephemeral instance and vanish at the
 * next deploy. Uploads have to leave the deployment.
 *
 * Local development still writes to disk when no Blob token is present, so
 * `npm run dev` works offline and without a store. That fallback is explicitly
 * refused in production — falling back there would silently reproduce the exact
 * bug this route exists to fix.
 */

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]);

/** Extension is derived from the MIME type, which is checked; the filename is not. */
const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

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

  const ext = EXT_BY_TYPE[file.type] ?? "png";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
  // The SDK accepts two credentials, and checking only for the token would
  // refuse a perfectly working store: either BLOB_READ_WRITE_TOKEN, or a
  // BLOB_STORE_ID paired with the OIDC token Vercel injects into every
  // deployment. Mirroring both here keeps this gate honest — the alternative is
  // reporting "not configured" on a deploy where `put()` would have succeeded.
  const hasBlobCredentials = Boolean(
    process.env.BLOB_READ_WRITE_TOKEN ||
      (process.env.BLOB_STORE_ID && process.env.VERCEL_OIDC_TOKEN),
  );

  // Every storage failure below returns JSON. The old route let the exception
  // escape, which is why the browser saw a 500 with `Content-Length: 0` and the
  // panel could only say "Upload failed" — there was nothing else to say.
  try {
    if (hasBlobCredentials) {
      const blob = await put(`uploads/${filename}`, file, {
        access: "public",
        contentType: file.type,
        // The filename already carries a timestamp and a random suffix, so the
        // pathname is stored verbatim and the returned URL stays predictable.
        addRandomSuffix: false,
      });
      return NextResponse.json({ url: blob.url });
    }

    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        {
          error:
            "Image storage is not configured. Create a Blob store in the Vercel dashboard " +
            "(Storage → Create → Blob) and redeploy, so that either BLOB_READ_WRITE_TOKEN or " +
            "BLOB_STORE_ID is present in the deployment environment.",
        },
        { status: 500 },
      );
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));
    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown error.";
    return NextResponse.json({ error: `Upload failed: ${detail}` }, { status: 500 });
  }
}
