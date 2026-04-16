import "server-only";

import { getSql } from "@/lib/db";
import { fallbackProfile } from "@/lib/dashboard/fallback-profile";
import type {
  BlogRecord,
  DashboardOverview,
  ExperienceRecord,
  PortfolioSettings,
  ProjectRecord,
  ReviewRecord,
  SocialLink,
  StackCategory,
  StackTool,
} from "@/lib/dashboard/types";

type Row = Record<string, unknown>;

function parseNumber(value: unknown, fallback = 0) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function parseString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function parseBoolean(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function parseJsonArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }

  return [];
}

function toIsoDate(value: unknown) {
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  return new Date().toISOString();
}

function mapSettings(row: Row): PortfolioSettings {
  const socials = parseJsonArray<SocialLink>(row.socials).map((item) => ({
    iconName: parseString(item?.iconName, "link"),
    link: parseString(item?.link),
  }));

  return {
    id: parseNumber(row.id, 1),
    name: parseString(row.name, fallbackProfile.name),
    totalProjects: parseNumber(row.total_projects, fallbackProfile.totalProjects),
    yearsOfExperience: parseNumber(row.years_of_experience, fallbackProfile.yearsOfExperience),
    availability: parseString(row.availability, fallbackProfile.availability),
    designations: parseJsonArray<string>(row.designations),
    shortSummary: parseString(row.short_summary, fallbackProfile.shortSummary),
    primaryAvatar: parseString(row.primary_avatar, fallbackProfile.primaryAvatar),
    subAvatar: parseString(row.sub_avatar, fallbackProfile.subAvatar),
    bannerImage: parseString(row.banner_image, fallbackProfile.bannerImage),
    location: parseString(row.location, fallbackProfile.location),
    email: parseString(row.email, fallbackProfile.email),
    phone: parseString(row.phone, fallbackProfile.phone),
    socials: socials.length ? socials : fallbackProfile.socials,
    happyClients: parseNumber(row.happy_clients, fallbackProfile.happyClients),
    currentlyFocusedOn: parseJsonArray<string>(row.currently_focused_on),
    detailedSummary: parseString(row.detailed_summary, fallbackProfile.detailedSummary),
    updatedAt: toIsoDate(row.updated_at),
  };
}

function mapProject(row: Row): ProjectRecord {
  return {
    id: parseNumber(row.id),
    title: parseString(row.title),
    subtitle: parseString(row.subtitle),
    role: parseString(row.role),
    description: parseJsonArray<string>(row.description),
    image: parseString(row.image),
    images: parseJsonArray<string>(row.images),
    tech: parseJsonArray<string>(row.tech),
    github: parseString(row.github),
    demo: parseString(row.demo),
    featured: parseBoolean(row.featured),
    accent: parseString(row.accent, "#3b82f6"),
    tag: parseString(row.tag),
    sortOrder: parseNumber(row.sort_order),
  };
}

function mapExperience(row: Row): ExperienceRecord {
  return {
    id: parseNumber(row.id),
    title: parseString(row.title),
    company: parseString(row.company),
    location: parseString(row.location),
    duration: parseString(row.duration),
    type: parseString(row.type),
    description: parseJsonArray<string>(row.description),
    tech: parseJsonArray<string>(row.tech),
    current: parseBoolean(row.current),
    accent: parseString(row.accent, "#3b82f6"),
    sortOrder: parseNumber(row.sort_order),
  };
}

function mapBlog(row: Row): BlogRecord {
  return {
    id: parseNumber(row.id),
    title: parseString(row.title),
    slug: parseString(row.slug),
    excerpt: parseString(row.excerpt),
    content: parseString(row.content),
    published: parseBoolean(row.published),
    updatedAt: toIsoDate(row.updated_at),
  };
}

function mapReview(row: Row): ReviewRecord {
  return {
    id: parseNumber(row.id),
    clientName: parseString(row.client_name),
    clientRole: parseString(row.client_role),
    quote: parseString(row.quote),
    rating: parseNumber(row.rating, 5),
    featured: parseBoolean(row.featured),
    updatedAt: toIsoDate(row.updated_at),
  };
}

function mapStackTool(row: Row): StackTool {
  return {
    id: parseNumber(row.id),
    categoryId: parseNumber(row.category_id),
    name: parseString(row.name),
    color: parseString(row.color, "#94a3b8"),
    iconName: parseString(row.icon_name),
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export type PortfolioSettingsInput = Omit<PortfolioSettings, "id" | "updatedAt">;

export async function getPortfolioSettings() {
  const sql = getSql();
  const rows = await sql`SELECT * FROM portfolio_settings WHERE id = 1 LIMIT 1`;
  const row = rows[0] as Row | undefined;
  return row ? mapSettings(row) : null;
}

export async function getPublicPortfolioSettings() {
  const settings = await getPortfolioSettings();
  return settings ?? fallbackProfile;
}

export async function upsertPortfolioSettings(input: PortfolioSettingsInput) {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO portfolio_settings (
      id,
      name,
      total_projects,
      years_of_experience,
      availability,
      designations,
      short_summary,
      primary_avatar,
      sub_avatar,
      banner_image,
      location,
      email,
      phone,
      socials,
      happy_clients,
      currently_focused_on,
      detailed_summary,
      updated_at
    )
    VALUES (
      1,
      ${input.name},
      ${input.totalProjects},
      ${input.yearsOfExperience},
      ${input.availability},
      ${JSON.stringify(input.designations)}::jsonb,
      ${input.shortSummary},
      ${input.primaryAvatar},
      ${input.subAvatar},
      ${input.bannerImage},
      ${input.location},
      ${input.email},
      ${input.phone},
      ${JSON.stringify(input.socials)}::jsonb,
      ${input.happyClients},
      ${JSON.stringify(input.currentlyFocusedOn)}::jsonb,
      ${input.detailedSummary},
      NOW()
    )
    ON CONFLICT (id)
    DO UPDATE SET
      name = EXCLUDED.name,
      total_projects = EXCLUDED.total_projects,
      years_of_experience = EXCLUDED.years_of_experience,
      availability = EXCLUDED.availability,
      designations = EXCLUDED.designations,
      short_summary = EXCLUDED.short_summary,
      primary_avatar = EXCLUDED.primary_avatar,
      sub_avatar = EXCLUDED.sub_avatar,
      banner_image = EXCLUDED.banner_image,
      location = EXCLUDED.location,
      email = EXCLUDED.email,
      phone = EXCLUDED.phone,
      socials = EXCLUDED.socials,
      happy_clients = EXCLUDED.happy_clients,
      currently_focused_on = EXCLUDED.currently_focused_on,
      detailed_summary = EXCLUDED.detailed_summary,
      updated_at = NOW()
    RETURNING *
  `;

  return mapSettings(rows[0] as Row);
}

export async function listStackCategories() {
  const sql = getSql();
  const rows = await sql`
    SELECT
      c.id,
      c.key,
      c.label,
      c.accent,
      COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'id', t.id,
            'categoryId', t.category_id,
            'name', t.name,
            'color', t.color,
            'iconName', t.icon_name
          )
          ORDER BY t.id
        ) FILTER (WHERE t.id IS NOT NULL),
        '[]'::jsonb
      ) AS tools
    FROM stack_categories c
    LEFT JOIN stack_tools t ON t.category_id = c.id
    GROUP BY c.id
    ORDER BY c.id
  `;

  return (rows as Row[]).map((row) => ({
    id: parseNumber(row.id),
    key: parseString(row.key),
    label: parseString(row.label),
    accent: parseString(row.accent, "#3b82f6"),
    tools: parseJsonArray<StackTool>(row.tools),
  })) as StackCategory[];
}

export async function createStackCategory(input: { label: string; accent: string; key?: string }) {
  const sql = getSql();
  const key = input.key?.trim() || slugify(input.label);
  const rows = await sql`
    INSERT INTO stack_categories (key, label, accent, updated_at)
    VALUES (${key}, ${input.label}, ${input.accent}, NOW())
    RETURNING id, key, label, accent
  `;

  return {
    id: parseNumber(rows[0]?.id),
    key: parseString(rows[0]?.key),
    label: parseString(rows[0]?.label),
    accent: parseString(rows[0]?.accent),
    tools: [],
  } as StackCategory;
}

export async function updateStackCategory(
  id: number,
  input: { label: string; accent: string; key?: string },
) {
  const sql = getSql();
  const key = input.key?.trim() || slugify(input.label);
  const rows = await sql`
    UPDATE stack_categories
    SET key = ${key}, label = ${input.label}, accent = ${input.accent}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, key, label, accent
  `;

  const row = rows[0] as Row | undefined;
  if (!row) return null;
  return {
    id: parseNumber(row.id),
    key: parseString(row.key),
    label: parseString(row.label),
    accent: parseString(row.accent),
    tools: [],
  } as StackCategory;
}

export async function deleteStackCategory(id: number) {
  const sql = getSql();
  await sql`DELETE FROM stack_categories WHERE id = ${id}`;
}

export async function createStackTool(input: {
  categoryId: number;
  name: string;
  color: string;
  iconName: string;
}) {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO stack_tools (category_id, name, color, icon_name, updated_at)
    VALUES (${input.categoryId}, ${input.name}, ${input.color}, ${input.iconName}, NOW())
    RETURNING *
  `;

  return mapStackTool(rows[0] as Row);
}

export async function updateStackTool(
  id: number,
  input: { name: string; color: string; iconName: string },
) {
  const sql = getSql();
  const rows = await sql`
    UPDATE stack_tools
    SET name = ${input.name}, color = ${input.color}, icon_name = ${input.iconName}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;

  const row = rows[0] as Row | undefined;
  return row ? mapStackTool(row) : null;
}

export async function deleteStackTool(id: number) {
  const sql = getSql();
  await sql`DELETE FROM stack_tools WHERE id = ${id}`;
}

export type ProjectInput = Omit<ProjectRecord, "id" | "sortOrder"> & { sortOrder?: number };

export async function listProjects() {
  const sql = getSql();
  const rows = await sql`SELECT * FROM projects ORDER BY sort_order ASC, id ASC`;
  return (rows as Row[]).map(mapProject);
}

export async function createProject(input: ProjectInput) {
  const sql = getSql();
  const nextOrderRows = await sql`SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order FROM projects`;
  const sortOrder = input.sortOrder ?? parseNumber(nextOrderRows[0]?.next_order, 1);

  const rows = await sql`
    INSERT INTO projects (
      title, subtitle, role, description, image, images, tech, github, demo, featured, accent, tag, sort_order, updated_at
    )
    VALUES (
      ${input.title},
      ${input.subtitle},
      ${input.role},
      ${JSON.stringify(input.description)}::jsonb,
      ${input.image},
      ${JSON.stringify(input.images)}::jsonb,
      ${JSON.stringify(input.tech)}::jsonb,
      ${input.github},
      ${input.demo},
      ${input.featured},
      ${input.accent},
      ${input.tag},
      ${sortOrder},
      NOW()
    )
    RETURNING *
  `;
  return mapProject(rows[0] as Row);
}

export async function updateProject(id: number, input: ProjectInput) {
  const sql = getSql();
  const rows = await sql`
    UPDATE projects
    SET
      title = ${input.title},
      subtitle = ${input.subtitle},
      role = ${input.role},
      description = ${JSON.stringify(input.description)}::jsonb,
      image = ${input.image},
      images = ${JSON.stringify(input.images)}::jsonb,
      tech = ${JSON.stringify(input.tech)}::jsonb,
      github = ${input.github},
      demo = ${input.demo},
      featured = ${input.featured},
      accent = ${input.accent},
      tag = ${input.tag},
      sort_order = ${input.sortOrder ?? 0},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;

  const row = rows[0] as Row | undefined;
  return row ? mapProject(row) : null;
}

export async function deleteProject(id: number) {
  const sql = getSql();
  await sql`DELETE FROM projects WHERE id = ${id}`;
}

export type ExperienceInput = Omit<ExperienceRecord, "id" | "sortOrder"> & { sortOrder?: number };

export async function listExperiences() {
  const sql = getSql();
  const rows = await sql`SELECT * FROM experiences ORDER BY sort_order ASC, id ASC`;
  return (rows as Row[]).map(mapExperience);
}

export async function createExperience(input: ExperienceInput) {
  const sql = getSql();
  const nextOrderRows =
    await sql`SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order FROM experiences`;
  const sortOrder = input.sortOrder ?? parseNumber(nextOrderRows[0]?.next_order, 1);

  const rows = await sql`
    INSERT INTO experiences (
      title, company, location, duration, type, description, tech, current, accent, sort_order, updated_at
    )
    VALUES (
      ${input.title},
      ${input.company},
      ${input.location},
      ${input.duration},
      ${input.type},
      ${JSON.stringify(input.description)}::jsonb,
      ${JSON.stringify(input.tech)}::jsonb,
      ${input.current},
      ${input.accent},
      ${sortOrder},
      NOW()
    )
    RETURNING *
  `;
  return mapExperience(rows[0] as Row);
}

export async function updateExperience(id: number, input: ExperienceInput) {
  const sql = getSql();
  const rows = await sql`
    UPDATE experiences
    SET
      title = ${input.title},
      company = ${input.company},
      location = ${input.location},
      duration = ${input.duration},
      type = ${input.type},
      description = ${JSON.stringify(input.description)}::jsonb,
      tech = ${JSON.stringify(input.tech)}::jsonb,
      current = ${input.current},
      accent = ${input.accent},
      sort_order = ${input.sortOrder ?? 0},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;

  const row = rows[0] as Row | undefined;
  return row ? mapExperience(row) : null;
}

export async function deleteExperience(id: number) {
  const sql = getSql();
  await sql`DELETE FROM experiences WHERE id = ${id}`;
}

export type BlogInput = Omit<BlogRecord, "id" | "updatedAt">;

export async function listBlogs() {
  const sql = getSql();
  const rows = await sql`SELECT * FROM blogs ORDER BY updated_at DESC, id DESC`;
  return (rows as Row[]).map(mapBlog);
}

export async function createBlog(input: BlogInput) {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO blogs (title, slug, excerpt, content, published, updated_at)
    VALUES (${input.title}, ${input.slug}, ${input.excerpt}, ${input.content}, ${input.published}, NOW())
    RETURNING *
  `;
  return mapBlog(rows[0] as Row);
}

export async function updateBlog(id: number, input: BlogInput) {
  const sql = getSql();
  const rows = await sql`
    UPDATE blogs
    SET
      title = ${input.title},
      slug = ${input.slug},
      excerpt = ${input.excerpt},
      content = ${input.content},
      published = ${input.published},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;

  const row = rows[0] as Row | undefined;
  return row ? mapBlog(row) : null;
}

export async function deleteBlog(id: number) {
  const sql = getSql();
  await sql`DELETE FROM blogs WHERE id = ${id}`;
}

export type ReviewInput = Omit<ReviewRecord, "id" | "updatedAt">;

export async function listReviews() {
  const sql = getSql();
  const rows = await sql`SELECT * FROM reviews ORDER BY updated_at DESC, id DESC`;
  return (rows as Row[]).map(mapReview);
}

export async function createReview(input: ReviewInput) {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO reviews (client_name, client_role, quote, rating, featured, updated_at)
    VALUES (${input.clientName}, ${input.clientRole}, ${input.quote}, ${input.rating}, ${input.featured}, NOW())
    RETURNING *
  `;
  return mapReview(rows[0] as Row);
}

export async function updateReview(id: number, input: ReviewInput) {
  const sql = getSql();
  const rows = await sql`
    UPDATE reviews
    SET
      client_name = ${input.clientName},
      client_role = ${input.clientRole},
      quote = ${input.quote},
      rating = ${input.rating},
      featured = ${input.featured},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;

  const row = rows[0] as Row | undefined;
  return row ? mapReview(row) : null;
}

export async function deleteReview(id: number) {
  const sql = getSql();
  await sql`DELETE FROM reviews WHERE id = ${id}`;
}

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      (SELECT COUNT(*)::int FROM projects) AS projects,
      (SELECT COUNT(*)::int FROM reviews) AS reviews,
      (SELECT COUNT(*)::int FROM experiences) AS experiences,
      (SELECT COUNT(*)::int FROM stack_categories) AS skills,
      (SELECT COUNT(*)::int FROM blogs) AS blog_posts,
      (SELECT COUNT(*)::int FROM stack_tools) AS stack_tools,
      (
        SELECT MAX(updated_at)
        FROM (
          SELECT updated_at FROM portfolio_settings
          UNION ALL
          SELECT updated_at FROM projects
          UNION ALL
          SELECT updated_at FROM experiences
          UNION ALL
          SELECT updated_at FROM stack_categories
          UNION ALL
          SELECT updated_at FROM stack_tools
          UNION ALL
          SELECT updated_at FROM reviews
          UNION ALL
          SELECT updated_at FROM blogs
        ) updates
      ) AS last_updated
  `;

  const row = rows[0] as Row;
  return {
    projects: parseNumber(row.projects),
    reviews: parseNumber(row.reviews),
    experiences: parseNumber(row.experiences),
    skills: parseNumber(row.skills),
    blogPosts: parseNumber(row.blog_posts),
    stackTools: parseNumber(row.stack_tools),
    lastUpdated: row.last_updated ? toIsoDate(row.last_updated) : null,
  };
}

