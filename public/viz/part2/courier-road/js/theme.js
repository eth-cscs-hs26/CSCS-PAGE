/* Light or dark, remembered in this browser. Light is the default: it projects
 * well. Runs in the head, before the body paints, so there is no flash. */
(function () {
  'use strict';
  var KEY = 'courierRoad.theme';
  var root = document.documentElement;

  function read() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function write(t) {
    try { localStorage.setItem(KEY, t); } catch (e) { /* private mode: fine */ }
  }
  function apply(t) {
    root.setAttribute('data-theme', t);
  }

  apply(read() === 'dark' ? 'dark' : 'light');

  window.Theme = {
    toggle: function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      apply(next);
      write(next);
    },
  };
})();
