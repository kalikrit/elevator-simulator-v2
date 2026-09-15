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
  constructor(config: MetricsCollectorConfig) {
    throw new Error('Not implemented: MetricsCollector.constructor');
  }

  /** Сброс в исходное состояние. */
  reset(): void {
    throw new Error('Not implemented: MetricsCollector.reset');
  }

  /** Зафиксировать начало сценария. */
  onScenarioStart(now: number): void {
    throw new Error('Not implemented: MetricsCollector.onScenarioStart');
  }

  /** Зафиксировать момент вызова. */
  onCallMade(request: TripRequest): void {
    throw new Error('Not implemented: MetricsCollector.onCallMade');
  }

  /** Зафиксировать прибытие лифта на этаж вызова. */
  onElevatorArrived(elevator: Elevator, floor: number, now: number): void {
    throw new Error('Not implemented: MetricsCollector.onElevatorArrived');
  }

  /** Обновить пробег и остановки. Вызывается каждый tick. */
  onTick(elevators: readonly Elevator[], arrivedElevatorId: number | null): void {
    throw new Error('Not implemented: MetricsCollector.onTick');
  }

  /** Собрать текущий снапшот метрик. Чистый — не мутирует сборщик. */
  snapshot(algorithm: Algorithm): Metrics {
    throw new Error('Not implemented: MetricsCollector.snapshot');
  }
}