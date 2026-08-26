/**
 * Pure time maths for the experience chart.
 *
 * No DOM, no React, no imports from the app. Every function here is total: it
 * either returns a value or returns null, and none of them throw on the kind of
 * half-filled record a CMS actually produces.
 *
 * The whole chart rests on one idea: a calendar month is an integer.
 * `year * 12 + month` is comparable, subtractable and cheap, which means
 * overlap, duration and position are all one subtraction away. There is exactly
 * one scale in this concept and it is `(m - domainStart) / months`.
 */

import type { Band, Span } from "@/types/experience";

export const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

const MONTH_LOOKUP: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

/** Words a CMS uses to mean "no end date yet". */
const PRESENT = /\b(present|current|now|ongoing|today)\b/i;

/**
 * Range separators, widest first.
 *
 * The plain hyphen case requires whitespace on at least one side, or digits on
 * both, so a hyphenated word inside a label ("Full-time", "Asp.Net-Core") can
 * never be mistaken for a range boundary.
 */
const RANGE = /\s*(?:–|—|−|\bto\b|\s-\s|-\s|\s-|(?<=\d)-(?=\d))\s*/i;

/** Absolute month index. `month` is 0-based, matching Date#getMonth. */
export function monthIndex(year: number, month: number): number {
  return year * 12 + month;
}

export function yearOf(index: number): number {
  return Math.floor(index / 12);
}

export function monthOf(index: number): number {
  return ((index % 12) + 12) % 12;
}

/** "Sep 2021". The only place month names are produced. */
export function label(index: number): string {
  return `${MONTH_LABELS[monthOf(index)]} ${yearOf(index)}`;
}

/**
 * Inclusive duration between two month indices, as "1 yr 7 mo".
 *
 * Inclusive because Sep 2021 to Mar 2023 is nineteen months worked, not
 * eighteen months elapsed. A resume counts the months you were there.
 */
export function dur(start: number, end: number): string {
  const months = Math.max(1, end - start + 1);
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (!years) return `${rest} mo`;
  if (!rest) return `${years} yr`;
  return `${years} yr ${rest} mo`;
}

/** Do two spans share at least one month? */
export function overlaps(a: Span, b: Span): boolean {
  return a.start <= b.end && b.start <= a.end;
}

/** Is this month inside the span? */
export function contains(span: Span, month: number): boolean {
  return month >= span.start && month <= span.end;
}

/**
 * Greedy interval fit: the fewest vertical tracks that keep any two overlapping
 * spans apart.
 *
 * Walk the spans in start order and drop each into the first track whose last
 * occupant has already finished. Roles that never share a month end up sharing
 * a track, which is the entire point on a 390px screen: five roles as five
 * columns would leave no room for a label, and the packing loses no information
 * because vertical position never encoded anything in this chart anyway.
 *
 * Returns a track index per span, in the order the spans were given.
 */
export function packTracks(spans: Span[]): number[] {
  const order = spans
    .map((_, index) => index)
    .sort((a, b) => spans[a].start - spans[b].start || spans[a].end - spans[b].end);

  const trackEnds: number[] = [];
  const tracks = new Array<number>(spans.length).fill(0);

  for (const index of order) {
    const span = spans[index];
    let track = trackEnds.findIndex((end) => end < span.start);
    if (track < 0) {
      track = trackEnds.length;
      trackEnds.push(span.end);
    } else {
      trackEnds[track] = span.end;
    }
    tracks[index] = track;
  }

  return tracks;
}

/**
 * The months in which two or more spans were live, collapsed into runs.
 *
 * Derived from the spans on every build rather than authored anywhere, so a
 * band physically cannot drift out of sync with the bars it sits under. Walks
 * the domain once and counts, which for a career is a few hundred comparisons
 * at module load and never again.
 */
export function concurrencyRuns(
  spans: Span[],
  domainStart: number,
  domainEnd: number
): Array<[number, number]> {
  const runs: Array<[number, number]> = [];
  let open = -1;

  for (let month = domainStart; month <= domainEnd; month += 1) {
    let live = 0;
    for (const span of spans) {
      if (contains(span, month)) live += 1;
      if (live > 1) break;
    }

    if (live > 1 && open < 0) open = month;
    if (live <= 1 && open >= 0) {
      runs.push([open, month - 1]);
      open = -1;
    }
  }

  if (open >= 0) runs.push([open, domainEnd]);
  return runs;
}

/** Runs promoted to fractions of the domain, ready to write as percentages. */
export function toBands(
  runs: Array<[number, number]>,
  domainStart: number,
  months: number
): Band[] {
  return runs.map(([start, end]) => ({
    start,
    end,
    f0: (start - domainStart) / months,
    f1: (end + 1 - domainStart) / months,
  }));
}

/** Which roles were live in a given month. The chart summarising itself. */
export function liveIn(spans: Span[], month: number): number[] {
  const live: number[] = [];
  for (let index = 0; index < spans.length; index += 1) {
    if (contains(spans[index], month)) live.push(index);
  }
  return live;
}

/**
 * Parse one side of a range.
 *
 * A bare year is deliberately asymmetric: "2023" as a start means January and
 * as an end means December, because "2023 to 2024" describes two whole years,
 * not one instant repeated.
 */
function parseEdge(text: string, nowIndex: number, edge: "start" | "end"): number | null {
  if (PRESENT.test(text)) return nowIndex;

  const yearMatch = text.match(/\d{4}/);
  if (!yearMatch) return null;
  const year = Number(yearMatch[0]);

  const nameMatch = text.match(/[A-Za-z]{3,}/);
  const month = nameMatch ? MONTH_LOOKUP[nameMatch[0].slice(0, 3).toLowerCase()] : undefined;

  if (month === undefined) return monthIndex(year, edge === "start" ? 0 : 11);
  return monthIndex(year, month);
}

/**
 * Turn a human duration string into a span.
 *
 * The dashboard stores this field as prose ("June 2025 to Present",
 * "Feb 2025 to June 2025", "2023 to Present"), so this is the one place where
 * editorial text becomes chart geometry. It returns null rather than guessing
 * when it cannot find a year, and the caller drops that role from the chart.
 * A role at the wrong position would be a lie; a role that is absent is only a
 * gap, and a gap is visible.
 */
export function parseSpan(duration: string, nowIndex: number): Span | null {
  if (!duration) return null;

  const parts = duration.split(RANGE).map((part) => part.trim()).filter(Boolean);
  if (!parts.length) return null;

  const start = parseEdge(parts[0], nowIndex, "start");
  if (start === null) return null;

  const tail = parts.length > 1 ? parts[parts.length - 1] : parts[0];
  const ongoing = PRESENT.test(tail);
  const end = ongoing ? nowIndex : parseEdge(tail, nowIndex, "end");
  if (end === null) return null;

  return { start, end: Math.max(start, end), ongoing };
}

/** Absolute month index for a Date, in the reader's own timezone. */
export function monthIndexOf(date: Date): number {
  return monthIndex(date.getFullYear(), date.getMonth());
}

export const clamp01 = (value: number): number => (value < 0 ? 0 : value > 1 ? 1 : value);

/**
 * Frame-rate independent exponential damp.
 *
 * Lambda 16 lands about 63% of the way to the target in 60ms, which is the
 * point where a marker reads as having weight without reading as lag. The `dt`
 * term is what keeps that true on a 120Hz display and on a frame that dropped.
 */
export function damp(current: number, target: number, lambda: number, dt: number): number {
  return target + (current - target) * Math.exp(-lambda * dt);
}
