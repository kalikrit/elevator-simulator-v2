import type {
  Elevator,
  ElevatorConfig,
  Metrics,
  AlgorithmId,
  TickResult,
  TickEvent,
} from './types';
import { addTarget, removeTarget } from './queue';
import { pickElevator } from './selector';
import { MetricsCollector } from './metrics';
import { getAlgorithm } from './algorithms';

export class ElevatorSystem {
  private readonly config: ElevatorConfig;
  private readonly elevators: Elevator[];
  private readonly metrics: MetricsCollector;
  private algorithm: AlgorithmId = 'nearest';
  private wasIdle = true;

  constructor(config: ElevatorConfig) {
    this.config = config;
    this.elevators = Array.from({ length: config.count }, (_, i) => ({
      id: i,
      currentFloor: 0,
      targetFloor: null,
      direction: 'idle',
      isMoving: false,
      isWaiting: false,
      waitTimeRemaining: 0,
      queue: [],
    }));
    this.metrics = new MetricsCollector({ elevatorCount: config.count });
  }

  requestTrip(from: number, to: number[], now: number): void {
    const request = { from, to, requestedAt: now };
    const elevator = pickElevator(
      this.elevators,
      request,
      this.config,
      this.algorithm,
    );
    if (!elevator) return;

    this.metrics.onCallMade(request);

    // Лифт уже на этаже вызова — фиксируем мгновенное прибытие.
    // Иначе ожидание запишется, когда лифт случайно вернётся сюда.
    if (elevator.currentFloor === from) {
      this.metrics.onElevatorArrived(elevator, from, now);
    } else {
      addTarget(elevator, from);
    }

    for (const target of to) {
      addTarget(elevator, target);
    }

    this.updateTargetAndDirection(elevator);
  }

  tick(deltaMs: number, now: number): TickResult {
    const arrivals: TickEvent[] = [];
    const deltaSeconds = deltaMs / 1000;

    for (const elevator of this.elevators) {
      this.tickElevator(elevator, deltaSeconds, deltaMs, now, arrivals);
    }

    this.metrics.onTick(this.elevators);

    const idle = this.isIdle();
    const justFinished = idle && !this.wasIdle;
    this.wasIdle = idle;

    return { arrivals, justFinished };
  }

  private tickElevator(
    elevator: Elevator,
    deltaSeconds: number,
    deltaMs: number,
    now: number,
    arrivals: TickEvent[],
  ): void {
    // === Ожидание ===
    if (elevator.isWaiting) {
      elevator.waitTimeRemaining -= deltaMs;
      if (elevator.waitTimeRemaining <= 0) {
        elevator.isWaiting = false;
        elevator.waitTimeRemaining = 0;
        this.updateTargetAndDirection(elevator);
      }
      return;
    }

    // === Пустая очередь — лифт останавливается там, где он есть ===
    if (elevator.queue.length === 0) {
      elevator.isMoving = false;
      elevator.isWaiting = false;
      elevator.direction = 'idle';
      elevator.targetFloor = null;
      return;
    }

    // === Установка цели, если её нет ===
    if (elevator.targetFloor === null) {
      this.updateTargetAndDirection(elevator);
    }

    const target = elevator.targetFloor;
    if (target === null) return;

    // === Движение ===
    const dir = Math.sign(target - elevator.currentFloor);
    if (dir === 0) {
      this.handleArrival(elevator, now, arrivals);
      return;
    }

    const step = this.config.speedFloorsPerSec * deltaSeconds * dir;
    const newFloor = elevator.currentFloor + step;

    const reached = dir > 0 ? newFloor >= target : newFloor <= target;
    if (reached) {
      elevator.currentFloor = target;
      this.handleArrival(elevator, now, arrivals);
    } else {
      elevator.currentFloor = newFloor;
    }
  }

  private handleArrival(
    elevator: Elevator,
    now: number,
    arrivals: TickEvent[],
  ): void {
    const floor = elevator.currentFloor;
    removeTarget(elevator, floor);

    arrivals.push({ elevatorId: elevator.id, floor });
    this.metrics.onElevatorArrived(elevator, floor, now);

    if (elevator.queue.length > 0) {
      elevator.targetFloor = elevator.queue[0];
      elevator.isWaiting = true;
      elevator.waitTimeRemaining = this.config.waitTimeMs;
      elevator.isMoving = false;
      elevator.direction = this.directionTo(elevator, elevator.targetFloor);
    } else {
      elevator.targetFloor = null;
      elevator.isMoving = false;
      elevator.isWaiting = false;
      elevator.direction = 'idle';
    }
  }

  private updateTargetAndDirection(elevator: Elevator): void {
    if (elevator.queue.length === 0) return;

    elevator.targetFloor = elevator.queue[0];
    elevator.isMoving = true;
    elevator.direction = this.directionTo(elevator, elevator.targetFloor);
  }

  private directionTo(elevator: Elevator, floor: number): Elevator['direction'] {
    if (floor > elevator.currentFloor) return 'up';
    if (floor < elevator.currentFloor) return 'down';
    return 'idle';
  }

  setAlgorithm(id: AlgorithmId): void {
    this.algorithm = id;
  }

  reset(): void {
    for (const elevator of this.elevators) {
      elevator.currentFloor = 0;
      elevator.targetFloor = null;
      elevator.direction = 'idle';
      elevator.isMoving = false;
      elevator.isWaiting = false;
      elevator.waitTimeRemaining = 0;
      elevator.queue = [];
    }
    this.metrics.reset();
    this.wasIdle = true;
  }

  startScenario(now: number): void {
    this.metrics.reset();
    this.metrics.onScenarioStart(now);
  }

  getElevators(): readonly Elevator[] {
    return this.elevators;
  }

  getMetrics(now: number): Metrics {
    return this.metrics.snapshot(getAlgorithm(this.algorithm), now);
  }

  getAlgorithm(): AlgorithmId {
    return this.algorithm;
  }

  isIdle(): boolean {
    return this.elevators.every(
      (e) => !e.isMoving && !e.isWaiting && e.queue.length === 0,
    );
  }
}