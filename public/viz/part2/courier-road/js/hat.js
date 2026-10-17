/* Mara's hat with a pile of coins, as SVG markup. Loads in a page (window.Hat) and in Node
 * (require). It only draws: it is given a number of coins and never reads a coin amount
 * of a place.
 *
 * The hat lies upside down on the ground, like a busker's hat. The coins heap up inside it
 * in a triangle: a base row of seven, then rows of six, five and so on, which holds
 * twenty-eight coins. Coin k always sits in slot k, so a coin that arrives never moves the
 * coins already there. The slots fill from the middle of each row outwards, which keeps the
 * heap balanced at every count. All colours come from classes (css/scenes.css), so the
 * theme switch reaches them.
 *
 *   Hat.svg(total, opts)    a whole <svg> element, 112 by 94 units
 *   Hat.inner(total, opts)  its content, to place inside a bigger picture with a transform
 *   opts.newFrom            the index of the first coin that has just arrived; those coins
 *                           get the class "new", which css/scenes.css animates as a drop
 *   opts.cls                an extra class for the <svg> element
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Hat = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const VB_X = 10;                                  // the picture spans x from 10 to 122
  const VB_W = 112;
  const VB_H = 94;
  const ROWS = 7;
  const MAX = (ROWS * (ROWS + 1)) / 2;              // 28 coins
  const DX = 10.4;                                  // across a row
  const DY = 8.2;                                   // from one row to the next
  const X0 = 66;                                    // the middle of the hat
  const Y0 = 63;                                    // the base row, low enough to sit inside the rim

  // The place of every coin, in the order the coins arrive.
  function slots() {
    const out = [];
    for (let r = 0; r < ROWS; r++) {
      const m = ROWS - r;
      const mid = (m - 1) / 2;
      const order = [];
      for (let j = 0; j < m; j++) order.push(j);
      order.sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid) || a - b);
      for (const j of order) out.push({ row: r, j: j, x: X0 + (j - mid) * DX, y: Y0 - r * DY });
    }
    return out;
  }

  const SLOTS = slots();

  // A small fixed wobble so the heap does not look ruled.
  const wobbleX = (k) => (((k * 53) % 7) - 3) * 0.22;
  const wobbleY = (k) => (((k * 31) % 5) - 2) * 0.2;

  function coinMarkup(k, newFrom) {
    const s = SLOTS[k];
    const x = (s.x + wobbleX(k)).toFixed(1);
    const y = (s.y + wobbleY(k)).toFixed(1);
    const isNew = k >= newFrom;
    return '<g transform="translate(' + x + ' ' + y + ')"><g class="coin' + (isNew ? ' new' : '') + '"' +
      (isNew ? ' style="--k:' + (k - newFrom) + '"' : '') + ' data-k="' + k + '">' +
      '<circle class="c-edge" r="5.4"/><circle class="c-face' + (k % 3 === 0 ? ' b' : '') + '" r="4.3"/>' +
      '<path class="c-shine" d="M-2.6 -1.4 A3 3 0 0 1 0.2 -3.1"/></g></g>';
  }

  function inner(total, opts) {
    opts = opts || {};
    const n = Math.max(0, Math.min(MAX, Math.floor(Number(total) || 0)));
    const newFrom = opts.newFrom === undefined ? n : opts.newFrom;
    let s = '';
    s += '<ellipse class="hat-shadow" cx="66" cy="87" rx="48" ry="5.6"/>';
    s += '<ellipse class="hat-crown" cx="66" cy="82" rx="35" ry="8"/>';
    s += '<path class="hat-crown" d="M24 58 L31 82 A35 8 0 0 0 101 82 L108 58 Z"/>' +
    '<path class="hat-crown-lit" d="M24 58 L31 82 A35 8 0 0 0 49 89 L44 60 Z"/>';
    s += '<path class="hat-band" d="M26.6 67 Q66 86 105.4 67 L103.4 74 Q66 94 28.7 74 Z"/>';
    s += '<ellipse class="hat-brim" cx="66" cy="58" rx="52" ry="15"/>';
    s += '<ellipse class="hat-in" cx="66" cy="57" rx="40" ry="11"/>';
    // the coins, painted from the bottom row up and from left to right, so the upper ones
    // lie over the lower ones; the animation order is the arrival order k
    const order = [];
    for (let k = 0; k < n; k++) order.push(k);
    order.sort((a, b) => SLOTS[a].row - SLOTS[b].row || SLOTS[a].x - SLOTS[b].x);
    for (const k of order) s += coinMarkup(k, newFrom);
    // the front lip of the brim lies over the foot of the heap
    s += '<path class="hat-edge" d="M14 58 A52 15 0 0 0 118 58"/>';
    s += '<path class="hat-lip" d="M26 57 A40 11 0 0 0 106 57 L118 58 A52 15 0 0 1 14 58 Z"/>';
    return s;
  }

  function svg(total, opts) {
    opts = opts || {};
    return '<svg class="hat-svg' + (opts.cls ? ' ' + opts.cls : '') + '" viewBox="' + VB_X + ' 0 ' + VB_W + ' ' + VB_H +
      '" aria-hidden="true" focusable="false">' + inner(total, opts) + '</svg>';
  }

  return { VB_X: VB_X, VB_W: VB_W, VB_H: VB_H, MAX: MAX, SLOTS: SLOTS, inner: inner, svg: svg };
});
