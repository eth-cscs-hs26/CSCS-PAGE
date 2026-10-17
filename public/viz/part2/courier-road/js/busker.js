/* Mara the busker: one line of story for each of the fifteen places. Loads in a page
 * (window.Busker) and in Node (require).
 *
 * Mara plays the fiddle in every place she reaches, and whoever passes may drop coins in
 * her hat. The lines are keyed by place id (the ids of js/places.js) and say where she is
 * and who is listening. They never name an amount of coins, since the page shows the coins
 * itself, and they never say that a place pays the same every day or that it varies, so
 * they stay true when a later version adds luck to the hat.
 *
 * js/places.js keeps the older courier stories for the knobs page (knobs.html). The pages
 * of the busker (index.html) read only this file for the words of a place.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Busker = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const lines = {
    pass: 'Dawn at Eagle Pass: the hospice is still asleep, so Mara tunes her fiddle and sets her hat on the snow.',
    lake: 'At Mirror Lake the ferry passengers step off to listen while the mountains float upside down in the water.',
    market: 'Windmill Market is loud and crowded, and a lively tune makes shoppers stop between the stalls.',
    mill: 'At Millbrook the miller sets a stool by the water wheel, and the lunch guests listen between bites.',
    vines: 'On the Vine Terraces the pickers rest in the shade and hum along while Mara plays.',
    canyon: 'Red Canyon echoes every note back, and the few walkers on the rope bridge stop to listen.',
    inn: 'At the Dune Inn the caravan drivers rest in the shade, glad of a fiddle after the long dry road.',
    harbour: 'Sunset at Fishing Harbour: the boats are coming in and the fishers sit on the quay to listen.',
    lighthouse: 'The keeper of Reef Lighthouse leans out of his window to listen while the waves keep time.',
    olives: 'Harvest night at the Olive Grove Estate, with lanterns, a long table and a dance floor waiting for a fiddle.',
    citrus: 'The lemon sellers at Citrus Market sing along to every tune they know.',
    monastery: 'At Cliff Monastery the monks listen from the steps, and the bell tower answers after every tune.',
    springs: 'The Hot Springs are full of guests who have come to relax, and a fiddle floats nicely over the steam.',
    oasis: 'At Salt Oasis a few travellers rest by the water while the palms sway and the first star comes out.',
    cove: "Smugglers' Cove is a quiet crowd: a few shadows by the lanterns, listening without a word.",
  };

  return { lines: lines };
});
