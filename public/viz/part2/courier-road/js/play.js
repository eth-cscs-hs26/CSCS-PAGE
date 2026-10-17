/* Mara's road, scene 2: the walk and the record of days, with no DOM. Loads in a page
 * (window.Play) and in Node (require), so tests/test_play.js can check it.
 *
 * The game is the tree of js/places.js. Fifteen places are numbered breadth first, so the
 * children of place i are 2i+1 (the southwest road, direction 0) and 2i+2 (the southeast
 * road, direction 1). Places 0 to 6 have two roads out of them and places 7 to 14 end the
 * day. Mara starts at place 0, Eagle Pass, where she has not played yet and the hat is
 * empty. Every place she reaches gives her a few coins, and the coins of a day are the
 * coins of the places she played in.
 *
 * This file needs only js/places.js. It copies the three rules of the numbering above
 * (child, leaf, depth) and tests/test_play.js checks them against js/road.js.
 *
 * Where the coins come from. hatCoins(i) below is the one function that says how many coins
 * the hat receives at place i. Everything else in scene 2 (the walk, the totals, the record,
 * the page) asks it, or reads what the walk stored from it. Today a place gives the fixed
 * amount written in js/places.js. A later version will add day-to-day luck, and that change
 * belongs inside hatCoins alone.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./places.js'));
  } else {
    root.Play = factory(root.Places);
  }
})(typeof self !== 'undefined' ? self : this, function (Places) {
  'use strict';

  const N = Places.list.length;                       // fifteen places
  const child = (i, d) => 2 * i + 1 + d;
  const isLeaf = (i) => 2 * i + 1 >= N;
  const depthOf = (i) => Math.floor(Math.log2(i + 1));
  const DEPTH = depthOf(N - 1);                       // roads in one day: three

  // The coins the hat receives at place i.
  // Day-to-day luck will enter here later; for now this is the fixed amount of the place.
  function hatCoins(i) {
    return Places.list[i].reward;
  }

  // The places Mara can walk to from i: southwest first, then southeast. A leaf has none.
  function nextPlaces(i) {
    return isLeaf(i) ? [] : [child(i, 0), child(i, 1)];
  }

  function copyDay(d) {
    return { n: d.n, path: d.path.slice(), coins: d.coins.slice(), roads: d.roads.slice(), total: d.total };
  }

  // One game of a visit: the walk in progress and the days finished so far. Nothing is
  // saved anywhere; closing the page forgets the days.
  //   opts.hat   optional function(place) giving the coins of a place, for tests. The
  //              default is hatCoins.
  function create(opts) {
    const hat = (opts && opts.hat) || hatCoins;
    let days = [];             // finished days of this visit, oldest first
    let cleared = null;        // the days removed by the last clearDays, for undoClear
    let walk = freshWalk();

    // The start pays nothing: Mara has not played yet.
    function freshWalk() {
      return { place: 0, path: [0], coins: [0], roads: [], total: 0, done: false, day: 0 };
    }

    // What the page needs to draw the walk now.
    function view() {
      const i = walk.place;
      return {
        day: walk.done ? walk.day : days.length + 1,
        place: i,
        path: walk.path.slice(),
        coins: walk.coins.slice(),                    // coins at each place visited, the start first
        roads: walk.roads.slice(),                    // directions taken so far
        here: walk.coins[walk.coins.length - 1],      // coins from this place
        total: walk.total,                            // coins so far
        step: walk.roads.length,                      // roads taken so far
        steps: DEPTH,                                 // roads in a day
        done: walk.done,
        options: nextPlaces(i).map((p, d) => ({ dir: d, place: p })),
      };
    }

    // Walk one road: 0 for southwest, 1 for southeast. Returns what happened, or null when
    // the day is over or the direction is not 0 or 1.
    function choose(dir) {
      if (walk.done || (dir !== 0 && dir !== 1)) return null;
      const from = walk.place;
      const to = child(from, dir);
      const given = Number(hat(to));
      const got = Number.isFinite(given) ? given : 0;
      walk.path.push(to);
      walk.coins.push(got);
      walk.roads.push(dir);
      walk.total += got;
      walk.place = to;
      walk.done = isLeaf(to);
      let day = null;
      if (walk.done) {
        day = { n: days.length + 1, path: walk.path.slice(), coins: walk.coins.slice(), roads: walk.roads.slice(), total: walk.total };
        walk.day = day.n;
        days.push(day);
        cleared = null;                               // a new day makes the old undo stale
      }
      return { from: from, dir: dir, to: to, coins: got, total: walk.total, done: walk.done, day: day ? copyDay(day) : null };
    }

    // Start a new day at Eagle Pass. Allowed only once the day is over.
    function playAgain() {
      if (!walk.done) return false;
      walk = freshWalk();
      return true;
    }

    // The days of this visit, the best one and the average.
    function record() {
      const list = days.map(copyDay);
      const count = list.length;
      let best = null;
      let bestDay = null;
      let sum = 0;
      for (const d of list) {
        sum += d.total;
        if (best === null || d.total > best) {
          best = d.total;
          bestDay = d.n;
        }
      }
      return { days: list, count: count, best: best, bestDay: bestDay, sum: sum, average: count ? sum / count : null };
    }

    // Forget the days of this visit. A day that has just ended goes with them, so a walk that
    // is over starts again at Eagle Pass; a walk in progress goes on and becomes day 1.
    function clearDays() {
      if (!days.length) return false;
      cleared = days;
      days = [];
      if (walk.done) walk = freshWalk();
      return true;
    }

    function canUndoClear() {
      return cleared !== null && days.length === 0;
    }

    function undoClear() {
      if (!canUndoClear()) return false;
      days = cleared;
      cleared = null;
      return true;
    }

    return { view: view, choose: choose, playAgain: playAgain, record: record, clearDays: clearDays, canUndoClear: canUndoClear, undoClear: undoClear };
  }

  // Walk the places in the list one after the other, from the place the game stands in.
  // The list names the places reached, for example [1, 4, 9]. Returns false at the first
  // place that is not one of the two next places.
  function walkTo(game, places) {
    for (const p of places) {
      const opts = game.view().options;
      const hit = opts.find((o) => o.place === p);
      if (!hit || !game.choose(hit.dir)) return false;
    }
    return true;
  }

  // A whole day with a random generator (a function giving numbers in [0, 1)), for the
  // demo flag of the page and for tests. Starts a new day first when the last one is over.
  function playRandomDay(game, rng) {
    if (game.view().done) game.playAgain();
    let last = null;
    while (!game.view().done) last = game.choose(rng() < 0.5 ? 0 : 1);
    return last;
  }

  return {
    N: N,
    DEPTH: DEPTH,
    child: child,
    isLeaf: isLeaf,
    depthOf: depthOf,
    hatCoins: hatCoins,
    nextPlaces: nextPlaces,
    create: create,
    walkTo: walkTo,
    playRandomDay: playRandomDay,
  };
});
