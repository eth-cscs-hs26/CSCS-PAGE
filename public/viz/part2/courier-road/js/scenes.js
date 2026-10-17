/* The scene engine of Mara's road: two scenes (1 The story, 2 Play), a pager with Back and
 * Next in the top bar, deep links by hash, and the keys. It follows the click-step pattern
 * of the course-viz skill: every scene is a <section> in index.html, built by a function
 * registered in window.scenes (js/story.js and js/playui.js), which may return the hooks
 *   onEnter()     the scene has just been shown
 *   onLeave()     the scene is about to be hidden
 *   onNextKey()   the right arrow was pressed; return true to keep it for the scene (the
 *                 story turns a card), false to let the engine go to the next scene
 *   onPrevKey()   the same for the left arrow
 * Every scene builds itself at load, so a deep link to any scene starts it cold.
 *
 * Deep links: index.html#scene=2 opens the play scene, #scene=1 the story. Dev flags that
 * a participant link never carries (set after the scene, joined with &):
 *   card=4        the story card to show, counted from 1
 *   walk=1,4,9    the play scene starts with Mara walked to those places
 *   demo=5        the play scene starts with five seeded days in the record
 *   fast          no animations and no waiting
 * and ?seed=7 in the query string chooses the seed of demo. The parser is plain data in,
 * data out, so tests/test_play.js can check it in Node.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Scenes = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const TITLES = ['The story', 'Play'];
  const COUNT = TITLES.length;

  const isInt = (s) => /^[0-9]+$/.test(s || '');

  // The hash, as the engine reads it. Anything that does not parse is left out.
  function parseHash(hash) {
    const out = { scene: null, card: null, walk: null, demo: 0, fast: false, seed: null };
    const text = String(hash || '').replace(/^#/, '');
    if (!text) return out;
    text.split('&').forEach((part) => {
      const at = part.indexOf('=');
      const key = at < 0 ? part : part.slice(0, at);
      const val = at < 0 ? '' : part.slice(at + 1);
      if (key === 'scene' && isInt(val) && +val >= 1 && +val <= COUNT) out.scene = +val;
      else if (key === 'card' && isInt(val) && +val >= 1) out.card = +val;
      else if (key === 'walk' && /^[0-9]+(,[0-9]+)*$/.test(val)) out.walk = val.split(',').map(Number);
      else if (key === 'demo' && isInt(val) && +val >= 1) out.demo = Math.min(+val, 200);
      else if (key === 'fast' && val !== '0') out.fast = true;
      else if (key === 'seed' && isInt(val)) out.seed = +val;
    });
    return out;
  }

  // What the module hands out: the parser everywhere, and in a page the engine as well.
  const api = { TITLES: TITLES, COUNT: COUNT, parseHash: parseHash };

  if (typeof document !== 'undefined') {
    const $ = (id) => document.getElementById(id);
    const sections = {};
    const hooks = {};
    let current = 0;

    // quiet: the address bar already says where we are, so it is left as it is
    function go(n, quiet) {
      n = Number(n);
      if (!(n >= 1 && n <= COUNT) || n === current) return;
      const first = current === 0;
      const old = hooks[current];
      if (old && old.onLeave) old.onLeave();
      current = n;
      for (let i = 1; i <= COUNT; i++) sections[i].hidden = i !== n;
      document.body.setAttribute('data-scene', String(n));
      document.querySelectorAll('.pg').forEach((b) => {
        const on = +b.dataset.scene === n;
        if (on) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
        b.classList.toggle('visited', +b.dataset.scene < n);
      });
      $('navBack').disabled = n === 1;
      $('navNext').disabled = n === COUNT;
      if (!quiet) window.location.hash = '#scene=' + n;
      if (!first) window.scrollTo(0, 0);
      const h = hooks[n];
      if (h && h.onEnter) h.onEnter();
    }

    function start() {
      const flags = parseHash(window.location.hash);
      const query = new URLSearchParams(window.location.search);
      for (let i = 1; i <= COUNT; i++) {
        sections[i] = $('scene' + i);
        const build = window.scenes && window.scenes['scene' + i];
        hooks[i] = (build && build(sections[i])) || {};
      }
      if (window.StoryUI && flags.card) window.StoryUI.show(flags.card - 1);
      if (window.PlayUI && (flags.walk || flags.demo || flags.fast)) {
        const seed = flags.seed !== null ? flags.seed : query.get('seed');
        window.PlayUI.dev({ walk: flags.walk, demo: flags.demo, fast: flags.fast, seed: seed });
      }

      document.querySelectorAll('.pg').forEach((b) => b.addEventListener('click', () => go(+b.dataset.scene)));
      $('navBack').addEventListener('click', () => go(current - 1));
      $('navNext').addEventListener('click', () => go(current + 1));
      $('themeBtn').addEventListener('click', () => window.Theme.toggle());
      window.addEventListener('hashchange', () => {
        const f = parseHash(window.location.hash);
        if (f.scene) go(f.scene, true);
      });

      document.addEventListener('keydown', (e) => {
        if (e.defaultPrevented) return;
        const t = e.target;
        if (t && (/^(input|textarea|select)$/i.test(t.tagName) || t.isContentEditable)) return;
        if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
        const h = hooks[current] || {};
        if (e.key === 't' || e.key === 'T') {
          window.Theme.toggle();
        } else if (e.key === 'ArrowRight') {
          if (!(h.onNextKey && h.onNextKey())) go(current + 1);
        } else if (e.key === 'ArrowLeft') {
          if (!(h.onPrevKey && h.onPrevKey())) go(current - 1);
        }
      });

      go(flags.scene || 1, true);
    }

    api.go = go;
    api.current = () => current;
    window.Scenes = api;
    start();
  }

  return api;
});
