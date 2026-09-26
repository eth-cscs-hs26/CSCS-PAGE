import { parts, partLabel } from './parts';

export interface CourseEvent {
  uid: string;
  title: string;
  /** Inclusive ISO start date. */
  start: string;
  /** Inclusive ISO end date (same as start for single-day events). */
  end: string;
  partId: string;
  partNumber: number;
  note?: string;
}

/**
 * One event per part, derived from the part data (its two days). A part whose
 * dates are still to be announced has no event until they are set.
 */
export const partEvents: CourseEvent[] = parts.flatMap((p) => {
  const [a, b] = p.days;
  if (!a.dateISO || !b.dateISO) return [];
  return [
    {
      uid: `cscs-${p.id}`,
      title: `CSCS AI Tutorials, ${partLabel(p)}: ${p.title}`,
      start: a.dateISO,
      end: b.dateISO,
      partId: p.id,
      partNumber: p.number,
      note: p.theme,
    },
  ];
});

export const allEvents: CourseEvent[] = [...partEvents].sort((a, b) =>
  a.start < b.start ? -1 : a.start > b.start ? 1 : 0,
);

/**
 * Months the course spans (year, 0-based month). October 2026 holds Parts I
 * and II; add the month of Part III once its dates are known.
 */
export const calendarMonths: { year: number; month0: number }[] = [{ year: 2026, month0: 9 }];

/** All events overlapping a given ISO day. */
export function eventsOnDay(iso: string): CourseEvent[] {
  return allEvents.filter((e) => iso >= e.start && iso <= e.end);
}
