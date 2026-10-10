/* The fifteen places of the courier's road, as data. Loads in a page (window.Places)
 * and in Node (require).
 *
 * The places are numbered breadth first, so the children of place i are 2i+1 (the
 * southwest road) and 2i+2 (the southeast road). Places 0 to 6 have two roads; places
 * 7 to 14 are where the day ends. A place pays its reward in coins when Mara arrives
 * (a negative reward is a cost); the start pays nothing.
 *
 * The rewards are built so that the road that pays most at the first fork leads to a
 * poor day (Windmill Market, 6 coins, then at most 9 in all) and the road that pays
 * least leads to the best one (Mirror Lake, Vine Terraces, Olive Grove Estate: 1 + 2 +
 * 15 = 18). The same happens one level down, at Mirror Lake.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Places = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const list = [
    {
      id: 'pass', name: 'Eagle Pass', tag: 'Pass', light: 'dawn', reward: 0,
      story: 'Dawn at Eagle Pass. The hospice lamp is still lit and the satchel is packed. Two roads leave the pass, one to the southwest and one to the southeast.',
    },
    {
      id: 'lake', name: 'Mirror Lake', tag: 'Lake', light: 'morning', reward: 1,
      story: 'Mirror Lake holds the mountains upside down. The ferryman pays one coin for a letter to his sister.',
    },
    {
      id: 'market', name: 'Windmill Market', tag: 'Market', light: 'morning', reward: 6,
      story: 'Windmill Market is loud with wool traders. They pay six coins for the first news from the pass.',
    },
    {
      id: 'mill', name: 'Millbrook', tag: 'Mill', light: 'afternoon', reward: 3,
      story: 'The miller at Millbrook serves lunch and pays three coins for the news.',
    },
    {
      id: 'vines', name: 'Vine Terraces', tag: 'Vines', light: 'afternoon', reward: 2,
      story: 'The pickers on the Vine Terraces pay two coins to hear what the mountain has been up to.',
    },
    {
      id: 'canyon', name: 'Red Canyon', tag: 'Canyon', light: 'afternoon', reward: 2,
      story: 'At Red Canyon the toll keeper tips two coins for help with a frayed rope bridge.',
    },
    {
      id: 'inn', name: 'Dune Inn', tag: 'Inn', light: 'afternoon', reward: 4,
      story: 'The Dune Inn is full of caravan drivers. Four coins for a story is a fair price at supper.',
    },
    {
      id: 'harbour', name: 'Fishing Harbour', tag: 'Harbour', light: 'sunset', reward: 4,
      story: 'Sunset at Fishing Harbour. The harbour master pays four coins for the evening mail.',
    },
    {
      id: 'lighthouse', name: 'Reef Lighthouse', tag: 'Light', light: 'sunset', reward: -2,
      story: 'The keeper of Reef Lighthouse charges two coins for a bed and lamp oil, and the stairs have 300 steps.',
    },
    {
      id: 'olives', name: 'Olive Grove Estate', tag: 'Olives', light: 'sunset', reward: 15,
      story: 'Harvest night at the Olive Grove Estate. The owner has waited all year for this letter and pays fifteen coins.',
    },
    {
      id: 'citrus', name: 'Citrus Market', tag: 'Citrus', light: 'sunset', reward: 5,
      story: 'The lemon sellers at Citrus Market pay five coins for a letter and a story.',
    },
    {
      id: 'monastery', name: 'Cliff Monastery', tag: 'Cliff', light: 'sunset', reward: 1,
      story: 'The monks of Cliff Monastery offer a bed, a blessing and one coin.',
    },
    {
      id: 'springs', name: 'Hot Springs', tag: 'Springs', light: 'sunset', reward: -5,
      story: 'The Hot Springs are lovely and expensive. A soak costs five coins.',
    },
    {
      id: 'oasis', name: 'Salt Oasis', tag: 'Oasis', light: 'dusk', reward: -1,
      story: 'At Salt Oasis water costs one coin a cup, and Mara is thirsty.',
    },
    {
      id: 'cove', name: "Smugglers' Cove", tag: 'Cove', light: 'dusk', reward: -6,
      story: "Nobody asks questions at Smugglers' Cove, and a pickpocket lifts six coins from the satchel.",
    },
  ];

  return {
    list: list,
    rewards: list.map((p) => p.reward),
  };
});
