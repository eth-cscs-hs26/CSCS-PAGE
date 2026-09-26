import { Link } from 'react-router-dom';
import { parts, TRIAL_NOTEBOOK } from '../data/parts';
import { PartCard } from '../components/PartCard';
import { CalendarStrip } from '../components/CalendarStrip';

export function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="hero__inner">
            <p className="eyebrow">ETH Zürich · CSCS · Autumn 2026</p>
            <h1>CSCS Workshop</h1>
            <div className="hero__rule" />
            <p className="hero__lead">
              Machine learning and AI for scientists and engineers who compute on Alps: three parts
              of two days each, from a first PyTorch model on a GH200 through language models,
              reinforcement learning and agents to training at scale. Every coding exercise runs
              in your own JupyterLab session on Santis.
            </p>
            <dl className="hero__meta">
              <div>
                <dt>Parts</dt>
                <dd>3</dd>
              </div>
              <div>
                <dt>Period</dt>
                <dd>From 6 October 2026</dd>
              </div>
              <div>
                <dt>Format</dt>
                <dd>Two consecutive days, 10:00 to 17:30 and 09:00 to 16:30</dd>
              </div>
            </dl>
            {/*
              The setup guide sits by the title rather than inside a part's
              Materials list because it is the first thing every participant
              needs, before any lecture: a running JupyterLab session on Santis.
              The trial notebook is the proof that the session works.
            */}
            <div className="hero__cta">
              <Link className="btn" to="/setup">
                Set up your JupyterLab session on Santis
              </Link>
              <a className="btn btn--ghost" href={TRIAL_NOTEBOOK} download="">
                Trial notebook (Notebook ↓)
              </a>
            </div>
            <p className="hero__note">
              Do the setup before the first day. It takes ten minutes once you have your CSCS
              course account, and the trial notebook shows that your session sees the GPU.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section__head">
            <h2>The three parts</h2>
            <p>Select a part to see its full agenda and materials.</p>
          </div>

          <div className="card-grid">
            {parts.map((p) => (
              <PartCard key={p.id} part={p} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section__head">
            <h2>Course calendar</h2>
            <p>Chronological overview of all parts.</p>
          </div>
          <CalendarStrip />
          <div className="section__cta">
            <Link to="/calendar" className="btn">
              Open full calendar
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
