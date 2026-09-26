import { Link } from 'react-router-dom';
import { parts, partLabel } from '../data/parts';

/** Compact chronological strip of all parts. */
export function CalendarStrip() {
  return (
    <div className="calstrip">
      {parts.map((p) => (
        <Link key={p.id} to={`/part/${p.id}`} className="calstrip__cell">
          <div className="calstrip__num">{partLabel(p)}</div>
          <div className="calstrip__date">{p.dates.replace(' 2026', '')}</div>
          <div className="calstrip__title">{p.title}</div>
          <span className="calstrip__project">
            Days {p.days[0].number} and {p.days[1].number}
          </span>
        </Link>
      ))}
    </div>
  );
}
