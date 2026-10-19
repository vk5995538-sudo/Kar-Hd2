import { Building, RoadSegment, StuntRamp, SpeedCamera, CollectibleItem, TreeObject } from './types';

export const WORLD_SIZE = 4400;

export interface ServiceStation {
  id: number;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CityData {
  roads: RoadSegment[];
  buildings: Building[];
  trees: TreeObject[];
  ramps: StuntRamp[];
  speedCameras: SpeedCamera[];
  collectibles: CollectibleItem[];
  stations: ServiceStation[];
  districts: { name: string; x: number; y: number; color: string }[];
}

export function generateCity(): CityData {
  const roads: RoadSegment[] = [];
  const buildings: Building[] = [];
  const trees: TreeObject[] = [];
  const ramps: StuntRamp[] = [];
  const speedCameras: SpeedCamera[] = [];
  const collectibles: CollectibleItem[] = [];
  const stations: ServiceStation[] = [];

  let nextId = 1;

  // 1. Grid of Primary & Secondary Roads
  // Vertical Boulevards
  const vertRoadCoords = [
    { x: 400, lanes: 2, name: 'West Industrial Way' },
    { x: 1100, lanes: 4, name: 'Parkside Boulevard' },
    { x: 1800, lanes: 4, name: 'Downtown Central Ave' },
    { x: 2600, lanes: 4, name: 'Skyline Highway' },
    { x: 3300, lanes: 4, name: 'Ocean Coastal Drive' },
    { x: 4000, lanes: 2, name: 'Harbor Perimeter Rd' },
  ];

  // Horizontal Avenues
  const horizRoadCoords = [
    { y: 400, lanes: 2, name: 'North Ring Expressway' },
    { y: 1100, lanes: 4, name: 'Highland Avenue' },
    { y: 1800, lanes: 4, name: 'Grand Central Plaza' },
    { y: 2600, lanes: 4, name: 'Sunset Boulevard' },
    { y: 3400, lanes: 4, name: 'Marina Waterfront Way' },
    { y: 4000, lanes: 2, name: 'South Harbor Expressway' },
  ];

  // Connecting cross streets to make organic urban blocks
  const innerStreets = [
    // Sub-blocks in Downtown & Suburbs
    { x: 1450, y: 1100, w: 100, h: 1500, isV: true, lanes: 2, name: 'Commerce Lane' },
    { x: 2200, y: 1100, w: 100, h: 1500, isV: true, lanes: 2, name: 'Financial St' },
    { x: 1800, y: 1450, w: 1500, h: 100, isV: false, lanes: 2, name: 'Neon Street' },
    { x: 1100, y: 2200, w: 1500, h: 100, isV: false, lanes: 2, name: 'Theatre Alley' },
    { x: 2950, y: 1800, w: 100, h: 1600, isV: true, lanes: 2, name: 'Palm Crest Blvd' },
  ];

  // Build Road Segments
  vertRoadCoords.forEach((vr) => {
    const width = vr.lanes * 46;
    roads.push({
      id: nextId++,
      x: vr.x - width / 2,
      y: 0,
      width: width,
      height: WORLD_SIZE,
      isVertical: true,
      lanes: vr.lanes,
      name: vr.name,
    });
  });

  horizRoadCoords.forEach((hr) => {
    const height = hr.lanes * 46;
    roads.push({
      id: nextId++,
      x: 0,
      y: hr.y - height / 2,
      width: WORLD_SIZE,
      height: height,
      isVertical: false,
      lanes: hr.lanes,
      name: hr.name,
    });
  });

  innerStreets.forEach((is) => {
    roads.push({
      id: nextId++,
      x: is.x,
      y: is.y,
      width: is.w,
      height: is.h,
      isVertical: is.isV,
      lanes: is.lanes,
      name: is.name,
    });
  });

  // 2. City Districts
  const districts = [
    { name: 'Skyline Downtown', x: 2000, y: 1600, color: '#38BDF8' },
    { name: 'Emerald Central Park', x: 1450, y: 750, color: '#10B981' },
    { name: 'Ocean Marina & Beach', x: 3600, y: 3600, color: '#06B6D4' },
    { name: 'West Industrial Docks', x: 750, y: 3600, color: '#F59E0B' },
    { name: 'Sunset Residential Hills', x: 800, y: 1450, color: '#A855F7' },
    { name: 'Highland Financial Core', x: 2900, y: 1450, color: '#EC4899' },
  ];

  // 3. Buildings Placement (City Blocks)
  // Downtown Skyscraper cluster
  const skyscraperPalettes = [
    { roof: '#1E293B', wall: '#0F172A', trim: '#38BDF8', neon: '#00F0FF' },
    { roof: '#334155', wall: '#1E293B', trim: '#818CF8', neon: '#A855F7' },
    { roof: '#111827', wall: '#1F2937', trim: '#F43F5E', neon: '#FF0055' },
    { roof: '#0F172A', wall: '#090D16', trim: '#34D399', neon: '#10B981' },
  ];

  // Downtown block (Between x: 1850-2550, y: 1850-2550)
  for (let bx = 1920; bx < 2500; bx += 180) {
    for (let by = 1920; by < 2500; by += 180) {
      const pal = skyscraperPalettes[(bx + by) % skyscraperPalettes.length];
      buildings.push({
        id: nextId++,
        x: bx,
        y: by,
        width: 130,
        height: 130,
        roofColor: pal.roof,
        wallColor: pal.wall,
        trimColor: pal.trim,
        neonColor: pal.neon,
        floors: 12 + Math.floor(Math.random() * 18),
        name: `Tower ${nextId}`,
        category: 'skyscraper',
      });
    }
  }

  // Financial District (Between x: 2650-3250, y: 1150-1750)
  for (let bx = 2700; bx < 3200; bx += 200) {
    for (let by = 1200; by < 1700; by += 160) {
      const pal = skyscraperPalettes[nextId % skyscraperPalettes.length];
      buildings.push({
        id: nextId++,
        x: bx,
        y: by,
        width: 140,
        height: 110,
        roofColor: pal.roof,
        wallColor: pal.wall,
        trimColor: pal.trim,
        floors: 8 + Math.floor(Math.random() * 10),
        name: `Plaza ${nextId}`,
        category: 'commercial',
      });
    }
  }

  // Residential Sunset Hills (x: 500-1000, y: 1200-1700)
  const resiColors = ['#F8FAFC', '#F1F5F9', '#FEF3C7', '#E0E7FF', '#FEE2E2'];
  const resiRoofs = ['#DC2626', '#475569', '#B45309', '#047857', '#4338CA'];
  for (let bx = 520; bx < 1000; bx += 140) {
    for (let by = 1200; by < 1700; by += 130) {
      buildings.push({
        id: nextId++,
        x: bx,
        y: by,
        width: 90,
        height: 80,
        roofColor: resiRoofs[(bx + by) % resiRoofs.length],
        wallColor: resiColors[(bx * by) % resiColors.length],
        trimColor: '#94A3B8',
        floors: 2,
        category: 'residential',
      });
    }
  }

  // Industrial Warehouses & Docks (x: 500-1000, y: 2700-3300)
  const indusColors = ['#334155', '#475569', '#64748B'];
  for (let bx = 500; bx < 1000; bx += 220) {
    for (let by = 2720; by < 3300; by += 180) {
      buildings.push({
        id: nextId++,
        x: bx,
        y: by,
        width: 160,
        height: 120,
        roofColor: '#1E293B',
        wallColor: indusColors[nextId % indusColors.length],
        trimColor: '#EAB308',
        floors: 1,
        name: `Logistics Bay ${nextId}`,
        category: 'industrial',
      });
    }
  }

  // Waterfront / Marina Shops & Hotels (x: 2700-3200, y: 2700-3300)
  for (let bx = 2720; bx < 3200; bx += 180) {
    for (let by = 2750; by < 3300; by += 150) {
      buildings.push({
        id: nextId++,
        x: bx,
        y: by,
        width: 125,
        height: 95,
        roofColor: '#0F172A',
        wallColor: '#F8FAFC',
        trimColor: '#06B6D4',
        floors: 4,
        category: 'commercial',
        name: `Marina Suites ${nextId}`,
      });
    }
  }

  // 4. Service / Repair Stations & Gas Bays
  stations.push(
    { id: 1, name: 'Downtown Nitro & Repair Hub', x: 2150, y: 1720, width: 80, height: 70 },
    { id: 2, name: 'Sunset Service Garage', x: 1020, y: 1720, width: 80, height: 70 },
    { id: 3, name: 'Ocean Coastal Pit Stop', x: 3220, y: 2520, width: 80, height: 70 },
    { id: 4, name: 'North Expressway Fuel', x: 1720, y: 480, width: 80, height: 70 },
  );

  stations.forEach((st) => {
    buildings.push({
      id: nextId++,
      x: st.x,
      y: st.y,
      width: st.width,
      height: st.height,
      roofColor: '#10B981',
      wallColor: '#064E3B',
      trimColor: '#34D399',
      floors: 1,
      name: st.name,
      category: 'station',
      neonColor: '#10B981',
    });
  });

  // 5. Trees (Central Park, Boulevards, Residential Lawns)
  // Central Park green zone (x: 1200-1700, y: 500-1000)
  for (let i = 0; i < 90; i++) {
    const tx = 1200 + Math.random() * 500;
    const ty = 500 + Math.random() * 500;
    trees.push({
      x: tx,
      y: ty,
      radius: 12 + Math.random() * 10,
      color: ['#15803D', '#16A34A', '#22C55E', '#14532D'][Math.floor(Math.random() * 4)],
      type: 'oak',
    });
  }

  // Coastal Palm Trees along Marina Drive (x: 3350-3450)
  for (let y = 500; y < 3900; y += 75) {
    trees.push({
      x: 3370 + (Math.random() * 30 - 15),
      y: y,
      radius: 14,
      color: '#059669',
      type: 'palm',
    });
  }

  // Boulevard side trees
  for (let y = 600; y < 3800; y += 140) {
    trees.push({ x: 1040, y: y, radius: 10, color: '#16A34A', type: 'oak' });
    trees.push({ x: 1870, y: y, radius: 10, color: '#15803D', type: 'pine' });
  }

  // 6. Stunt Ramps
  ramps.push(
    // Grand Central Alley Mega Ramp
    { id: 1, x: 1750, y: 1730, angle: Math.PI / 2, width: 44, length: 50, boostMultiplier: 1.6 },
    // Park Lake Jump Ramp
    { id: 2, x: 1450, y: 720, angle: 0, width: 40, length: 48, boostMultiplier: 1.5 },
    // Skyline Highway Rooftop Launch
    { id: 3, x: 2600, y: 2150, angle: -Math.PI / 2, width: 42, length: 50, boostMultiplier: 1.8 },
    // Coastal Beach Pier Ramp
    { id: 4, x: 3300, y: 3100, angle: Math.PI / 4, width: 40, length: 48, boostMultiplier: 1.6 },
    // Industrial Harbor Container Leap
    { id: 5, x: 700, y: 3100, angle: -Math.PI / 4, width: 44, length: 52, boostMultiplier: 1.7 },
    // North Ring Super Speed Ramp
    { id: 6, x: 2200, y: 400, angle: 0, width: 42, length: 50, boostMultiplier: 1.5 },
  );

  // 7. Speed Traps / Radars
  speedCameras.push(
    { id: 1, x: 2600, y: 1400, speedLimit: 120, bonusReward: 120, lastTriggered: 0 },
    { id: 2, x: 1800, y: 2200, speedLimit: 110, bonusReward: 100, lastTriggered: 0 },
    { id: 3, x: 3300, y: 2000, speedLimit: 130, bonusReward: 150, lastTriggered: 0 },
    { id: 4, x: 1100, y: 3000, speedLimit: 115, bonusReward: 110, lastTriggered: 0 },
    { id: 5, x: 2200, y: 400, speedLimit: 140, bonusReward: 200, lastTriggered: 0 },
  );

  // 8. Collectibles (Coins, Nitro Canisters, Repair Kits)
  // Coins along roads
  for (let x = 450; x < 3950; x += 90) {
    collectibles.push({
      id: nextId++,
      x: x,
      y: 1800,
      type: 'coin',
      value: 15,
      collected: false,
    });
    collectibles.push({
      id: nextId++,
      x: x,
      y: 2600,
      type: 'coin',
      value: 15,
      collected: false,
    });
  }

  for (let y = 450; y < 3950; y += 90) {
    collectibles.push({
      id: nextId++,
      x: 1800,
      y: y,
      type: 'coin',
      value: 15,
      collected: false,
    });
    collectibles.push({
      id: nextId++,
      x: 2600,
      y: y,
      type: 'coin',
      value: 15,
      collected: false,
    });
    collectibles.push({
      id: nextId++,
      x: 3300,
      y: y,
      type: 'coin',
      value: 15,
      collected: false,
    });
  }

  // Secret Cash Bundles ($100 each) in park and harbor corners
  const secretSpots = [
    { x: 1450, y: 750 },
    { x: 1550, y: 650 },
    { x: 650, y: 3400 },
    { x: 750, y: 3500 },
    { x: 3800, y: 3800 },
    { x: 3600, y: 1200 },
    { x: 2200, y: 1500 },
    { x: 1450, y: 2300 },
    { x: 3000, y: 2900 },
  ];

  secretSpots.forEach((sp) => {
    collectibles.push({
      id: nextId++,
      x: sp.x,
      y: sp.y,
      type: 'cash_bundle',
      value: 100,
      collected: false,
    });
  });

  // Nitro & Repair powerups along highway and near ramps
  const powerupSpots = [
    { x: 1800, y: 1200, type: 'nitro' as const },
    { x: 2600, y: 2900, type: 'nitro' as const },
    { x: 3300, y: 1500, type: 'nitro' as const },
    { x: 1100, y: 2000, type: 'nitro' as const },
    { x: 1800, y: 2400, type: 'repair' as const },
    { x: 2600, y: 1600, type: 'repair' as const },
    { x: 1100, y: 3600, type: 'repair' as const },
    { x: 3300, y: 3600, type: 'repair' as const },
  ];

  powerupSpots.forEach((ps) => {
    collectibles.push({
      id: nextId++,
      x: ps.x,
      y: ps.y,
      type: ps.type,
      value: 50,
      collected: false,
    });
  });

  return {
    roads,
    buildings,
    trees,
    ramps,
    speedCameras,
    collectibles,
    stations,
    districts,
  };
}
