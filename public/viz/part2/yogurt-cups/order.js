// order.js: the order in which one player's catalogue is laid out.
//
// A catalogue shown in a fixed order hands the pair a code for free: "second row, fourth
// along" names a picture on both screens, and nobody has invented anything. The flags are
// therefore laid out in a random order that is drawn again for every player and every
// round, so the sender's wall and the receiver's wall disagree and a position tells the
// partner nothing. The other families keep their sorted order, because for them the sorted
// layout is the lesson (one number names any picture).
//
// Loaded by index.html before its own script, and by tests/test_order.js under node.
(function (root) {
  "use strict";

  // Every cell of a family, in sorted (row-major) order.
  function allCells(f) {
    var out = [], a = f.axes;
    if (a.length === 1) {
      for (var i = 1; i <= a[0].n; i++) { out.push([i]); }
    } else if (a.length === 2) {
      // A pairs family is the upper triangle: its cell is an unordered pair, so [3,7] and [7,3]
      // would be the same flag and only one of them exists.
      var tri = (f.layout === "pairs");
      for (var r = 1; r <= a[0].n; r++) {
        for (var c = tri ? r + 1 : 1; c <= a[1].n; c++) { out.push([r, c]); }
      }
    } else {
      for (var b = 1; b <= a[0].n; b++) {
        for (var q = 1; q <= a[1].n; q++) {
          for (var z = 1; z <= a[2].n; z++) { out.push([b, q, z]); }
        }
      }
    }
    return out;
  }

  // The flags are the one family whose layout is "pairs".
  function isScrambled(f) {
    return f.layout === "pairs";
  }

  // Fisher-Yates on a copy. rnd() returns a number in [0, 1): Math.random on the page, a
  // seeded generator in the test.
  function shuffled(cells, rnd) {
    var out = cells.slice(), r = rnd || Math.random;
    for (var i = out.length - 1; i > 0; i--) {
      var j = Math.floor(r() * (i + 1));
      var t = out[i]; out[i] = out[j]; out[j] = t;
    }
    return out;
  }

  // The cells of family f in the order this player's wall shows them.
  function wallOrder(f, rnd) {
    var cells = allCells(f);
    return isScrambled(f) ? shuffled(cells, rnd) : cells;
  }

  var api = { allCells: allCells, isScrambled: isScrambled, shuffled: shuffled, wallOrder: wallOrder };
  root.YogurtOrder = api;
  if (typeof module !== "undefined" && module.exports) { module.exports = api; }
}(typeof window !== "undefined" ? window : globalThis));
