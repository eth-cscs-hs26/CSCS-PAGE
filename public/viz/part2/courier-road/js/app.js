/* The courier's road: the page. The game and its numbers are in road.js and the
 * places in places.js; this file draws them and wires the controls.
 *
 * Dev affordances for checking the page without clicking, not part of the game:
 *   ?seed=7      a seeded generator, so the sampled days repeat
 *   ?autoplay=1  send Mara six times on load
 */
(function () {
  'use strict';

  const Road = window.Road;
  const Places = window.Places;
  const P = Places.list;
  const R = Places.rewards;
  const ND = Road.N_DECISIONS;
  const MINUS = '−';
  const UP = '▲';
  const DOWN = '▼';
  const N_DAYS = 6;
  const KEY = 'courierRoad.v1';
  const HIST_MAX = 400;
  const DIR_NAME = ['southwest', 'southeast'];
  const DIR_TAG = ['SW', 'SE'];
  const $ = (id) => document.getElementById(id);

  const ARROW = [
    '<svg class="arrow" viewBox="0 0 16 16" aria-hidden="true"><path d="M12.5 3.5 L3.5 12.5 M3.5 6.5 V12.5 H9.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    '<svg class="arrow" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 3.5 L12.5 12.5 M12.5 6.5 V12.5 H6.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  ];

  const params = new URLSearchParams(window.location.search);
  const seedParam = params.get('seed');
  const rng = seedParam ? Road.mulberry32(parseInt(seedParam, 10) || 1) : Math.random;

  const BEST = Road.best(R);
  const START_J = Road.expectedReturn(Road.zeroKnobs(), R);

  const state = {
    w: Road.zeroKnobs(),
    hist: [],                 // coins a day after each knob change
    sel: { i: 0, d: 0 },      // the selected knob: place and direction
    view: 0,                  // the place shown in the card under the map
    days: null,               // { list, rev, J }
    rev: 0,                   // knob changes in this visit
    lastDelta: null,          // change of the average by the last knob change
    undo: null,
  };
  let an = null;              // the analysis of the current knobs

  /* Saving: this browser only, and optional. */

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify({ v: 1, w: state.w, hist: state.hist }));
    } catch (e) { /* storage blocked: the page works without it */ }
  }

  function load() {
    try {
      const d = JSON.parse(localStorage.getItem(KEY));
      if (!d || d.v !== 1 || !Array.isArray(d.w) || d.w.length !== ND) return;
      const w = Road.zeroKnobs();
      for (let i = 0; i < ND; i++) {
        for (let k = 0; k < 2; k++) {
          const x = d.w[i] && d.w[i][k];
          w[i][k] = typeof x === 'number' ? Road.clampKnob(x) : 0;
        }
      }
      state.w = w;
      if (Array.isArray(d.hist)) {
        state.hist = d.hist.filter((x) => typeof x === 'number' && isFinite(x)).slice(-HIST_MAX);
      }
    } catch (e) { /* nothing saved, or unreadable: start fresh */ }
  }

  /* Formatting. */

  const coinWord = (n) => (Math.abs(n) === 1 ? 'coin' : 'coins');
  const fmtCoins = (x) => (x < -0.05 ? MINUS : '') + Math.abs(x).toFixed(1);
  const fmtReward = (r) => (r > 0 ? '+' + r : r < 0 ? MINUS + Math.abs(r) : '0');
  function fmtKnob(v) {
    const t = Number.isInteger(v) ? String(Math.abs(v)) : Math.abs(v).toFixed(1);
    return v < 0 ? MINUS + t : t;
  }
  function fmtShare(p) {                     // p in 0..1
    const x = p * 100;
    if (x >= 99.95) return '100%';
    return (x >= 10 && x < 99 ? x.toFixed(0) : x.toFixed(1)) + '%';
  }
  function fmtCell(p) {                      // for a table cell, no percent sign
    const x = p * 100;
    if (x < 0.05) return '0';
    if (x < 1) return x.toFixed(1);
    if (x > 99 && x < 99.95) return x.toFixed(1);
    return String(Math.round(x));
  }
  const fmtPill = (p) => String(Math.round(p * 100));
  function fmtExp(x) {
    if (x < 0.01) return x.toExponential(1);
    if (x < 10) return x.toFixed(2);
    if (x < 100) return x.toFixed(1);
    return Math.round(x).toLocaleString('en-US');
  }
  function fmtDelta(d) {
    if (Math.abs(d) < 0.05) return 'no change';
    return (d > 0 ? UP + ' +' : DOWN + ' ' + MINUS) + Math.abs(d).toFixed(1) + ' coins';
  }
  function deltaClass(d) {
    if (d === null || Math.abs(d) < 0.05) return '';
    return d > 0 ? 'up' : 'down';
  }
  const art = (i) => 'img/' + P[i].id + '.svg';

  /* The map. */

  const MAP_W = 340;
  const MAP_H = 384;
  const ROW_Y = [44, 138, 232, 326];
  const RADIUS = [27, 25, 22, 19.5];
  const mapRefs = { road: {}, sel: {}, pill: {}, pillTx: {}, node: [] };

  function pos(i) {
    const depth = Road.depthOf(i);
    const k = i - (Math.pow(2, depth) - 1);
    return { x: (k + 0.5) * (MAP_W / Math.pow(2, depth)), y: ROW_Y[depth], r: RADIUS[depth], depth: depth };
  }

  function roadGeometry(i, d) {
    const a = pos(i);
    const b = pos(Road.child(i, d));
    const dy = 0.45 * (b.y - a.y);
    const p = [{ x: a.x, y: a.y }, { x: a.x, y: a.y + dy }, { x: b.x, y: b.y - dy }, { x: b.x, y: b.y }];
    const t = 0.56;
    const u = 1 - t;
    const mid = {
      x: u * u * u * p[0].x + 3 * u * u * t * p[1].x + 3 * u * t * t * p[2].x + t * t * t * p[3].x,
      y: u * u * u * p[0].y + 3 * u * u * t * p[1].y + 3 * u * t * t * p[2].y + t * t * t * p[3].y,
    };
    const dd = 'M' + p[0].x + ' ' + p[0].y + ' C' + p[1].x + ' ' + p[1].y + ' ' + p[2].x + ' ' + p[2].y + ' ' + p[3].x + ' ' + p[3].y;
    return { d: dd, mid: mid };
  }

  function buildMap() {
    let s = '<defs><linearGradient id="mpbg" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" class="mp-sky"/><stop offset="0.17" class="mp-land"/><stop offset="0.9" class="mp-land2"/>' +
      '<stop offset="0.915" class="mp-sea"/><stop offset="1" class="mp-sea"/></linearGradient>';
    for (let i = 0; i < Road.N; i++) {
      const q = pos(i);
      s += '<clipPath id="clip' + i + '"><circle cx="' + q.x + '" cy="' + q.y + '" r="' + q.r + '"/></clipPath>';
    }
    s += '</defs>';
    s += '<rect width="' + MAP_W + '" height="' + MAP_H + '" fill="url(#mpbg)"/>';

    // mountains in the north, either side of the pass, and the sea in the south
    s += '<path class="mp-mtn" opacity="0.6" d="M0 66 L20 36 L38 52 L64 18 L96 58 L120 44 L132 66 Z"/>';
    s += '<path class="mp-mtn" opacity="0.6" d="M208 66 L222 44 L248 16 L276 52 L296 32 L318 54 L340 38 L340 66 Z"/>';
    let wave = 'M0 364 q8.5 -4 17 0';
    for (let k = 0; k < 19; k++) wave += ' t17 0';
    s += '<path class="mp-wave" d="' + wave + '"/>';
    s += '<path class="mp-wave" opacity="0.7" d="M0 374 q8.5 -4 17 0' + ' t17 0'.repeat(19) + '"/>';

    // a compass: north up, and the two directions of the game
    s += '<g transform="translate(28 46)"><circle class="mp-compass" r="14"/>' +
      '<path class="mp-north" d="M0 -12 L3.2 -3 L-3.2 -3 Z"/>' +
      '<path class="mp-arrow" d="M-1.5 2 L-9 9.5 M-9 5 V9.5 H-4.5"/>' +
      '<path class="mp-arrow" d="M1.5 2 L9 9.5 M9 5 V9.5 H4.5"/>' +
      '<text class="mp-lab" x="0" y="-17" text-anchor="middle">N</text>' +
      '<text class="mp-lab" x="-9" y="23" text-anchor="middle">SW</text>' +
      '<text class="mp-lab" x="9" y="23" text-anchor="middle">SE</text></g>';

    // roads: a halo for the selected one, the road itself, then its chance on a pill
    let roads = '';
    let pills = '';
    for (let i = 0; i < ND; i++) {
      for (let d = 0; d < 2; d++) {
        const g = roadGeometry(i, d);
        roads += '<path class="road-sel" data-k="' + i + ',' + d + '" d="' + g.d + '"/>' +
          '<path class="road" data-k="' + i + ',' + d + '" d="' + g.d + '"/>';
        pills += '<g class="pill" data-i="' + i + '" data-d="' + d + '"><rect class="pill-bg" x="' + (g.mid.x - 10.5) + '" y="' + (g.mid.y - 7.5) +
          '" width="21" height="15" rx="7.5"/><text class="pill-tx" x="' + g.mid.x + '" y="' + (g.mid.y + 0.6) + '">50</text></g>';
      }
    }
    s += roads + pills;

    // the places
    for (let i = 0; i < Road.N; i++) {
      const q = pos(i);
      const r = q.r;
      const small = q.depth === 3;
      const br = small ? 7.4 : 8.4;
      const bx = q.x + 0.7 * r;
      const by = q.y + 0.74 * r;
      s += '<g class="node" data-i="' + i + '" tabindex="0" role="button" aria-label="' + P[i].name + '">' +
        '<circle class="node-bg" cx="' + q.x + '" cy="' + q.y + '" r="' + (r + 1.6) + '"/>' +
        '<image href="' + art(i) + '" x="' + (q.x - r) + '" y="' + (q.y - r) + '" width="' + (2 * r) + '" height="' + (2 * r) +
        '" preserveAspectRatio="xMidYMid slice" clip-path="url(#clip' + i + ')"/>' +
        '<circle class="node-ring" cx="' + q.x + '" cy="' + q.y + '" r="' + r + '"/>';
      if (i === 0) {
        s += '<text class="start-tx" x="' + q.x + '" y="' + (q.y - r - 5) + '">start</text>';
      } else {
        const up = R[i] >= 0;
        s += '<circle class="coin-bg ' + (up ? 'up' : 'down') + '" cx="' + bx + '" cy="' + by + '" r="' + br + '"/>' +
          '<text class="coin-tx ' + (up ? 'up' : 'down') + (small || Math.abs(R[i]) >= 10 ? ' small' : '') + '" x="' + bx + '" y="' + (by + 0.5) + '">' + fmtReward(R[i]) + '</text>';
      }
      s += '</g>';
    }
    $('map').innerHTML = s;

    $('map').querySelectorAll('.road').forEach((el) => { mapRefs.road[el.dataset.k] = el; });
    $('map').querySelectorAll('.road-sel').forEach((el) => { mapRefs.sel[el.dataset.k] = el; });
    $('map').querySelectorAll('.pill').forEach((el) => {
      const k = el.dataset.i + ',' + el.dataset.d;
      mapRefs.pill[k] = el;
      mapRefs.pillTx[k] = el.querySelector('.pill-tx');
    });
    $('map').querySelectorAll('.node').forEach((el) => { mapRefs.node[+el.dataset.i] = el; });
  }

  function refreshMap() {
    for (let i = 0; i < ND; i++) {
      for (let d = 0; d < 2; d++) {
        const k = i + ',' + d;
        const width = 1.6 + 9.4 * an.flow[i][d];
        mapRefs.road[k].style.strokeWidth = width.toFixed(2) + 'px';
        mapRefs.sel[k].style.strokeWidth = (width + 4.5).toFixed(2) + 'px';
        const on = state.sel.i === i && state.sel.d === d;
        mapRefs.sel[k].classList.toggle('on', on);
        mapRefs.pill[k].classList.toggle('on', on);
        mapRefs.pillTx[k].textContent = fmtPill(an.p[i][d]);
      }
    }
    mapRefs.node.forEach((el, i) => el.classList.toggle('on', i === state.view));
  }

  /* The place card: the picture, the story, and the two roads. */

  function refreshPlace() {
    const i = state.view;
    const pl = P[i];
    const up = R[i] >= 0;
    let h = '<img class="place-art" src="' + art(i) + '" alt="' + pl.name + '">';
    h += '<div class="place-body"><div class="place-head"><h3>' + pl.name + '</h3>' +
      (i === 0 ? '<span class="coin start">start</span>' : '<span class="coin ' + (up ? 'up' : 'down') + '">' + fmtReward(R[i]) + ' ' + coinWord(R[i]) + '</span>') + '</div>';
    h += '<div class="place-light">' + pl.light + (Road.isLeaf(i) ? ', the road ends' : '') + '</div>';
    h += '<p class="place-story">' + pl.story + '</p>';
    if (i === 0) h += '<p class="place-stat">Every day starts here.</p>';
    else if (Road.isLeaf(i)) h += '<p class="place-stat">Mara ends her day here <b>' + fmtShare(an.reach[i]) + '</b> of the time.</p>';
    else h += '<p class="place-stat">Mara passes through here <b>' + fmtShare(an.reach[i]) + '</b> of the time, and from here she still collects <b>' + fmtCoins(an.V[i]) + '</b> coins on average.</p>';
    h += '</div>';
    if (!Road.isLeaf(i)) {
      h += '<div class="roads">';
      for (let d = 0; d < 2; d++) {
        const c = Road.child(i, d);
        const on = state.sel.i === i && state.sel.d === d;
        h += '<button type="button" class="road-btn' + (on ? ' on' : '') + '" data-i="' + i + '" data-d="' + d + '">' + ARROW[d] +
          '<span class="rb-name">' + DIR_NAME[d] + ' to ' + P[c].name + '<small>' + fmtShare(an.p[i][d]) + ' of her days from here</small></span>' +
          '<span class="coin ' + (R[c] >= 0 ? 'up' : 'down') + '">' + fmtReward(R[c]) + '</span>' +
          '<span class="rb-chance">' + fmtShare(an.p[i][d]) + '</span></button>';
      }
      h += '</div>';
    }
    $('place').innerHTML = h;
  }

  /* The two tables, built once and updated in place. */

  const refs = {};            // refs['3,1'] = { btn, v, tg, tb, td, pv }

  function build() {
    let head = '';
    for (let i = 0; i < ND; i++) {
      head += '<th scope="col" data-i="' + i + '"><img class="th-art" src="' + art(i) + '" alt=""><span class="th-tag">' + P[i].tag + '</span></th>';
    }
    $('knobHead').innerHTML = head;
    $('probHead').innerHTML = head;

    let bk = '';
    let bp = '';
    for (let d = 0; d < 2; d++) {
      const rowHead = '<th scope="row" data-d="' + d + '">' + ARROW[d] + '<span class="rl">' + DIR_TAG[d] + '</span></th>';
      bk += '<tr>' + rowHead;
      bp += '<tr>' + rowHead;
      for (let i = 0; i < ND; i++) {
        bk += '<td><button type="button" class="cell" data-i="' + i + '" data-d="' + d + '">' +
          '<span class="v"></span><i class="tg" hidden></i><i class="tb" hidden></i></button></td>';
        bp += '<td class="p" data-i="' + i + '" data-d="' + d + '"><span class="pv"></span></td>';
      }
      bk += '</tr>';
      bp += '</tr>';
    }
    $('knobBody').innerHTML = bk;
    $('probBody').innerHTML = bp;

    document.querySelectorAll('#knobBody .cell').forEach((btn) => {
      refs[btn.dataset.i + ',' + btn.dataset.d] = {
        btn: btn,
        v: btn.querySelector('.v'),
        tg: btn.querySelector('.tg'),
        tb: btn.querySelector('.tb'),
      };
    });
    document.querySelectorAll('#probBody td.p').forEach((td) => {
      const r = refs[td.dataset.i + ',' + td.dataset.d];
      r.td = td;
      r.pv = td.querySelector('.pv');
    });
  }

  function refreshTables() {
    for (let i = 0; i < ND; i++) {
      for (let d = 0; d < 2; d++) {
        const r = refs[i + ',' + d];
        const knob = state.w[i][d];
        const p = an.p[i][d];
        const on = state.sel.i === i && state.sel.d === d;
        r.v.textContent = fmtKnob(knob);
        r.btn.setAttribute('aria-label', P[i].name + ', ' + DIR_NAME[d] + ', knob ' + fmtKnob(knob));
        r.btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        r.btn.classList.toggle('sel', on);
        const txt = fmtCell(p);
        r.pv.textContent = txt;
        const pct = (p * 100).toFixed(1) + '%';
        r.td.style.backgroundImage = 'linear-gradient(to top, var(--fill) ' + pct + ', transparent ' + pct + ')';
        r.td.classList.toggle('sel', on);
      }
    }
    document.querySelectorAll('#knobHead th, #probHead th').forEach((th) => {
      th.classList.toggle('csel', +th.dataset.i === state.sel.i);
    });
    document.querySelectorAll('#knobBody th, #probBody th').forEach((th) => {
      th.classList.toggle('rsel', +th.dataset.d === state.sel.d);
    });
  }

  /* The arithmetic of the selected column. */

  function refreshDetail() {
    const i = state.sel.i;
    const col = Road.column(state.w, i);
    let rows = '';
    for (let d = 0; d < 2; d++) {
      rows += '<tr' + (d === state.sel.d ? ' class="sel"' : '') + '><td>' + DIR_NAME[d] + '</td><td>' +
        fmtKnob(state.w[i][d]) + '</td><td>' + fmtExp(col.e[d]) + '</td><td>' + fmtShare(col.p[d]) + '</td></tr>';
    }
    $('detail').innerHTML =
      '<div class="detail-h">' + P[i].name + ' <span>how the column is computed</span></div>' +
      '<table class="mini"><thead><tr><th>road</th><th>knob</th><th class="ex">e<sup>knob</sup></th><th>chance</th></tr></thead>' +
      '<tbody>' + rows + '</tbody>' +
      '<tfoot><tr><td>total</td><td></td><td>' + fmtExp(col.total) + '</td><td>100%</td></tr></tfoot></table>';
  }

  /* The bar at the bottom, and the coins per day. */

  let typing = false;

  function refreshHud() {
    const { i, d } = state.sel;
    $('hudWin').textContent = fmtCoins(an.J);
    const hd = $('hudDelta');
    hd.textContent = state.lastDelta === null ? '' : fmtDelta(state.lastDelta);
    hd.className = 'hud-delta ' + deltaClass(state.lastDelta);
    $('hudName').textContent = P[i].name + ', ' + DIR_NAME[d];
    $('hudProb').textContent = 'chosen ' + fmtShare(an.p[i][d]) + ' of the time here';
    if (!typing) $('valInput').value = String(state.w[i][d]);
  }

  function refreshWinCard() {
    $('winBig').textContent = fmtCoins(an.J);
    $('winBar').style.width = Math.max(0, Math.min(100, (100 * an.J) / BEST.J)).toFixed(2) + '%';
    $('winStart').textContent = fmtCoins(START_J);
    $('winBest').textContent = fmtCoins(BEST.J);
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
    const Rm = 10;
    const T = 10;
    const B = 24;
    const top = Math.ceil(BEST.J);
    const x = (k) => (n > 1 ? L + (k * (W - L - Rm)) / (n - 1) : L);
    const y = (v) => T + ((top - v) * (H - T - B)) / top;
    let svg = '';
    [0, top / 2, top].forEach((g) => {
      svg += '<line class="sp-grid" x1="' + L + '" x2="' + (W - Rm) + '" y1="' + y(g) + '" y2="' + y(g) + '"/>' +
        '<text class="sp-lab" x="' + (L - 6) + '" y="' + (y(g) + 3.5) + '" text-anchor="end">' + g + '</text>';
    });
    if (n > 1) {
      svg += '<polyline class="sp-line" points="' + h.map((v, k) => x(k).toFixed(1) + ',' + y(v).toFixed(1)).join(' ') + '"/>';
      svg += '<circle class="sp-first" cx="' + x(0).toFixed(1) + '" cy="' + y(h[0]).toFixed(1) + '" r="3.6"/>';
      svg += '<circle class="sp-dot" cx="' + x(n - 1).toFixed(1) + '" cy="' + y(h[n - 1]).toFixed(1) + '" r="3.8"/>';
    } else {
      svg += '<circle class="sp-dot" cx="' + L + '" cy="' + y(h[0]).toFixed(1) + '" r="3.8"/>';
      svg += '<text class="sp-empty" x="' + (L + 14) + '" y="' + (y(top * 0.75) + 4) + '">Turn a knob and the line starts.</text>';
    }
    svg += '<text class="sp-lab" x="' + L + '" y="' + (H - 6) + '">0</text>' +
      '<text class="sp-lab" x="' + ((L + W - Rm) / 2) + '" y="' + (H - 6) + '" text-anchor="middle">knob changes</text>' +
      '<text class="sp-lab" x="' + (W - Rm) + '" y="' + (H - 6) + '" text-anchor="end">' + (n - 1) + '</text>';
    $('spark').innerHTML = svg;
  }

  /* The days. */

  function dayExpression(day) {
    return day.steps.map((st, k) => (k === 0 ? String(st.reward) : (st.reward < 0 ? ' ' + MINUS + ' ' + Math.abs(st.reward) : ' + ' + st.reward))).join('') +
      ' = ' + (day.total < 0 ? MINUS : '') + Math.abs(day.total) + ' ' + coinWord(day.total);
  }

  function verdict(day, J) {
    const d = day.total - J;
    if (Math.abs(d) < 0.05) return '<em class="vs">on average</em>';
    return '<em class="vs ' + (d > 0 ? 'up' : 'down') + '">' + Math.abs(d).toFixed(1) + (d > 0 ? ' above' : ' below') + ' average</em>';
  }

  function legHTML(st) {
    const pl = P[st.to];
    let adv;
    if (st.kind === 'better') adv = '<span class="adv up">' + UP + ' ' + Math.abs(st.adv).toFixed(1) + '</span>';
    else if (st.kind === 'worse') adv = '<span class="adv down">' + DOWN + ' ' + Math.abs(st.adv).toFixed(1) + '</span>';
    else adv = '<span class="adv even">even</span>';
    const gain = '<span class="gain ' + (st.reward >= 0 ? 'up' : 'down') + '">' + fmtReward(st.reward) + '</span>';
    const label = 'Mara took the ' + DIR_NAME[st.dir] + ' road from ' + P[st.from].name + ' to ' + pl.name + ' and got ' + fmtReward(st.reward) +
      ' ' + coinWord(st.reward) + '. The road was ' + (st.kind === 'even' ? 'about as good as' : st.kind === 'better' ? 'better than' : 'worse than') + ' her average. Select its knob.';
    return '<button type="button" class="leg" data-i="' + st.from + '" data-d="' + st.dir + '" aria-label="' + label + '">' +
      '<span class="dir">' + ARROW[st.dir] + DIR_TAG[st.dir] + '</span>' +
      '<span class="pic"><img src="' + art(st.to) + '" alt=""></span>' +
      '<span class="nm">' + pl.tag + '</span>' + gain + adv + '</button>';
  }

  function dayHTML(day, n, J) {
    return '<article class="day"><div class="day-h"><span>Day ' + n + '</span><span class="tot">' +
      (day.total < 0 ? MINUS : '+') + Math.abs(day.total) + ' ' + coinWord(day.total) + verdict(day, J) + '</span></div>' +
      '<div class="legs">' + day.steps.map(legHTML).join('') + '</div>' +
      '<p class="sum">' + dayExpression(day) + '</p></article>';
  }

  function renderDays() {
    const g = state.days;
    if (!g) {
      $('days').innerHTML = '<p class="empty">No days yet. Press the button to send Mara down.</p>';
      $('score').textContent = '';
      $('stale').hidden = true;
      return;
    }
    $('days').innerHTML = g.list.map((day, k) => dayHTML(day, k + 1, g.J)).join('');
    const mean = g.list.reduce((s, day) => s + day.total, 0) / g.list.length;
    $('score').innerHTML = 'Average of these ' + g.list.length + ' days: <b>' + fmtCoins(mean) + ' coins</b>. The exact average was ' +
      fmtCoins(g.J) + ', so a few days give a rough picture.';
    refreshDayState();
  }

  function refreshDayState() {
    const g = state.days;
    $('stale').hidden = !(g && g.rev !== state.rev);
    document.querySelectorAll('#days .leg').forEach((b) => {
      b.classList.toggle('sel', +b.dataset.i === state.sel.i && +b.dataset.d === state.sel.d);
    });
  }

  function renderTallies() {
    const t = state.days ? Road.tally(state.days.list) : {};
    for (const key in refs) {
      const c = t[key];
      const better = c ? c.better : 0;
      const worse = c ? c.worse : 0;
      refs[key].tg.hidden = !better;
      refs[key].tg.textContent = better || '';
      refs[key].tb.hidden = !worse;
      refs[key].tb.textContent = worse || '';
    }
  }

  function play() {
    const now = Road.analyse(state.w, R);
    const list = [];
    for (let k = 0; k < N_DAYS; k++) list.push(Road.sampleDay(now, R, rng));
    state.days = { list: list, rev: state.rev, J: now.J };
    renderDays();
    renderTallies();
  }

  /* Changing the knobs. */

  function refresh() {
    an = Road.analyse(state.w, R);
    refreshMap();
    refreshPlace();
    refreshTables();
    refreshDetail();
    refreshHud();
    refreshWinCard();
    refreshDayState();
  }

  function flashLimit() {
    const el = $('valInput');
    el.classList.add('limit');
    setTimeout(() => el.classList.remove('limit'), 350);
  }

  // A short flash on the column whose probabilities just changed: a knob moves both
  // chances of its place, and that is the point of the softmax.
  function flashColumn(i) {
    for (let d = 0; d < 2; d++) {
      const td = refs[i + ',' + d].td;
      td.classList.remove('flash');
      void td.offsetWidth;
      td.classList.add('flash');
    }
  }

  function setKnob(i, d, v) {
    v = Road.clampKnob(v);
    const old = state.w[i][d];
    if (v === old) {
      if (Math.abs(old) === Road.CAP) flashLimit();
      refresh();
      return;
    }
    const before = Road.expectedReturn(state.w, R);
    state.w[i][d] = v;
    const after = Road.expectedReturn(state.w, R);
    state.hist.push(after);
    if (state.hist.length > HIST_MAX) state.hist.shift();
    state.lastDelta = after - before;
    state.rev += 1;
    state.undo = null;
    $('toast').hidden = true;
    save();
    refresh();
    flashColumn(i);
  }

  function nudge(delta) {
    const { i, d } = state.sel;
    setKnob(i, d, state.w[i][d] + delta);
  }

  function selectKnob(i, d) {
    state.sel = { i: i, d: d };
    state.view = i;
    refresh();
  }

  function viewPlace(i) {
    state.view = i;
    if (!Road.isLeaf(i)) state.sel = { i: i, d: state.sel.i === i ? state.sel.d : 0 };
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
    state.undo = { w: Road.cloneKnobs(state.w), hist: state.hist.slice() };
    state.w = Road.zeroKnobs();
    state.hist = [START_J];
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
    $('map').addEventListener('click', (e) => {
      const pill = e.target.closest('.pill');
      if (pill) { selectKnob(+pill.dataset.i, +pill.dataset.d); return; }
      const node = e.target.closest('.node');
      if (node) viewPlace(+node.dataset.i);
    });
    $('map').addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const node = e.target.closest('.node');
      if (!node) return;
      e.preventDefault();
      viewPlace(+node.dataset.i);
    });
    $('place').addEventListener('click', (e) => {
      const b = e.target.closest('.road-btn');
      if (b) selectKnob(+b.dataset.i, +b.dataset.d);
    });
    $('knobBody').addEventListener('click', (e) => {
      const b = e.target.closest('.cell');
      if (b) selectKnob(+b.dataset.i, +b.dataset.d);
    });
    $('probBody').addEventListener('click', (e) => {
      const td = e.target.closest('td.p');
      if (td) selectKnob(+td.dataset.i, +td.dataset.d);
    });
    $('days').addEventListener('click', (e) => {
      const b = e.target.closest('.leg');
      if (b) selectKnob(+b.dataset.i, +b.dataset.d);
    });

    $('knobBody').addEventListener('keydown', (e) => {
      const b = e.target.closest('.cell');
      if (!b) return;
      let i = +b.dataset.i;
      let d = +b.dataset.d;
      if (e.key === '+' || e.key === '=') { e.preventDefault(); nudge(1); return; }
      if (e.key === '-' || e.key === '_') { e.preventDefault(); nudge(-1); return; }
      if (e.key === 'ArrowLeft') i = Math.max(0, i - 1);
      else if (e.key === 'ArrowRight') i = Math.min(ND - 1, i + 1);
      else if (e.key === 'ArrowUp') d = 0;
      else if (e.key === 'ArrowDown') d = 1;
      else return;
      e.preventDefault();
      selectKnob(i, d);
      refs[i + ',' + d].btn.focus();
    });

    $('incBtn').addEventListener('click', () => nudge(1));
    $('decBtn').addEventListener('click', () => nudge(-1));
    const val = $('valInput');
    val.addEventListener('input', () => { typing = true; });
    val.addEventListener('change', () => {
      typing = false;
      const x = parseFloat(val.value);
      if (Number.isFinite(x)) setKnob(state.sel.i, state.sel.d, x);
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

  /* Start. */

  load();
  if (!state.hist.length) state.hist = [Road.expectedReturn(state.w, R)];
  buildMap();
  build();
  wire();
  renderDays();
  renderTallies();
  refresh();
  if (params.get('autoplay') === '1') play();

  window.CourierRoad = { state: state, selectKnob: selectKnob, setKnob: setKnob, play: play, resetAll: resetAll };
})();
