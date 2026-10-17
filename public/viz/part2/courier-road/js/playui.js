/* Scene 2 of Mara's road: the page that lets the participant walk Mara down by hand.
 * The walk and the record are in play.js (no DOM there); this file draws them.
 *
 * What the page shows: the place Mara stands in, the coins the hat received there and in
 * all so far, and the two places she can walk to next, with their names and pictures but
 * without their coins. After a tap she walks to the chosen place, the hat receives its
 * coins, and the numbers update. After the last road the day ends: the day's total, the
 * three places played and a button to play again. The record of the days of this visit
 * (day, places, total, best, average) stays on the page and is kept in memory only.
 *
 * Every coin amount on this page comes from play.js. This file never reads one from the
 * places, which is why it does not mention the word that js/places.js uses for them. A place
 * pays its usual coins plus a little luck that changes from day to day, so the same road
 * pays differently on different days; the page shows what the hat received, never the usual
 * amount.
 *
 * The page's own random generator draws the luck. ?seed=7 in the address (or &seed=7 in the
 * hash) seeds it, so a seeded run repeats exactly, luck included; without a seed it is
 * Math.random. A participant link carries no seed.
 *
 * Dev affordances for checking the page without tapping, not part of the game (in the URL
 * hash, set by js/scenes.js):
 *   #scene=2&walk=1,4,9    start with the walk taken to those places
 *   #scene=2&demo=5        play five days first, with the road dice of the same generator
 *   #scene=2&fast          no animations and no waiting
 * The two flags that play days for you seed the generator with 7 when no seed is given, so
 * that the days they play repeat.
 */
(function () {
  'use strict';

  const Places = window.Places;
  const Busker = window.Busker;
  const Play = window.Play;
  const Hat = window.Hat;
  const P = Places.list;
  const $ = (id) => document.getElementById(id);
  const DIR_NAME = ['southwest', 'southeast'];
  const ROWS_SHOWN = 12;                     // days listed in full; older ones are counted
  const UNDO_MS = 9000;

  const ARROW = [
    '<svg class="arrow" viewBox="0 0 16 16" aria-hidden="true"><path d="M12.5 3.5 L3.5 12.5 M3.5 6.5 V12.5 H9.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    '<svg class="arrow" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 3.5 L12.5 12.5 M12.5 6.5 V12.5 H6.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  ];

  const art = (i) => 'img/' + P[i].id + '.svg';
  const coinWord = (n) => (Math.abs(n) === 1 ? 'coin' : 'coins');
  const gain = (n) => (n > 0 ? '+' + n : String(n));
  const fmtAvg = (x) => x.toFixed(1);

  let fast = false;
  const reduced = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const stroll = () => (fast || reduced() ? 0 : 440);
  const later = (ms, fn) => { if (ms) setTimeout(fn, ms); else fn(); };

  // a small seeded generator for the luck, so that a seeded run repeats
  function mulberry32(seed) {
    let t = seed >>> 0;
    return function () {
      t = (t + 0x6d2b79f5) >>> 0;
      let r = Math.imul(t ^ (t >>> 15), 1 | t);
      r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }

  // The seed of the page's generator: ?seed= in the address, else seed= in the hash, else 7
  // when a flag plays days for you, else none (the luck then comes from Math.random).
  function pageSeed() {
    const flags = window.Scenes ? window.Scenes.parseHash(window.location.hash) : { seed: null, walk: null, demo: 0 };
    const q = new URLSearchParams(window.location.search).get('seed');
    if (q !== null && /^[0-9]+$/.test(q)) return parseInt(q, 10);
    if (flags.seed !== null) return flags.seed;
    return flags.walk || flags.demo ? 7 : null;
  }

  window.scenes = window.scenes || {};
  window.scenes.scene2 = function () {
    const seed = pageSeed();
    const rng = seed === null ? Math.random : mulberry32(seed);
    const game = Play.create({ rng: rng });
    let busy = false;
    let undoTimer = null;

    P.forEach((_, i) => { const im = new Image(); im.src = art(i); });

    /* The pieces of the page, each drawn from the walk as it stands. */

    function renderDay(v) {
      $('s2Day').textContent = 'Day ' + v.day;
      $('s2Road').textContent = v.done ? 'The day is over' : 'Road ' + (v.step + 1) + ' of ' + v.steps;
    }

    function renderPlace(v) {
      const pl = P[v.place];
      $('s2Light').textContent = pl.light;
      $('s2Name').textContent = pl.name;
      $('s2Story').textContent = Busker.lines[pl.id];
    }

    function popOn(el) {
      el.classList.remove('pop');
      void el.offsetWidth;
      el.classList.add('pop');
    }

    // the numbers and the hat; the coins that arrived with this step drop in
    function renderCoins(v, arrived) {
      $('s2Here').textContent = v.here > 0 ? gain(v.here) : String(v.here);
      $('s2Here').classList.toggle('zero', v.here === 0);
      $('s2Total').textContent = String(v.total);
      const from = arrived ? Math.max(0, v.total - v.here) : v.total;
      $('s2Hat').innerHTML = Hat.svg(v.total, { newFrom: from });
      if (arrived) {
        popOn($('s2Here'));
        popOn($('s2Total'));
      }
    }

    function renderAsk(v) {
      $('s2Ask').hidden = v.done;
      if (v.done) return;
      v.options.forEach((o) => {
        const b = $(o.dir === 0 ? 's2SW' : 's2SE');
        b.innerHTML = '<span class="fsign">' + ARROW[o.dir] + '<span>' + DIR_NAME[o.dir] + '</span></span>' +
          '<img class="fimg" src="' + art(o.place) + '" alt="" width="240" height="180">' +
          '<span class="fname">' + P[o.place].name + '</span>';
        b.setAttribute('aria-label', 'Walk ' + DIR_NAME[o.dir] + ' to ' + P[o.place].name);
      });
    }

    function renderEnd(v) {
      $('s2End').hidden = !v.done;
      if (!v.done) return;
      const got = v.coins.slice(1);
      $('s2EndTitle').textContent = 'Mara counts her hat: ' + v.total + ' ' + coinWord(v.total) + '.';
      $('s2EndSum').textContent = got.join(' + ') + ' = ' + v.total + ' ' + coinWord(v.total);
      $('s2EndPlaces').innerHTML = v.path.slice(1).map((p, k) =>
        '<li><img src="' + art(p) + '" alt="" width="240" height="180"><span class="ep-name">' + P[p].name +
        '</span><b class="coin ' + (got[k] > 0 ? 'up' : 'start') + '">' + gain(got[k]) + '</b></li>').join('');
    }

    function renderRecord() {
      const rec = game.record();
      $('s2Count').textContent = String(rec.count);
      $('s2Best').textContent = rec.best === null ? 'none yet' : String(rec.best);
      $('s2BestSub').textContent = rec.best === null ? ' ' : coinWord(rec.best) + ', day ' + rec.bestDay;
      $('s2Best').classList.toggle('empty', rec.best === null);
      $('s2Avg').classList.toggle('empty', rec.average === null);
      $('s2Avg').textContent = rec.average === null ? 'none yet' : fmtAvg(rec.average);
      $('s2AvgSub').textContent = rec.average === null ? ' ' : 'coins a day';
      $('s2Clear').disabled = rec.count === 0;
      const rows = rec.days.slice().reverse().slice(0, ROWS_SHOWN).map((d) => {
        const places = d.path.slice(1).map((p, k) =>
          '<span class="rp" title="' + P[p].name + '"><img src="' + art(p) + '" alt="' + P[p].name + '" width="240" height="180"><b' +
          (d.coins[k + 1] > 0 ? '' : ' class="z"') + '>' + gain(d.coins[k + 1]) + '</b></span>').join('');
        const label = 'Day ' + d.n + ': ' + d.path.slice(1).map((p, k) => P[p].name + ' ' + d.coins[k + 1]).join(', ') + ', total ' + d.total;
        const isBest = d.total === rec.best && d.n === rec.bestDay;
        return '<li class="rrow' + (isBest ? ' best' : '') + '" aria-label="' + label + '"><span class="rday">Day ' + d.n + '</span>' +
          '<span class="rplaces">' + places + '</span><span class="rtot"><b>' + d.total + '</b>' + (isBest ? '<i>best</i>' : '') + '</span></li>';
      });
      if (rec.count > ROWS_SHOWN) rows.push('<li class="rmore">and ' + (rec.count - ROWS_SHOWN) + ' earlier ' + (rec.count - ROWS_SHOWN === 1 ? 'day' : 'days') + ', counted above</li>');
      $('s2List').innerHTML = rows.join('');
      $('s2List').hidden = rec.count === 0;
    }

    // everything, from the walk as it stands: at the start, on coming back, after a clear
    function renderAll(arrived) {
      const v = game.view();
      const cur = document.querySelector('#s2Frame .pimg.cur');
      if (cur) cur.setAttribute('src', art(v.place));
      renderDay(v);
      renderPlace(v);
      renderCoins(v, arrived || false);
      renderAsk(v);
      renderEnd(v);
      renderRecord();
    }

    function announce(text) {
      $('s2Live').textContent = text;
    }

    /* Walking one road. The logic moves at once; the picture, the numbers and the hat
     * follow it, so the page is only decoration around a state that is already right. */

    function setBusy(on) {
      busy = on;
      document.querySelector('#s2Ask .forks').classList.toggle('busy', on);
      $('s2SW').setAttribute('aria-disabled', on ? 'true' : 'false');
      $('s2SE').setAttribute('aria-disabled', on ? 'true' : 'false');
    }

    function slide(place, dir, dur) {
      const frame = $('s2Frame');
      const old = frame.querySelector('.pimg.cur');
      if (!dur) { old.setAttribute('src', art(place)); return; }
      const nu = document.createElement('img');
      nu.className = 'pimg incoming';
      nu.alt = '';
      nu.setAttribute('src', art(place));
      nu.style.setProperty('--from', dir === 0 ? '-14%' : '14%');
      old.style.setProperty('--to', dir === 0 ? '14%' : '-14%');
      frame.insertBefore(nu, $('s2Mara'));
      void nu.offsetWidth;
      nu.classList.add('go');
      old.classList.add('outgoing');
      $('s2Mara').classList.add('walking');
      later(dur, () => {
        old.remove();
        nu.classList.remove('incoming', 'go');
        nu.classList.add('cur');
        $('s2Mara').classList.remove('walking');
      });
    }

    function choose(dir) {
      if (busy) return;
      const r = game.choose(dir);
      if (!r) return;
      setBusy(true);
      const dur = stroll();
      slide(r.to, dir, dur);
      later(dur, () => {
        const v = game.view();
        renderDay(v);
        renderPlace(v);
        renderCoins(v, true);
        renderAsk(v);
        renderEnd(v);
        renderRecord();
        announce('Mara walked ' + DIR_NAME[dir] + ' to ' + P[r.to].name + '. Coins from this place: ' + r.coins + '. Coins so far: ' + r.total + '.' +
          (r.done ? ' The day is over. Mara counts ' + r.total + ' ' + coinWord(r.total) + '.' : ''));
        if (r.done) $('s2End').scrollIntoView({ block: 'nearest', behavior: dur ? 'smooth' : 'auto' });
        later(dur ? 140 : 0, () => {
          setBusy(false);
          if (r.done) $('s2Again').focus({ preventScroll: true });
        });
      });
    }

    function playAgain() {
      if (busy || !game.playAgain()) return;
      const frame = $('s2Frame');
      renderAll(false);
      if (!stroll()) return;
      frame.classList.remove('fresh');
      void frame.offsetWidth;
      frame.classList.add('fresh');
      announce('A new day begins at Eagle Pass.');
      const first = $('s2SW');
      first.focus({ preventScroll: true });
    }

    function hideUndo() {
      clearTimeout(undoTimer);
      $('s2UndoRow').hidden = true;
    }

    function clearDays() {
      if (busy || !game.clearDays()) return;
      renderAll(false);
      $('s2UndoRow').hidden = false;
      clearTimeout(undoTimer);
      undoTimer = setTimeout(hideUndo, UNDO_MS);
      announce('Your days are cleared.');
    }

    function undoClear() {
      if (game.undoClear()) {
        renderAll(false);
        announce('Your days are back.');
      }
      hideUndo();
    }

    $('s2SW').addEventListener('click', () => choose(0));
    $('s2SE').addEventListener('click', () => choose(1));
    $('s2Again').addEventListener('click', playAgain);
    $('s2Clear').addEventListener('click', clearDays);
    $('s2Undo').addEventListener('click', undoClear);

    renderAll(false);

    // the dev flags of the hash, applied once at load by js/scenes.js
    window.PlayUI = {
      game: game,
      seed: seed,
      dev: function (flags) {
        if (flags.fast) {
          fast = true;
          document.documentElement.classList.add('fast');
        }
        if (flags.demo) {
          for (let k = 0; k < flags.demo; k++) Play.playRandomDay(game, rng);
          if (game.view().done && !flags.walk) game.playAgain();
        }
        if (flags.walk && flags.walk.length) {
          if (game.view().done) game.playAgain();
          Play.walkTo(game, flags.walk);
        }
        renderAll(false);
      },
    };

    return { onEnter: function () { if (!busy) renderAll(false); } };
  };
})();
