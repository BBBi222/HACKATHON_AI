# Elsewhere

Elsewhere is a configurable simulation universe prototype. Its entry chamber is a world library: choose a reality, change its material, environment, event chain, intensity, and time scale, then enter its preview.

## Run locally

```sh
npm install
npm run dev
```

Build a static production bundle with `npm run build`.

## Add a world

Add a `world(...)` entry to `src/data/worlds.js`. A world definition includes its identity, category, mood palette, environment, default material and event, tags, and object count. The library, filters, world counter, cards, and procedural preview read from that shared definition. Reuse a category to have the scenario appear under its existing library filter.

Add a material to `src/data/materials.js` with broad response properties. Shared simulation systems read those properties directly, so new materials do not need their own behavior code. Add event names to the shared catalog in `src/data/worlds.js`; common event families are handled by reusable thermal, moisture, damage, structural, and aging systems.

## Current prototype

- 25 curated world presets spanning urban, climate, structural, material, organic, laboratory, and experimental categories.
- Search and category filters over one shared scenario catalog.
- Procedural canvas panoramas with different visual treatments for cities, tensile webs, specimens, and material-scale scenes.
- Shared material definitions and state, climate response, event intensity, composable event chains, time-scaled updates, and consequence inspection.
- Configurable scenario loading, random world/material/climate/event combinations, and distance-based simulation LOD.
- Responsive gateway UI, world-scale inspection views, a soft ambient-noise toggle, and browser fullscreen previews.

The lightweight state model is designed for qualitative response and visible cause and effect, not engineering analysis. World previews are procedural canvas scenes. A stereo WebXR renderer, room-scale locomotion, hand tracking interactions, and validated physical simulation remain future extensions.
