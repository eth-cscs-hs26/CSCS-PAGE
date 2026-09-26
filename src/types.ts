export type SessionType = 'lecture' | 'exercise' | 'break' | 'tba';

export interface Session {
  time: string;
  /** Empty for slots the syllabus leaves open (rendered as a quiet placeholder row). */
  title: string;
  type: SessionType;
  /**
   * Topic heading shown ABOVE this session, e.g. "Introduction to Machine
   * Learning on HPC". The syllabus groups each half-day under one, so it is set
   * on the first session of a morning and of an afternoon.
   */
  topic?: string;
  /** Optional single link for this session, e.g. one notebook to download. */
  url?: string;
  /** Optional multiple labelled links, e.g. slides plus a handout. */
  links?: Resource[];
}

export interface Resource {
  label: string;
  url: string;
  /**
   * Optional sub-section heading on the part's Materials list, e.g.
   * "Before you start", "Lecture slides", "Coding exercises". Resources sharing
   * a group are rendered together under that heading, groups appear in
   * first-seen order. Resources without a group render as a single flat list.
   */
  group?: string;
}

export interface Day {
  /** Course-wide day number, 1 to 6. */
  number: number;
  /** ISO date, absent while the date is still to be announced. */
  dateISO?: string;
  /** Hours as written in the syllabus, e.g. "10:00 to 17:30". */
  hours: string;
  /** Room / location, if known. */
  room?: string;
  sessions: Session[];
}

export interface Part {
  /** Stable slug used in the URL, e.g. "part1". */
  id: string;
  number: number;
  title: string;
  /** Short theme / subtitle. */
  theme: string;
  /** Human-readable date range, e.g. "6–7 October 2026", or "Dates to be announced". */
  dates: string;
  /** Authored short description of the part. */
  summary: string;
  /** The two consecutive days. */
  days: [Day, Day];
  resources: Resource[];
}
