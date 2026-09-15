import type {
  Metrics,
  Elevator,
  TripRequest,
  Algorithm,
} from './types';

// Сбор и агрегация метрик одного запуска сценария.

export interface MetricsCollectorConfig {
  readonly elevatorCount: number;
}

export class MetricsCollector {
  private readonly elevatorCount: number;
  private startTime = 0;
  private callTimes = new Map<number, number>();
  private waitTimes: number[] = [];
  private totalStops = 0;
  private totalDistance = 0;
  private lastPositions: number[];

  constructor(config: MetricsCollectorConfig) {
    this.elevatorCount = config.elevatorCount;
    this.lastPositions = new Array(config.elevatorCount).fill(0);
  }

  reset(): void {
    this.startTime = 0;
    this.callTimes.clear();
    this.waitTimes = [];
    this.totalStops = 0;
    this.totalDistance = 0;
    this.lastPositions = new Array(this.elevatorCount).fill(0);
  }

  onScenarioStart(now: number): void {
    this.startTime = now;
  }

  onCallMade(request: TripRequest): void {
    // Идемпотентно по этажу: повторный вызов не сбрасывает время ожидания.
    if (this.callTimes.has(request.from)) return;
    this.callTimes.set(request.from, request.requestedAt);
  }

  onElevatorArrived(elevator: Elevator, floor: number, now: number): void {
    this.totalStops++;

    const calledAt = this.callTimes.get(floor);
    if (calledAt === undefined) return;

    this.waitTimes.push((now - calledAt) / 1000);
    this.callTimes.delete(floor);
  }

  onTick(elevators: readonly Elevator[]): void {
    for (const elevator of elevators) {
      const last = this.lastPositions[elevator.id] ?? 0;
      this.totalDistance += Math.abs(elevator.currentFloor - last);
      this.lastPositions[elevator.id] = elevator.currentFloor;
    }
  }

  snapshot(algorithm: Algorithm, now: number): Metrics {
    const totalTime = (now - this.startTime) / 1000;
    const callsCount = this.waitTimes.length;

    const averageWaitTime = callsCount
      ? this.waitTimes.reduce((s, v) => s + v, 0) / callsCount
      : 0;

    const maxWaitTime = callsCount ? Math.max(...this.waitTimes) : 0;

    return {
      algorithmId: algorithm.id,
      algorithmName: algorithm.name,
      totalTime,
      averageWaitTime,
      maxWaitTime,
      totalDistance: this.totalDistance,
      totalStops: this.totalStops,
      callsCount,
      waitTimes: [...this.waitTimes],
    };
  }
}