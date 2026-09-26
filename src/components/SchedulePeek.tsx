import type { Part, Day, Session } from '../types';

/** Headline sessions only, so the hover preview stays compact. */
const mainSessions = (sessions: Session[]): Session[] =>
  sessions.filter((s) => s.type === 'lecture');

function PeekDay({ day }: { day: Day }) {
  const items = mainSessions(day.sessions);
  if (items.length === 0) return null;
  return (
    <>
      <div className="wpeek__day">Day {day.number}</div>
      {items.map((s, i) => (
        <div className="wpeek__row" key={`${day.number}-${i}`}>
          <span className="wpeek__time">{s.time}</span>
          <span className="wpeek__title">{s.title}</span>
        </div>
      ))}
    </>
  );
}

/** Small floating agenda preview shown when hovering a part block. */
export function SchedulePeek({ part }: { part: Part }) {
  return (
    <div className="wpeek" role="tooltip">
      <div className="wpeek__head">Agenda at a glance</div>
      {part.days.map((d) => (
        <PeekDay key={d.number} day={d} />
      ))}
    </div>
  );
}
