import { TrafficCar, RoadSegment } from './types';

const TRAFFIC_COLORS = [
  '#F59E0B', // Taxi yellow
  '#FFFFFF', // White
  '#94A3B8', // Silver/Grey
  '#3B82F6', // Blue
  '#10B981', // Green
  '#6366F1', // Indigo
  '#71717A', // Graphite
  '#D97706', // Bronze
];

export class TrafficSystem {
  public cars: TrafficCar[] = [];
  private maxCars = 24;
  private roads: RoadSegment[];

  constructor(roads: RoadSegment[]) {
    this.roads = roads;
    this.initCars();
  }

  private initCars() {
    this.cars = [];
    for (let i = 0; i < this.maxCars; i++) {
      const road = this.roads[Math.floor(Math.random() * this.roads.length)];
      const car = this.createCar(i + 1, road);
      if (car) {
        this.cars.push(car);
      }
    }
  }

  private createCar(id: number, road: RoadSegment, nearX?: number, nearY?: number): TrafficCar | null {
    const isVertical = road.isVertical;
    const models: TrafficCar['model'][] = ['sedan', 'suv', 'cab', 'van', 'sports'];
    const model = models[Math.floor(Math.random() * models.length)];

    let width = 30;
    let length = 56;
    if (model === 'suv') { width = 34; length = 62; }
    if (model === 'van') { width = 34; length = 66; }
    if (model === 'cab') { width = 30; length = 56; }
    if (model === 'sports') { width = 32; length = 58; }

    const direction: 1 | -1 = Math.random() > 0.5 ? 1 : -1;
    // Position car in its proper lane based on direction
    const laneOffset = (road.width / 4) * (direction === 1 ? 1 : -1);

    let x = 0;
    let y = 0;
    let angle = 0;

    if (isVertical) {
      x = road.x + road.width / 2 + laneOffset;
      if (nearY !== undefined) {
        y = nearY + (Math.random() * 800 - 400);
      } else {
        y = Math.random() * road.height;
      }
      angle = direction === 1 ? Math.PI / 2 : -Math.PI / 2;
    } else {
      y = road.y + road.height / 2 + laneOffset;
      if (nearX !== undefined) {
        x = nearX + (Math.random() * 800 - 400);
      } else {
        x = Math.random() * road.width;
      }
      angle = direction === 1 ? 0 : Math.PI;
    }

    const baseSpeed = 160 + Math.random() * 100;
    const color = model === 'cab' ? '#FACC15' : TRAFFIC_COLORS[Math.floor(Math.random() * TRAFFIC_COLORS.length)];

    return {
      id,
      x,
      y,
      angle,
      speed: baseSpeed,
      targetSpeed: baseSpeed,
      width,
      length,
      color,
      model,
      laneId: `${road.id}_${direction}`,
      distanceAlongRoad: isVertical ? y : x,
      roadId: road.id,
      direction,
      isBraking: false,
    };
  }

  public update(dt: number, playerX: number, playerY: number) {
    const despawnDistance = 1800;

    for (let i = 0; i < this.cars.length; i++) {
      const car = this.cars[i];
      const road = this.roads.find((r) => r.id === car.roadId) || this.roads[0];

      // Check distance to player
      const dxToPlayer = car.x - playerX;
      const dyToPlayer = car.y - playerY;
      const distToPlayerSq = dxToPlayer * dxToPlayer + dyToPlayer * dyToPlayer;

      // Respawn if too far away from player
      if (distToPlayerSq > despawnDistance * despawnDistance) {
        // Pick a road near the player to spawn traffic ahead
        const nearRoads = this.roads.filter((r) => {
          if (r.isVertical) {
            return Math.abs(r.x + r.width / 2 - playerX) < 900;
          } else {
            return Math.abs(r.y + r.height / 2 - playerY) < 900;
          }
        });

        const targetRoad = nearRoads.length > 0 
          ? nearRoads[Math.floor(Math.random() * nearRoads.length)]
          : this.roads[Math.floor(Math.random() * this.roads.length)];

        const respawned = this.createCar(car.id, targetRoad, playerX, playerY);
        if (respawned) {
          this.cars[i] = respawned;
        }
        continue;
      }

      // Check collision / distance to cars ahead
      let shouldBrake = false;
      for (let j = 0; j < this.cars.length; j++) {
        if (i === j) continue;
        const other = this.cars[j];
        if (other.roadId === car.roadId && other.direction === car.direction) {
          // Same lane line
          const distAlong = road.isVertical 
            ? (other.y - car.y) * car.direction
            : (other.x - car.x) * car.direction;

          if (distAlong > 0 && distAlong < 120) {
            shouldBrake = true;
            break;
          }
        }
      }

      // Check distance to player car (don't ram player blindly)
      const distAlongToPlayer = road.isVertical
        ? (playerY - car.y) * car.direction
        : (playerX - car.x) * car.direction;
      const lateralDistToPlayer = road.isVertical
        ? Math.abs(playerX - car.x)
        : Math.abs(playerY - car.y);

      if (distAlongToPlayer > 0 && distAlongToPlayer < 100 && lateralDistToPlayer < 40) {
        shouldBrake = true;
      }

      car.isBraking = shouldBrake;

      // Adjust speed
      if (shouldBrake) {
        car.speed = Math.max(0, car.speed - 350 * dt);
      } else {
        car.speed = Math.min(car.targetSpeed, car.speed + 150 * dt);
      }

      // Move along road
      const vx = Math.cos(car.angle) * car.speed;
      const vy = Math.sin(car.angle) * car.speed;

      car.x += vx * dt;
      car.y += vy * dt;

      // Wrap around road bounds
      if (road.isVertical) {
        if (car.direction === 1 && car.y > road.height) {
          car.y = 0;
        } else if (car.direction === -1 && car.y < 0) {
          car.y = road.height;
        }
      } else {
        if (car.direction === 1 && car.x > road.width) {
          car.x = 0;
        } else if (car.direction === -1 && car.x < 0) {
          car.x = road.width;
        }
      }
    }
  }
}
