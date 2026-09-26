import type { Day } from '../types';
import { SessionTypeChip } from './SessionTypeChip';
import { downloadKind } from '../lib/links';
import { formatLongDate } from '../lib/date';

export function ScheduleTable({ day }: { day: Day }) {
  const date = day.dateISO ? formatLongDate(day.dateISO) : 'Date to be announced';
  return (
    <div className="day">
      <div className="day__head">
        <h3>Day {day.number}</h3>
        <span className="day__meta">
          <span className="day__date">
            {date} · {day.hours}
          </span>
          {day.room && <span className="day__room">{day.room}</span>}
        </span>
      </div>
      <div className="schedule">
        {day.sessions.map((s, i) => {
          // Coding exercises are prefixed with "CX" to match the course convention.
          const title = s.type === 'exercise' ? `CX ${s.title}` : s.title;
          // PDFs and notebooks are offered as a download rather than opened in
          // the browser viewer. This applies to the chips below as well as the
          // title, so a deck saves the same way whether it is reached from here
          // or from the part's Materials list.
          const isFile = !!s.url && downloadKind(s.url) !== null;
          const quiet = s.type === 'break' || s.type === 'tba';
          return (
            <div key={i}>
              {s.topic && (
                <div className="srow srow--topic">
                  <div className="srow__time">{s.time}</div>
                  <div className="srow__body">
                    <span className="srow__topic">{s.topic}</span>
                  </div>
                </div>
              )}
              <div className={`srow${quiet ? ` srow--${s.type}` : ''}`}>
                <div className="srow__time">{s.time}</div>
                <div className="srow__body">
                  {s.url ? (
                    <a
                      className="srow__title srow__title--link"
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      {...(isFile ? { download: '' } : {})}
                    >
                      {title}
                      <span className="srow__ext" aria-hidden="true">
                        {isFile ? '↓' : '↗'}
                      </span>
                    </a>
                  ) : (
                    <span className="srow__title">{title}</span>
                  )}
                  {s.type !== 'break' && (
                    <span className="srow__meta">
                      <SessionTypeChip type={s.type} />
                      {s.links?.map((l, j) => {
                        const isLinkFile = downloadKind(l.url) !== null;
                        return (
                          <a
                            key={j}
                            className="srow__link"
                            href={l.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            {...(isLinkFile ? { download: '' } : {})}
                          >
                            {l.label}
                            <span className="srow__ext" aria-hidden="true">
                              {isLinkFile ? '↓' : '↗'}
                            </span>
                          </a>
                        );
                      })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
