import type {
  Elevator,
  TripRequest,
  ElevatorConfig,
  AlgorithmId,
  SelectionStrategy,
} from './types';

// Алгоритмы выбора лифта. Стратегии — чистые функции.

/** Оценка «сколько времени лифт потратит, чтобы забрать вызов». */
export const nearestStrategy: SelectionStrategy = (elevator, request, config) => {
  throw new Error('Not implemented: nearestStrategy');
};

/** Оценка «когда лифт завершит все текущие поездки + новую». */
export const totalTimeStrategy: SelectionStrategy = (elevator, request, config) => {
  throw new Error('Not implemented: totalTimeStrategy');
};

/** Реестр стратегий. */
export const STRATEGIES: Record<AlgorithmId, SelectionStrategy> = {
  nearest: nearestStrategy,
  totalTime: totalTimeStrategy,
};

/** Выбирает лучший лифт под запрос. null — если лифтов нет. */
export function pickElevator(
  elevators: readonly Elevator[],
  request: TripRequest,
  config: ElevatorConfig,
  algorithm: AlgorithmId,
): Elevator | null {
  throw new Error('Not implemented: pickElevator');
}