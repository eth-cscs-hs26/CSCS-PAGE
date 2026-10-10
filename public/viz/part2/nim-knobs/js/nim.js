/* The Nim of the knobs game: pure logic, no DOM. Loads in a page (window.Nim)
 * and in Node (require), so tests/test_nim.js can check it against the Python
 * reference of the lecture (part2-day1/policy-gradient-slides/nim/nim_reinforce.py).
 *
 * The game, as in the Part 1 deck: one pile of 10 matches, a move takes 1, 2 or
 * 3 (never more than are left), whoever takes the last match wins. The machine
 * moves first. Its opponent is a perfect player: it takes the number that leaves
 * a multiple of 4 when it can; from 4 or 8, where every move loses, it takes 1, 2
 * or 3 at random.
 *
 * The machine's policy is a table of knobs w[s][a-1], one per pile size s and
 * amount a (a at most s). Each column is turned into probabilities by a softmax
 * over its legal amounts.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Nim = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const START = 10;
  const MAXTAKE = 3;
  const CAP = 10;      // knobs live in [-CAP, CAP]
  const GRAIN = 10;    // and are kept to one decimal

  const legalCount = (s) => Math.min(MAXTAKE, s);

  // w[s][a-1] for s = 1..START; index 0 is unused.
  function zeroKnobs() {
    const w = [null];
    for (let s = 1; s <= START; s++) w.push([0, 0, 0]);
    return w;
  }

  function cloneKnobs(w) {
    return w.map((row) => (row ? row.slice() : row));
  }

  function clampKnob(x) {
    if (!Number.isFinite(x)) return 0;
    x = Math.round(x * GRAIN) / GRAIN;
    x = Math.max(-CAP, Math.min(CAP, x));
    return x === 0 ? 0 : x;
  }

  // One column of the probability table: e^knob for each legal amount, their
  // total, and the shares p.
  function column(w, s) {
    const m = legalCount(s);
    const e = [];
    let total = 0;
    for (let a = 0; a < m; a++) {
      const x = Math.exp(w[s][a]);
      e.push(x);
      total += x;
    }
    return { e: e, total: total, p: e.map((x) => x / total) };
  }

  // The chance the machine wins, exactly, by dynamic programming over the pile.
  // V[s]: the machine is to move at s. O[t]: the opponent is to move at t.
  function winProb(w) {
    const V = new Array(START + 1).fill(0);
    const O = new Array(START + 1).fill(0);
    for (let s = 1; s <= START; s++) {
      const t = s - 1;
      if (t >= 1) {
        const r = t % 4;
        if (r !== 0) {
          const left = t - r;
          O[t] = left === 0 ? 0 : V[left];
        } else {
          O[t] = (V[t - 1] + V[t - 2] + V[t - 3]) / 3;
        }
      }
      const p = column(w, s).p;
      let v = 0;
      for (let a = 1; a <= p.length; a++) {
        v += p[a - 1] * (s - a === 0 ? 1 : O[s - a]);
      }
      V[s] = v;
    }
    return V[START];
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

  // An amount from 1 to p.length, drawn with the probabilities p.
  function draw(p, rng) {
    const u = rng();
    let acc = 0;
    for (let i = 0; i < p.length; i++) {
      acc += p[i];
      if (u < acc) return i + 1;
    }
    return p.length;
  }

  // The perfect player.
  function opponentTake(pile, rng) {
    const r = pile % 4;
    if (r !== 0) return r;
    return 1 + Math.floor(rng() * Math.min(MAXTAKE, pile));
  }

  // The state after a move of the machine from `from`, taking `take`:
  // good: it leaves a multiple of 4 (0 included), so the opponent cannot stop it;
  // bad: it leaves anything else although it was not lost yet;
  // stuck: it was already facing a multiple of 4, so no move could have helped.
  function moveKind(from, take) {
    if ((from - take) % 4 === 0) return 'good';
    return from % 4 === 0 ? 'stuck' : 'bad';
  }

  // One game, the machine first. steps: who, from, take, to, kind. For the
  // machine, kind is good, bad or stuck; for the opponent, safe when it leaves a
  // multiple of 4 and plain otherwise.
  function sampleGame(w, rng) {
    const steps = [];
    let pile = START;
    let machine = true;
    while (pile > 0) {
      let take;
      let kind;
      if (machine) {
        take = draw(column(w, pile).p, rng);
        kind = moveKind(pile, take);
      } else {
        take = opponentTake(pile, rng);
        kind = (pile - take) % 4 === 0 ? 'safe' : 'plain';
      }
      steps.push({
        who: machine ? 'machine' : 'opponent',
        from: pile,
        take: take,
        to: pile - take,
        kind: kind,
      });
      pile -= take;
      machine = !machine;
    }
    return { steps: steps, won: steps[steps.length - 1].who === 'machine' };
  }

  // The first move of the machine that gave the game away, or null.
  function slip(game) {
    for (const st of game.steps) {
      if (st.who === 'machine' && st.kind === 'bad') return st;
    }
    return null;
  }

  // For every cell (s, a) of the table, how many times a sample of games used it
  // for a good move and for a bad one. Moves from an already lost pile are not
  // counted: no knob could have helped there.
  function tally(games) {
    const out = {};
    for (const g of games) {
      for (const st of g.steps) {
        if (st.who !== 'machine' || st.kind === 'stuck') continue;
        const key = st.from + ',' + st.take;
        if (!out[key]) out[key] = { good: 0, bad: 0 };
        out[key][st.kind] += 1;
      }
    }
    return out;
  }

  return {
    START: START,
    MAXTAKE: MAXTAKE,
    CAP: CAP,
    legalCount: legalCount,
    zeroKnobs: zeroKnobs,
    cloneKnobs: cloneKnobs,
    clampKnob: clampKnob,
    column: column,
    winProb: winProb,
    mulberry32: mulberry32,
    draw: draw,
    opponentTake: opponentTake,
    moveKind: moveKind,
    sampleGame: sampleGame,
    slip: slip,
    tally: tally,
  };
});
