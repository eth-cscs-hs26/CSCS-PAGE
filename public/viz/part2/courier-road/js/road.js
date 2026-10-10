/* The courier's road: pure logic, no DOM. Loads in a page (window.Road) and in Node
 * (require), so tests/test_road.js can check it against an independent computation.
 *
 * The game. Fifteen places form a binary tree of depth 3, numbered breadth first: the
 * children of place i are 2i+1 (southwest, direction 0) and 2i+2 (southeast, direction
 * 1). Mara starts at place 0 and, at each of the places 0 to 6, takes one of its two
 * roads; places 7 to 14 end the day. Arriving at a place pays its reward in coins.
 * The return of a day is the sum of the three rewards she collects.
 *
 * The policy is a table of knobs w[i][d], one per decision place and direction. The
 * two knobs of a place are turned into probabilities by a softmax, which for two
 * roads is the sigmoid of their difference.
 *
 * What the page shows, all exact (no sampling):
 *   J        the average return of a day under the knobs
 *   V[i]     the coins still to come on average once Mara stands at i
 *   Q[i][d]  the reward at the end of road d from i plus V of that place
 *   A[i][d]  Q[i][d] minus V[i]: how much better (or worse) the road is than Mara's
 *            average road from i. The chance of taking road d from i, times A[i][d],
 *            times the chance of being at i, is the slope of J along that knob.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Road = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const N = 15;            // places
  const N_DECISIONS = 7;   // places with two roads: 0 to 6
  const DEPTH = 3;
  const EPS = 0.05;        // coins; a road within this of Mara's average counts as even
  const CAP = 10;          // knobs live in [-CAP, CAP]
  const GRAIN = 10;        // and are kept to one decimal

  const isLeaf = (i) => i >= N_DECISIONS;
  const child = (i, d) => 2 * i + 1 + d;
  const parent = (i) => (i - 1) >> 1;
  const depthOf = (i) => Math.floor(Math.log2(i + 1));

  function zeroKnobs() {
    return Array.from({ length: N_DECISIONS }, () => [0, 0]);
  }

  function cloneKnobs(w) {
    return w.map((row) => row.slice());
  }

  function clampKnob(x) {
    if (!Number.isFinite(x)) return 0;
    x = Math.round(x * GRAIN) / GRAIN;
    x = Math.max(-CAP, Math.min(CAP, x));
    return x === 0 ? 0 : x;
  }

  // One column of the probability table: e^knob for each road, their total, the shares.
  function column(w, i) {
    const e = [Math.exp(w[i][0]), Math.exp(w[i][1])];
    const total = e[0] + e[1];
    return { e: e, total: total, p: [e[0] / total, e[1] / total] };
  }

  // Everything the page shows for one table of knobs, given the reward of every place.
  function analyse(w, rewards) {
    const p = [];
    for (let i = 0; i < N_DECISIONS; i++) p.push(column(w, i).p);

    const V = new Array(N).fill(0);
    const Q = [];
    for (let i = N_DECISIONS - 1; i >= 0; i--) {
      Q[i] = [0, 1].map((d) => rewards[child(i, d)] + V[child(i, d)]);
      V[i] = p[i][0] * Q[i][0] + p[i][1] * Q[i][1];
    }

    const reach = new Array(N).fill(0);
    reach[0] = 1;
    for (let i = 0; i < N_DECISIONS; i++) {
      for (const d of [0, 1]) reach[child(i, d)] = reach[i] * p[i][d];
    }

    const A = Q.map((q, i) => q.map((x) => x - V[i]));
    const flow = p.map((pi, i) => pi.map((x) => reach[i] * x));
    const grad = p.map((pi, i) => pi.map((x, d) => reach[i] * x * A[i][d]));
    return { p: p, V: V, Q: Q, A: A, reach: reach, flow: flow, grad: grad, J: V[0] };
  }

  const expectedReturn = (w, rewards) => analyse(w, rewards).J;

  // The best day: the road with the larger Q at every place, from the start.
  function best(rewards) {
    const Vs = new Array(N).fill(0);
    const pick = new Array(N_DECISIONS).fill(0);
    for (let i = N_DECISIONS - 1; i >= 0; i--) {
      const q = [0, 1].map((d) => rewards[child(i, d)] + Vs[child(i, d)]);
      pick[i] = q[1] > q[0] ? 1 : 0;
      Vs[i] = q[pick[i]];
    }
    const path = [0];
    while (!isLeaf(path[path.length - 1])) {
      const i = path[path.length - 1];
      path.push(child(i, pick[i]));
    }
    return { J: Vs[0], path: path, V: Vs };
  }

  // The greedy day: at every fork, the road whose own place pays more.
  function greedy(rewards) {
    const path = [0];
    let total = 0;
    while (!isLeaf(path[path.length - 1])) {
      const i = path[path.length - 1];
      const d = rewards[child(i, 1)] > rewards[child(i, 0)] ? 1 : 0;
      path.push(child(i, d));
      total += rewards[child(i, d)];
    }
    return { total: total, path: path };
  }

  // All eight days with their return, in order from the southwest-most leaf.
  function allDays(rewards) {
    const days = [];
    for (let leaf = N_DECISIONS; leaf < N; leaf++) {
      const path = [leaf];
      while (path[0] !== 0) path.unshift(parent(path[0]));
      days.push({ path: path, total: path.slice(1).reduce((s, i) => s + rewards[i], 0) });
    }
    return days;
  }

  // A seeded generator for reproducible samples and tests.
  function mulberry32(seed) {
    let t = seed >>> 0;
    return function () {
      t = (t + 0x6d2b79f5) >>> 0;
      let r = Math.imul(t ^ (t >>> 15), 1 | t);
      r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }

  // One day, from the analysis of the table it is drawn from (so the labels belong to
  // the probabilities that produced it). Each step records the road, the reward, the
  // advantage of the road and its kind: better, worse or even than Mara's average road.
  function sampleDay(an, rewards, rng) {
    const steps = [];
    let i = 0;
    let total = 0;
    while (!isLeaf(i)) {
      const d = rng() < an.p[i][0] ? 0 : 1;
      const c = child(i, d);
      const adv = an.A[i][d];
      steps.push({
        from: i,
        dir: d,
        to: c,
        reward: rewards[c],
        p: an.p[i][d],
        adv: adv,
        kind: adv > EPS ? 'better' : adv < -EPS ? 'worse' : 'even',
      });
      total += rewards[c];
      i = c;
    }
    return { steps: steps, total: total };
  }

  // For every knob (place, direction), how many steps of a sample of days took that road
  // when it was better than Mara's average, and when it was worse.
  function tally(days) {
    const out = {};
    for (const day of days) {
      for (const st of day.steps) {
        if (st.kind === 'even') continue;
        const key = st.from + ',' + st.dir;
        if (!out[key]) out[key] = { better: 0, worse: 0 };
        out[key][st.kind] += 1;
      }
    }
    return out;
  }

  return {
    N: N,
    N_DECISIONS: N_DECISIONS,
    DEPTH: DEPTH,
    EPS: EPS,
    CAP: CAP,
    isLeaf: isLeaf,
    child: child,
    parent: parent,
    depthOf: depthOf,
    zeroKnobs: zeroKnobs,
    cloneKnobs: cloneKnobs,
    clampKnob: clampKnob,
    column: column,
    analyse: analyse,
    expectedReturn: expectedReturn,
    best: best,
    greedy: greedy,
    allDays: allDays,
    mulberry32: mulberry32,
    sampleDay: sampleDay,
    tally: tally,
  };
});
