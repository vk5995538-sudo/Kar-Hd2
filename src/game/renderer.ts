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
  FloatingText 
} from './types';
import { WORLD_SIZE, ServiceStation } from './city';

export interface RenderContext {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  player: PlayerCarState;
  carConfig: CarConfig;
  roads: RoadSegment[];
  buildings: Building[];
  trees: TreeObject[];
  ramps: StuntRamp[];
  speedCameras: SpeedCamera[];
  collectibles: CollectibleItem[];
  stations: ServiceStation[];
  trafficCars: TrafficCar[];
  particles: Particle[];
  skidMarks: SkidMark[];
  floatingTexts: FloatingText[];
  cameraZoom: number; // 0.85 = wide, 1.0 = normal, 1.2 = close
}

export function renderGame(rc: RenderContext) {
  const { canvas, ctx, player, carConfig } = rc;
  const width = canvas.width;
  const height = canvas.height;

  // Clear canvas with deep asphalt/ground tone
  ctx.save();
  ctx.fillStyle = '#0B0F17'; // Base terrain
  ctx.fillRect(0, 0, width, height);

  // Center camera on player car with smooth zoom
  const zoom = player.isAirborne ? rc.cameraZoom * 0.85 : rc.cameraZoom;
  ctx.translate(width / 2, height / 2);
  ctx.scale(zoom, zoom);
  ctx.translate(-player.x, -player.y);

  // Viewport culling boundaries
  const viewLeft = player.x - (width / zoom) / 2 - 120;
  const viewRight = player.x + (width / zoom) / 2 + 120;
  const viewTop = player.y - (height / zoom) / 2 - 120;
  const viewBottom = player.y + (height / zoom) / 2 + 120;

  // 1. Render Ground Terrain (Grass lawns, Water at marina, Pavements)
  renderGroundTerrain(ctx, viewLeft, viewRight, viewTop, viewBottom);

  // 2. Render Roads with Asphalt, Curbs, Crosswalks, Lane Dividers
  renderRoads(ctx, rc.roads, viewLeft, viewRight, viewTop, viewBottom);

  // 3. Render Skid Marks on Asphalt
  renderSkidMarks(ctx, rc.skidMarks, viewLeft, viewRight, viewTop, viewBottom);

  // 4. Render Stunt Ramps
  renderRamps(ctx, rc.ramps, viewLeft, viewRight, viewTop, viewBottom);

  // 5. Render Speed Cameras
  renderSpeedCameras(ctx, rc.speedCameras, viewLeft, viewRight, viewTop, viewBottom);

  // 6. Render Service Stations
  renderServiceStations(ctx, rc.stations, viewLeft, viewRight, viewTop, viewBottom);

  // 7. Render Collectibles (Coins, Nitro, Repair)
  renderCollectibles(ctx, rc.collectibles, viewLeft, viewRight, viewTop, viewBottom);

  // 8. Render AI Traffic Cars
  renderTrafficCars(ctx, rc.trafficCars, viewLeft, viewRight, viewTop, viewBottom);

  // 9. Render Player Car (with Headlights, Brake Lights, Shadow, Airborne scaling)
  renderPlayerCar(ctx, player, carConfig);

  // 10. Render Particles (Tire Smoke, Flames, Sparks, Flashes)
  renderParticles(ctx, rc.particles, viewLeft, viewRight, viewTop, viewBottom);

  // 11. Render Buildings with 3D Depth Roofs and Neon Billboards
  renderBuildings(ctx, rc.buildings, viewLeft, viewRight, viewTop, viewBottom);

  // 12. Render Trees with Canopy Highlights and Shadows
  renderTrees(ctx, rc.trees, viewLeft, viewRight, viewTop, viewBottom);

  // 13. Render Floating Texts (Scores, Bonuses, Stunts)
  renderFloatingTexts(ctx, rc.floatingTexts);

  ctx.restore();
}

function renderGroundTerrain(
  ctx: CanvasRenderingContext2D,
  vl: number,
  vr: number,
  vt: number,
  vb: number
) {
  // Ground grid grass / sand patterns
  // Central Park (x: 1100 - 1800, y: 400 - 1100)
  if (vr > 1100 && vl < 1800 && vb > 400 && vt < 1100) {
    ctx.fillStyle = '#143823'; // Deep park green
    ctx.fillRect(1100, 400, 700, 700);

    // Park Pond
    ctx.fillStyle = '#0284C7';
    ctx.beginPath();
    ctx.ellipse(1450, 750, 180, 110, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Pond shoreline
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  // Marina Beach / Ocean (x: 3400 - 4400, y: 0 - 4400)
  if (vr > 3400) {
    // Sand strip
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(3360, 0, 80, WORLD_SIZE);

    // Ocean Water
    ctx.fillStyle = '#0369A1';
    ctx.fillRect(3440, 0, 960, WORLD_SIZE);

    // Animated gentle ocean waves
    const waveOffset = (Date.now() / 800) % 30;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 3;
    for (let wy = Math.max(0, vt - 40); wy < Math.min(WORLD_SIZE, vb + 40); wy += 80) {
      ctx.beginPath();
      ctx.moveTo(3440, wy + waveOffset);
      ctx.bezierCurveTo(3490, wy + 20 + waveOffset, 3550, wy - 20 + waveOffset, 3600, wy + waveOffset);
      ctx.stroke();
    }
  }

  // World Boundary Warning Line
  ctx.strokeStyle = '#EF4444';
  ctx.lineWidth = 8;
  ctx.setLineDash([20, 20]);
  ctx.strokeRect(30, 30, WORLD_SIZE - 60, WORLD_SIZE - 60);
  ctx.setLineDash([]);
}

function renderRoads(
  ctx: CanvasRenderingContext2D,
  roads: RoadSegment[],
  vl: number,
  vr: number,
  vt: number,
  vb: number
) {
  for (const r of roads) {
    if (r.x + r.width < vl || r.x > vr || r.y + r.height < vt || r.y > vb) {
      continue;
    }

    // Concrete Sidewalk Border
    ctx.fillStyle = '#475569';
    ctx.fillRect(r.x - 6, r.y - 6, r.width + 12, r.height + 12);

    // Asphalt Surface
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(r.x, r.y, r.width, r.height);

    // Road Markings
    ctx.save();
    if (r.isVertical) {
      // Center Double Yellow Line
      const centerX = r.x + r.width / 2;
      ctx.strokeStyle = '#FACC15';
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.moveTo(centerX - 3, r.y);
      ctx.lineTo(centerX - 3, r.y + r.height);
      ctx.moveTo(centerX + 3, r.y);
      ctx.lineTo(centerX + 3, r.y + r.height);
      ctx.stroke();

      // White Dashed Lane Dividers if 4 lanes
      if (r.lanes >= 4) {
        ctx.strokeStyle = '#F8FAFC';
        ctx.lineWidth = 2;
        ctx.setLineDash([20, 25]);

        const quarterWidth = r.width / 4;
        ctx.beginPath();
        ctx.moveTo(r.x + quarterWidth, r.y);
        ctx.lineTo(r.x + quarterWidth, r.y + r.height);
        ctx.moveTo(r.x + quarterWidth * 3, r.y);
        ctx.lineTo(r.x + quarterWidth * 3, r.y + r.height);
        ctx.stroke();
      }
    } else {
      // Horizontal road
      const centerY = r.y + r.height / 2;
      ctx.strokeStyle = '#FACC15';
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.moveTo(r.x, centerY - 3);
      ctx.lineTo(r.x + r.width, centerY - 3);
      ctx.moveTo(r.x, centerY + 3);
      ctx.lineTo(r.x + r.width, centerY + 3);
      ctx.stroke();

      if (r.lanes >= 4) {
        ctx.strokeStyle = '#F8FAFC';
        ctx.lineWidth = 2;
        ctx.setLineDash([20, 25]);

        const quarterHeight = r.height / 4;
        ctx.beginPath();
        ctx.moveTo(r.x, r.y + quarterHeight);
        ctx.lineTo(r.x + r.width, r.y + quarterHeight);
        ctx.moveTo(r.x, r.y + quarterHeight * 3);
        ctx.lineTo(r.x + r.width, r.y + quarterHeight * 3);
        ctx.stroke();
      }
    }
    ctx.restore();
  }
}

function renderSkidMarks(
  ctx: CanvasRenderingContext2D,
  skids: SkidMark[],
  vl: number,
  vr: number,
  vt: number,
  vb: number
) {
  ctx.save();
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  for (const s of skids) {
    if (s.x1 < vl || s.x1 > vr || s.y1 < vt || s.y1 > vb) continue;
    ctx.strokeStyle = `rgba(10, 10, 15, ${s.alpha * 0.7})`;
    ctx.beginPath();
    ctx.moveTo(s.x1, s.y1);
    ctx.lineTo(s.x2, s.y2);
    ctx.stroke();
  }
  ctx.restore();
}

function renderRamps(
  ctx: CanvasRenderingContext2D,
  ramps: StuntRamp[],
  vl: number,
  vr: number,
  vt: number,
  vb: number
) {
  for (const r of ramps) {
    if (r.x < vl || r.x > vr || r.y < vt || r.y > vb) continue;
    ctx.save();
    ctx.translate(r.x, r.y);
    ctx.rotate(r.angle);

    // Ramp surface with yellow & black warning hazard stripes
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(-r.width / 2, -r.length / 2, r.width, r.length);

    // Hazard chevrons
    ctx.fillStyle = '#18181B';
    for (let i = -r.length / 2; i < r.length / 2; i += 12) {
      ctx.beginPath();
      ctx.moveTo(-r.width / 2, i);
      ctx.lineTo(0, i + 8);
      ctx.lineTo(r.width / 2, i);
      ctx.lineTo(r.width / 2, i + 5);
      ctx.lineTo(0, i + 13);
      ctx.lineTo(-r.width / 2, i + 5);
      ctx.fill();
    }

    // Launch Lip
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(-r.width / 2, r.length / 2 - 6, r.width, 6);

    ctx.restore();
  }
}

function renderSpeedCameras(
  ctx: CanvasRenderingContext2D,
  cams: SpeedCamera[],
  vl: number,
  vr: number,
  vt: number,
  vb: number
) {
  for (const cam of cams) {
    if (cam.x < vl || cam.x > vr || cam.y < vt || cam.y > vb) continue;
    ctx.save();
    ctx.translate(cam.x, cam.y);

    // Pole base
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();

    // Camera housing
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(-12, -18, 24, 16);

    // Lens
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(0, -10, 5, 0, Math.PI * 2);
    ctx.fill();

    // Speed Limit text badge
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 16, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#18181B';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${cam.speedLimit}`, 0, 16);

    ctx.restore();
  }
}

function renderServiceStations(
  ctx: CanvasRenderingContext2D,
  stations: ServiceStation[],
  vl: number,
  vr: number,
  vt: number,
  vb: number
) {
  for (const st of stations) {
    if (st.x + st.width < vl || st.x > vr || st.y + st.height < vt || st.y > vb) continue;
    ctx.save();
    // Glowing repair bay floor
    ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 3;
    ctx.strokeRect(st.x, st.y, st.width, st.height);
    ctx.fillRect(st.x, st.y, st.width, st.height);

    // Sign
    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ PIT STOP & REPAIR', st.x + st.width / 2, st.y + st.height / 2 + 4);
    ctx.restore();
  }
}

function renderCollectibles(
  ctx: CanvasRenderingContext2D,
  collectibles: CollectibleItem[],
  vl: number,
  vr: number,
  vt: number,
  vb: number
) {
  const time = Date.now() / 300;
  for (const c of collectibles) {
    if (c.collected) continue;
    if (c.x < vl || c.x > vr || c.y < vt || c.y > vb) continue;

    ctx.save();
    ctx.translate(c.x, c.y);

    if (c.type === 'coin') {
      // 3D spinning coin animation
      const scaleX = Math.cos(time);
      ctx.scale(Math.abs(scaleX) * 0.7 + 0.3, 1.0);

      // Outer gold rim
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();

      // Inner shiny gold
      ctx.fillStyle = '#FACC15';
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#78350F';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('$', 0, 1);
    } else if (c.type === 'cash_bundle') {
      // Secret Cash Stash ($100)
      ctx.fillStyle = '#10B981';
      ctx.fillRect(-12, -8, 24, 16);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-10, -6, 20, 12);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('100', 0, 0);
    } else if (c.type === 'nitro') {
      // Nitro cylinder with bolt
      ctx.fillStyle = '#00F0FF';
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#090D16';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⚡', 0, 1);
    } else if (c.type === 'repair') {
      // Repair Kit with wrench
      ctx.fillStyle = '#10B981';
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🔧', 0, 1);
    }
    ctx.restore();
  }
}

function renderTrafficCars(
  ctx: CanvasRenderingContext2D,
  trafficCars: TrafficCar[],
  vl: number,
  vr: number,
  vt: number,
  vb: number
) {
  for (const tc of trafficCars) {
    if (tc.x < vl || tc.x > vr || tc.y < vt || tc.y > vb) continue;

    ctx.save();
    ctx.translate(tc.x, tc.y);
    ctx.rotate(tc.angle);

    // Car Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(-tc.length / 2 + 3, -tc.width / 2 + 3, tc.length, tc.width);

    // Wheels
    ctx.fillStyle = '#111827';
    const wheelW = 12;
    const wheelH = 6;
    ctx.fillRect(-tc.length / 2 + 8, -tc.width / 2 - 2, wheelW, wheelH);
    ctx.fillRect(tc.length / 2 - 20, -tc.width / 2 - 2, wheelW, wheelH);
    ctx.fillRect(-tc.length / 2 + 8, tc.width / 2 - 4, wheelW, wheelH);
    ctx.fillRect(tc.length / 2 - 20, tc.width / 2 - 4, wheelW, wheelH);

    // Car Body
    ctx.fillStyle = tc.color;
    roundRect(ctx, -tc.length / 2, -tc.width / 2, tc.length, tc.width, 6);
    ctx.fill();

    // Windshield & Roof
    ctx.fillStyle = '#1E293B';
    roundRect(ctx, -tc.length / 4, -tc.width / 2 + 4, tc.length * 0.5, tc.width - 8, 4);
    ctx.fill();

    // Taxi Roof Sign
    if (tc.model === 'cab') {
      ctx.fillStyle = '#18181B';
      ctx.fillRect(-6, -8, 12, 16);
      ctx.fillStyle = '#FACC15';
      ctx.font = 'bold 6px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('TAXI', 0, 2);
    }

    // Headlights
    ctx.fillStyle = '#FEF08A';
    ctx.fillRect(tc.length / 2 - 2, -tc.width / 2 + 4, 3, 6);
    ctx.fillRect(tc.length / 2 - 2, tc.width / 2 - 10, 3, 6);

    // Brake Lights (Bright red when braking)
    ctx.fillStyle = tc.isBraking ? '#EF4444' : '#7F1D1D';
    ctx.fillRect(-tc.length / 2 - 1, -tc.width / 2 + 4, 3, 6);
    ctx.fillRect(-tc.length / 2 - 1, tc.width / 2 - 10, 3, 6);

    ctx.restore();
  }
}

function renderPlayerCar(
  ctx: CanvasRenderingContext2D,
  player: PlayerCarState,
  config: CarConfig
) {
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.rotate(player.angle);

  // Stunt jump altitude scale & shadow displacement
  const heightScale = player.isAirborne ? 1.0 + Math.min(0.45, player.airborneTime * 0.4) : 1.0;
  const shadowDist = player.isAirborne ? 18 : 6;

  // Car Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  roundRect(
    ctx,
    -config.length / 2 + shadowDist,
    -config.width / 2 + shadowDist,
    config.length,
    config.width,
    8
  );
  ctx.fill();

  // Scale if airborne
  if (player.isAirborne) {
    ctx.scale(heightScale, heightScale);
  }

  // Headlight illumination beams on the road
  ctx.save();
  const grad = ctx.createRadialGradient(
    config.length / 2 + 80, 0, 20,
    config.length / 2, 0, 160
  );
  grad.addColorStop(0, 'rgba(255, 255, 200, 0.28)');
  grad.addColorStop(1, 'rgba(255, 255, 200, 0.0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(config.length / 2, -config.width / 2 + 4);
  ctx.lineTo(config.length / 2 + 150, -config.width - 25);
  ctx.lineTo(config.length / 2 + 150, config.width + 25);
  ctx.lineTo(config.length / 2, config.width / 2 - 4);
  ctx.fill();
  ctx.restore();

  // Wheels / Tires (Black rubber with silver rim)
  const wheelL = 14;
  const wheelW = 7;
  const frontSteer = player.steerInput * 0.35;

  // Rear Left & Right wheels (Straight)
  ctx.fillStyle = '#090D16';
  ctx.fillRect(-config.length / 2 + 8, -config.width / 2 - 3, wheelL, wheelW);
  ctx.fillRect(-config.length / 2 + 8, config.width / 2 - 4, wheelL, wheelW);

  // Front Left & Right wheels (Steered with angle)
  ctx.save();
  ctx.translate(config.length / 2 - 16, -config.width / 2);
  ctx.rotate(frontSteer);
  ctx.fillRect(-wheelL / 2, -wheelW / 2, wheelL, wheelW);
  ctx.restore();

  ctx.save();
  ctx.translate(config.length / 2 - 16, config.width / 2);
  ctx.rotate(frontSteer);
  ctx.fillRect(-wheelL / 2, -wheelW / 2, wheelL, wheelW);
  ctx.restore();

  // Car Body Exterior
  ctx.fillStyle = player.color;
  roundRect(ctx, -config.length / 2, -config.width / 2, config.length, config.width, 9);
  ctx.fill();

  // Accent Racing Stripes or Hood Trim
  ctx.fillStyle = config.accentColor;
  ctx.fillRect(-config.length / 2 + 4, -4, config.length - 8, 8);

  // Front Hood Scoop / Vents
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(config.length / 2 - 24, -8, 10, 16);

  // Cabin / Windshield Glass
  ctx.fillStyle = '#020617';
  roundRect(ctx, -config.length / 4, -config.width / 2 + 5, config.length * 0.45, config.width - 10, 5);
  ctx.fill();

  // Windshield Glass Glint / Highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.beginPath();
  ctx.moveTo(config.length / 8, -config.width / 2 + 7);
  ctx.lineTo(config.length / 8 + 6, -config.width / 2 + 7);
  ctx.lineTo(-config.length / 6, config.width / 2 - 7);
  ctx.lineTo(-config.length / 6 - 6, config.width / 2 - 7);
  ctx.fill();

  // Rear Aerodynamic Spoiler / Wing
  ctx.fillStyle = config.accentColor;
  ctx.fillRect(-config.length / 2 - 2, -config.width / 2 + 3, 5, config.width - 6);

  // Side Mirrors
  ctx.fillStyle = player.color;
  ctx.fillRect(config.length / 2 - 26, -config.width / 2 - 5, 5, 5);
  ctx.fillRect(config.length / 2 - 26, config.width / 2, 5, 5);

  // Headlights (Twin ultra-bright LED lamps)
  ctx.fillStyle = '#FEF08A';
  ctx.fillRect(config.length / 2 - 3, -config.width / 2 + 4, 3, 7);
  ctx.fillRect(config.length / 2 - 3, config.width / 2 - 11, 3, 7);

  // Tail / Brake Lights
  const isBraking = player.isBraking || player.handbrake;
  ctx.fillStyle = isBraking ? '#FF1E27' : '#991B1B';
  ctx.fillRect(-config.length / 2 - 2, -config.width / 2 + 4, 4, 8);
  ctx.fillRect(-config.length / 2 - 2, config.width / 2 - 12, 4, 8);

  // Reverse Lights
  if (player.isReversing) {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-config.length / 2 - 2, -3, 3, 6);
  }

  // Damage smoke if car health is low
  if (player.health < config.maxHealth * 0.35) {
    ctx.fillStyle = 'rgba(30, 41, 59, 0.6)';
    ctx.beginPath();
    ctx.arc(config.length / 2 - 10, (Math.random() - 0.5) * 12, 8 + Math.random() * 6, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function renderBuildings(
  ctx: CanvasRenderingContext2D,
  buildings: Building[],
  vl: number,
  vr: number,
  vt: number,
  vb: number
) {
  for (const b of buildings) {
    if (b.x + b.width < vl || b.x > vr || b.y + b.height < vt || b.y > vb) continue;

    // Building Drop Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(b.x + 10, b.y + 10, b.width, b.height);

    // Wall 3D Elevation Edge
    ctx.fillStyle = b.wallColor;
    ctx.fillRect(b.x, b.y, b.width, b.height);

    // Rooftop Surface
    const inset = Math.min(6, b.floors);
    ctx.fillStyle = b.roofColor;
    ctx.fillRect(b.x + inset, b.y + inset, b.width - inset * 2, b.height - inset * 2);

    // Rooftop AC Vents / Helipads
    if (b.category === 'skyscraper') {
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(b.x + b.width / 2 - 18, b.y + b.height / 2 - 18, 36, 36);

      // Helipad 'H'
      ctx.strokeStyle = '#FACC15';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(b.x + b.width / 2, b.y + b.height / 2, 14, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#FACC15';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('H', b.x + b.width / 2, b.y + b.height / 2);
    } else if (b.category === 'commercial') {
      // Skylight or solar panels
      ctx.fillStyle = '#0284C7';
      ctx.fillRect(b.x + 15, b.y + 15, b.width - 30, 20);
    }

    // Neon Trim Glow
    if (b.neonColor) {
      ctx.strokeStyle = b.neonColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(b.x + inset, b.y + inset, b.width - inset * 2, b.height - inset * 2);
    }
  }
}

function renderTrees(
  ctx: CanvasRenderingContext2D,
  trees: TreeObject[],
  vl: number,
  vr: number,
  vt: number,
  vb: number
) {
  for (const t of trees) {
    if (t.x + t.radius < vl || t.x - t.radius > vr || t.y + t.radius < vt || t.y - t.radius > vb) continue;

    // Tree Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(t.x + 5, t.y + 5, t.radius, 0, Math.PI * 2);
    ctx.fill();

    // Canopy
    ctx.fillStyle = t.color;
    ctx.beginPath();
    ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
    ctx.fill();

    // Canopy Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.arc(t.x - t.radius * 0.3, t.y - t.radius * 0.3, t.radius * 0.45, 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  vl: number,
  vr: number,
  vt: number,
  vb: number
) {
  ctx.save();
  for (const p of particles) {
    if (p.x < vl || p.x > vr || p.y < vt || p.y > vb) continue;

    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;

    if (p.type === 'smoke') {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === 'flame' || p.type === 'spark') {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === 'flash') {
      ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.8})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
  }
  ctx.restore();
}

function renderFloatingTexts(ctx: CanvasRenderingContext2D, texts: FloatingText[]) {
  ctx.save();
  for (const ft of texts) {
    const alpha = Math.min(1.0, ft.life / (ft.maxLife * 0.6));
    ctx.fillStyle = ft.color;
    ctx.globalAlpha = alpha;
    ctx.font = `bold ${ft.size}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.strokeText(ft.text, ft.x, ft.y);
    ctx.fillText(ft.text, ft.x, ft.y);
  }
  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
