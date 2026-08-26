import type { Experience as ExperienceRecord } from "@/components/experience-data";
import { experiences as FALLBACK_EXPERIENCE } from "@/components/experience-data";
import type { Milestone, Role, Span, Timeline, YearMark } from "@/types/experience";
import {
  concurrencyRuns,
  contains,
  liveIn,
  monthIndexOf,
  overlaps,
  packTracks,
  parseSpan,
  toBands,
  yearOf,
} from "@/lib/experience/timeline";

/**
 * Role data for the experience chart, plus every fraction the chart needs,
 * computed once.
 *
 * The dashboard owns three fields the chart cannot derive: a one-sentence
 * account of what the job actually was, the rung on the responsibility ladder,
 * and the month each shipped thing shipped. None of those exist in the record
 * shape, so they come from a local enrichment map keyed by company name and
 * degrade to values derived from the record when the company is unknown.
 * An unrecognised employer renders a slightly thinner panel; it never crashes
 * and it never invents a date.
 */

interface RoleEnrichment {
  /** Where this role sat in the responsibility ladder, in three words or less. */
  rung: string;
  /** One sentence: what the job actually was, not what the title claimed. */
  summary: string;
  /**
   * Months in which the description bullets shipped, indexed the same way as
   * `ExperienceRecord.description`.
   *
   * Each entry is `[year, month0]` or null for "date not known". A null renders
   * the line with no date prefix rather than guessing, because a wrong month in
   * a chart about months is worse than no month at all.
   *
   * TODO(miftaul): these are all null because the dashboard stores description
   * bullets as undated prose. Fill in the real months and the detail panel
   * becomes a second, finer timeline inside the first one.
   */
  shipped: Array<[number, number] | null>;
}

const ROLE_ENRICHMENT: Record<string, RoleEnrichment> = {
  "Web Makers LTD": {
    rung: "Module lead",
    summary:
      "Building SaaS products alongside a ten-person team, owning front-end modules and the AWS services sitting behind them.",
    shipped: [null, null, null, null],
  },
  "Solution Insurance Group": {
    rung: "Contract engineer",
    summary:
      "Three sub-projects around a core insurance platform, delivered on contract with a two-person build team.",
    shipped: [null, null, null, null],
  },
  Freelancer: {
    rung: "Sole delivery",
    summary:
      "Direct client work across real estate and analytics, carried from API to dashboard without a team to hand off to.",
    shipped: [null, null, null, null],
  },
};

/** Everything a record can supply on its own when the company is unknown. */
function fallbackEnrichment(record: ExperienceRecord): RoleEnrichment {
  return {
    rung: record.type,
    summary: record.description[0] ?? `${record.title} at ${record.company}.`,
    shipped: record.description.map(() => null),
  };
}

/** Slug used as the React key, the DOM `data-role` value and the panel target. */
function slugify(record: ExperienceRecord): string {
  const base = `${record.company}-${record.title}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return base || `role-${record.id}`;
}

function toMilestones(record: ExperienceRecord, enrichment: RoleEnrichment): Milestone[] {
  return record.description.map((text, index) => {
    const dated = enrichment.shipped[index];
    return {
      month: dated ? dated[0] * 12 + dated[1] : null,
      text,
    };
  });
}

/**
 * Build the whole chart model from whatever records are available.
 *
 * Records whose duration string cannot be parsed into a span are dropped, not
 * defaulted: a bar in the wrong place is a false claim, and the alternative
 * (a role missing from the chart) is at least visibly a gap.
 *
 * Ordering is by start month, newest first, because vertical position in this
 * chart encodes reading order and nothing else, and "most recent at the top" is
 * the order a reader already expects from a resume.
 */
export function buildTimeline(records: ExperienceRecord[], now: Date = new Date()): Timeline {
  const nowIndex = monthIndexOf(now);

  const parsed = records
    .map((record) => ({ record, span: parseSpan(record.duration, nowIndex) }))
    .filter((entry): entry is { record: ExperienceRecord; span: Span } => entry.span !== null)
    .sort((a, b) => b.span.start - a.span.start || b.span.end - a.span.end);

  if (!parsed.length) {
    return {
      roles: [],
      domainStart: nowIndex,
      domainEnd: nowIndex,
      months: 1,
      years: [],
      bands: [],
      trackCount: 1,
      concurrentMonths: 0,
    };
  }

  const spans = parsed.map((entry) => entry.span);
  const domainStart = Math.min(...spans.map((span) => span.start));
  // The axis always runs to today even if every role ended years ago, because
  // the gap between the last bar and the right edge is itself information.
  const domainEnd = Math.max(nowIndex, ...spans.map((span) => span.end));
  const months = domainEnd - domainStart + 1;

  const tracks = packTracks(spans);

  /* Per-role concurrency, derived here for the same reason the bands are: a
     hand-written "ran alongside X" would be a claim the chart could contradict.
     `sharedMonths` counts months of this role's own span in which anything else
     was live, so two simultaneous colleagues are not double-counted. */
  const sharedWith = spans.map((span, index) =>
    spans
      .map((_, other) => other)
      .filter((other) => other !== index && overlaps(span, spans[other]))
      .map((other) => parsed[other].record.company)
  );

  const sharedMonths = spans.map((span, index) => {
    let count = 0;
    for (let month = span.start; month <= span.end; month += 1) {
      const alongside = spans.some(
        (other, index2) => index2 !== index && contains(other, month)
      );
      if (alongside) count += 1;
    }
    return count;
  });

  const roles: Role[] = parsed.map((entry, index) => {
    const { record, span } = entry;
    const enrichment = ROLE_ENRICHMENT[record.company] ?? fallbackEnrichment(record);

    return {
      id: slugify(record),
      company: record.company,
      title: record.title,
      location: record.location,
      type: record.type,
      rung: enrichment.rung,
      summary: enrichment.summary,
      tech: record.tech,
      milestones: toMilestones(record, enrichment),
      accent: record.accent,
      current: record.current || span.ongoing,
      span,
      sharedWith: sharedWith[index],
      sharedMonths: sharedMonths[index],
      // The bar covers whole months, so it ends at the far edge of its last
      // month rather than at its near edge. Without the +1 a one-month role
      // would be zero pixels wide, which is the one duration a chart about
      // duration must not lose.
      f0: (span.start - domainStart) / months,
      f1: (span.end + 1 - domainStart) / months,
      track: tracks[index],
    };
  });

  const years: YearMark[] = [];
  for (let year = yearOf(domainStart); year <= yearOf(domainEnd); year += 1) {
    const boundary = year * 12;
    if (boundary < domainStart) {
      // The domain's own first year gets a numeral at the left edge but no rule:
      // a rule there would read as a boundary the data does not have.
      years.push({ year, f: 0 });
      continue;
    }
    years.push({ year, f: (boundary - domainStart) / months });
  }

  const runs = concurrencyRuns(spans, domainStart, domainEnd);
  const bands = toBands(runs, domainStart, months);
  const concurrentMonths = runs.reduce((total, [start, end]) => total + (end - start + 1), 0);

  return {
    roles,
    domainStart,
    domainEnd,
    months,
    years,
    bands,
    trackCount: Math.max(1, ...tracks.map((track) => track + 1)),
    concurrentMonths,
  };
}

/**
 * The chart's own one-line summary of itself.
 *
 * Concurrency is the single most informative fact in a career history and a
 * list cannot express it, so the section states the number in words above the
 * chart that proves it.
 */
export function concurrencySentence(timeline: Timeline): string {
  const { months, concurrentMonths, roles } = timeline;
  if (!roles.length) return "No dated roles yet.";
  if (!concurrentMonths) {
    return `${roles.length} roles across ${months} months, none of them overlapping.`;
  }
  return `${roles.length} roles across ${months} months. Two ran together for ${concurrentMonths} of them.`;
}

/**
 * The role's concurrency in as few words as a popover can hold.
 *
 * Names are only spelled out when there is exactly one. Two company names
 * joined by a plus runs to forty characters and wraps a 15rem box onto three
 * lines, which stops being a glance and starts being a paragraph — so more than
 * one collapses to a count and the panel below carries the full list.
 */
export function sharedLabel(role: Role): string {
  if (!role.sharedWith.length) return "Ran alone";
  if (role.sharedWith.length === 1) return `With ${role.sharedWith[0]}`;
  return `With ${role.sharedWith.length} other roles`;
}

/** Roles live in a given month, in lane order. Derived in the loop, never stored. */
export function liveRoles(timeline: Timeline, month: number): Role[] {
  return liveIn(
    timeline.roles.map((role) => role.span),
    month
  ).map((index) => timeline.roles[index]);
}

/** The static model, built at module scope so the markup can render without JS. */
export const FALLBACK_TIMELINE: Timeline = buildTimeline(FALLBACK_EXPERIENCE);
