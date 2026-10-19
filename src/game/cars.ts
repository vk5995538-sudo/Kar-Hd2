import { CarConfig, UserProgress } from './types';

export const INITIAL_CARS: CarConfig[] = [
  {
    id: 'crimson_gt',
    name: 'Crimson GT',
    subtitle: 'Classic Red Sports Coupe',
    category: 'Sports',
    price: 0,
    unlocked: true,
    baseColor: '#E61E2A',
    accentColor: '#18181B',
    maxSpeed: 640, // ~190 km/h
    acceleration: 480,
    braking: 750,
    reverseSpeed: 180,
    turnSpeed: 3.4,
    grip: 0.88,
    driftFactor: 1.2,
    maxHealth: 100,
    nitroCapacity: 5.0,
    coinMultiplier: 1.0,
    width: 32,
    length: 64,
    description: 'The iconic city thoroughbred. Perfectly balanced handling, responsive throttle, and sleek aerodynamic styling.',
  },
  {
    id: 'turbo_phantom',
    name: 'Turbo Phantom',
    subtitle: 'Midnight Black Hypercar',
    category: 'Hypercar',
    price: 800,
    unlocked: false,
    baseColor: '#18181B',
    accentColor: '#00F0FF',
    maxSpeed: 780, // ~240 km/h
    acceleration: 580,
    braking: 880,
    reverseSpeed: 210,
    turnSpeed: 3.8,
    grip: 0.94,
    driftFactor: 1.4,
    maxHealth: 90,
    nitroCapacity: 6.5,
    coinMultiplier: 1.3,
    width: 34,
    length: 68,
    description: 'Carbon fiber chassis with active aero and twin-turbo v12. Dominates highways and long boulevards.',
  },
  {
    id: 'cobalt_rx',
    name: 'Cobalt Drift RX',
    subtitle: 'JDM Street Drifter',
    category: 'Tuner',
    price: 1500,
    unlocked: false,
    baseColor: '#2563EB',
    accentColor: '#FFFFFF',
    maxSpeed: 620,
    acceleration: 510,
    braking: 800,
    reverseSpeed: 190,
    turnSpeed: 4.2,
    grip: 0.78, // more slippery for glorious drifting
    driftFactor: 2.2,
    maxHealth: 105,
    nitroCapacity: 5.5,
    coinMultiplier: 1.5,
    width: 31,
    length: 62,
    description: 'Engineered for street corners and roundabouts. Slips effortlessly into smoky power slides with huge score multipliers.',
  },
  {
    id: 'goliath_4x4',
    name: 'Goliath Offroad',
    subtitle: 'Heavy Armored Bumper',
    category: 'Truck',
    price: 2400,
    unlocked: false,
    baseColor: '#F59E0B',
    accentColor: '#1F2937',
    maxSpeed: 540,
    acceleration: 440,
    braking: 680,
    reverseSpeed: 170,
    turnSpeed: 2.8,
    grip: 0.91,
    driftFactor: 0.9,
    maxHealth: 250, // Massive armor
    nitroCapacity: 4.5,
    coinMultiplier: 1.2,
    width: 38,
    length: 72,
    description: 'A monster on wheels. Heavy steel push bar shatters traffic cars aside while barely scratching your paintwork.',
  },
  {
    id: 'viper_green',
    name: 'Viper Spyder',
    subtitle: 'Track-Tuned Exotic',
    category: 'Exotic',
    price: 3800,
    unlocked: false,
    baseColor: '#10B981',
    accentColor: '#000000',
    maxSpeed: 720,
    acceleration: 600,
    braking: 920,
    reverseSpeed: 200,
    turnSpeed: 4.0,
    grip: 0.92,
    driftFactor: 1.6,
    maxHealth: 95,
    nitroCapacity: 7.0,
    coinMultiplier: 1.7,
    width: 33,
    length: 65,
    description: 'Ultra-lightweight track weapon with extreme downforce and lightning corner entry speeds.',
  },
  {
    id: 'golden_monarch',
    name: 'Golden Monarch',
    subtitle: '24K Luxury King',
    category: 'Hypercar',
    price: 6000,
    unlocked: false,
    baseColor: '#EAB308',
    accentColor: '#78350F',
    maxSpeed: 820,
    acceleration: 640,
    braking: 950,
    reverseSpeed: 230,
    turnSpeed: 3.9,
    grip: 0.95,
    driftFactor: 1.8,
    maxHealth: 130,
    nitroCapacity: 8.0,
    coinMultiplier: 2.5, // 2.5x coin booster!
    width: 35,
    length: 70,
    description: 'The crowning achievement of open world driving. Coated in liquid gold, granting massive coin multipliers.',
  },
];

export const COLOR_PALETTES = [
  { name: 'Crimson Red', hex: '#E61E2A' },
  { name: 'Onyx Black', hex: '#18181B' },
  { name: 'Royal Cobalt', hex: '#2563EB' },
  { name: 'Amber Gold', hex: '#EAB308' },
  { name: 'Viper Lime', hex: '#10B981' },
  { name: 'Sunset Orange', hex: '#F97316' },
  { name: 'Ultra Violet', hex: '#8B5CF6' },
  { name: 'Polar White', hex: '#F8FAFC' },
];

const STORAGE_KEY = 'open_world_car_game_user_progress_v1';

export function loadUserProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        coins: typeof parsed.coins === 'number' ? parsed.coins : 150,
        totalDistanceDriven: parsed.totalDistanceDriven || 0,
        stuntsCompleted: parsed.stuntsCompleted || 0,
        speedTrapsHit: parsed.speedTrapsHit || 0,
        unlockedCarIds: Array.isArray(parsed.unlockedCarIds) && parsed.unlockedCarIds.length > 0 
          ? parsed.unlockedCarIds 
          : ['crimson_gt'],
        selectedCarId: parsed.selectedCarId || 'crimson_gt',
        customCarColors: parsed.customCarColors || {},
        bestDriftScore: parsed.bestDriftScore || 0,
      };
    }
  } catch (e) {
    console.warn('Failed to load user progress:', e);
  }

  return {
    coins: 150, // Starter bonus!
    totalDistanceDriven: 0,
    stuntsCompleted: 0,
    speedTrapsHit: 0,
    unlockedCarIds: ['crimson_gt'],
    selectedCarId: 'crimson_gt',
    customCarColors: {},
    bestDriftScore: 0,
  };
}

export function saveUserProgress(progress: UserProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.warn('Failed to save user progress:', e);
  }
}
