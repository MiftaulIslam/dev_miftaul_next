/**
 * Seeds the v2 projects reel and nothing else.
 *
 * Deliberately separate from `seed.mjs`, for the same reason
 * `seed-skills-v2.mjs` is: that script TRUNCATEs the whole portfolio, which is
 * right for standing a fresh database up and wrong for loading one section into
 * a database that is already live. This one touches two tables.
 *
 * Idempotent by slug rather than by TRUNCATE. The skills seed can truncate
 * safely because nothing links to a skill row; a project's slug is a public URL
 * (`/work/crebrains`) and its id is what the case rows hang off, so re-seeding
 * upserts on the slug and keeps both stable. Projects present in the database
 * but absent from the seed file are left alone — a project added in the
 * dashboard must survive a re-seed, or the seed becomes a thing you are afraid
 * to run.
 *
 * Case blocks are the exception: they are replaced wholesale per seeded project,
 * because a block has no stable identity to match on and appending would
 * duplicate the whole body on the second run.
 *
 *   node scripts/db/seed-projects-v2.mjs      (or: npm run db:seed:projects)
 */

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { neon } from "@neondatabase/serverless";

import { V2_PROJECTS } from "./data/projects-v2.mjs";

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

  let caseCount = 0;

  for (const [index, project] of V2_PROJECTS.entries()) {
    const rows = await sql`
      INSERT INTO v2_projects (
        slug, name, year, discipline, role, problem, outcome, tech, accent,
        plate_src, plate_caption, plate_focus, link_live, link_source, sort_order, updated_at
      )
      VALUES (
        ${project.slug},
        ${project.name},
        ${project.year ?? ""},
        ${project.discipline ?? ""},
        ${project.role ?? ""},
        ${project.problem ?? ""},
        ${project.outcome ?? ""},
        ${JSON.stringify(project.tech ?? [])}::jsonb,
        ${project.accent ?? "#3b82f6"},
        ${project.plate?.src ?? ""},
        ${project.plate?.caption ?? ""},
        ${project.plate?.focus ?? ""},
        ${project.links?.live ?? ""},
        ${project.links?.source ?? ""},
        ${project.sortOrder ?? index},
        NOW()
      )
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        year = EXCLUDED.year,
        discipline = EXCLUDED.discipline,
        role = EXCLUDED.role,
        problem = EXCLUDED.problem,
        outcome = EXCLUDED.outcome,
        tech = EXCLUDED.tech,
        accent = EXCLUDED.accent,
        plate_src = EXCLUDED.plate_src,
        plate_caption = EXCLUDED.plate_caption,
        plate_focus = EXCLUDED.plate_focus,
        link_live = EXCLUDED.link_live,
        link_source = EXCLUDED.link_source,
        sort_order = EXCLUDED.sort_order,
        updated_at = NOW()
      RETURNING id;
    `;
    const projectId = Number(rows[0].id);

    // Replace, do not append: a case block has no stable key to upsert on.
    await sql`DELETE FROM v2_project_cases WHERE project_id = ${projectId};`;

    for (const [k, block] of (project.cases ?? []).entries()) {
      await sql`
        INSERT INTO v2_project_cases (project_id, heading, body, sort_order, updated_at)
        VALUES (
          ${projectId},
          ${block.heading ?? ""},
          ${JSON.stringify(block.body ?? [])}::jsonb,
          ${block.sortOrder ?? k},
          NOW()
        );
      `;
      caseCount += 1;
    }
  }

  console.log(
    `v2 projects seeded: ${V2_PROJECTS.length} projects, ${caseCount} case blocks.`
  );
}

run().catch((error) => {
  console.error("v2 projects seed failed:", error);
  process.exit(1);
});
