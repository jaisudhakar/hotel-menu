# Hotem — animated restaurant menu

A static, dependency-free website built from the Hotem design mockups: a hero with a floating ramen bowl,
an animated menu grid and a dish detail page you can drag to rotate.

## Run it

Open `index.html` through any static server, for example:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

## What moves

- **Intro**: a stamp-and-wordmark loader that wipes away, then the headline rises word by word.
- **Hero**: the bowl floats, follows the cursor, and can be dragged to tilt in 3D with inertia and a moving
  highlight. Ingredients drift around it with mouse parallax. Scrolling eases the bowl away.
- **Menu**: cards stagger in on scroll. The filter pill slides between categories and cards re-flow with FLIP
  animations. Hearts burst when you save a dish.
- **Dish page**: the card image morphs into the detail view (View Transitions API), ingredient labels pop in,
  chillies and nutrition numbers count up, thumbnails swap angles, and "Add to order" flies the dish into the cart.
- **Story / reservations**: a scroll-lit headline, counting stats, a booking form with validation, a cart
  drawer and a `/` search.

Motion is reduced automatically for visitors who ask for it (`prefers-reduced-motion`).

## Files

- `index.html` — markup for every view
- `assets/css/style.css` — design tokens, layout and animation
- `assets/js/data.js` — dishes, prices, nutrition and ingredient hotspots
- `assets/js/app.js` — loader, router, drag-to-rotate, filters, cart, search and reveals
- `assets/img/` — dish photos and transparent cutouts taken from the mockups

To add a dish, add an entry to `data.js` with its images.
