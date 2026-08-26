/**
 * Seeds the v2 skills reel and nothing else.
 *
 * Deliberately separate from `seed.mjs`. That script TRUNCATEs the whole
 * portfolio — settings, projects, experiences, reviews, messages — which is the
 * right behaviour for standing a fresh database up and the wrong behaviour
 * entirely for loading one section into a database that is already live. This
 * one touches two tables and is safe to re-run against production data.
 *
 * Idempotent: it replaces the contents of the v2 skill tables rather than
 * appending, so running it twice leaves the same 6 sections, not 12.
 *
 *   node scripts/db/seed-skills-v2.mjs      (or: npm run db:seed:skills)
 */

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { neon } from "@neondatabase/serverless";

import { V2_SKILL_SECTIONS } from "./data/skills-v2.mjs";

function loadEnvFile(fileName) {
  const envPath = path.resolve(process.cwd(), fileName);
  if (!existsSync(envPath)) return;

  const content = readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    // First writer wins, so `.env.local` keeps precedence over `.env`.
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

async function run() {
  loadEnvFile(".env.local");
  loadEnvFile(".env");

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing. Add it to .env.local, .env, or your environment.");
  }

  const sql = neon(process.env.DATABASE_URL);

  // CASCADE reaches v2_skill_items through its foreign key; RESTART IDENTITY
  // keeps ids stable across re-seeds so nothing downstream drifts.
  await sql`TRUNCATE TABLE v2_skill_sections RESTART IDENTITY CASCADE;`;

  let skillCount = 0;

  for (const [index, section] of V2_SKILL_SECTIONS.entries()) {
    const rows = await sql`
      INSERT INTO v2_skill_sections (key, title, subtitle, description, layer, accent, sort_order, updated_at)
      VALUES (
        ${section.key},
        ${section.title},
        ${section.subtitle ?? ""},
        ${section.description ?? ""},
        ${section.layer ?? ""},
        ${section.accent ?? "#60a5fa"},
        ${section.sortOrder ?? index},
        NOW()
      )
      RETURNING id;
    `;
    const sectionId = Number(rows[0].id);

    for (const [k, skill] of (section.skills ?? []).entries()) {
      await sql`
        INSERT INTO v2_skill_items (section_id, name, title, icon, note, weight, sort_order, updated_at)
        VALUES (
          ${sectionId},
          ${skill.name},
          ${skill.title ?? ""},
          ${skill.icon ?? ""},
          ${skill.note ?? ""},
          ${Number(skill.weight) || 0.55},
          ${skill.sortOrder ?? k},
          NOW()
        );
      `;
      skillCount += 1;
    }
  }

  console.log(
    `v2 skills seeded: ${V2_SKILL_SECTIONS.length} sections, ${skillCount} skills.`
  );
}

run().catch((error) => {
  console.error("v2 skills seed failed:", error);
  process.exit(1);
});
