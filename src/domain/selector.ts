import type {
  Elevator,
  TripRequest,
  ElevatorConfig,
  AlgorithmId,
  SelectionStrategy,
} from './types';

// === Вспомогательные ===

/** Конвертирует waitTimeMs в секунды. */
function waitSec(config: ElevatorConfig): number {
  return config.waitTimeMs / 1000;
}

/** Максимальная цель из списка (худший случай). */
function maxTo(request: TripRequest): number {
  return Math.max(...request.to);
}

/** Сколько остановок из queue лежит между from и to (включительно). */
function stopsBetween(from: number, to: number, stops: readonly number[]): number {
  const lo = Math.min(from, to);
  const hi = Math.max(from, to);
  return stops.filter((s) => s >= lo && s <= hi).length;
}

// === Стратегии ===

/** Оценивает время до прибытия лифта за вызовом. */
export const nearestStrategy: SelectionStrategy = (elevator, request, config) => {
  const { currentFloor, direction, queue } = elevator;
  const wait = waitSec(config);

  // Свободный лифт — только путь до вызова.
  if (queue.length === 0) {
    return Math.abs(currentFloor - request.from);
  }

  // Едет в ту же сторону, вызов по пути.
  const goingUp = direction === 'up' && request.from >= currentFloor;
  const goingDown = direction === 'down' && request.from <= currentFloor;

  if (goingUp || goingDown) {
    const stops = stopsBetween(currentFloor, request.from, queue);
    return Math.abs(currentFloor - request.from) + stops * wait;
  }

  // Иначе: сначала доедет очередь, потом за вызовом.
  const lastTarget = queue[queue.length - 1];
  return (
    Math.abs(currentFloor - lastTarget) +
    Math.abs(lastTarget - request.from) +
    queue.length * wait
  );
};

/** Оценивает, когда лифт завершит все текущие поездки + новую. */
export const totalTimeStrategy: SelectionStrategy = (elevator, request, config) => {
  const wait = waitSec(config);
  let current = elevator.currentFloor;
  let total = 0;

  // Проходим всю очередь.
  for (const target of elevator.queue) {
    total += Math.abs(current - target);
    total += wait;
    current = target;
  }

  // Путь до вызова.
  total += Math.abs(current - request.from);
  current = request.from;

  // Путь до дальней цели (без стойки — это конец поездки).
  total += Math.abs(current - maxTo(request));

  return total;
};

/** Реестр стратегий. */
export const STRATEGIES: Record<AlgorithmId, SelectionStrategy> = {
  nearest: nearestStrategy,
  totalTime: totalTimeStrategy,
};

// === Выбор лифта ===

/** Выбирает лифт с минимальной оценкой. При равенстве — первый в списке. */
export function pickElevator(
  elevators: readonly Elevator[],
  request: TripRequest,
  config: ElevatorConfig,
  algorithm: AlgorithmId,
): Elevator | null {
  if (elevators.length === 0) return null;

  const strategy = STRATEGIES[algorithm];
  let best = elevators[0];
  let bestCost = strategy(best, request, config);

  for (let i = 1; i < elevators.length; i++) {
    const cost = strategy(elevators[i], request, config);
    if (cost < bestCost) {
      best = elevators[i];
      bestCost = cost;
    }
  }

  return best;
}