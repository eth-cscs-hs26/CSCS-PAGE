/* Scene 1 of Mara's road: the story, told in six cards. The cards (words and pictures) are
 * plain data that loads in Node too, so tests/test_play.js can read them. The part at the
 * bottom runs in a page only: it shows one card at a time with Back, Next and a way to skip.
 *
 * The words never give an amount of coins, and they never say that a place pays the same
 * every day or that it varies, so the story stays true when a later version adds luck. The
 * pictures are the three new drawings in img/ (the fiddler, Eagle Pass at dawn, the market
 * square) and four small compositions made of the place pictures, drawn as inline SVG with
 * the colour classes of css/scenes.css.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./hat.js'));
  } else {
    root.Story = factory(root.Hat);
  }
})(typeof self !== 'undefined' ? self : this, function (Hat) {
  'use strict';

  /* Pictures made of other pictures. Each returns an HTML string for the picture box, which
   * is 4 by 3. Ids inside the SVG are unique to their picture, and only one card is in the
   * page at a time. */

  const roundImage = (file, uid, cx, cy, r) =>
    '<circle class="node-bg" cx="' + cx + '" cy="' + cy + '" r="' + (r + 2) + '"/>' +
    '<image href="img/' + file + '.svg" x="' + (cx - r) + '" y="' + (cy - r) + '" width="' + 2 * r + '" height="' + 2 * r +
    '" preserveAspectRatio="xMidYMid slice" clip-path="url(#' + uid + ')"/>' +
    '<circle class="node-ring" cx="' + cx + '" cy="' + cy + '" r="' + r + '"/>';

  const clip = (uid, cx, cy, r) => '<clipPath id="' + uid + '"><circle cx="' + cx + '" cy="' + cy + '" r="' + r + '"/></clipPath>';

  const landGradient = (uid) =>
    '<linearGradient id="' + uid + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="mp-sky"/>' +
    '<stop offset="0.55" class="mp-land"/><stop offset="1" class="mp-land2"/></linearGradient>';

  const pill = (cx, cy, w, text) =>
    '<rect class="sp-pill" x="' + (cx - w / 2) + '" y="' + (cy - 9) + '" width="' + w + '" height="18" rx="9"/>' +
    '<text class="sp-pilltx" x="' + cx + '" y="' + (cy + 3.4) + '" text-anchor="middle">' + text + '</text>';

  const MOUNTAINS =
    '<path class="mp-mtn" opacity="0.6" d="M0 66 L16 36 L30 50 L52 20 L76 56 L94 42 L102 66 Z"/>' +
    '<path class="mp-mtn" opacity="0.6" d="M140 66 L154 46 L176 18 L202 52 L222 34 L240 46 L240 66 Z"/>';

  // Card 3: the road forks. Eagle Pass at the top, Mirror Lake to the southwest, Windmill
  // Market to the southeast, and Mara beside the pass.
  function forkPicture() {
    const nodes = [{ f: 'pass', x: 120, y: 50, r: 30 }, { f: 'lake', x: 56, y: 136, r: 30 }, { f: 'market', x: 184, y: 136, r: 30 }];
    let s = '<svg class="sp-svg" viewBox="0 0 240 180" role="img" aria-label="From Eagle Pass the road forks into a southwest road to a lake and a southeast road to a windmill market">';
    s += '<defs>' + landGradient('sf-bg') + nodes.map((n, k) => clip('sf-c' + k, n.x, n.y, n.r)).join('') + '</defs>';
    s += '<rect width="240" height="180" fill="url(#sf-bg)"/>' + MOUNTAINS;
    s += '<path class="sp-road" d="M120 50 C120 98 56 90 56 136"/><path class="sp-road" d="M120 50 C120 98 184 90 184 136"/>';
    nodes.forEach((n, k) => { s += roundImage(n.f, 'sf-c' + k, n.x, n.y, n.r); });
    s += '<ellipse class="sp-shadow" cx="170" cy="74.4" rx="17" ry="3.2"/>';
    s += '<image href="img/mara-fiddler.svg" x="152" y="26" width="36" height="48"/>';
    s += pill(80, 92, 58, 'southwest') + pill(160, 92, 58, 'southeast');
    return s + '</svg>';
  }

  // Card 4: three crowds, each with an empty hat and a question mark.
  function unknownPicture() {
    const nodes = [{ f: 'market', x: 44 }, { f: 'inn', x: 120 }, { f: 'canyon', x: 196 }];
    let s = '<svg class="sp-svg" viewBox="0 0 240 180" role="img" aria-label="Three different places, each with an empty hat and a question mark">';
    s += '<defs>' + landGradient('su-bg') + nodes.map((n, k) => clip('su-c' + k, n.x, 58, 28)).join('') + '</defs>';
    s += '<rect width="240" height="180" fill="url(#su-bg)"/>' + MOUNTAINS;
    nodes.forEach((n, k) => {
      s += roundImage(n.f, 'su-c' + k, n.x, 58, 28);
      s += '<circle class="sp-q-bg" cx="' + n.x + '" cy="108" r="12"/><text class="sp-q" x="' + n.x + '" y="114" text-anchor="middle">?</text>';
      s += '<g transform="translate(' + (n.x - 26.4) + ' ' + (148 - 23.2) + ') scale(0.4)">' + Hat.inner(0) + '</g>';
    });
    return s + '</svg>';
  }

  // Card 5: sunset at the harbour, Mara and her hat, full of coins.
  function sunsetPicture() {
    let s = '<svg class="sp-svg" viewBox="0 0 240 180" role="img" aria-label="Sunset at the harbour: Mara stands beside her hat, which is full of coins">';
    s += '<image href="img/harbour.svg" width="240" height="180"/>';
    s += '<g transform="translate(21.3 84.9) scale(0.95)">' + Hat.inner(15) + '</g>';
    s += '<image href="img/mara-fiddler.svg" x="134" y="64" width="72" height="96"/>';
    s += '<path class="sp-spark" d="M58 112 l1.6 4 l4 1.6 l-4 1.6 l-1.6 4 l-1.6 -4 l-4 -1.6 l4 -1.6 Z"/>';
    s += '<path class="sp-spark" d="M118 104 l1.2 3 l3 1.2 l-3 1.2 l-1.2 3 l-1.2 -3 l-3 -1.2 l3 -1.2 Z"/>';
    return s + '</svg>';
  }

  // Card 6: a signpost with two arrows, and Mara waiting to see which way you go.
  function signPicture() {
    let s = '<svg class="sp-svg" viewBox="0 0 240 180" role="img" aria-label="A signpost with one arrow pointing southwest and one pointing southeast, and Mara waiting beside it">';
    s += '<image href="img/pass.svg" width="240" height="180"/>';
    s += '<ellipse class="sp-shadow" cx="88" cy="166" rx="28" ry="4.6"/>';
    s += '<rect class="sp-post" x="84" y="88" width="9" height="78" rx="1.6"/><rect class="sp-post-lit" x="84" y="88" width="3.2" height="78"/>';
    s += '<g transform="rotate(-9 88 116)"><path class="sp-board-a" d="M26 116 L38 104 L92 104 L92 128 L38 128 Z"/><path class="sp-chev" d="M48 110 L40 116 L48 122"/></g>';
    s += '<g transform="rotate(9 88 146)"><path class="sp-board-b" d="M150 146 L138 134 L84 134 L84 158 L138 158 Z"/><path class="sp-chev" d="M128 140 L136 146 L128 152"/></g>';
    s += '<ellipse class="sp-shadow" cx="178" cy="160" rx="26" ry="4.4"/>';
    s += '<g transform="translate(240 0) scale(-1 1)"><image href="img/mara-fiddler.svg" x="26" y="80" width="62" height="83"/></g>';
    return s + '</svg>';
  }

  const imgTag = (file, alt) => '<img src="img/' + file + '.svg" alt="' + alt + '" width="240" height="180">';

  const cards = [
    {
      id: 'dawn',
      title: 'Dawn at Eagle Pass',
      text: 'Mara is a busker, a street fiddler. She tunes her fiddle in front of the hospice, her hat empty on the snow.',
      pic: () => imgTag('story-pass', 'Mara tuning her fiddle at dawn in front of the hospice, her hat empty on the snow'),
    },
    {
      id: 'day',
      title: 'A day on the road',
      text: 'Today she walks down to the sea and plays in every place she reaches. Whoever passes may drop coins in her hat.',
      pic: () => imgTag('story-crowd', 'Mara playing in a sunny square while the listeners toss coins towards her hat'),
    },
    {
      id: 'fork',
      title: 'A fork in the road',
      text: 'At every place the road forks, southwest or southeast. She picks a way and plays at the next place.',
      pic: forkPicture,
    },
    {
      id: 'crowd',
      title: 'What will the crowd give?',
      text: 'She never knows what a crowd will give until she has played for it. Some places love a fiddle more than others.',
      pic: unknownPicture,
    },
    {
      id: 'sunset',
      title: 'Sunset',
      text: 'At sunset she counts her hat. The coins of the day are the coins from every place she played in.',
      pic: sunsetPicture,
    },
    {
      id: 'turn',
      title: 'Your turn',
      text: 'Which way will you walk? Play as many days as you like.',
      pic: signPicture,
    },
  ];

  // The last card ends with the words of the lecture for what the story has just told.
  const lecture = [
    ['place', 'state'],
    ['road', 'action'],
    ['coins at a place', 'reward'],
    ['coins of a day', 'return'],
  ];

  /* The page part: one card at a time. */

  if (typeof document !== 'undefined') {
    window.scenes = window.scenes || {};
    window.scenes.scene1 = function () {
      const $ = (id) => document.getElementById(id);
      const last = cards.length - 1;
      let index = 0;

      // the pictures are small files, so the next card can be fetched ahead of time
      function warm(k) {
        const html = cards[k] ? cards[k].pic() : '';
        const files = html.match(/img\/[a-z0-9-]+\.svg/g) || [];
        files.forEach((f) => { const im = new Image(); im.src = f; });
      }

      // All the titles lie in one grid cell, and so do all the texts, with only the card
      // that is showing visible. The cell is as tall as the tallest, so the buttons below
      // stay where they are from card to card.
      $('storyTitle').innerHTML = cards.map((c) => '<span>' + c.title + '</span>').join('');
      $('storyText').innerHTML = cards.map((c) => '<span>' + c.text + '</span>').join('');

      function render() {
        const c = cards[index];
        $('storyPic').innerHTML = c.pic();
        $('storyStep').textContent = (index + 1) + ' of ' + cards.length;
        ['storyTitle', 'storyText'].forEach((id) => {
          Array.prototype.forEach.call($(id).children, (el, k) => el.classList.toggle('on', k === index));
        });
        $('storyDots').innerHTML = cards.map((_, k) => '<i' + (k === index ? ' class="on"' : '') + '></i>').join('');
        $('storyBack').disabled = index === 0;
        $('storyNext').textContent = index === last ? 'Start walking' : 'Next';
        $('storyLecture').hidden = index !== last;
        $('storySkipRow').hidden = index === last;
        const body = $('story');
        body.classList.remove('turn');
        void body.offsetWidth;
        body.classList.add('turn');
        warm(index + 1);
      }

      function show(k) {
        index = Math.max(0, Math.min(last, k));
        render();
      }

      function next() {
        if (index < last) { show(index + 1); return true; }
        return false;
      }

      function prev() {
        if (index > 0) { show(index - 1); return true; }
        return false;
      }

      $('storyLectureList').innerHTML = lecture.map((p) => '<li><span class="lec-a">' + p[0] + '</span><span class="lec-eq">=</span><b class="lec-b">' + p[1] + '</b></li>').join('');
      $('storyBack').addEventListener('click', prev);
      $('storyNext').addEventListener('click', () => { if (!next()) window.Scenes.go(2); });

      // a swipe on the card turns it, for a phone
      let x0 = null;
      let y0 = null;
      const card = $('story');
      card.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
      card.addEventListener('touchend', (e) => {
        if (x0 === null) return;
        const dx = e.changedTouches[0].clientX - x0;
        const dy = e.changedTouches[0].clientY - y0;
        x0 = null;
        if (Math.abs(dx) < 60 || Math.abs(dx) < 1.6 * Math.abs(dy)) return;
        if (dx < 0) next(); else prev();
      }, { passive: true });

      render();
      warm(0);
      window.StoryUI = { show: show, current: () => index };
      return { onEnter: function () {}, onNextKey: next, onPrevKey: prev };
    };
  }

  return { cards: cards, lecture: lecture };
});
