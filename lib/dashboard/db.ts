import "server-only";

import { getSql } from "@/lib/db";
import { fallbackProfile } from "@/lib/dashboard/fallback-profile";
import { coerceSiteVersion, DEFAULT_SITE_VERSION, type SiteVersion } from "@/lib/siteVersion";
import type {
  BlogRecord,
  DashboardOverview,
  ExperienceRecord,
  MessageRecord,
  PortfolioSettings,
  ProjectRecord,
  ReviewRecord,
  SocialLink,
  StackCategory,
  StackTool,
  V2ProjectCaseBlock,
  V2ProjectRecord,
  V2SkillItem,
  V2SkillSection,
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
    siteVersion: coerceSiteVersion(row.site_version),
    // Tolerates the column not existing yet: an undefined value falls back
    // to the shipped default rather than reading as false.
    introEnabled: row.intro_enabled == null ? fallbackProfile.introEnabled : Boolean(row.intro_enabled),
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

function mapMessage(row: Row): MessageRecord {
  return {
    id: parseNumber(row.id),
    name: parseString(row.name),
    email: parseString(row.email),
    subject: parseString(row.subject),
    message: parseString(row.message),
    read: parseBoolean(row.read),
    createdAt: toIsoDate(row.created_at),
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

/**
 * Narrow read for the public config endpoint.
 *
 * Total by contract: a missing row, an unset column, or any database failure
 * resolves to the default version instead of throwing, so an outage degrades
 * the site to v1 rather than breaking every visitor page.
 */
export async function getSiteVersion(): Promise<SiteVersion> {
  try {
    const sql = getSql();
    const rows = await sql`SELECT site_version FROM portfolio_settings WHERE id = 1 LIMIT 1`;
    const row = rows[0] as Row | undefined;
    return row ? coerceSiteVersion(row.site_version) : DEFAULT_SITE_VERSION;
  } catch {
    return DEFAULT_SITE_VERSION;
  }
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
      site_version,
      intro_enabled,
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
      ${coerceSiteVersion(input.siteVersion)},
      ${input.introEnabled !== false},
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
      site_version = EXCLUDED.site_version,
      intro_enabled = EXCLUDED.intro_enabled,
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

/* ── v2 skills ───────────────────────────────────────────────────────────────
   The reel's own tables. Separate from stack_categories/stack_tools because the
   v2 model carries authored copy per section and per skill, which the v1 chip
   list does not have and does not want. */

function mapV2Section(row: Row): V2SkillSection {
  return {
    id: parseNumber(row.id),
    key: parseString(row.key),
    title: parseString(row.title),
    subtitle: parseString(row.subtitle),
    description: parseString(row.description),
    layer: parseString(row.layer),
    accent: parseString(row.accent, "#60a5fa"),
    sortOrder: parseNumber(row.sort_order),
    skills: parseJsonArray<V2SkillItem>(row.skills).map((skill) => ({
      id: parseNumber(skill?.id),
      sectionId: parseNumber(skill?.sectionId),
      name: parseString(skill?.name),
      title: parseString(skill?.title),
      icon: parseString(skill?.icon),
      note: parseString(skill?.note),
      // 0.55 matches the seed default: mid weight, no visual emphasis either way.
      weight: parseNumber(skill?.weight, 0.55),
      sortOrder: parseNumber(skill?.sortOrder),
    })),
  };
}

export async function listV2SkillSections(): Promise<V2SkillSection[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      s.id,
      s.key,
      s.title,
      s.subtitle,
      s.description,
      s.layer,
      s.accent,
      s.sort_order,
      COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'id', i.id,
            'sectionId', i.section_id,
            'name', i.name,
            'title', i.title,
            'icon', i.icon,
            'note', i.note,
            'weight', i.weight,
            'sortOrder', i.sort_order
          )
          ORDER BY i.sort_order, i.id
        ) FILTER (WHERE i.id IS NOT NULL),
        '[]'::jsonb
      ) AS skills
    FROM v2_skill_sections s
    LEFT JOIN v2_skill_items i ON i.section_id = s.id
    GROUP BY s.id
    ORDER BY s.sort_order, s.id
  `;

  return (rows as Row[]).map(mapV2Section);
}

/** Never throws: the reel falls back to its static copy rather than showing an error. */
export async function listV2SkillSectionsSafe(): Promise<V2SkillSection[]> {
  try {
    return await listV2SkillSections();
  } catch {
    return [];
  }
}

async function getV2Section(id: number): Promise<V2SkillSection | null> {
  const sections = await listV2SkillSections();
  return sections.find((section) => section.id === id) ?? null;
}

export async function createV2SkillSection(input: {
  key?: string;
  title: string;
  subtitle?: string;
  description?: string;
  layer?: string;
  accent?: string;
  sortOrder?: number;
}) {
  const sql = getSql();
  const key = input.key?.trim() || slugify(input.title);
  const rows = await sql`
    INSERT INTO v2_skill_sections (key, title, subtitle, description, layer, accent, sort_order, updated_at)
    VALUES (
      ${key},
      ${input.title},
      ${input.subtitle ?? ""},
      ${input.description ?? ""},
      ${input.layer ?? ""},
      ${input.accent ?? "#60a5fa"},
      ${input.sortOrder ?? 0},
      NOW()
    )
    RETURNING id
  `;
  return getV2Section(parseNumber((rows as Row[])[0]?.id));
}

export async function updateV2SkillSection(
  id: number,
  input: {
    key?: string;
    title: string;
    subtitle?: string;
    description?: string;
    layer?: string;
    accent?: string;
    sortOrder?: number;
  },
) {
  const sql = getSql();
  const key = input.key?.trim() || slugify(input.title);
  const rows = await sql`
    UPDATE v2_skill_sections
    SET
      key = ${key},
      title = ${input.title},
      subtitle = ${input.subtitle ?? ""},
      description = ${input.description ?? ""},
      layer = ${input.layer ?? ""},
      accent = ${input.accent ?? "#60a5fa"},
      sort_order = ${input.sortOrder ?? 0},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING id
  `;
  if (!(rows as Row[]).length) return null;
  return getV2Section(id);
}

export async function deleteV2SkillSection(id: number) {
  const sql = getSql();
  // The items go with it via ON DELETE CASCADE.
  await sql`DELETE FROM v2_skill_sections WHERE id = ${id}`;
}

export async function createV2SkillItem(input: {
  sectionId: number;
  name: string;
  title?: string;
  icon?: string;
  note?: string;
  weight?: number;
  sortOrder?: number;
}) {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO v2_skill_items (section_id, name, title, icon, note, weight, sort_order, updated_at)
    VALUES (
      ${input.sectionId},
      ${input.name},
      ${input.title ?? ""},
      ${input.icon ?? ""},
      ${input.note ?? ""},
      ${input.weight ?? 0.55},
      ${input.sortOrder ?? 0},
      NOW()
    )
    RETURNING id
  `;
  return { id: parseNumber((rows as Row[])[0]?.id) };
}

export async function updateV2SkillItem(
  id: number,
  input: {
    name: string;
    title?: string;
    icon?: string;
    note?: string;
    weight?: number;
    sortOrder?: number;
  },
) {
  const sql = getSql();
  const rows = await sql`
    UPDATE v2_skill_items
    SET
      name = ${input.name},
      title = ${input.title ?? ""},
      icon = ${input.icon ?? ""},
      note = ${input.note ?? ""},
      weight = ${input.weight ?? 0.55},
      sort_order = ${input.sortOrder ?? 0},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING id
  `;
  return (rows as Row[]).length ? { id } : null;
}

export async function deleteV2SkillItem(id: number) {
  const sql = getSql();
  await sql`DELETE FROM v2_skill_items WHERE id = ${id}`;
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

export type MessageInput = Omit<MessageRecord, "id" | "read" | "createdAt" | "updatedAt"> & {
  read?: boolean;
};

export async function listMessages() {
  const sql = getSql();
  const rows = await sql`SELECT * FROM messages ORDER BY created_at DESC, id DESC`;
  return (rows as Row[]).map(mapMessage);
}

export async function createMessage(input: MessageInput) {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO messages (name, email, subject, message, read, updated_at)
    VALUES (${input.name}, ${input.email}, ${input.subject}, ${input.message}, ${Boolean(input.read)}, NOW())
    RETURNING *
  `;
  return mapMessage(rows[0] as Row);
}

export async function updateMessageRead(id: number, read: boolean) {
  const sql = getSql();
  const rows = await sql`
    UPDATE messages
    SET read = ${read}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  const row = rows[0] as Row | undefined;
  return row ? mapMessage(row) : null;
}

export async function deleteMessage(id: number) {
  const sql = getSql();
  await sql`DELETE FROM messages WHERE id = ${id}`;
}

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      (SELECT COUNT(*)::int FROM projects) AS projects,
      (SELECT COUNT(*)::int FROM v2_projects) AS v2_projects,
      (SELECT COUNT(*)::int FROM reviews) AS reviews,
      (SELECT COUNT(*)::int FROM experiences) AS experiences,
      (SELECT COUNT(*)::int FROM stack_categories) AS skills,
      (SELECT COUNT(*)::int FROM blogs) AS blog_posts,
      (SELECT COUNT(*)::int FROM stack_tools) AS stack_tools,
      (SELECT COUNT(*)::int FROM messages) AS messages,
      (
        SELECT MAX(updated_at)
        FROM (
          SELECT updated_at FROM portfolio_settings
          UNION ALL
          SELECT updated_at FROM projects
          UNION ALL
          SELECT updated_at FROM v2_projects
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
          UNION ALL
          SELECT updated_at FROM messages
        ) updates
      ) AS last_updated
  `;

  const row = rows[0] as Row;
  return {
    projects: parseNumber(row.projects),
    v2Projects: parseNumber(row.v2_projects),
    reviews: parseNumber(row.reviews),
    experiences: parseNumber(row.experiences),
    skills: parseNumber(row.skills),
    blogPosts: parseNumber(row.blog_posts),
    stackTools: parseNumber(row.stack_tools),
    messages: parseNumber(row.messages),
    lastUpdated: row.last_updated ? toIsoDate(row.last_updated) : null,
  };
}

/* ── v2 projects ──────────────────────────────────────────────────────────── */

function mapV2ProjectCase(row: Row): V2ProjectCaseBlock {
  return {
    id: parseNumber(row.id),
    heading: parseString(row.heading),
    body: parseJsonArray<string>(row.body),
    sortOrder: parseNumber(row.sort_order),
  };
}

function mapV2Project(row: Row): V2ProjectRecord {
  return {
    id: parseNumber(row.id),
    slug: parseString(row.slug),
    name: parseString(row.name),
    year: parseString(row.year),
    discipline: parseString(row.discipline),
    role: parseString(row.role),
    problem: parseString(row.problem),
    outcome: parseString(row.outcome),
    tech: parseJsonArray<string>(row.tech),
    accent: parseString(row.accent, "#3b82f6"),
    plateSrc: parseString(row.plate_src),
    plateCaption: parseString(row.plate_caption),
    plateFocus: parseString(row.plate_focus),
    linkLive: parseString(row.link_live),
    linkSource: parseString(row.link_source),
    sortOrder: parseNumber(row.sort_order),
    // Ordered in SQL, and sorted again here. The ORDER BY lives inside a
    // jsonb_agg over a LEFT JOIN, which is a long way from the value anyone
    // reads; re-sorting makes the guarantee local to this function.
    cases: parseJsonArray<Row>(row.cases)
      .map(mapV2ProjectCase)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id),
  };
}

export type V2ProjectInput = Omit<V2ProjectRecord, "id" | "sortOrder" | "cases"> & {
  sortOrder?: number;
  /** Replaces the whole case body. Blocks carry no id — see `writeV2Cases`. */
  cases: { heading: string; body: string[] }[];
};

export async function listV2Projects(): Promise<V2ProjectRecord[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      p.*,
      COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'id', c.id,
            'heading', c.heading,
            'body', c.body,
            'sort_order', c.sort_order
          )
          ORDER BY c.sort_order, c.id
        ) FILTER (WHERE c.id IS NOT NULL),
        '[]'::jsonb
      ) AS cases
    FROM v2_projects p
    LEFT JOIN v2_project_cases c ON c.project_id = p.id
    GROUP BY p.id
    ORDER BY p.sort_order ASC, p.id ASC
  `;
  return (rows as Row[]).map(mapV2Project);
}

/**
 * Same list, but never throws.
 *
 * The public reel and the /work pages call this: a database blip should cost
 * the reader the live copy and nothing more, so the caller can fall back to the
 * static list rather than serving a 500.
 */
export async function listV2ProjectsSafe(): Promise<V2ProjectRecord[]> {
  try {
    return await listV2Projects();
  } catch {
    return [];
  }
}

export async function getV2Project(id: number): Promise<V2ProjectRecord | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      p.*,
      COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'id', c.id,
            'heading', c.heading,
            'body', c.body,
            'sort_order', c.sort_order
          )
          ORDER BY c.sort_order, c.id
        ) FILTER (WHERE c.id IS NOT NULL),
        '[]'::jsonb
      ) AS cases
    FROM v2_projects p
    LEFT JOIN v2_project_cases c ON c.project_id = p.id
    WHERE p.id = ${id}
    GROUP BY p.id
  `;
  const row = (rows as Row[])[0];
  return row ? mapV2Project(row) : null;
}

/**
 * Replaces a project's case body.
 *
 * Delete-then-insert rather than a per-block diff. A block is a heading and some
 * paragraphs — it has no natural key, and the dashboard lets you reorder, insert
 * and delete blocks freely, so matching old rows onto new ones would mean
 * inventing a client-side id or guessing. Rewriting a handful of rows costs
 * nothing and cannot drift.
 */
async function writeV2Cases(projectId: number, blocks: V2ProjectInput["cases"]) {
  const sql = getSql();
  await sql`DELETE FROM v2_project_cases WHERE project_id = ${projectId}`;

  for (const [index, block] of (blocks ?? []).entries()) {
    await sql`
      INSERT INTO v2_project_cases (project_id, heading, body, sort_order, updated_at)
      VALUES (
        ${projectId},
        ${block.heading},
        ${JSON.stringify(block.body ?? [])}::jsonb,
        ${index},
        NOW()
      )
    `;
  }
}

/**
 * Finds a slug that is free.
 *
 * The slug is a public URL, so a collision must not 500 the save — but it must
 * not silently overwrite another project either. Suffixing is the honest middle:
 * the save succeeds, and the dashboard shows the slug it actually got.
 */
async function uniqueV2Slug(desired: string, excludeId?: number) {
  const sql = getSql();
  const base = slugify(desired) || "project";
  let candidate = base;
  const exclude = excludeId ?? 0;

  for (let attempt = 2; attempt < 100; attempt += 1) {
    const rows = await sql`
      SELECT id FROM v2_projects
      WHERE slug = ${candidate} AND id <> ${exclude}
      LIMIT 1
    `;
    if (!(rows as Row[]).length) return candidate;
    candidate = `${base}-${attempt}`;
  }

  return `${base}-${Date.now()}`;
}

export async function createV2Project(input: V2ProjectInput): Promise<V2ProjectRecord> {
  const sql = getSql();
  const nextOrderRows =
    await sql`SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order FROM v2_projects`;
  const sortOrder = input.sortOrder ?? parseNumber(nextOrderRows[0]?.next_order, 1);
  const slug = await uniqueV2Slug(input.slug || input.name);

  const rows = await sql`
    INSERT INTO v2_projects (
      slug, name, year, discipline, role, problem, outcome, tech, accent,
      plate_src, plate_caption, plate_focus, link_live, link_source, sort_order, updated_at
    )
    VALUES (
      ${slug},
      ${input.name},
      ${input.year},
      ${input.discipline},
      ${input.role},
      ${input.problem},
      ${input.outcome},
      ${JSON.stringify(input.tech)}::jsonb,
      ${input.accent},
      ${input.plateSrc},
      ${input.plateCaption},
      ${input.plateFocus},
      ${input.linkLive},
      ${input.linkSource},
      ${sortOrder},
      NOW()
    )
    RETURNING id
  `;

  const id = parseNumber(rows[0]?.id);
  await writeV2Cases(id, input.cases);
  return (await getV2Project(id)) as V2ProjectRecord;
}

export async function updateV2Project(
  id: number,
  input: V2ProjectInput,
): Promise<V2ProjectRecord | null> {
  const sql = getSql();
  // Note the missing `|| input.name` that `createV2Project` has. The slug is a
  // public URL: renaming "VRFY" to "Vrfy Store" must not silently move
  // /work/vrfy and break every link anyone has shared. It changes only when the
  // slug field itself is edited, and the dashboard says so under the field.
  // An empty slug means "leave it alone" rather than "slugify the name", so a
  // caller that omits the field cannot rename the URL by accident.
  const existing = await sql`SELECT slug, sort_order FROM v2_projects WHERE id = ${id}`;
  const current = (existing as Row[])[0];
  const currentSlug = parseString(current?.slug);
  if (!currentSlug) return null;
  const slug = input.slug ? await uniqueV2Slug(input.slug, id) : currentSlug;

  // Same rule for position. `?? 0` would send a project the caller never meant
  // to move straight to the front of the reel — the kind of edit nobody notices
  // until the homepage is already wrong.
  const sortOrder = input.sortOrder ?? parseNumber(current?.sort_order);

  const rows = await sql`
    UPDATE v2_projects
    SET
      slug = ${slug},
      name = ${input.name},
      year = ${input.year},
      discipline = ${input.discipline},
      role = ${input.role},
      problem = ${input.problem},
      outcome = ${input.outcome},
      tech = ${JSON.stringify(input.tech)}::jsonb,
      accent = ${input.accent},
      plate_src = ${input.plateSrc},
      plate_caption = ${input.plateCaption},
      plate_focus = ${input.plateFocus},
      link_live = ${input.linkLive},
      link_source = ${input.linkSource},
      sort_order = ${sortOrder},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING id
  `;

  if (!(rows as Row[]).length) return null;
  await writeV2Cases(id, input.cases);
  return getV2Project(id);
}

export async function deleteV2Project(id: number) {
  const sql = getSql();
  // The case rows go with it: the foreign key is ON DELETE CASCADE.
  await sql`DELETE FROM v2_projects WHERE id = ${id}`;
}
