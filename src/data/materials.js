const material = (name, family, density, stiffness, elasticity, brittleness, tensile, compression, heatCapacity, conductivity, ignition, moistureResponse, corrosion, porosity, fatigue) => ({
  name, family, density, stiffness, elasticity, brittleness, tensile, compression,
  heatCapacity, conductivity, ignition, moistureResponse, corrosion, porosity, fatigue,
  properties: { density, stiffness, elasticity, brittleness, tensile, compression, heatCapacity, conductivity, ignition, moistureResponse, corrosion, porosity, fatigue },
});

// Properties use a broad 0–100 response range, except density, which is relative.
export const materials = [
  material('Mixed / realistic', 'Composite', 58, 72, 42, 48, 64, 72, 55, 48, 22, 48, 34, 28, 42),
  material('Structural steel', 'Metal', 84, 88, 66, 18, 88, 90, 52, 88, 2, 12, 69, 3, 47),
  material('Reinforced concrete', 'Mineral', 92, 78, 24, 72, 38, 94, 87, 29, 0, 27, 43, 27, 51),
  material('Laminated glass', 'Mineral', 62, 81, 13, 93, 44, 45, 26, 55, 0, 4, 0, 0, 30),
  material('Cross-laminated wood', 'Organic', 38, 57, 50, 39, 54, 51, 42, 16, 78, 79, 0, 39, 39),
  material('Spider silk', 'Organic', 8, 46, 96, 5, 91, 8, 18, 8, 35, 44, 0, 3, 32),
  material('Mycelium + fiber', 'Organic', 23, 39, 57, 22, 41, 49, 59, 12, 54, 92, 0, 76, 25),
  material('Bone lattice', 'Bio-inspired', 41, 67, 28, 54, 59, 78, 34, 20, 0, 21, 0, 42, 37),
  material('Cellular composite', 'Synthetic', 28, 52, 66, 31, 63, 59, 32, 19, 48, 15, 9, 55, 35),
  material('Programmable matter', 'Experimental', 46, 61, 75, 14, 72, 68, 48, 36, 12, 34, 5, 18, 20),
];
