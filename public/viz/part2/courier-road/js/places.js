/* The fifteen places of the courier's road, as data. Loads in a page (window.Places)
 * and in Node (require).
 *
 * The places are numbered breadth first, so the children of place i are 2i+1 (the
 * southwest road) and 2i+2 (the southeast road). Places 0 to 6 have two roads; places
 * 7 to 14 are where the day ends. A place pays its reward in coins when Mara arrives;
 * every reward is positive, and the start pays nothing.
 *
 * The rewards are built so that no single place gives the best day away (Carlos,
 * 2026-10-10: "the last place clearly dominates ... make the optimal path less
 * obvious. Make all rewards positive"). The eight days pay 19, 18, 21, 18, 14, 19, 15
 * and 14 coins:
 *   - the best day is Mirror Lake, Vine Terraces, Olive Grove Estate, 7 + 7 + 7 = 21, a
 *     day on which no place stands out;
 *   - the biggest reward of the tree (Windmill Market, 9) is on a day of 14 to 19;
 *   - two leaves share the top leaf reward (Olive Grove Estate and Hot Springs, 7), and
 *     two other days come within 2 coins of the best (19 each);
 *   - the road that pays more at each fork, the greedy road, ends the day with 15,
 *     and it is wrong at the first fork (9 against 7) and at the second (8 against 7).
 * The dry east is poor except for its market; the green west is richer.
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
      id: 'lake', name: 'Mirror Lake', tag: 'Lake', light: 'morning', reward: 7,
      story: 'Mirror Lake holds the mountains upside down. The ferry owner pays seven coins to hear the news from the pass first.',
    },
    {
      id: 'market', name: 'Windmill Market', tag: 'Market', light: 'morning', reward: 9,
      story: 'Windmill Market is loud with wool traders. They pay nine coins for the first news from the pass.',
    },
    {
      id: 'mill', name: 'Millbrook', tag: 'Mill', light: 'afternoon', reward: 8,
      story: 'The miller at Millbrook serves lunch and pays eight coins for the news.',
    },
    {
      id: 'vines', name: 'Vine Terraces', tag: 'Vines', light: 'afternoon', reward: 7,
      story: 'The pickers on the Vine Terraces pay seven coins to hear what the mountain has been up to.',
    },
    {
      id: 'canyon', name: 'Red Canyon', tag: 'Canyon', light: 'afternoon', reward: 3,
      story: 'At Red Canyon the toll keeper tips three coins for help with a frayed rope bridge.',
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
      id: 'lighthouse', name: 'Reef Lighthouse', tag: 'Light', light: 'sunset', reward: 3,
      story: 'The keeper of Reef Lighthouse pays three coins and shares his soup, and the stairs up to his lamp have 300 steps.',
    },
    {
      id: 'olives', name: 'Olive Grove Estate', tag: 'Olives', light: 'sunset', reward: 7,
      story: 'Harvest night at the Olive Grove Estate. The owner has waited all year for this letter and pays seven coins.',
    },
    {
      id: 'citrus', name: 'Citrus Market', tag: 'Citrus', light: 'sunset', reward: 4,
      story: 'The lemon sellers at Citrus Market pay four coins for a letter and a story.',
    },
    {
      id: 'monastery', name: 'Cliff Monastery', tag: 'Cliff', light: 'sunset', reward: 2,
      story: 'The monks of Cliff Monastery offer a bed, a blessing and two coins.',
    },
    {
      id: 'springs', name: 'Hot Springs', tag: 'Springs', light: 'sunset', reward: 7,
      story: 'The Hot Springs are full of guests hungry for news from the pass, and the bath owner pays seven coins for it.',
    },
    {
      id: 'oasis', name: 'Salt Oasis', tag: 'Oasis', light: 'dusk', reward: 2,
      story: 'At Salt Oasis the water seller pays two coins for the news and throws in a cup of water.',
    },
    {
      id: 'cove', name: "Smugglers' Cove", tag: 'Cove', light: 'dusk', reward: 1,
      story: "Nobody asks questions at Smugglers' Cove. A smuggler pays one coin for a quiet delivery and says nothing more.",
    },
  ];

  return {
    list: list,
    rewards: list.map((p) => p.reward),
  };
});
