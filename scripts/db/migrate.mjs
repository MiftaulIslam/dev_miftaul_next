import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { neon } from "@neondatabase/serverless";

function loadEnvFile(fileName) {
  const envPath = path.resolve(process.cwd(), fileName);
  if (!existsSync(envPath)) return;

  const content = readFileSync(envPath, "utf8");
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (value.startsWith("\"") && value.endsWith("\"")) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

// `.env.local` is read first so it keeps precedence over `.env`, matching how
// Next.js layers them. `.env` is where this repo actually keeps DATABASE_URL.
function loadLocalEnv() {
  loadEnvFile(".env.local");
  loadEnvFile(".env");
}

async function run() {
  loadLocalEnv();

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing. Add it to .env.local, .env, or your environment.");
  }

  const sql = neon(process.env.DATABASE_URL);

  await sql`
    CREATE TABLE IF NOT EXISTS portfolio_settings (
      id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
      name TEXT NOT NULL,
      total_projects INTEGER NOT NULL DEFAULT 0,
      years_of_experience INTEGER NOT NULL DEFAULT 0,
      availability TEXT NOT NULL DEFAULT '',
      designations JSONB NOT NULL DEFAULT '[]'::jsonb,
      short_summary TEXT NOT NULL DEFAULT '',
      primary_avatar TEXT NOT NULL DEFAULT '',
      sub_avatar TEXT NOT NULL DEFAULT '',
      banner_image TEXT NOT NULL DEFAULT '',
      location TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      socials JSONB NOT NULL DEFAULT '[]'::jsonb,
      happy_clients INTEGER NOT NULL DEFAULT 0,
      currently_focused_on JSONB NOT NULL DEFAULT '[]'::jsonb,
      detailed_summary TEXT NOT NULL DEFAULT '',
      site_version TEXT NOT NULL DEFAULT 'v1',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  // Databases created before the site version became server-controlled are
  // missing the column; ADD COLUMN IF NOT EXISTS keeps this safe to re-run.
  await sql`
    ALTER TABLE portfolio_settings
    ADD COLUMN IF NOT EXISTS site_version TEXT NOT NULL DEFAULT 'v1';
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS stack_categories (
      id SERIAL PRIMARY KEY,
      key TEXT NOT NULL UNIQUE,
      label TEXT NOT NULL,
      accent TEXT NOT NULL DEFAULT '#3b82f6',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS stack_tools (
      id SERIAL PRIMARY KEY,
      category_id INTEGER NOT NULL REFERENCES stack_categories(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT '#94a3b8',
      icon_name TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_stack_tools_category_id ON stack_tools(category_id);
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      subtitle TEXT NOT NULL DEFAULT '',
      role TEXT NOT NULL DEFAULT '',
      description JSONB NOT NULL DEFAULT '[]'::jsonb,
      image TEXT NOT NULL DEFAULT '',
      images JSONB NOT NULL DEFAULT '[]'::jsonb,
      tech JSONB NOT NULL DEFAULT '[]'::jsonb,
      github TEXT NOT NULL DEFAULT '#',
      demo TEXT NOT NULL DEFAULT '#',
      featured BOOLEAN NOT NULL DEFAULT FALSE,
      accent TEXT NOT NULL DEFAULT '#3b82f6',
      tag TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS experiences (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      location TEXT NOT NULL DEFAULT '',
      duration TEXT NOT NULL DEFAULT '',
      type TEXT NOT NULL DEFAULT '',
      description JSONB NOT NULL DEFAULT '[]'::jsonb,
      tech JSONB NOT NULL DEFAULT '[]'::jsonb,
      current BOOLEAN NOT NULL DEFAULT FALSE,
      accent TEXT NOT NULL DEFAULT '#3b82f6',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS blogs (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      excerpt TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      published BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      client_name TEXT NOT NULL,
      client_role TEXT NOT NULL DEFAULT '',
      quote TEXT NOT NULL,
      rating INTEGER NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
      featured BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL DEFAULT '',
      message TEXT NOT NULL,
      read BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  // ── v2 skills ─────────────────────────────────────────────────────────────
  // Separate tables rather than more columns on stack_categories/stack_tools,
  // because the two models are not the same thing. The v1 stack is a flat list
  // of tool chips: a name, a brand colour, an icon. The v2 reel is authored
  // copy — every section carries a title, a subtitle and a description, and
  // every skill carries the one-line title that appears beside its name. Bolting
  // those onto the v1 tables would leave half the columns null for v1 and force
  // the v1 dashboard panel to edit fields it has no business showing.
  await sql`
    CREATE TABLE IF NOT EXISTS v2_skill_sections (
      id SERIAL PRIMARY KEY,
      key TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      subtitle TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      layer TEXT NOT NULL DEFAULT '',
      accent TEXT NOT NULL DEFAULT '#60a5fa',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  // No `years` column, deliberately: it is not modelled on either version.
  // `weight` is not a rendered number — it drives icon size and ordering only.
  await sql`
    CREATE TABLE IF NOT EXISTS v2_skill_items (
      id SERIAL PRIMARY KEY,
      section_id INTEGER NOT NULL REFERENCES v2_skill_sections(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      title TEXT NOT NULL DEFAULT '',
      icon TEXT NOT NULL DEFAULT '',
      note TEXT NOT NULL DEFAULT '',
      weight REAL NOT NULL DEFAULT 0.55,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_v2_skill_items_section_id ON v2_skill_items(section_id);
  `;

  // ── v2 projects ───────────────────────────────────────────────────────────
  // Separate from `projects` for the same reason the v2 skill tables are
  // separate from `stack_categories`: the two are not the same record. The v1
  // project is a card — a title, a subtitle, bullets, a thumbnail. The v2 reel
  // entry is a case study: it carries a stable slug (the /work/[slug] route
  // param and the plate drawing seed), a shipping year, a one-noun discipline,
  // the problem/outcome pair the reel reads out, an honestly-named plate with
  // its own focal point, and a long-form body. Bolting eleven columns onto
  // `projects` would leave all of them null for v1 and force the v1 panel to
  // show fields it has no business editing.
  await sql`
    CREATE TABLE IF NOT EXISTS v2_projects (
      id SERIAL PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      year TEXT NOT NULL DEFAULT '',
      discipline TEXT NOT NULL DEFAULT '',
      role TEXT NOT NULL DEFAULT '',
      problem TEXT NOT NULL DEFAULT '',
      outcome TEXT NOT NULL DEFAULT '',
      tech JSONB NOT NULL DEFAULT '[]'::jsonb,
      accent TEXT NOT NULL DEFAULT '#3b82f6',
      plate_src TEXT NOT NULL DEFAULT '',
      plate_caption TEXT NOT NULL DEFAULT '',
      plate_focus TEXT NOT NULL DEFAULT '',
      link_live TEXT NOT NULL DEFAULT '',
      link_source TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  // The case body is rows rather than one JSONB column so a heading can be
  // reordered, added or removed in the dashboard without rewriting the whole
  // document. `body` stays JSONB because a block's paragraphs are only ever
  // read and written together — they have no identity of their own.
  await sql`
    CREATE TABLE IF NOT EXISTS v2_project_cases (
      id SERIAL PRIMARY KEY,
      project_id INTEGER NOT NULL REFERENCES v2_projects(id) ON DELETE CASCADE,
      heading TEXT NOT NULL DEFAULT '',
      body JSONB NOT NULL DEFAULT '[]'::jsonb,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_v2_project_cases_project_id ON v2_project_cases(project_id);
  `;

  console.log("Database migration complete.");
}

run().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
