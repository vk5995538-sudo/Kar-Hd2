export type GameScreen = 'HOME' | 'PLAYING' | 'GARAGE' | 'MAP' | 'SETTINGS';

export interface CarConfig {
  id: string;
  name: string;
  subtitle: string;
  category: 'Sports' | 'Hypercar' | 'Muscle' | 'Truck' | 'Tuner' | 'Exotic';
  price: number;
  unlocked: boolean;
  baseColor: string;
  accentColor: string;
  // Performance characteristics
  maxSpeed: number; // max forward velocity in world units/sec (e.g., 550 - 850)
  acceleration: number; // forward thrust power
  braking: number; // braking deceleration
  reverseSpeed: number; // max reverse velocity
  turnSpeed: number; // steering rate in rad/sec
  grip: number; // lateral grip (higher = less sliding)
  driftFactor: number; // drift multiplier
  maxHealth: number;
  nitroCapacity: number; // seconds of nitro
  coinMultiplier: number;
  width: number;
  length: number;
  description: string;
}

export interface PlayerCarState {
  x: number;
  y: number;
  angle: number; // heading angle in radians
  vx: number; // velocity x
  vy: number; // velocity y
  speed: number; // scalar speed in world units
  angularVelocity: number;
  health: number;
  maxHealth: number;
  nitro: number; // 0 to 1
  isDrifting: boolean;
  driftScore: number;
  driftMultiplier: number;
  isNitroActive: boolean;
  isBraking: boolean;
  isAccelerating: boolean;
  isReversing: boolean;
  steerInput: number; // -1 (left) to 1 (right)
  throttleInput: number; // -1 (reverse) to 1 (forward)
  handbrake: boolean;
  hornActive: boolean;
  gear: 'P' | 'R' | '1' | '2' | '3' | '4' | '5' | '6';
  rpm: number; // 0.0 to 1.0 for audio
  color: string;
  airborneTime: number; // seconds in air if launched from ramp
  isAirborne: boolean;
  carId: string;
}

export interface TrafficCar {
  id: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  targetSpeed: number;
  length: number;
  width: number;
  color: string;
  model: 'sedan' | 'suv' | 'cab' | 'van' | 'sports';
  laneId: string;
  distanceAlongRoad: number;
  roadId: number;
  direction: 1 | -1;
  isBraking: boolean;
}

export interface Building {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  roofColor: string;
  wallColor: string;
  trimColor: string;
  floors: number;
  name?: string;
  category: 'residential' | 'commercial' | 'skyscraper' | 'industrial' | 'station' | 'landmark';
  neonColor?: string;
}

export interface RoadSegment {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  isVertical: boolean;
  lanes: number;
  name: string;
}

export interface StuntRamp {
  id: number;
  x: number;
  y: number;
  angle: number;
  width: number;
  length: number;
  boostMultiplier: number;
}

export interface SpeedCamera {
  id: number;
  x: number;
  y: number;
  speedLimit: number; // in km/h
  bonusReward: number;
  lastTriggered: number;
}

export interface CollectibleItem {
  id: number;
  x: number;
  y: number;
  type: 'coin' | 'nitro' | 'repair' | 'cash_bundle';
  value: number;
  collected: boolean;
  respawnTime?: number;
}

export interface TreeObject {
  x: number;
  y: number;
  radius: number;
  color: string;
  type: 'pine' | 'oak' | 'palm';
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'smoke' | 'spark' | 'flame' | 'skid' | 'coin_pickup' | 'flash';
  alpha: number;
}

export interface SkidMark {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  alpha: number;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  size: number;
}

export interface GameSettings {
  sfxVolume: number; // 0 to 1
  musicVolume: number; // 0 to 1
  controlType: 'buttons' | 'wheel' | 'slider';
  vibration: boolean;
  showFPS: boolean;
  speedUnit: 'kmh' | 'mph';
  selectedRadioStation: number;
}

export interface UserProgress {
  coins: number;
  totalDistanceDriven: number;
  stuntsCompleted: number;
  speedTrapsHit: number;
  unlockedCarIds: string[];
  selectedCarId: string;
  customCarColors: Record<string, string>;
  bestDriftScore: number;
}
