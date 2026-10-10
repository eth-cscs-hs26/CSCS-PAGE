/* Nim knobs: the page. The game and its numbers are in nim.js; this file draws
 * them and wires the controls.
 *
 * Dev affordances for checking the page without clicking, not part of the game:
 *   ?seed=7      a seeded generator, so the sampled games repeat
 *   ?autoplay=1  play the six games on load
 */
(function () {
  'use strict';

  const Nim = window.Nim;
  const S = Nim.START;
  const MINUS = '−';
  const STAR = '★';
  const CROSS = '✗';
  const UP = '▲';
  const DOWN = '▼';
  const N_GAMES = 6;
  const KEY = 'nimKnobs.v1';
  const HIST_MAX = 400;
  const $ = (id) => document.getElementById(id);

  const params = new URLSearchParams(window.location.search);
  const seedParam = params.get('seed');
  const rng = seedParam ? Nim.mulberry32(parseInt(seedParam, 10) || 1) : Math.random;

  const START_WIN = Nim.winProb(Nim.zeroKnobs()) * 100;

  const state = {
    w: Nim.zeroKnobs(),
    hist: [],                 // win chance in percent after each knob change
    sel: { s: S, a: 1 },
    games: null,              // { list, rev, win }
    rev: 0,                   // knob changes in this visit
    lastDelta: null,          // change of the win chance by the last knob change
    undo: null,
  };

  /* Saving: this browser only, and optional. */

  function rowsOf(w) {
    const rows = [];
    for (let s = 1; s <= S; s++) rows.push(w[s].slice(0, Nim.legalCount(s)));
    return rows;
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify({ v: 1, w: rowsOf(state.w), hist: state.hist }));
    } catch (e) { /* storage blocked: the page works without it */ }
  }

  function load() {
    try {
      const d = JSON.parse(localStorage.getItem(KEY));
      if (!d || d.v !== 1 || !Array.isArray(d.w) || d.w.length !== S) return;
      const w = Nim.zeroKnobs();
      for (let s = 1; s <= S; s++) {
        for (let a = 0; a < Nim.legalCount(s); a++) {
          const x = d.w[s - 1] && d.w[s - 1][a];
          w[s][a] = typeof x === 'number' ? Nim.clampKnob(x) : 0;
        }
      }
      state.w = w;
      if (Array.isArray(d.hist)) {
        state.hist = d.hist.filter((x) => typeof x === 'number' && isFinite(x)).slice(-HIST_MAX);
      }
    } catch (e) { /* nothing saved, or unreadable: start fresh */ }
  }

  /* Formatting. */

  function fmtKnob(v) {
    const t = Number.isInteger(v) ? String(Math.abs(v)) : Math.abs(v).toFixed(1);
    return v < 0 ? MINUS + t : t;
  }
  function fmtPct(x) {                       // x in percent
    return x >= 99.95 ? '100%' : x.toFixed(1) + '%';
  }
  function fmtShare(p) {                     // p in 0..1
    const x = p * 100;
    if (x >= 99.95) return '100%';
    return (x >= 10 && x < 99 ? x.toFixed(0) : x.toFixed(1)) + '%';
  }
  function fmtCell(p) {                      // for a 31 pixel cell, no percent sign
    const x = p * 100;
    if (x < 0.05) return '0';
    if (x < 1) return x.toFixed(1);
    if (x > 99 && x < 99.95) return x.toFixed(1);
    return String(Math.round(x));
  }
  function fmtExp(x) {
    if (x < 0.01) return x.toExponential(1);
    if (x < 10) return x.toFixed(2);
    if (x < 100) return x.toFixed(1);
    return Math.round(x).toLocaleString('en-US');
  }
  function fmtDelta(d) {
    if (Math.abs(d) < 0.05) return 'no change';
    return (d > 0 ? UP + ' +' : DOWN + ' ' + MINUS) + Math.abs(d).toFixed(1) + ' pts';
  }
  function deltaClass(d) {
    if (d === null || Math.abs(d) < 0.05) return '';
    return d > 0 ? 'up' : 'down';
  }

  /* The two tables, built once and updated in place. */

  const refs = {};            // refs['7,3'] = { btn, v, tg, tb, td, pv }

  function build() {
    let head = '';
    for (let s = 1; s <= S; s++) {
      head += '<th scope="col" data-s="' + s + '">' + s + (s === S ? '<small>start</small>' : '') + '</th>';
    }
    $('knobHead').innerHTML = head;
    $('probHead').innerHTML = head;

    let bk = '';
    let bp = '';
    for (let a = 1; a <= Nim.MAXTAKE; a++) {
      const rowHead = '<th scope="row" data-a="' + a + '"><span class="rl">take</span>' + a + '</th>';
      bk += '<tr>' + rowHead;
      bp += '<tr>' + rowHead;
      for (let s = 1; s <= S; s++) {
        if (a > Nim.legalCount(s)) {
          bk += '<td class="na"></td>';
          bp += '<td class="na"></td>';
        } else {
          bk += '<td><button type="button" class="cell" data-s="' + s + '" data-a="' + a + '">' +
            '<span class="v"></span><i class="tg" hidden></i><i class="tb" hidden></i></button></td>';
          bp += '<td class="p" data-s="' + s + '" data-a="' + a + '"><span class="pv"></span></td>';
        }
      }
      bk += '</tr>';
      bp += '</tr>';
    }
    $('knobBody').innerHTML = bk;
    $('probBody').innerHTML = bp;

    document.querySelectorAll('#knobBody .cell').forEach((btn) => {
      refs[btn.dataset.s + ',' + btn.dataset.a] = {
        btn: btn,
        v: btn.querySelector('.v'),
        tg: btn.querySelector('.tg'),
        tb: btn.querySelector('.tb'),
      };
    });
    document.querySelectorAll('#probBody td.p').forEach((td) => {
      const r = refs[td.dataset.s + ',' + td.dataset.a];
      r.td = td;
      r.pv = td.querySelector('.pv');
    });
  }

  function refreshTables() {
    for (let s = 1; s <= S; s++) {
      const col = Nim.column(state.w, s);
      for (let a = 1; a <= Nim.legalCount(s); a++) {
        const r = refs[s + ',' + a];
        const knob = state.w[s][a - 1];
        const p = col.p[a - 1];
        const on = state.sel.s === s && state.sel.a === a;
        r.v.textContent = fmtKnob(knob);
        r.btn.setAttribute('aria-label', 'Pile ' + s + ', take ' + a + ', knob ' + fmtKnob(knob));
        r.btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        r.btn.classList.toggle('sel', on);
        const txt = fmtCell(p);
        r.pv.textContent = txt;
        r.pv.classList.toggle('tiny', txt.length > 3);
        const pct = (p * 100).toFixed(1) + '%';
        r.td.style.backgroundImage = 'linear-gradient(to top, var(--fill) ' + pct + ', transparent ' + pct + ')';
        r.td.classList.toggle('sel', on);
      }
    }
    document.querySelectorAll('#knobHead th, #probHead th').forEach((th) => {
      th.classList.toggle('csel', +th.dataset.s === state.sel.s);
    });
    document.querySelectorAll('#knobBody th, #probBody th').forEach((th) => {
      th.classList.toggle('rsel', +th.dataset.a === state.sel.a);
    });
  }

  /* The arithmetic of the selected column. */

  function refreshDetail() {
    const s = state.sel.s;
    const col = Nim.column(state.w, s);
    let rows = '';
    for (let a = 1; a <= col.e.length; a++) {
      rows += '<tr' + (a === state.sel.a ? ' class="sel"' : '') + '><td>take ' + a + '</td><td>' +
        fmtKnob(state.w[s][a - 1]) + '</td><td>' + fmtExp(col.e[a - 1]) + '</td><td>' +
        fmtShare(col.p[a - 1]) + '</td></tr>';
    }
    const note = col.e.length === 1 ? 'one legal move, so it is certain' : 'how the column is computed';
    $('detail').innerHTML =
      '<div class="detail-h">Pile ' + s + ' <span>' + note + '</span></div>' +
      '<table class="mini"><thead><tr><th>move</th><th>knob</th><th class="ex">e<sup>knob</sup></th><th>chance</th></tr></thead>' +
      '<tbody>' + rows + '</tbody>' +
      '<tfoot><tr><td>total</td><td></td><td>' + fmtExp(col.total) + '</td><td>100%</td></tr></tfoot></table>';
  }

  /* The bar at the bottom, and the chance of winning. */

  let typing = false;

  function refreshHud(win) {
    const { s, a } = state.sel;
    const col = Nim.column(state.w, s);
    $('hudWin').textContent = fmtPct(win);
    const hd = $('hudDelta');
    hd.textContent = state.lastDelta === null ? '' : fmtDelta(state.lastDelta);
    hd.className = 'hud-delta ' + deltaClass(state.lastDelta);
    $('hudName').textContent = 'Pile ' + s + ', take ' + a;
    $('hudProb').textContent = col.e.length === 1 ? 'the only move: 100%' : 'chosen ' + fmtShare(col.p[a - 1]) + ' of the time';
    if (!typing) $('valInput').value = String(state.w[s][a - 1]);
  }

  function refreshWinCard(win) {
    $('winBig').textContent = fmtPct(win);
    $('winBar').style.width = Math.min(100, win).toFixed(2) + '%';
    $('winStart').textContent = fmtPct(START_WIN);
    const d = $('winDelta');
    d.textContent = state.lastDelta === null ? '' : 'last change ' + fmtDelta(state.lastDelta);
    d.className = 'delta ' + deltaClass(state.lastDelta);
    drawSpark();
  }

  function drawSpark() {
    const h = state.hist;
    const n = h.length;
    const W = 320;
    const H = 112;
    const L = 32;
    const R = 10;
    const T = 10;
    const B = 24;
    const x = (i) => (n > 1 ? L + (i * (W - L - R)) / (n - 1) : L);
    const y = (p) => T + ((100 - p) * (H - T - B)) / 100;
    let svg = '';
    [0, 50, 100].forEach((g) => {
      svg += '<line class="sp-grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + y(g) + '" y2="' + y(g) + '"/>' +
        '<text class="sp-lab" x="' + (L - 6) + '" y="' + (y(g) + 3.5) + '" text-anchor="end">' + g + '%</text>';
    });
    if (n > 1) {
      svg += '<polyline class="sp-line" points="' + h.map((p, i) => x(i).toFixed(1) + ',' + y(p).toFixed(1)).join(' ') + '"/>';
      svg += '<circle class="sp-first" cx="' + x(0).toFixed(1) + '" cy="' + y(h[0]).toFixed(1) + '" r="3.6"/>';
      svg += '<circle class="sp-dot" cx="' + x(n - 1).toFixed(1) + '" cy="' + y(h[n - 1]).toFixed(1) + '" r="3.8"/>';
    } else {
      svg += '<circle class="sp-dot" cx="' + L + '" cy="' + y(h[0]).toFixed(1) + '" r="3.8"/>';
      svg += '<text class="sp-empty" x="' + (L + 14) + '" y="' + (y(75) + 4) + '">Turn a knob and the line starts.</text>';
    }
    svg += '<text class="sp-lab" x="' + L + '" y="' + (H - 6) + '">0</text>' +
      '<text class="sp-lab" x="' + ((L + W - R) / 2) + '" y="' + (H - 6) + '" text-anchor="middle">knob changes</text>' +
      '<text class="sp-lab" x="' + (W - R) + '" y="' + (H - 6) + '" text-anchor="end">' + (n - 1) + '</text>';
    $('spark').innerHTML = svg;
  }

  /* The games. */

  function markFor(kind) {
    if (kind === 'good') return '<span class="mk">' + STAR + '</span>';
    if (kind === 'bad') return '<span class="mk">' + CROSS + '</span>';
    return '';
  }
  const KIND_TITLE = { good: 'good state', bad: 'bad state', stuck: 'already lost' };

  function captionFor(g) {
    if (g.won) return 'No slips: every move left a good state.';
    const sl = Nim.slip(g);
    return 'Slip at pile ' + sl.from + ': it took ' + sl.take + ' and left ' + sl.to +
      '. From there the opponent cannot be stopped.';
  }

  function gameHTML(g, n) {
    let h = '<article class="game"><div class="game-h"><span>Game ' + n + '</span><span class="res ' +
      (g.won ? 'won' : 'lost') + '">' + (g.won ? 'won' : 'lost') + '</span></div><div class="strip">';
    h += '<span class="st start" title="the pile at the start">' + S + '</span>';
    for (const st of g.steps) {
      if (st.who === 'machine') {
        h += '<button type="button" class="mv me" data-s="' + st.from + '" data-a="' + st.take +
          '" aria-label="The machine took ' + st.take + ' from ' + st.from + ', leaving a ' + KIND_TITLE[st.kind] +
          '. Select its knob.">' + MINUS + st.take + '</button>';
        h += '<span class="st ' + st.kind + '" title="' + KIND_TITLE[st.kind] + '">' + st.to + markFor(st.kind) + '</span>';
      } else {
        h += '<span class="mv opp" title="The opponent took ' + st.take + '">' + MINUS + st.take + '</span>';
        h += '<span class="st opp">' + st.to + (st.kind === 'safe' ? '<span class="mk">' + STAR + '</span>' : '') + '</span>';
      }
    }
    return h + '</div><p class="cap">' + captionFor(g) + '</p></article>';
  }

  function renderGames() {
    const g = state.games;
    if (!g) {
      $('games').innerHTML = '<p class="empty">No games yet. Press the button to watch the machine play.</p>';
      $('score').textContent = '';
      $('stale').hidden = true;
      return;
    }
    $('games').innerHTML = g.list.map((game, i) => gameHTML(game, i + 1)).join('');
    const won = g.list.filter((x) => x.won).length;
    $('score').innerHTML = 'Won <b>' + won + ' of ' + g.list.length + '</b>. The exact chance was ' +
      fmtPct(g.win) + ', so a few games give a rough picture.';
    refreshGameState();
  }

  function refreshGameState() {
    const g = state.games;
    $('stale').hidden = !(g && g.rev !== state.rev);
    document.querySelectorAll('#games .mv.me').forEach((b) => {
      b.classList.toggle('sel', +b.dataset.s === state.sel.s && +b.dataset.a === state.sel.a);
    });
  }

  function renderTallies() {
    const t = state.games ? Nim.tally(state.games.list) : {};
    for (const key in refs) {
      const c = t[key];
      const good = c ? c.good : 0;
      const bad = c ? c.bad : 0;
      refs[key].tg.hidden = !good;
      refs[key].tg.textContent = good || '';
      refs[key].tb.hidden = !bad;
      refs[key].tb.textContent = bad || '';
    }
  }

  function play() {
    const list = [];
    for (let i = 0; i < N_GAMES; i++) list.push(Nim.sampleGame(state.w, rng));
    state.games = { list: list, rev: state.rev, win: Nim.winProb(state.w) * 100 };
    renderGames();
    renderTallies();
  }

  /* Changing the knobs. */

  function refresh() {
    const win = Nim.winProb(state.w) * 100;
    refreshTables();
    refreshDetail();
    refreshHud(win);
    refreshWinCard(win);
    refreshGameState();
  }

  function flashLimit() {
    const el = $('valInput');
    el.classList.add('limit');
    setTimeout(() => el.classList.remove('limit'), 350);
  }

  // A short flash on the column whose probabilities just changed: one knob moves
  // every probability in its column, and that is the point of the softmax.
  function flashColumn(s) {
    for (let a = 1; a <= Nim.legalCount(s); a++) {
      const td = refs[s + ',' + a].td;
      td.classList.remove('flash');
      void td.offsetWidth;
      td.classList.add('flash');
    }
  }

  function setKnob(s, a, v) {
    v = Nim.clampKnob(v);
    const old = state.w[s][a - 1];
    if (v === old) {
      if (Math.abs(old) === Nim.CAP) flashLimit();
      refresh();
      return;
    }
    const before = Nim.winProb(state.w) * 100;
    state.w[s][a - 1] = v;
    const after = Nim.winProb(state.w) * 100;
    state.hist.push(after);
    if (state.hist.length > HIST_MAX) state.hist.shift();
    state.lastDelta = after - before;
    state.rev += 1;
    state.undo = null;
    $('toast').hidden = true;
    save();
    refresh();
    flashColumn(s);
  }

  function nudge(d) {
    const { s, a } = state.sel;
    setKnob(s, a, state.w[s][a - 1] + d);
  }

  function select(s, a) {
    state.sel = { s: s, a: Math.min(a, Nim.legalCount(s)) };
    refresh();
  }

  /* Reset, with an undo. */

  let toastTimer = null;
  function toast(text, withUndo) {
    $('toastText').textContent = text;
    $('toastUndo').hidden = !withUndo;
    $('toast').hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { $('toast').hidden = true; state.undo = null; }, 9000);
  }

  function resetAll() {
    state.undo = { w: Nim.cloneKnobs(state.w), hist: state.hist.slice() };
    state.w = Nim.zeroKnobs();
    state.hist = [START_WIN];
    state.lastDelta = null;
    state.rev += 1;
    save();
    refresh();
    toast('All knobs are back at 0.', true);
  }

  function undoReset() {
    if (!state.undo) return;
    state.w = state.undo.w;
    state.hist = state.undo.hist;
    state.undo = null;
    state.lastDelta = null;
    state.rev += 1;
    save();
    refresh();
    $('toast').hidden = true;
  }

  /* Wiring. */

  function wire() {
    $('knobBody').addEventListener('click', (e) => {
      const b = e.target.closest('.cell');
      if (b) select(+b.dataset.s, +b.dataset.a);
    });
    $('probBody').addEventListener('click', (e) => {
      const td = e.target.closest('td.p');
      if (td) select(+td.dataset.s, +td.dataset.a);
    });
    $('games').addEventListener('click', (e) => {
      const b = e.target.closest('.mv.me');
      if (b) select(+b.dataset.s, +b.dataset.a);
    });

    $('knobBody').addEventListener('keydown', (e) => {
      const b = e.target.closest('.cell');
      if (!b) return;
      let s = +b.dataset.s;
      let a = +b.dataset.a;
      if (e.key === '+' || e.key === '=') { e.preventDefault(); nudge(1); return; }
      if (e.key === '-' || e.key === '_') { e.preventDefault(); nudge(-1); return; }
      if (e.key === 'ArrowLeft') s = Math.max(1, s - 1);
      else if (e.key === 'ArrowRight') s = Math.min(S, s + 1);
      else if (e.key === 'ArrowUp') a = Math.max(1, a - 1);
      else if (e.key === 'ArrowDown') a = Math.min(Nim.legalCount(s), a + 1);
      else return;
      e.preventDefault();
      a = Math.min(a, Nim.legalCount(s));
      select(s, a);
      refs[s + ',' + a].btn.focus();
    });

    $('incBtn').addEventListener('click', () => nudge(1));
    $('decBtn').addEventListener('click', () => nudge(-1));
    const val = $('valInput');
    val.addEventListener('input', () => { typing = true; });
    val.addEventListener('change', () => {
      typing = false;
      const x = parseFloat(val.value);
      if (Number.isFinite(x)) setKnob(state.sel.s, state.sel.a, x);
      else refresh();
    });
    val.addEventListener('blur', () => { typing = false; refresh(); });
    val.addEventListener('keydown', (e) => { if (e.key === 'Enter') val.blur(); });

    $('playBtn').addEventListener('click', play);
    $('resetBtn').addEventListener('click', resetAll);
    $('toastUndo').addEventListener('click', undoReset);
    $('themeBtn').addEventListener('click', () => window.Theme.toggle());
    document.addEventListener('keydown', (e) => {
      if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 't' || e.key === 'T') window.Theme.toggle();
    });
  }

  function drawMatches() {
    let h = '';
    for (let i = 0; i < 10; i++) {
      const x = 10 + i * 14;
      h += '<rect class="m-stick" x="' + (x - 1.6) + '" y="12" width="3.2" height="32" rx="1.6"/>' +
        '<circle class="m-head" cx="' + x + '" cy="9" r="4.6"/>';
    }
    $('matches').innerHTML = h;
  }

  /* Start. */

  load();
  if (!state.hist.length) state.hist = [Nim.winProb(state.w) * 100];
  drawMatches();
  build();
  wire();
  renderGames();
  renderTallies();
  refresh();
  if (params.get('autoplay') === '1') play();

  window.NimKnobs = { state: state, select: select, setKnob: setKnob, play: play, resetAll: resetAll };
})();
