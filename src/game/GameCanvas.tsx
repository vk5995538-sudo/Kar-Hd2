import React, { useEffect, useRef, useCallback } from 'react';
import { 
  PlayerCarState, 
  CarConfig, 
  TrafficCar, 
  Building, 
  RoadSegment, 
  StuntRamp, 
  SpeedCamera, 
  CollectibleItem, 
  TreeObject, 
  Particle, 
  SkidMark, 
  FloatingText,
  UserProgress,
  GameSettings 
} from './types';
import { generateCity, WORLD_SIZE, ServiceStation } from './city';
import { TrafficSystem } from './traffic';
import { createInitialPlayer, updatePhysics, PhysicsContext } from './physics';
import { renderGame } from './renderer';
import { audio } from './audio';

export interface GameCanvasHandles {
  setSteer: (val: number) => void;
  setThrottle: (val: number) => void;
  setHandbrake: (val: boolean) => void;
  setNitro: (val: boolean) => void;
  setHorn: (val: boolean) => void;
  resetCar: () => void;
  repairCar: () => void;
}

interface GameCanvasProps {
  carConfig: CarConfig;
  userProgress: UserProgress;
  settings: GameSettings;
  isPaused: boolean;
  onUpdateHUD: (data: {
    speedKmh: number;
    gear: string;
    rpm: number;
    health: number;
    maxHealth: number;
    nitro: number;
    driftScore: number;
    driftMultiplier: number;
    playerX: number;
    playerY: number;
    playerAngle: number;
    coins: number;
    isAirborne: boolean;
  }) => void;
  onCoinsEarned: (amount: number, reason: string) => void;
  onStuntFinished: (airtime: number, reward: number) => void;
  onGameOver: () => void;
  canvasRefCallback?: (handles: GameCanvasHandles) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  carConfig,
  userProgress,
  settings,
  isPaused,
  onUpdateHUD,
  onCoinsEarned,
  onStuntFinished,
  onGameOver,
  canvasRefCallback,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mutable game entities stored in refs for 60fps loop performance
  const playerRef = useRef<PlayerCarState>(createInitialPlayer(carConfig));
  const cityDataRef = useRef(generateCity());
  const trafficSystemRef = useRef<TrafficSystem>(new TrafficSystem(cityDataRef.current.roads));
  const particlesRef = useRef<Particle[]>([]);
  const skidMarksRef = useRef<SkidMark[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);

  // Input states
  const steerInputRef = useRef(0);
  const throttleInputRef = useRef(0);
  const handbrakeRef = useRef(false);
  const nitroRef = useRef(false);
  const hornRef = useRef(false);

  // Keyboard state tracker
  const keysDownRef = useRef<{ [key: string]: boolean }>({});

  // Reset / Respawn car to the nearest road
  const resetCar = useCallback(() => {
    const p = playerRef.current;
    p.vx = 0;
    p.vy = 0;
    p.speed = 0;
    p.angle = 0;
    p.angularVelocity = 0;
    p.isAirborne = false;
    p.airborneTime = 0;

    // Nearest vertical road center
    const roads = cityDataRef.current.roads.filter(r => r.isVertical);
    if (roads.length > 0) {
      const nearest = roads.reduce((prev, curr) => {
        return Math.abs(curr.x + curr.width / 2 - p.x) < Math.abs(prev.x + prev.width / 2 - p.x) ? curr : prev;
      });
      p.x = nearest.x + nearest.width / 2;
    }
  }, []);

  const repairCar = useCallback(() => {
    playerRef.current.health = carConfig.maxHealth;
    playerRef.current.nitro = 1.0;
  }, [carConfig.maxHealth]);

  // Expose input handles to parent (for mobile touch buttons and wheel)
  useEffect(() => {
    if (canvasRefCallback) {
      canvasRefCallback({
        setSteer: (val: number) => { steerInputRef.current = Math.max(-1, Math.min(1, val)); },
        setThrottle: (val: number) => { throttleInputRef.current = Math.max(-1, Math.min(1, val)); },
        setHandbrake: (val: boolean) => { handbrakeRef.current = val; },
        setNitro: (val: boolean) => { nitroRef.current = val; },
        setHorn: (val: boolean) => { hornRef.current = val; },
        resetCar,
        repairCar,
      });
    }
  }, [canvasRefCallback, resetCar, repairCar]);

  // Update car properties if config changed
  useEffect(() => {
    const p = playerRef.current;
    p.maxHealth = carConfig.maxHealth;
    p.color = userProgress.customCarColors[carConfig.id] || carConfig.baseColor;
    p.carId = carConfig.id;
  }, [carConfig, userProgress.customCarColors]);

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysDownRef.current[e.code] = true;

      // Audio init on first key
      audio.init();

      // Quick hotkey for horn
      if (e.code === 'KeyH') {
        hornRef.current = true;
      }
      if (e.code === 'KeyR') {
        resetCar();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysDownRef.current[e.code] = false;
      if (e.code === 'KeyH') {
        hornRef.current = false;
      }
    };

    const handleBlur = () => {
      keysDownRef.current = {};
      steerInputRef.current = 0;
      throttleInputRef.current = 0;
      handbrakeRef.current = false;
      nitroRef.current = false;
      hornRef.current = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [resetCar]);

  // Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();
    let hudThrottleCounter = 0;

    // Handle canvas resizing
    const resizeCanvas = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const loop = (currentTime: number) => {
      animId = requestAnimationFrame(loop);

      const rawDt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      const dt = Math.min(rawDt, 0.05);

      if (isPaused) {
        return;
      }

      // Process Keyboard inputs into continuous controls
      const keys = keysDownRef.current;
      let kbSteer = 0;
      if (keys['KeyA'] || keys['ArrowLeft']) kbSteer -= 1;
      if (keys['KeyD'] || keys['ArrowRight']) kbSteer += 1;

      let kbThrottle = 0;
      if (keys['KeyW'] || keys['ArrowUp']) kbThrottle += 1;
      if (keys['KeyS'] || keys['ArrowDown']) kbThrottle -= 1;

      const kbBrake = !!keys['Space'];
      const kbNitro = !!(keys['ShiftLeft'] || keys['ShiftRight']);
      const kbHorn = !!keys['KeyH'];

      // Merge touch and keyboard inputs
      const finalSteer = kbSteer !== 0 ? kbSteer : steerInputRef.current;
      const finalThrottle = kbThrottle !== 0 ? kbThrottle : throttleInputRef.current;
      const finalHandbrake = kbBrake || handbrakeRef.current;
      const finalNitro = kbNitro || nitroRef.current;
      const finalHorn = kbHorn || hornRef.current;

      const player = playerRef.current;
      player.steerInput = finalSteer;
      player.throttleInput = finalThrottle;
      player.handbrake = finalHandbrake;
      player.isNitroActive = finalNitro;
      player.hornActive = finalHorn;

      // Update AI Traffic
      trafficSystemRef.current.update(dt, player.x, player.y);

      // Physics context
      const physicsCtx: PhysicsContext = {
        buildings: cityDataRef.current.buildings,
        trafficCars: trafficSystemRef.current.cars,
        ramps: cityDataRef.current.ramps,
        speedCameras: cityDataRef.current.speedCameras,
        collectibles: cityDataRef.current.collectibles,
        stations: cityDataRef.current.stations,
        particles: particlesRef.current,
        skidMarks: skidMarksRef.current,
        floatingTexts: floatingTextsRef.current,
        progress: userProgress,
        onCoinsEarned: (amount, reason) => {
          onCoinsEarned(amount, reason);
        },
        onDamageTaken: () => {
          if (player.health <= 0) {
            onGameOver();
          }
        },
        onStuntFinished: (airtime, reward) => {
          onStuntFinished(airtime, reward);
        },
      };

      // Physics step
      updatePhysics(player, carConfig, physicsCtx, dt);

      // Render Scene
      renderGame({
        canvas,
        ctx,
        player,
        carConfig,
        roads: cityDataRef.current.roads,
        buildings: cityDataRef.current.buildings,
        trees: cityDataRef.current.trees,
        ramps: cityDataRef.current.ramps,
        speedCameras: cityDataRef.current.speedCameras,
        collectibles: cityDataRef.current.collectibles,
        stations: cityDataRef.current.stations,
        trafficCars: trafficSystemRef.current.cars,
        particles: particlesRef.current,
        skidMarks: skidMarksRef.current,
        floatingTexts: floatingTextsRef.current,
        cameraZoom: window.innerWidth < 768 ? 1.05 : 1.15,
      });

      // Throttled HUD update for 60fps React efficiency (every ~3 frames = 20Hz)
      hudThrottleCounter++;
      if (hudThrottleCounter % 3 === 0) {
        onUpdateHUD({
          speedKmh: Math.round(player.speed * 0.32),
          gear: player.gear,
          rpm: player.rpm,
          health: player.health,
          maxHealth: player.maxHealth,
          nitro: player.nitro,
          driftScore: player.driftScore,
          driftMultiplier: player.driftMultiplier,
          playerX: player.x,
          playerY: player.y,
          playerAngle: player.angle,
          coins: userProgress.coins,
          isAirborne: player.isAirborne,
        });
      }
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isPaused, carConfig, userProgress, onCoinsEarned, onStuntFinished, onGameOver, onUpdateHUD]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden select-none bg-slate-950">
      <canvas
        ref={canvasRef}
        className="w-full h-full block touch-none pointer-events-auto"
        onPointerDown={() => audio.init()}
      />
    </div>
  );
};
