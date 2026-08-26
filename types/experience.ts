/**
 * Types for the experience chart — components/sections/Experience.tsx.
 *
 * Everything here is derived once, at module scope, from whatever role records
 * the API (or the static fallback) hands over. Nothing in this file is
 * re-walked inside a render, and nothing carries a value that changes per
 * frame: the chart's only moving number is a single 0..1 scalar held in a ref
 * by the client leaf.
 */

/** A closed, inclusive run of calendar months on the absolute month axis. */
export interface Span {
  /** Absolute month index of the first month worked. */
  start: number;
  /** Absolute month index of the last month worked. Inclusive. */
  end: number;
  /** The role has no end date yet, so `end` is "this month" and will move. */
  ongoing: boolean;
}

/**
 * One dated thing that shipped.
 *
 * `month` is null whenever the source data does not carry a date — which is the
 * normal case, because the dashboard stores description bullets as prose. A
 * null month renders the line without a date prefix rather than inventing one.
 */
export interface Milestone {
  /** Absolute month index, or null when the date is not known. */
  month: number | null;
  text: string;
}

export interface Role {
  /** Stable slug. React key, DOM `data-role` value, and panel target. */
  id: string;
  company: string;
  title: string;
  location: string;
  /** "Full-time", "Contractual", "Remote · Freelance". */
  type: string;
  /** Where this role sat in the responsibility ladder, in three words or less. */
  rung: string;
  /** One sentence: what the job actually was. */
  summary: string;
  tech: string[];
  milestones: Milestone[];
  /** Signature hue for the lane, as authored in the dashboard. */
  accent: string;
  current: boolean;
  span: Span;
  /**
   * Companies whose roles shared at least one month with this one.
   *
   * Derived from the spans on every build, like the concurrency bands, so it
   * cannot drift out of step with the bars that prove it.
   */
  sharedWith: string[];
  /** Months of this role's own span in which some other role was also live. */
  sharedMonths: number;
  /** Fraction of the domain where the bar starts. Set once, as a CSS percentage. */
  f0: number;
  /** Fraction of the domain where the bar ends. `f1 - f0` is the bar width. */
  f1: number;
  /** Vertical track for the mobile axis, from a greedy interval fit. */
  track: number;
}

/** A run of months where more than one role was live. Derived, never authored. */
export interface Band {
  start: number;
  end: number;
  f0: number;
  f1: number;
}

/** A year boundary that falls inside the domain, with its position on the axis. */
export interface YearMark {
  year: number;
  /** Fraction of the domain. 0 for the domain's own first year. */
  f: number;
}

export interface Timeline {
  roles: Role[];
  /** Absolute month index of the left (or top) edge of the plot. */
  domainStart: number;
  /** Absolute month index of the right (or bottom) edge. Inclusive. */
  domainEnd: number;
  /** Inclusive month count across the domain. The denominator of every fraction. */
  months: number;
  years: YearMark[];
  bands: Band[];
  /** Number of vertical tracks the mobile axis needs. */
  trackCount: number;
  /** Total months in which two or more roles ran together. */
  concurrentMonths: number;
}
