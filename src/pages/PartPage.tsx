import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { parts, getPart, partRoom, partLabel } from '../data/parts';
import { ScheduleTable } from '../components/ScheduleTable';
import type { Resource } from '../types';
import { downloadKind } from '../lib/links';

function ResourceLink({ resource }: { resource: Resource }) {
  const isPlaceholder = resource.url === '#';
  if (isPlaceholder) {
    return (
      <li>
        <span className="reslink reslink--placeholder">
          {resource.label}
          <span className="reslink__arrow">Soon</span>
        </span>
      </li>
    );
  }
  // A link into this site (#/setup) opens in the same tab; a file or an
  // external page opens in a new one.
  const internal = resource.url.startsWith('#/');
  const kind = downloadKind(resource.url);
  return (
    <li>
      <a
        className="reslink"
        href={resource.url}
        {...(internal ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
        {...(kind ? { download: '' } : {})}
      >
        {resource.label}
        <span className="reslink__arrow">
          {kind === 'pdf'
            ? 'PDF ↓'
            : kind === 'notebook'
              ? 'Notebook ↓'
              : kind === 'archive'
                ? 'ZIP ↓'
                : internal
                  ? '→'
                  : '↗'}
        </span>
      </a>
    </li>
  );
}

export function PartPage() {
  const { id } = useParams();
  const part = id ? getPart(id) : undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!part) {
    return (
      <section className="section">
        <div className="container">
          <p>Part not found.</p>
          <Link to="/">← Back to all parts</Link>
        </div>
      </section>
    );
  }

  const index = parts.findIndex((p) => p.id === part.id);
  const prev = index > 0 ? parts[index - 1] : undefined;
  const next = index < parts.length - 1 ? parts[index + 1] : undefined;

  const hasRealResources = part.resources.some((r) => r.url !== '#');
  const room = partRoom(part);
  const [a, b] = part.days;

  // Group resources by their optional `group`, preserving first-seen order.
  const resourceGroups: { name?: string; items: Resource[] }[] = [];
  for (const r of part.resources) {
    let g = resourceGroups.find((x) => x.name === r.group);
    if (!g) {
      g = { name: r.group, items: [] };
      resourceGroups.push(g);
    }
    g.items.push(r);
  }
  const isGrouped = resourceGroups.some((g) => g.name);

  return (
    <article className="section">
      <div className="container">
        <nav className="crumbs">
          <Link to="/">All parts</Link> &nbsp;/&nbsp; {partLabel(part)}
        </nav>

        <header className="wdetail-head">
          <div className="wdetail-head__eyebrow">
            <span className="wdetail-head__num">{partLabel(part)}</span>
          </div>
          <h1>{part.title}</h1>
          <p className="wdetail-head__theme">{part.theme}</p>
          <dl className="wdetail-meta">
            <div>
              <dt>Dates</dt>
              <dd>{part.dates}</dd>
            </div>
            <div>
              <dt>Format</dt>
              <dd>
                Days {a.number} and {b.number}, {a.hours} and {b.hours}
              </dd>
            </div>
            {room && (
              <div>
                <dt>Room</dt>
                <dd>{room}</dd>
              </div>
            )}
          </dl>
          <p className="wdetail-head__summary">{part.summary}</p>
        </header>

        <div className="days">
          <ScheduleTable day={a} />
          <ScheduleTable day={b} />
        </div>

        <section className="resources">
          <h2>Materials</h2>
          <p className="resources__note">
            {hasRealResources
              ? 'Slides and exercises for this part. Open each exercise folder in JupyterLab on Santis: download its zip here, or fetch it with the one-line command on the Setup page. PyTorch with SLURM submits its batch jobs from a JupyterLab terminal after source cluster-env.sh; see Setup.'
              : 'Materials for this part will be linked here once they are uploaded.'}
          </p>
          {isGrouped ? (
            resourceGroups.map((g, gi) => (
              <div className="resgroup" key={gi}>
                {g.name && <h3 className="resgroup__title">{g.name}</h3>}
                <ul className="reslist">
                  {g.items.map((r, i) => (
                    <ResourceLink key={i} resource={r} />
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <ul className="reslist">
              {part.resources.map((r, i) => (
                <ResourceLink key={i} resource={r} />
              ))}
            </ul>
          )}
        </section>

        <nav className="wnav">
          {prev ? (
            <Link to={`/part/${prev.id}`}>
              <span className="wnav__label">Previous</span>
              {partLabel(prev)}: {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link to={`/part/${next.id}`} className="wnav__next">
              <span className="wnav__label">Next</span>
              {partLabel(next)}: {next.title}
            </Link>
          )}
        </nav>
      </div>
    </article>
  );
}
