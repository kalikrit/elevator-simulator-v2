import type {
  Elevator,
  ElevatorConfig,
  Metrics,
  AlgorithmId,
  TickResult,
} from './types';

// Ядро. Оркестрирует queue, selector, metrics. Ноль зависимостей от Vue.

export class ElevatorSystem {
  constructor(config: ElevatorConfig) {
    throw new Error('Not implemented: ElevatorSystem.constructor');
  }

  /** Принять заявку. Выбирает лифт, кладёт цели в очередь. */
  requestTrip(from: number, to: number[], now: number): void {
    throw new Error('Not implemented: ElevatorSystem.requestTrip');
  }

  /** Продвинуть симуляцию на deltaMs. Возвращает события. */
  tick(deltaMs: number, now: number): TickResult {
    throw new Error('Not implemented: ElevatorSystem.tick');
  }

  /** Сменить алгоритм. */
  setAlgorithm(id: AlgorithmId): void {
    throw new Error('Not implemented: ElevatorSystem.setAlgorithm');
  }

  /** Полный сброс: лифты на 0 этаж, метрики очищены. */
  reset(): void {
    throw new Error('Not implemented: ElevatorSystem.reset');
  }

  /** Начать новый сценарий (сброс метрик + запись startTime). */
  startScenario(now: number): void {
    throw new Error('Not implemented: ElevatorSystem.startScenario');
  }

  /** Текущее состояние лифтов. Только для чтения. */
  getElevators(): readonly Elevator[] {
    throw new Error('Not implemented: ElevatorSystem.getElevators');
  }

  /** Текущие метрики. */
  getMetrics(): Metrics {
    throw new Error('Not implemented: ElevatorSystem.getMetrics');
  }

  /** Активный алгоритм. */
  getAlgorithm(): AlgorithmId {
    throw new Error('Not implemented: ElevatorSystem.getAlgorithm');
  }

  /** Все лифты стоят и очередь пуста. */
  isIdle(): boolean {
    throw new Error('Not implemented: ElevatorSystem.isIdle');
  }
}