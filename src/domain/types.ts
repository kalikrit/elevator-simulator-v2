// Словарь предметной области. Только типы, ноль логики.

export type Direction = 'up' | 'down' | 'idle';
export type AlgorithmId = 'nearest' | 'totalTime';

export interface Elevator {
  readonly id: number;
  currentFloor: number;
  targetFloor: number | null;
  direction: Direction;
  isMoving: boolean;
  isWaiting: boolean;
  waitTimeRemaining: number;
  queue: number[];
}

export interface TripRequest {
  readonly from: number;
  readonly to: number[];
  readonly requestedAt: number;
}

export interface ElevatorConfig {
  readonly floors: number;
  readonly count: number;
  readonly speedFloorsPerSec: number;
  readonly waitTimeMs: number;
}

export interface ScenarioStep {
  readonly from: number;
  readonly to: number[];
  readonly timeMs: number;
}

export interface Scenario {
  readonly id: string;
  readonly name: string;
  readonly steps: ScenarioStep[];
}

export interface Algorithm {
  readonly id: AlgorithmId;
  readonly name: string;
  readonly description: string;
}

export interface Metrics {
  readonly algorithmId: AlgorithmId;
  readonly algorithmName: string;
  readonly totalTime: number;
  readonly averageWaitTime: number;
  readonly maxWaitTime: number;
  readonly totalDistance: number;
  readonly totalStops: number;
  readonly callsCount: number;
  readonly waitTimes: number[];
}

export interface TickEvent {
  readonly elevatorId: number;
  readonly floor: number;
}

export interface TickResult {
  readonly arrivals: TickEvent[];
  readonly justFinished: boolean;
}

export type SelectionStrategy = (
  elevator: Elevator,
  request: TripRequest,
  config: ElevatorConfig,
) => number;