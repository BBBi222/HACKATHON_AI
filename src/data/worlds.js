const world = (id, name, category, subtitle, description, palette, icon, tags, environment, material, event, objects) => ({
  id, name, category, subtitle, description, palette, icon, tags,
  environment, material, event, objects,
  stats: { structures: objects, systems: 6, scale: id.includes('web') ? 'Tensile' : 'Urban' }
});

export const worlds = [
  world('aftershock', 'Aftershock', 'Urban', 'A city still finding its balance', 'Between the first tremor and the next, every fracture has a memory.', ['#f38c67','#e7bd85','#71808a'], '⌁', ['URBAN','SEISMIC','UNSTABLE'], 'Dry · 22°C', 'Concrete + steel', 'Earthquake', 248),
  world('tideline', 'The Tideline', 'Climate', 'Where the streets meet the sea', 'Saltwater redraws the map one quiet block at a time.', ['#5fc4c4','#a5d3c5','#647f87'], '≈', ['COASTAL','FLOOD','RISING'], 'Humid · 29°C', 'Concrete + glass', 'Coastal flood', 186),
  world('embers', 'Emberline', 'Climate', 'A settlement at the treeline', 'Wind carries heat through a forest poised between seasons.', ['#f08453','#edbc75','#786b46'], '✳', ['FOREST','FIRE','WIND'], 'Dry · 36°C', 'Timber + earth', 'Wildfire', 132),
  world('whiteout', 'Whiteout', 'Climate', 'Infrastructure in deep winter', 'Cold travels through the smallest connections first.', ['#a9cddd','#f0eddf','#8899aa'], '❋', ['FROZEN','FREEZE / THAW','REMOTE'], 'Frozen · −18°C', 'Steel + brick', 'Freeze / thaw', 204),
  world('monsoon', 'Monsoon Memory', 'Climate', 'One city, three days of rain', 'Water finds every seam that the last storm left behind.', ['#739f91','#a9c9ad','#65797a'], '⌇', ['MONSOON','WATER','AGING'], 'Saturated · 24°C', 'Brick + timber', 'Prolonged rain', 213),
  world('hurricane', 'Eye of the Coast', 'Climate', 'Inside the eye of the storm', 'Air pressure, wind, and water pull a shoreline in different directions.', ['#7198bc','#c4b08d','#5f7680'], '◉', ['HURRICANE','WIND','COASTAL'], 'Humid · 31°C', 'Concrete + timber', 'Cyclonic wind', 298),
  world('heatwave', 'Heat Island', 'Climate', 'A city that cannot cool down', 'The night offers no relief when the buildings remember the sun.', ['#f5ae72','#d8795c','#81705f'], '☼', ['URBAN','EXTREME HEAT','DRY'], 'Arid · 43°C', 'Asphalt + glass', 'Heat wave', 176),
  world('corrosion', 'Salt & Time', 'Material', 'The long conversation with rust', 'A harbor of small changes, made visible across accelerated time.', ['#d18566','#c5b188','#647973'], '⟳', ['INDUSTRIAL','CORROSION','SLOW TIME'], 'Salt air · 27°C', 'Weathering steel', 'Oxidation', 97),
  world('tunnel', 'Understory', 'Structure', 'A tunnel beneath the old city', 'Pressure moves through stone, water, and the spaces between.', ['#ad886f','#d4bb91','#5b6a69'], '⌑', ['SUBTERRANEAN','PRESSURE','STONE'], 'Damp · 16°C', 'Stone + concrete', 'Ground pressure', 84),
  world('span', 'The Last Span', 'Structure', 'A bridge learning to carry less', 'Watch a small failure move through a very large system.', ['#d29867','#d7c5a1','#75848a'], '⌯', ['BRIDGE','FATIGUE','LOAD'], 'Windy · 19°C', 'Steel + concrete', 'Structural overload', 56),
  world('vertical', 'Vertical Garden', 'Urban', 'A high-rise with its own weather', 'At every height, the city makes a different climate.', ['#83ba9f','#c3d0a4','#638087'], '▥', ['HIGH-RISE','WIND','LIVING'], 'Variable · 23°C', 'Steel + living skin', 'Gust front', 312),
  world('glass', 'Quiet Glass', 'Material', 'A district built to catch light', 'Stress lines appear before the first bright fracture.', ['#83c6d4','#d7edf0','#879eaa'], '◇', ['GLASS','BRITTLE','LIGHT'], 'Clear · 18°C', 'Laminated glass', 'Impact', 163),
  world('wood', 'The Grown City', 'Material', 'Architecture with a grain', 'Moisture, warmth, and time have different ideas about a wall.', ['#c89267','#d8c098','#74886d'], '♧', ['WOOD','ORGANIC','MOISTURE'], 'Humid · 25°C', 'Cross-laminated wood', 'Water exposure', 148),
  world('silk', 'Silken Geometry', 'Organic', 'A world held together by threads', 'Every strand carries a quiet map of the forces around it.', ['#d9a6bb','#c9c6bb','#7d8c8f'], '✳', ['SPIDER SILK','TENSION','MESMERIC'], 'Misty · 21°C', 'Spider silk', 'Crosswind', 480),
  world('mycelium', 'Below / Between', 'Organic', 'An architecture that grows together', 'The network remembers where moisture moves and where heat lingers.', ['#d5bd7b','#96b790','#626e63'], '⌘', ['MYCELIUM','GROWTH','NETWORK'], 'Moist · 26°C', 'Mycelium + fiber', 'Heat → rain', 228),
  world('bone', 'Ossuary / 09', 'Organic', 'Lightness, built from branches', 'A branching lattice distributes one local force through many paths.', ['#e3d2aa','#b9baaa','#737c77'], '⑂', ['BONE LATTICE','CELLULAR','LOAD'], 'Still · 20°C', 'Mineralized lattice', 'Compression', 340),
  world('chitin', 'Molt', 'Organic', 'A city in overlapping shells', 'Flexible seams protect rigid plates until they cannot.', ['#b0ad7d','#d9c18c','#747d66'], '▤', ['CHITIN','BIO-INSPIRED','FLEX'], 'Warm · 27°C', 'Chitin composite', 'Impact', 191),
  world('laboratory', 'Material / Matter', 'Laboratory', 'A specimen becomes a landscape', 'Change the conditions. Follow the heat through the body of a material.', ['#8bb1bf','#ddd3b7','#737d84'], '⊙', ['LABORATORY','SPECIMEN','INSPECT'], 'Controlled · 22°C', 'Adaptive composite', 'Thermal shock', 24),
  world('micro', 'A Grain of Sand', 'Laboratory', 'Enter the structure beneath the surface', 'Pores become rooms. A hairline crack becomes a horizon.', ['#c59c79','#d1c2aa','#6f8390'], '⊹', ['MICROSCALE','PORES','ZOOM'], 'Vacuum · 20°C', 'Porous ceramic', 'Vibration', 74),
  world('giant', 'Colossus', 'Laboratory', 'Make the familiar impossibly large', 'Scale turns a tiny material imperfection into a mountain pass.', ['#a6a77f','#d5b388','#777b70'], '↗', ['GIANT SCALE','MATERIAL','WONDER'], 'Still · 20°C', 'Cellular foam', 'Compression', 61),
  world('alien', 'Xenogarden', 'Experimental', 'A material with no earthly name', 'Give the unknown a set of rules, then see what those rules allow.', ['#a88fd1','#92c7bd','#696982'], '✧', ['ALIEN','EXPERIMENTAL','UNKNOWN'], 'Reactive · 14°C', 'Programmable matter', 'Field pulse', 118),
  world('gravity', 'Loose Physics', 'Experimental', 'Gravity is a suggestion here', 'A playground for forces, forms, and unexpectedly good questions.', ['#8fb6dd','#d3c095','#758096'], '⤢', ['ABSTRACT','GRAVITY','PLAY'], 'Variable · 20°C', 'Mixed / open', 'Gravity shift', 96),
  world('tomorrow', 'After the Thaw', 'Climate', 'A city in a warmer century', 'New coastlines and old foundations share the same horizon.', ['#d7aa78','#92b9ad','#667e83'], '⌁', ['FUTURE','CLIMATE','COASTAL'], 'Humid · 34°C', 'Reclaimed composite', 'Compound event', 274),
  world('convergence', 'Convergence', 'Experimental', 'Three events, one shared world', 'A running experiment in what happens when conditions overlap.', ['#c78e78','#8b9fa0','#768572'], '⟲', ['MULTI-EVENT','CHAINED','EMERGENT'], 'Shifting · 25°C', 'Mixed / adaptive', 'Earthquake → flood', 256),
  world('impossible', 'The Unbuilt', 'Experimental', 'An architecture from a half-remembered dream', 'Let the familiar rules run a little further than they usually do.', ['#b49bcc','#dbbd88','#778a96'], '✳', ['DREAM','IMPOSSIBLE','OPEN'], 'Soft light · 20°C', 'Unknown / living', 'Resonance', 140),
];

export const materials = [
  { name: 'Mixed / realistic', family: 'Composite', stiffness: 72, heat: 48 },
  { name: 'Structural steel', family: 'Metal', stiffness: 88, heat: 84 },
  { name: 'Reinforced concrete', family: 'Mineral', stiffness: 78, heat: 63 },
  { name: 'Laminated glass', family: 'Mineral', stiffness: 81, heat: 42 },
  { name: 'Cross-laminated wood', family: 'Organic', stiffness: 57, heat: 35 },
  { name: 'Spider silk', family: 'Organic', stiffness: 46, heat: 27 },
  { name: 'Mycelium + fiber', family: 'Organic', stiffness: 39, heat: 31 },
  { name: 'Bone lattice', family: 'Bio-inspired', stiffness: 67, heat: 39 },
  { name: 'Cellular composite', family: 'Synthetic', stiffness: 52, heat: 33 },
  { name: 'Programmable matter', family: 'Experimental', stiffness: 61, heat: 51 },
];

export const events = [
  'Earthquake', 'Coastal flood', 'Wildfire', 'Heat wave', 'Freeze / thaw', 'Cyclonic wind',
  'Impact', 'Structural overload', 'Oxidation', 'Water exposure', 'Thermal shock', 'Aging', 'Vibration',
];

export const filters = ['All worlds', 'Urban', 'Climate', 'Structure', 'Material', 'Organic', 'Laboratory', 'Experimental'];
