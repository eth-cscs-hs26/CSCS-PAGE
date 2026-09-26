import { Link } from 'react-router-dom';
import type { Part } from '../types';
import { partRoom, partLabel } from '../data/parts';
import { SchedulePeek } from './SchedulePeek';

export function PartCard({ part }: { part: Part }) {
  const room = partRoom(part);
  const [a, b] = part.days;
  return (
    <Link to={`/part/${part.id}`} className="wcard">
      <div className="wcard__top">
        <span className="wcard__num">{partLabel(part)}</span>
        <span className="wcard__meta">
          <span className="wcard__dates">{part.dates}</span>
          {room && <span className="wcard__room">{room}</span>}
        </span>
      </div>
      <h3 className="wcard__title">{part.title}</h3>
      <p className="wcard__theme">{part.theme}</p>
      <p className="wcard__project">
        Days {a.number} and {b.number}
      </p>
      <span className="wcard__cta">View agenda</span>

      <SchedulePeek part={part} />
    </Link>
  );
}
