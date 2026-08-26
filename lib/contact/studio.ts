/**
 * Studio time facts for the Console contact instrument.
 *
 * Single source of the fixed offset so the clock, the working-hours dot and
 * the "hours ahead of you" line can never disagree. Pure functions only —
 * pass a Date in, get numbers out.
 *
 * The studio is Dhaka (UTC+6) and does not observe DST, so a fixed offset is
 * correct here. If that ever changes, swap to Intl.DateTimeFormat with a
 * timeZone option — still no dependency needed.
 */

export const STUDIO_UTC_OFFSET_HOURS = 6;

export const WORK_HOURS = {
  /** 0 = Sunday … 6 = Saturday — the studio week runs Sunday to Thursday. */
  days: [0, 1, 2, 3, 4],
  /** Overnight window: 10:00 in the morning until 01:00 the next day. */
  start: 10,
  end: 1,
} as const;

/** Reply commitment: inside this many hours, not an average. */
export const REPLY_TARGET_HOURS = 12;
/** Hard outer bound of the reply window drawn on the meter. */
export const REPLY_OUTER_HOURS = 72;

export interface StudioReading {
  /** Wall-clock parts in studio local time. */
  hours: number;
  minutes: number;
  seconds: number;
  day: number;
}

export function studioReading(now: Date = new Date()): StudioReading {
  // Studio wall clock = UTC + the fixed offset. Read through the UTC getters
  // so the viewer's own timezone never touches the instrument.
  const shifted = now.getTime() + STUDIO_UTC_OFFSET_HOURS * 3_600_000;
  const d = new Date(shifted);
  return {
    hours: d.getUTCHours(),
    minutes: d.getUTCMinutes(),
    seconds: d.getUTCSeconds(),
    day: d.getUTCDay(),
  };
}

export function withinWorkingHours(r: StudioReading): boolean {
  const { hours, day } = r;
  const days = WORK_HOURS.days as readonly number[];
  // Window opens 10:00 on Sun–Thu…
  if (hours >= WORK_HOURS.start) return days.includes(day);
  // …and runs past midnight until 01:00, so the early hours belong to the
  // previous day when that day was a working day (Thu night counts; Fri not).
  if (hours < WORK_HOURS.end) {
    return days.includes((day + 6) % 7);
  }
  return false;
}

export function formatStudioClock(r: StudioReading): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(r.hours)}:${pad(r.minutes)}:${pad(r.seconds)}`;
}

/** Positive when the studio day is ahead of the viewer's. */
export function hoursAheadOfViewer(now: Date = new Date()): number {
  const viewerOffsetHours = -now.getTimezoneOffset() / 60;
  return STUDIO_UTC_OFFSET_HOURS - viewerOffsetHours;
}

export function formatHoursAhead(): string {
  const h = hoursAheadOfViewer();
  if (h === 0) return "same as you";
  const rounded = Math.round(h * 2) / 2;
  const label = Number.isInteger(rounded)
    ? `${rounded}h`
    : `${Math.floor(rounded)}.5h`;
  return `${label} ahead of you`;
}
