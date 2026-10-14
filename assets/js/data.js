/* Hotem menu data.
 * Hotspot x/y are percentages of the image box. `side: 'l'` puts the label
 * to the left of its dot. `box` pins a label to an exact rectangle (x, y, w, h in %),
 * used where the source photo already carries a printed label we sit on top of. */
window.HOTEM_DISHES = [
  {
    id: 'miso-ramen',
    name: 'Miso Ramen',
    short: 'Ramen',
    category: 'Mains',
    price: 16,
    desc: 'Rich, savoury miso broth with springy noodles, tender chashu, a jammy egg, fresh scallions and nori. A comforting classic, done our way.',
    spice: 2,
    nutrition: { Calories: [620, 'kcal'], Protein: [28, 'g'], Carbs: [68, 'g'], Fat: [24, 'g'] },
    card: 'assets/img/card-ramen.webp',
    thumb: 'assets/img/thumb-ramen.webp',
    views: [
      {
        src: 'assets/img/ramen-detail.webp', w: 740, h: 670, kind: 'cut',
        hotspots: [
          { label: 'Nori', box: [76.08, 16.87, 13.65, 7.16] },
          { label: 'Soft egg', side: 'l', box: [6.22, 37.61, 16.89, 7.16] },
          { label: 'Chashu', box: [69.32, 57.61, 16.62, 7.16] }
        ]
      },
      { src: 'assets/img/hero-ramen.webp', w: 680, h: 730, kind: 'cut', hotspots: [] },
      { src: 'assets/img/card-ramen.webp', w: 442, h: 272, kind: 'photo', hotspots: [] }
    ]
  },
  {
    id: 'pork-bao',
    name: 'Pork Bao',
    short: 'Bao',
    category: 'Starters',
    price: 9,
    desc: 'Pillowy steamed buns folded around sticky glazed pork belly, crisp cucumber and toasted sesame. Two to a basket, best eaten warm.',
    spice: 1,
    nutrition: { Calories: [380, 'kcal'], Protein: [18, 'g'], Carbs: [42, 'g'], Fat: [15, 'g'] },
    card: 'assets/img/card-bao.webp',
    thumb: 'assets/img/thumb-bao.webp',
    views: [
      {
        src: 'assets/img/cut-bao.webp', w: 442, h: 272, kind: 'cut',
        hotspots: [
          { label: 'Steamed bun', x: 70, y: 18 },
          { label: 'Glazed pork', x: 44, y: 40 },
          { label: 'Cucumber', side: 'l', x: 26, y: 58 }
        ]
      },
      { src: 'assets/img/card-bao.webp', w: 442, h: 272, kind: 'photo', hotspots: [] }
    ]
  },
  {
    id: 'chicken-katsu',
    name: 'Chicken Katsu',
    short: 'Katsu',
    category: 'Mains',
    price: 18,
    desc: 'Golden panko-crusted chicken thigh, shaved cabbage and our house tonkatsu sauce. Shatter-crisp outside, juicy within.',
    spice: 0,
    nutrition: { Calories: [710, 'kcal'], Protein: [42, 'g'], Carbs: [58, 'g'], Fat: [32, 'g'] },
    card: 'assets/img/card-katsu.webp',
    thumb: 'assets/img/thumb-katsu.webp',
    views: [
      {
        src: 'assets/img/cut-katsu.webp', w: 442, h: 272, kind: 'cut',
        hotspots: [
          { label: 'Panko crust', x: 46, y: 44 },
          { label: 'Cabbage', x: 76, y: 24 },
          { label: 'Tonkatsu sauce', side: 'l', x: 26, y: 70 }
        ]
      },
      { src: 'assets/img/card-katsu.webp', w: 442, h: 272, kind: 'photo', hotspots: [] }
    ]
  },
  {
    id: 'matcha-mochi',
    name: 'Matcha Mochi',
    short: 'Mochi',
    category: 'Desserts',
    price: 7,
    desc: 'Soft, chewy rice cakes — one ceremonial matcha, one strawberry — with a sweet red-bean heart and a dusting of kinako.',
    spice: 0,
    nutrition: { Calories: [240, 'kcal'], Protein: [4, 'g'], Carbs: [48, 'g'], Fat: [3, 'g'] },
    card: 'assets/img/card-mochi.webp',
    thumb: 'assets/img/thumb-mochi.webp',
    views: [
      {
        src: 'assets/img/cut-mochi.webp', w: 442, h: 272, kind: 'cut',
        hotspots: [
          { label: 'Strawberry', side: 'l', x: 30, y: 26 },
          { label: 'Red bean', x: 50, y: 64 },
          { label: 'Kinako', side: 'l', x: 22, y: 82 }
        ]
      },
      { src: 'assets/img/card-mochi.webp', w: 442, h: 272, kind: 'photo', hotspots: [] }
    ]
  },
  {
    id: 'yuzu-spritz',
    name: 'Yuzu Spritz',
    short: 'Yuzu',
    category: 'Drinks',
    price: 8,
    desc: 'Bright yuzu, sparkling water and a sprig of rosemary over crushed ice. Zesty, floral and endlessly refreshing.',
    spice: 0,
    nutrition: { Calories: [120, 'kcal'], Protein: [0, 'g'], Carbs: [28, 'g'], Fat: [0, 'g'] },
    card: 'assets/img/card-yuzu.webp',
    views: [
      {
        src: 'assets/img/cut-yuzu.webp', w: 442, h: 272, kind: 'cut',
        hotspots: [
          { label: 'Rosemary', x: 62, y: 14 },
          { label: 'Yuzu slice', side: 'l', x: 49, y: 46 },
          { label: 'Sparkling', x: 56, y: 78 }
        ]
      },
      { src: 'assets/img/card-yuzu.webp', w: 442, h: 272, kind: 'photo', hotspots: [] }
    ]
  },
  {
    id: 'gyoza',
    name: 'Gyoza',
    short: 'Gyoza',
    category: 'Starters',
    price: 10,
    desc: 'Pan-fried pork and cabbage dumplings with a lace-crisp base and a little chilli-soy for dipping.',
    spice: 1,
    nutrition: { Calories: [340, 'kcal'], Protein: [16, 'g'], Carbs: [36, 'g'], Fat: [14, 'g'] },
    card: 'assets/img/card-gyoza.webp',
    views: [
      {
        src: 'assets/img/cut-gyoza.webp', w: 442, h: 272, kind: 'cut',
        hotspots: [
          { label: 'Chilli-soy', x: 70, y: 14 },
          { label: 'Crispy base', x: 52, y: 54 },
          { label: 'Scallion', side: 'l', x: 32, y: 30 }
        ]
      },
      { src: 'assets/img/card-gyoza.webp', w: 442, h: 272, kind: 'photo', hotspots: [] }
    ]
  }
];
