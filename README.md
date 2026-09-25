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

Material families and event choices are shared catalogs in the same data module. Add a material with broad properties, or add an event name to the shared event catalog; either becomes available to the world builder without creating scenario-specific code.

## Current prototype

- 25 curated world presets spanning urban, climate, structural, material, organic, laboratory, and experimental categories.
- Search and category filters over one shared scenario catalog.
- Procedural canvas panoramas with different visual treatments for cities, tensile webs, specimens, and material-scale scenes.
- Shared material selection, environment presets, event intensity, composable event chains, and time controls.
- Responsive gateway UI, world-scale inspection views, a soft ambient-noise toggle, and browser fullscreen previews.

World previews and material response are visual prototypes. The app provides a broad scenario framework and interaction surface; a stereo WebXR renderer, room-scale locomotion, hand tracking interactions, and validated physical simulation remain future extensions.
