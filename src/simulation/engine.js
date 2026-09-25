import { materials } from '../data/materials.js';

const clamp = (x, min = 0, max = 100) => Math.min(max, Math.max(min, x));
const materialProfiles = Object.fromEntries(materials.map(material => [material.name, material.properties]));

export const systemCatalog = [
  'ThermalSystem', 'MoistureSystem', 'DamageSystem', 'StructuralSystem',
  'FireSystem', 'CorrosionSystem', 'AgingSystem', 'OrganicMaterialSystem',
  'SpiderWebSystem', 'EnvironmentalEventSystem', 'TimeSystem', 'InspectionSystem',
];

export function loadScenario(world, overrides = {}) {
  const events = String(overrides.event ?? world.event).split('→').map(x => x.trim()).filter(Boolean);
  const environment = overrides.environment ?? world.environment;
  const temperatureMatch = environment.match(/[−-]?\d+/);
  const temperatureC = temperatureMatch ? Number(temperatureMatch[0].replace('−', '-')) : 20;
  const atmosphere = environment.split('·')[0].trim();
  return {
    id: world.id,
    name: world.name,
    definition: world,
    layers: {
      world, material: overrides.material ?? world.material,
      environment,
      atmosphere,
      temperatureC,
      humidity: /saturat|humid|salt|coastal/i.test(atmosphere) ? 'high' : /dry|arid/i.test(atmosphere) ? 'low' : 'moderate',
      terrain: /coast|tide|hurricane|tideline/i.test(world.name) ? 'coastal' : /tunnel|understory|underground/i.test(world.name) ? 'subterranean' : /forest|ember/i.test(world.name) ? 'woodland' : 'configurable',
      architectureStyle: world.category === 'Organic' ? 'organic tensile' : world.category === 'Structure' ? 'infrastructure' : world.category.toLowerCase(),
      lighting: world.palette[1],
      gravityModifier: Number(overrides.gravity ?? 1),
      events, timeScale: overrides.timeScale ?? '1×',
      rules: { intensity: Number(overrides.intensity ?? 58), gravity: Number(overrides.gravity ?? 1) },
    },
    researchTargets: world.tags.slice(0, 3),
    visualMood: world.palette,
    representedObjects: Math.min(world.objects, 96),
    objectPopulation: world.objects,
  };
}

function initialState(index, profile, environment) {
  const temperatureMatch = environment.match(/[−-]?\d+/);
  const baseTemperature = temperatureMatch ? Number(temperatureMatch[0].replace('−', '-')) : 20;
  const climate = environment.toLowerCase();
  const baseMoisture = /saturat|humid|rain|coastal/.test(climate) ? 58 : /salt/.test(climate) ? 46 : /dry|arid/.test(climate) ? 11 : 26;
  return {
    temperature: baseTemperature + ((index * 17) % 9) - 4,
    moisture: baseMoisture + ((index * 13) % 17),
    damage: ((index * 7) % 6) / 10,
    cracks: 0,
    deformation: 0,
    corrosion: 0,
    oxidation: 0,
    burning: 0,
    porosity: profile.porosity,
    fatigue: 3 + ((index * 11) % 12),
    internalStress: 8 + ((index * 19) % 15),
    tension: profile.tensile * .2,
    failed: false,
  };
}

function applySharedSystems(object, profile, event, intensity, environment) {
  const s = object.state;
  const e = event.toLowerCase();
  const amp = intensity / 100;
  const wet = /humid|saturat|rain|salt|coastal|flood/.test(environment.toLowerCase());
  const cold = /frozen|freeze|−|below zero/.test(environment.toLowerCase());

  // Thermal and moisture exchange affect the same state regardless of material family.
  if (/heat|fire|thermal|wildfire/.test(e)) s.temperature += (e.includes('fire') || e.includes('wildfire') ? 48 : 26) * amp * (1 - profile.heatCapacity / 180);
  if (/freeze|thaw|cold/.test(e) || cold) s.temperature -= (e.includes('freeze') ? 32 : 11) * amp;
  if (/flood|water|rain|hurricane|coastal/.test(e)) s.moisture += (e.includes('flood') ? 37 : 22) * amp * (profile.moistureResponse / 70);
  else if (wet) s.moisture += 4 * amp * (profile.moistureResponse / 70);
  if (/dry|heat|fire|aging/.test(e)) s.moisture -= 5 * amp;
  s.moisture = clamp(s.moisture);

  const loadEvent = /earthquake|impact|overload|pressure|vibration|wind|hurricane|field pulse|gravity/.test(e);
  const load = loadEvent ? 18 + amp * 49 : 3 + amp * 10;
  s.internalStress = clamp(s.internalStress + load * (1 - profile.elasticity / 170));
  s.fatigue = clamp(s.fatigue + (loadEvent ? 4.8 : 1.4) * amp * (1 + (100 - profile.fatigue) / 100));

  if (/corrosion|oxidation|salt|aging/.test(e) || (s.moisture > 58 && profile.corrosion > 25)) {
    s.corrosion = clamp(s.corrosion + (1.5 + amp * 8) * (profile.corrosion / 65) * (s.moisture > 45 ? 1.8 : .55));
    s.oxidation = clamp(s.oxidation + (1 + amp * 7) * (profile.corrosion / 70));
  }
  if (/fire|wildfire/.test(e) && profile.ignition > 15 && s.temperature > 38) s.burning = clamp(s.burning + amp * (profile.ignition / 55) * 12);
  if (/freeze|thaw|thermal shock/.test(e) && s.moisture > 20) s.cracks = clamp(s.cracks + amp * (profile.brittleness / 25) * (s.moisture / 65) * 11);

  const baseCapacity = /pressure|compression|compress/.test(e) ? profile.compression : profile.tensile;
  const strengthAfterWear = Math.max(8, baseCapacity * (1 - s.damage / 135) * (1 - s.corrosion / 180));
  const overstress = Math.max(0, s.internalStress + load * .45 - strengthAfterWear);
  s.damage = clamp(s.damage + overstress * .13 + s.fatigue * .009 + s.burning * .025);
  s.cracks = clamp(s.cracks + Math.max(0, s.damage - profile.brittleness * .36) * .08);
  s.deformation = clamp(s.deformation + load * amp * (1 - profile.elasticity / 125) * .035 + overstress * .09);
  s.porosity = clamp(s.porosity + s.moisture * .004 + s.burning * .012);
  s.failed = s.damage > 68 || s.cracks > 76 || s.internalStress > 97;
}

function redistributeWebForces(objects) {
  const strands = objects.filter(o => o.isStrand && !o.state.failed);
  if (!strands.length) return;
  const broken = objects.filter(o => o.isStrand && o.state.failed).length;
  const redistribution = broken ? broken / Math.max(1, strands.length) * 19 : 0;
  for (const strand of strands) {
    strand.state.tension = clamp(strand.state.tension + strand.state.internalStress * .24 + redistribution);
    if (strand.state.tension > 96) {
      strand.state.failed = true;
      strand.state.damage = clamp(strand.state.damage + 7);
    }
  }
}

export function runScenario(scenario) {
  const profile = materialProfiles[scenario.layers.material] ?? materialProfiles['Mixed / realistic'];
  const isWeb = scenario.layers.material === 'Spider silk' || scenario.definition.id === 'silk';
  const objects = Array.from({ length: scenario.representedObjects }, (_, index) => ({
    id: `object-${String(index + 1).padStart(3, '0')}`,
    kind: isWeb ? (index % 7 === 0 ? 'junction' : 'strand') : (index % 5 === 0 ? 'connection' : 'structure'),
    isStrand: isWeb,
    lod: index % 9 === 0 ? 'near' : index % 3 === 0 ? 'active' : 'far',
    state: initialState(index, profile, scenario.layers.environment),
  }));
  const timeMultiplier = Number.parseFloat(scenario.layers.timeScale) || 1;
  const timeIterations = timeMultiplier >= 100 ? 6 : timeMultiplier >= 10 ? 3 : 1;
  for (const event of scenario.layers.events) {
    for (let tick = 0; tick < timeIterations; tick++) {
      for (const object of objects) {
        if (object.lod === 'far') {
          // Far objects use fewer shared-system updates, keeping large worlds inexpensive.
          if (Number(object.id.slice(-1)) % 2) continue;
        }
        applySharedSystems(object, profile, event, scenario.layers.rules.intensity, scenario.layers.environment);
      }
      if (isWeb) redistributeWebForces(objects);
    }
  }
  return inspectScenario(scenario, objects);
}

export function inspectScenario(scenario, objects) {
  const failed = objects.filter(o => o.state.failed).length;
  const mean = key => objects.reduce((sum, o) => sum + o.state[key], 0) / Math.max(1, objects.length);
  const hot = objects.filter(o => o.state.temperature > 45).length;
  const wet = objects.filter(o => o.state.moisture > 55).length;
  const events = scenario.layers.events;
  const insights = [];
  if (hot) insights.push(`${hot} nearby elements retained heat. Higher heat capacity slowed the temperature rise, while heat moved quickly through conductive materials.`);
  if (wet) insights.push(`Water reached ${wet} elements. Moisture-sensitive materials absorbed more, opening routes for later freeze damage and corrosion.`);
  if (mean('internalStress') > 35) insights.push(`Load concentrated around connections. Fatigue and earlier damage reduced their remaining strength, so later events inherited weaker structures.`);
  if (mean('cracks') > 2) insights.push(`Cracks grew where stress met brittle, moisture-exposed regions. Existing cracks lowered the threshold for another local failure.`);
  if (isSpiderScenario(scenario)) insights.push(`Broken strands shifted tension into neighboring threads. Elastic strands stretched first, then the remaining paths carried more of the web.`);
  if (mean('corrosion') > 1) insights.push(`Oxidation advanced on wet, corrosion-prone surfaces. The slow loss of strength compounds with fatigue over repeated events.`);
  if (!insights.length) insights.push(`${events.join(' → ')} moved through the material network. Change the material, climate, or event order to reveal a different response.`);
  const systemsActive = systemCatalog.filter(name => {
    if (name === 'SpiderWebSystem') return isSpiderScenario(scenario);
    if (name === 'FireSystem') return events.some(e => /fire|heat/i.test(e));
    if (name === 'CorrosionSystem') return events.some(e => /corrosion|oxidation|water|flood/i.test(e));
    return true;
  });
  return {
    name: scenario.name,
    events,
    objectPopulation: scenario.objectPopulation,
    simulatedObjects: objects.length,
    lod: { near: objects.filter(o => o.lod === 'near').length, active: objects.filter(o => o.lod === 'active').length, far: objects.filter(o => o.lod === 'far').length },
    metrics: { damage: mean('damage'), stress: mean('internalStress'), temperature: mean('temperature'), moisture: mean('moisture'), corrosion: mean('corrosion'), cracks: mean('cracks'), burning: mean('burning'), failed },
    insights,
    systemsActive,
    objects,
  };
}

function isSpiderScenario(scenario) {
  return scenario.layers.material === 'Spider silk' || scenario.definition.id === 'silk';
}

export function generateScenario(worlds, random = Math.random) {
  const pick = list => list[Math.floor(random() * list.length)];
  const world = pick(worlds);
  const material = pick(Object.keys(materialProfiles));
  const event = pick(['Earthquake', 'Coastal flood', 'Wildfire', 'Freeze / thaw', 'Cyclonic wind', 'Thermal shock', 'Water exposure']);
  const followup = pick(['Oxidation', 'Aging', 'Water exposure', 'Vibration', 'Thermal shock']);
  const environment = pick(['Dry · 22°C', 'Humid · 29°C', 'Saturated · 24°C', 'Frozen · −18°C', 'Salt air · 27°C']);
  return { world, scenario: loadScenario(world, { material, environment, event: `${event} → ${followup}`, intensity: Math.round(35 + random() * 60) }) };
}
