import { 
  PlayerCarState, 
  CarConfig, 
  Building, 
  TrafficCar, 
  StuntRamp, 
  SpeedCamera, 
  CollectibleItem, 
  Particle, 
  SkidMark, 
  FloatingText,
  UserProgress 
} from './types';
import { audio } from './audio';
import { WORLD_SIZE, ServiceStation } from './city';

export interface PhysicsContext {
  buildings: Building[];
  trafficCars: TrafficCar[];
  ramps: StuntRamp[];
  speedCameras: SpeedCamera[];
  collectibles: CollectibleItem[];
  stations: ServiceStation[];
  particles: Particle[];
  skidMarks: SkidMark[];
  floatingTexts: FloatingText[];
  progress: UserProgress;
  onCoinsEarned: (amount: number, reason: string) => void;
  onDamageTaken: (damage: number) => void;
  onStuntFinished: (airtime: number, reward: number) => void;
}

export function createInitialPlayer(config: CarConfig): PlayerCarState {
  return {
    x: 1800,
    y: 1800,
    angle: 0,
    vx: 0,
    vy: 0,
    speed: 0,
    angularVelocity: 0,
    health: config.maxHealth,
    maxHealth: config.maxHealth,
    nitro: 1.0,
    isDrifting: false,
    driftScore: 0,
    driftMultiplier: 1.0,
    isNitroActive: false,
    isBraking: false,
    isAccelerating: false,
    isReversing: false,
    steerInput: 0,
    throttleInput: 0,
    handbrake: false,
    hornActive: false,
    gear: '1',
    rpm: 0.2,
    color: config.baseColor,
    airborneTime: 0,
    isAirborne: false,
    carId: config.id,
  };
}

export function updatePhysics(
  player: PlayerCarState,
  config: CarConfig,
  ctx: PhysicsContext,
  dt: number
) {
  // Clamp delta time to avoid physics tunneling
  const clampedDt = Math.min(dt, 0.04);

  // 1. Inputs & Nitro
  let isNitro = false;
  if (player.isNitroActive && player.nitro > 0) {
    isNitro = true;
    player.nitro = Math.max(0, player.nitro - clampedDt / config.nitroCapacity);
  } else {
    // Gradual passive nitro recharge
    player.nitro = Math.min(1.0, player.nitro + clampedDt * 0.08);
  }

  // 2. Velocity decomposition in local coordinates (forward & lateral)
  const forwardX = Math.cos(player.angle);
  const forwardY = Math.sin(player.angle);
  const rightX = -Math.sin(player.angle);
  const rightY = Math.cos(player.angle);

  const forwardSpeed = player.vx * forwardX + player.vy * forwardY;
  const lateralSpeed = player.vx * rightX + player.vy * rightY;

  // 3. Acceleration / Throttle & Reverse
  let accelerationForce = 0;
  if (player.throttleInput > 0.05) {
    player.isAccelerating = true;
    player.isReversing = false;
    let power = config.acceleration * player.throttleInput;
    if (isNitro) power *= 1.6;

    // Fade acceleration as speed approaches maxSpeed
    const maxSpd = isNitro ? config.maxSpeed * 1.3 : config.maxSpeed;
    const speedRatio = Math.min(1.0, Math.abs(forwardSpeed) / maxSpd);
    accelerationForce = power * (1 - speedRatio * 0.7);

    // Nitro exhaust particles
    if (isNitro && Math.random() < 0.8) {
      spawnNitroParticles(player, ctx);
    }
  } else if (player.throttleInput < -0.05) {
    if (forwardSpeed > 30) {
      // Braking while moving forward
      player.isBraking = true;
      player.isAccelerating = false;
      player.isReversing = false;
      accelerationForce = -config.braking * Math.abs(player.throttleInput);
    } else {
      // Reversing
      player.isBraking = false;
      player.isAccelerating = false;
      player.isReversing = true;
      if (Math.abs(forwardSpeed) < config.reverseSpeed) {
        accelerationForce = -config.acceleration * 0.6 * Math.abs(player.throttleInput);
      }
    }
  } else {
    player.isAccelerating = false;
    player.isBraking = false;
    player.isReversing = false;
    // Rolling friction
    accelerationForce = -forwardSpeed * 0.6;
  }

  // Handbrake extra deceleration
  if (player.handbrake) {
    accelerationForce -= Math.sign(forwardSpeed) * config.braking * 0.8;
  }

  // 4. Steering & Cornering
  let steerAngle = player.steerInput * config.turnSpeed;
  // Reduce steering agility at hyper-speed for stability
  const speedAbs = Math.abs(forwardSpeed);
  if (speedAbs > 300) {
    steerAngle *= 1 - (speedAbs - 300) / (config.maxSpeed * 1.5);
  }

  // Direction modifier (steering in reverse is inverted)
  const dir = forwardSpeed >= 0 ? 1 : -1;
  if (speedAbs > 10) {
    player.angle += steerAngle * dir * clampedDt;
  }

  // 5. Lateral Grip & Drifting
  let grip = config.grip;
  if (player.handbrake) {
    grip *= 0.35; // Break traction
  } else if (Math.abs(player.steerInput) > 0.6 && speedAbs > 220) {
    grip *= 0.72; // Power slide
  }

  // Drifting detection
  const slipAngle = Math.abs(lateralSpeed);
  const isDrift = slipAngle > 85 && speedAbs > 140 && !player.isAirborne;
  player.isDrifting = isDrift;

  if (isDrift) {
    // Generate drift score
    const driftPoints = Math.round(slipAngle * 0.35 * config.driftFactor);
    player.driftScore += driftPoints;
    player.driftMultiplier = Math.min(4.0, player.driftMultiplier + clampedDt * 0.3);

    // Spawn tire smoke & skid marks under rear tires
    spawnDriftEffects(player, ctx);
  } else {
    if (player.driftScore > 100) {
      // Bank drift score as cash!
      const cashReward = Math.round((player.driftScore / 25) * player.driftMultiplier * config.coinMultiplier);
      if (cashReward > 0) {
        ctx.onCoinsEarned(cashReward, `Drift Bonus! +$${cashReward}`);
        spawnFloatingText(ctx, player.x, player.y - 40, `DRIFT +$${cashReward}!`, '#F59E0B');
        audio.playCoin();
      }
    }
    player.driftScore = 0;
    player.driftMultiplier = 1.0;
  }

  // Update forward & lateral velocities with friction
  let newForwardSpeed = forwardSpeed + accelerationForce * clampedDt;
  let newLateralSpeed = lateralSpeed * Math.pow(1 - grip, clampedDt * 10);

  // Recombine to world velocity vector
  player.vx = newForwardSpeed * Math.cos(player.angle) + newLateralSpeed * rightX;
  player.vy = newForwardSpeed * Math.sin(player.angle) + newLateralSpeed * rightY;

  // Aerodynamic drag
  player.vx *= 1 - 0.05 * clampedDt;
  player.vy *= 1 - 0.05 * clampedDt;

  player.speed = Math.hypot(player.vx, player.vy);

  // 6. Airtime & Stunt Jumps
  if (player.isAirborne) {
    player.airborneTime += clampedDt;
    // Airborne physics (slight car roll / rotation boost)
    if (player.airborneTime > 0.8 && player.airborneTime < 1.4) {
      // Land back safely
      player.isAirborne = false;
      const airReward = Math.round(player.airborneTime * 120 * config.coinMultiplier);
      ctx.onStuntFinished(player.airborneTime, airReward);
      spawnFloatingText(ctx, player.x, player.y - 50, `AIRTIME! +$${airReward}`, '#38BDF8');
      audio.playStuntCelebration();
      player.airborneTime = 0;
    }
  }

  // Check Stunt Ramps
  if (!player.isAirborne && player.speed > 250) {
    for (const ramp of ctx.ramps) {
      const dist = Math.hypot(player.x - ramp.x, player.y - ramp.y);
      if (dist < 45) {
        player.isAirborne = true;
        player.airborneTime = 0.1;
        player.vx *= ramp.boostMultiplier;
        player.vy *= ramp.boostMultiplier;
        audio.playStuntCelebration();
        spawnFloatingText(ctx, ramp.x, ramp.y - 30, 'MEGA RAMP LAUNCH!', '#F59E0B');
        break;
      }
    }
  }

  // 7. Update Position
  player.x += player.vx * clampedDt;
  player.y += player.vy * clampedDt;

  // Clamp within world limits
  const margin = 50;
  if (player.x < margin) { player.x = margin; player.vx = -player.vx * 0.4; }
  if (player.x > WORLD_SIZE - margin) { player.x = WORLD_SIZE - margin; player.vx = -player.vx * 0.4; }
  if (player.y < margin) { player.y = margin; player.vy = -player.vy * 0.4; }
  if (player.y > WORLD_SIZE - margin) { player.y = WORLD_SIZE - margin; player.vy = -player.vy * 0.4; }

  // 8. Collisions with Buildings
  const carRadius = Math.max(config.width, config.length) * 0.45;
  for (const b of ctx.buildings) {
    // Fast AABB check
    if (
      player.x + carRadius > b.x &&
      player.x - carRadius < b.x + b.width &&
      player.y + carRadius > b.y &&
      player.y - carRadius < b.y + b.height
    ) {
      // Find closest edge to bounce off
      const overlapLeft = player.x + carRadius - b.x;
      const overlapRight = b.x + b.width - (player.x - carRadius);
      const overlapTop = player.y + carRadius - b.y;
      const overlapBottom = b.y + b.height - (player.y - carRadius);

      const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
      const impactSpeed = player.speed;

      if (minOverlap === overlapLeft) {
        player.x = b.x - carRadius;
        player.vx = -Math.abs(player.vx) * 0.5;
      } else if (minOverlap === overlapRight) {
        player.x = b.x + b.width + carRadius;
        player.vx = Math.abs(player.vx) * 0.5;
      } else if (minOverlap === overlapTop) {
        player.y = b.y - carRadius;
        player.vy = -Math.abs(player.vy) * 0.5;
      } else {
        player.y = b.y + b.height + carRadius;
        player.vy = Math.abs(player.vy) * 0.5;
      }

      if (impactSpeed > 100) {
        const damage = Math.round(impactSpeed * 0.08);
        player.health = Math.max(0, player.health - damage);
        ctx.onDamageTaken(damage);
        audio.playCrash(impactSpeed / 600);
        spawnCollisionSparks(ctx, player.x, player.y);
        if (navigator.vibrate) navigator.vibrate(40);
      }
      break;
    }
  }

  // 9. Collisions with Traffic Cars
  for (const tc of ctx.trafficCars) {
    const dx = player.x - tc.x;
    const dy = player.y - tc.y;
    const dist = Math.hypot(dx, dy);
    const minDist = (config.length + tc.length) * 0.35;

    if (dist < minDist && dist > 0.01) {
      const normalX = dx / dist;
      const normalY = dy / dist;
      const relativeSpeed = player.speed;

      // Bounce player away
      player.x = tc.x + normalX * minDist;
      player.y = tc.y + normalY * minDist;
      player.vx += normalX * 180;
      player.vy += normalY * 180;

      // Push traffic car
      tc.speed = Math.max(20, tc.speed * 0.4);

      if (relativeSpeed > 90) {
        // High durability cars (like Goliath 4x4) take far less damage!
        const armorFactor = config.category === 'Truck' ? 0.3 : 1.0;
        const damage = Math.round(relativeSpeed * 0.06 * armorFactor);
        player.health = Math.max(0, player.health - damage);
        ctx.onDamageTaken(damage);
        audio.playCrash(relativeSpeed / 500);
        spawnCollisionSparks(ctx, (player.x + tc.x) / 2, (player.y + tc.y) / 2);
        if (navigator.vibrate) navigator.vibrate([25, 25, 25]);
      }
    }
  }

  // 10. Collectibles Check (Coins, Nitro, Repair)
  for (const c of ctx.collectibles) {
    if (c.collected) continue;
    const dist = Math.hypot(player.x - c.x, player.y - c.y);
    if (dist < 42) {
      c.collected = true;
      c.respawnTime = Date.now() + 25000; // Respawns after 25s

      if (c.type === 'coin' || c.type === 'cash_bundle') {
        const reward = Math.round(c.value * config.coinMultiplier);
        ctx.onCoinsEarned(reward, c.type === 'coin' ? 'Coin Picked Up' : 'Secret Cash Bundle!');
        audio.playCoin();
        spawnFloatingText(ctx, c.x, c.y - 20, `+$${reward}`, '#FACC15');
        spawnCoinParticles(ctx, c.x, c.y);
        if (navigator.vibrate) navigator.vibrate(15);
      } else if (c.type === 'nitro') {
        player.nitro = 1.0;
        audio.playCoin();
        spawnFloatingText(ctx, c.x, c.y - 20, 'NITRO REFILLED! ⚡', '#00F0FF');
      } else if (c.type === 'repair') {
        player.health = config.maxHealth;
        audio.playCoin();
        spawnFloatingText(ctx, c.x, c.y - 20, 'CAR REPAIRED! 🔧', '#10B981');
      }
    }
  }

  // Respawn collected items after timeout
  const nowTime = Date.now();
  for (const c of ctx.collectibles) {
    if (c.collected && c.respawnTime && nowTime > c.respawnTime) {
      c.collected = false;
    }
  }

  // 11. Speed Cameras (Speed Traps)
  for (const cam of ctx.speedCameras) {
    const dist = Math.hypot(player.x - cam.x, player.y - cam.y);
    const speedKmh = Math.round(player.speed * 0.32); // conversion factor
    if (dist < 70 && speedKmh > cam.speedLimit && nowTime - cam.lastTriggered > 8000) {
      cam.lastTriggered = nowTime;
      const bonus = Math.round(cam.bonusReward * config.coinMultiplier);
      ctx.onCoinsEarned(bonus, `Speed Trap Triggered (${speedKmh} km/h)!`);
      audio.playSpeedCamera();
      spawnFloatingText(ctx, cam.x, cam.y - 30, `SPEED TRAP: ${speedKmh} KM/H! +$${bonus}`, '#EC4899');
      // Camera flash particle
      ctx.particles.push({
        x: cam.x,
        y: cam.y,
        vx: 0,
        vy: 0,
        life: 0.25,
        maxLife: 0.25,
        size: 90,
        color: '#FFFFFF',
        type: 'flash',
        alpha: 1.0,
      });
      if (navigator.vibrate) navigator.vibrate([60, 40, 60]);
    }
  }

  // 12. Service Stations (Repair & Refill Pit Stop)
  for (const st of ctx.stations) {
    if (
      player.x > st.x &&
      player.x < st.x + st.width &&
      player.y > st.y &&
      player.y < st.y + st.height
    ) {
      // Inside service station
      if (player.health < config.maxHealth) {
        player.health = Math.min(config.maxHealth, player.health + clampedDt * 30);
      }
      if (player.nitro < 1.0) {
        player.nitro = Math.min(1.0, player.nitro + clampedDt * 0.6);
      }
      if (Math.random() < 0.1) {
        spawnFloatingText(ctx, player.x, player.y - 30, 'PIT STOP REPAIR...', '#34D399');
      }
    }
  }

  // 13. RPM and Gear calculation for audio & HUD
  calculateRPMAndGear(player, config);

  // 14. Update Audio Engine
  const speedRatio = Math.min(1.0, player.speed / config.maxSpeed);
  audio.updateEngineSound(speedRatio, player.rpm, player.isDrifting, isNitro);
  if (player.hornActive) {
    audio.playHorn(true);
  }

  // 15. Update Particles & Decals
  updateParticles(ctx, clampedDt);
}

function calculateRPMAndGear(player: PlayerCarState, config: CarConfig) {
  if (player.isReversing) {
    player.gear = 'R';
    player.rpm = Math.min(1.0, 0.3 + (player.speed / config.reverseSpeed) * 0.7);
    return;
  }

  const speedKmh = player.speed * 0.32;
  if (speedKmh < 3) {
    player.gear = '1';
    player.rpm = 0.2;
    return;
  }

  // 6 speed transmission intervals
  if (speedKmh < 35) {
    player.gear = '1';
    player.rpm = 0.25 + (speedKmh / 35) * 0.7;
  } else if (speedKmh < 70) {
    player.gear = '2';
    player.rpm = 0.3 + ((speedKmh - 35) / 35) * 0.68;
  } else if (speedKmh < 110) {
    player.gear = '3';
    player.rpm = 0.32 + ((speedKmh - 70) / 40) * 0.66;
  } else if (speedKmh < 155) {
    player.gear = '4';
    player.rpm = 0.35 + ((speedKmh - 110) / 45) * 0.64;
  } else if (speedKmh < 200) {
    player.gear = '5';
    player.rpm = 0.38 + ((speedKmh - 155) / 45) * 0.62;
  } else {
    player.gear = '6';
    player.rpm = Math.min(1.0, 0.4 + ((speedKmh - 200) / 70) * 0.6);
  }
}

function spawnNitroParticles(player: PlayerCarState, ctx: PhysicsContext) {
  const backAngle = player.angle + Math.PI;
  const exhaustDist = 28;
  const leftExhaustX = player.x + Math.cos(backAngle) * exhaustDist + Math.cos(player.angle - Math.PI / 2) * 10;
  const leftExhaustY = player.y + Math.sin(backAngle) * exhaustDist + Math.sin(player.angle - Math.PI / 2) * 10;
  const rightExhaustX = player.x + Math.cos(backAngle) * exhaustDist + Math.cos(player.angle + Math.PI / 2) * 10;
  const rightExhaustY = player.y + Math.sin(backAngle) * exhaustDist + Math.sin(player.angle + Math.PI / 2) * 10;

  [
    { x: leftExhaustX, y: leftExhaustY },
    { x: rightExhaustX, y: rightExhaustY },
  ].forEach((pos) => {
    ctx.particles.push({
      x: pos.x,
      y: pos.y,
      vx: Math.cos(backAngle) * (180 + Math.random() * 80),
      vy: Math.sin(backAngle) * (180 + Math.random() * 80),
      life: 0.25,
      maxLife: 0.25,
      size: 6 + Math.random() * 4,
      color: Math.random() > 0.4 ? '#00F0FF' : '#3B82F6',
      type: 'flame',
      alpha: 1.0,
    });
  });
}

function spawnDriftEffects(player: PlayerCarState, ctx: PhysicsContext) {
  const rearDist = 22;
  const trackWidth = 14;

  const rearX = player.x - Math.cos(player.angle) * rearDist;
  const rearY = player.y - Math.sin(player.angle) * rearDist;

  const tireLeftX = rearX + Math.cos(player.angle - Math.PI / 2) * trackWidth;
  const tireLeftY = rearY + Math.sin(player.angle - Math.PI / 2) * trackWidth;
  const tireRightX = rearX + Math.cos(player.angle + Math.PI / 2) * trackWidth;
  const tireRightY = rearY + Math.sin(player.angle + Math.PI / 2) * trackWidth;

  // Skid marks
  if (ctx.skidMarks.length > 250) {
    ctx.skidMarks.shift();
  }
  ctx.skidMarks.push({
    x1: tireLeftX,
    y1: tireLeftY,
    x2: tireLeftX + player.vx * 0.04,
    y2: tireLeftY + player.vy * 0.04,
    alpha: 0.5,
  });

  // Smoke puffs
  if (Math.random() < 0.6) {
    ctx.particles.push({
      x: (tireLeftX + tireRightX) / 2 + (Math.random() * 10 - 5),
      y: (tireLeftY + tireRightY) / 2 + (Math.random() * 10 - 5),
      vx: (Math.random() - 0.5) * 40,
      vy: (Math.random() - 0.5) * 40,
      life: 0.5,
      maxLife: 0.5,
      size: 10 + Math.random() * 8,
      color: '#CBD5E1',
      type: 'smoke',
      alpha: 0.45,
    });
  }
}

function spawnCollisionSparks(ctx: PhysicsContext, x: number, y: number) {
  for (let i = 0; i < 14; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 100 + Math.random() * 200;
    ctx.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.35,
      maxLife: 0.35,
      size: 3 + Math.random() * 3,
      color: Math.random() > 0.3 ? '#F59E0B' : '#EF4444',
      type: 'spark',
      alpha: 1.0,
    });
  }
}

function spawnCoinParticles(ctx: PhysicsContext, x: number, y: number) {
  for (let i = 0; i < 10; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 80 + Math.random() * 120;
    ctx.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.4,
      maxLife: 0.4,
      size: 4 + Math.random() * 3,
      color: '#FACC15',
      type: 'coin_pickup',
      alpha: 1.0,
    });
  }
}

function spawnFloatingText(ctx: PhysicsContext, x: number, y: number, text: string, color: string) {
  ctx.floatingTexts.push({
    id: Date.now() + Math.random(),
    x,
    y,
    text,
    color,
    life: 1.4,
    maxLife: 1.4,
    size: 16,
  });
}

function updateParticles(ctx: PhysicsContext, dt: number) {
  // Update particles
  for (let i = ctx.particles.length - 1; i >= 0; i--) {
    const p = ctx.particles[i];
    p.life -= dt;
    if (p.life <= 0) {
      ctx.particles.splice(i, 1);
      continue;
    }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.alpha = Math.max(0, p.life / p.maxLife);
    if (p.type === 'smoke') {
      p.size += dt * 15;
    }
  }

  // Update floating text
  for (let i = ctx.floatingTexts.length - 1; i >= 0; i--) {
    const ft = ctx.floatingTexts[i];
    ft.life -= dt;
    if (ft.life <= 0) {
      ctx.floatingTexts.splice(i, 1);
      continue;
    }
    ft.y -= dt * 35; // float upwards
  }

  // Skid marks fade slowly
  for (let i = ctx.skidMarks.length - 1; i >= 0; i--) {
    ctx.skidMarks[i].alpha -= dt * 0.02;
    if (ctx.skidMarks[i].alpha <= 0) {
      ctx.skidMarks.splice(i, 1);
    }
  }
}
