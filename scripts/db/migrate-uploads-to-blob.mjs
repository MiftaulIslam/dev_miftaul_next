/**
 * Moves legacy `/uploads/...` images into Vercel Blob and repoints the database.
 *
 * Why this exists: the old upload route wrote into `public/uploads/`, and
 * `.gitignore` excludes that directory. So every image uploaded through the
 * dashboard lived only on the machine that uploaded it and was never deployed —
 * the database pointed at `/uploads/x.png`, production had no such file, and the
 * image 404'd. That is the "no image coming after deploy" symptom.
 *
 * This script finds every `/uploads/...` path still referenced in the database,
 * uploads the matching local file to Blob, and rewrites the row to the Blob URL.
 * Anything whose local file is missing is reported and left untouched — a
 * dangling path is bad, but silently blanking the field is worse.
 *
 * Run it once, from the machine that has the files in `public/uploads/`:
 *
 *   BLOB_READ_WRITE_TOKEN=... node scripts/db/migrate-uploads-to-blob.mjs
 *   (or put the token in .env.local, then: npm run db:migrate:uploads)
 *
 * Idempotent: a second run finds nothing left on `/uploads/` and does nothing.
 * Pass --dry to see the plan without writing anything.
 */

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { put } from "@vercel/blob";
import { neon } from "@neondatabase/serverless";

function loadEnvFile(fileName) {
  const envPath = path.resolve(process.cwd(), fileName);
  if (!existsSync(envPath)) return;

  const content = readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    // A UTF-8 BOM on the first line would otherwise become part of the key.
    const key = trimmed.slice(0, eq).trim().replace(/^﻿/, "");
    let value = trimmed.slice(eq + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

const CONTENT_TYPES = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
};

const dryRun = process.argv.includes("--dry");

/** Cache by local path so an image used in two places uploads once. */
const uploaded = new Map();
const missing = new Set();

async function toBlobUrl(localPath) {
  if (!localPath || !localPath.startsWith("/uploads/")) return null;
  if (uploaded.has(localPath)) return uploaded.get(localPath);

  const filename = localPath.slice("/uploads/".length);
  const diskPath = path.resolve(process.cwd(), "public", "uploads", filename);
  if (!existsSync(diskPath)) {
    missing.add(localPath);
    return null;
  }

  if (dryRun) {
    uploaded.set(localPath, `[dry-run] ${localPath}`);
    return uploaded.get(localPath);
  }

  const ext = filename.split(".").pop()?.toLowerCase() ?? "png";
  const blob = await put(`uploads/${filename}`, readFileSync(diskPath), {
    access: "public",
    contentType: CONTENT_TYPES[ext] ?? "application/octet-stream",
    addRandomSuffix: false,
    // Re-running after a partial failure must not error on the files that
    // already made it across.
    allowOverwrite: true,
  });

  uploaded.set(localPath, blob.url);
  return blob.url;
}

async function run() {
  loadEnvFile(".env.local");
  loadEnvFile(".env");

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing. Add it to .env.local, .env, or your environment.");
  }
  if (!dryRun && !process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is missing. Create a Blob store in the Vercel dashboard " +
        "(Storage → Create → Blob), copy its read/write token into .env.local, and re-run. " +
        "Use --dry to preview without a token.",
    );
  }

  const sql = neon(process.env.DATABASE_URL);
  let changed = 0;

  /* ── portfolio_settings ─────────────────────────────────────────────────── */
  const settings = await sql`
    SELECT primary_avatar, sub_avatar, banner_image FROM portfolio_settings WHERE id = 1
  `;
  if (settings[0]) {
    const next = {
      primary_avatar: await toBlobUrl(settings[0].primary_avatar),
      sub_avatar: await toBlobUrl(settings[0].sub_avatar),
      banner_image: await toBlobUrl(settings[0].banner_image),
    };
    for (const [column, url] of Object.entries(next)) {
      if (!url) continue;
      console.log(`portfolio_settings.${column} → ${url}`);
      changed += 1;
      if (dryRun) continue;
      if (column === "primary_avatar") {
        await sql`UPDATE portfolio_settings SET primary_avatar = ${url}, updated_at = NOW() WHERE id = 1`;
      } else if (column === "sub_avatar") {
        await sql`UPDATE portfolio_settings SET sub_avatar = ${url}, updated_at = NOW() WHERE id = 1`;
      } else {
        await sql`UPDATE portfolio_settings SET banner_image = ${url}, updated_at = NOW() WHERE id = 1`;
      }
    }
  }

  /* ── projects (v1): one thumbnail plus a gallery array ──────────────────── */
  const projects = await sql`SELECT id, title, image, images FROM projects`;
  for (const project of projects) {
    const image = await toBlobUrl(project.image);
    const gallery = Array.isArray(project.images) ? project.images : [];
    const nextGallery = [];
    let galleryChanged = false;
    for (const entry of gallery) {
      const url = await toBlobUrl(entry);
      nextGallery.push(url ?? entry);
      if (url) galleryChanged = true;
    }

    if (!image && !galleryChanged) continue;
    console.log(`projects#${project.id} "${project.title}" → image:${Boolean(image)} gallery:${galleryChanged}`);
    changed += 1;
    if (dryRun) continue;
    await sql`
      UPDATE projects
      SET image = ${image ?? project.image},
          images = ${JSON.stringify(nextGallery)}::jsonb,
          updated_at = NOW()
      WHERE id = ${project.id}
    `;
  }

  /* ── v2_projects: the reel plate ────────────────────────────────────────── */
  const reel = await sql`SELECT id, slug, plate_src FROM v2_projects`;
  for (const project of reel) {
    const url = await toBlobUrl(project.plate_src);
    if (!url) continue;
    console.log(`v2_projects "${project.slug}".plate_src → ${url}`);
    changed += 1;
    if (dryRun) continue;
    await sql`
      UPDATE v2_projects SET plate_src = ${url}, updated_at = NOW() WHERE id = ${project.id}
    `;
  }

  console.log(
    dryRun
      ? `\nDry run: ${changed} reference(s) would move, ${uploaded.size} file(s) would upload.`
      : `\nDone: ${changed} reference(s) repointed, ${uploaded.size} file(s) uploaded.`,
  );

  if (missing.size) {
    console.warn(
      `\n${missing.size} reference(s) point at /uploads files that are not on this machine ` +
        `and were left unchanged — re-upload these in the dashboard:\n  ` +
        [...missing].join("\n  "),
    );
  }
}

run().catch((error) => {
  console.error("Upload migration failed:", error);
  process.exit(1);
});
