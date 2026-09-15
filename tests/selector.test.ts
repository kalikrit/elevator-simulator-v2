import { describe, it, expect } from 'vitest';
import { nearestStrategy, totalTimeStrategy, pickElevator } from '@/domain/selector';
import { DEFAULT_CONFIG } from '@/domain/config';
import type { Elevator, TripRequest } from '@/domain/types';

function makeElevator(overrides: Partial<Elevator> = {}): Elevator {
  return {
    id: 0,
    currentFloor: 0,
    targetFloor: null,
    direction: 'idle',
    isMoving: false,
    isWaiting: false,
    waitTimeRemaining: 0,
    queue: [],
    ...overrides,
  };
}

function makeRequest(from: number, to: number[]): TripRequest {
  return { from, to, requestedAt: 0 };
}

const config = DEFAULT_CONFIG; // floors: 25, count: 4, speed: 1, waitTime: 5000

describe('nearestStrategy', () => {
  it('оценивает путь до свободного лифта как расстояние', () => {
    const elevator = makeElevator({ currentFloor: 3, direction: 'idle' });
    const request = makeRequest(10, [0]);

    const cost = nearestStrategy(elevator, request, config);

    // |3 - 10| = 7
    expect(cost).toBe(7);
  });

  it('не учитывает путь после забора (в отличие от totalTime)', () => {
    const elevator = makeElevator({ currentFloor: 3, direction: 'idle' });

    const cost1 = nearestStrategy(elevator, makeRequest(10, [0]), config);
    const cost2 = nearestStrategy(elevator, makeRequest(10, [20]), config);

    // Цена не зависит от того, куда ехать после забора
    expect(cost1).toBe(cost2);
  });

  it('учитывает очередь лифта', () => {
    const elevator = makeElevator({
      currentFloor: 0,
      direction: 'up',
      queue: [10, 15],
    });

    const cost = nearestStrategy(elevator, makeRequest(20, [0]), config);

    // Лифт сначала доедет очередь 0 -> 10 -> 15, потом 15 -> 20
    // 10 + 5 + 5 = 20, + 2 стойки по 5с = 10 => 30
    expect(cost).toBe(30);
  });
});

describe('totalTimeStrategy', () => {
  it('учитывает путь от вызова до цели', () => {
    const elevator = makeElevator({ currentFloor: 0, direction: 'idle' });

    const cost1 = totalTimeStrategy(elevator, makeRequest(5, [10]), config);
    const cost2 = totalTimeStrategy(elevator, makeRequest(5, [20]), config);

    // 5 + 5 = 10 vs 5 + 15 = 20
    expect(cost1).toBe(10);
    expect(cost2).toBe(20);
  });

  it('учитывает очередь лифта', () => {
    const elevator = makeElevator({
      currentFloor: 0,
      direction: 'up',
      queue: [10, 15],
    });

    const cost = totalTimeStrategy(elevator, makeRequest(20, [25]), config);

    // Очередь: 0 -> 10 (10, +5) -> 15 (5, +5) -> 20 (5) -> 25 (5)
    // = 10 + 5 + 5 + 5 + 5 + 5 = 35
    expect(cost).toBe(35);
  });

  it('при нескольких целях берёт максимальное расстояние (худший случай)', () => {
    const elevator = makeElevator({ currentFloor: 0, direction: 'idle' });

    const costMultiple = totalTimeStrategy(
      elevator,
      makeRequest(5, [10, 15, 20]),
      config,
    );
    const costMax = totalTimeStrategy(elevator, makeRequest(5, [20]), config);

    // Обе должны дать одинаковую оценку — потому что берём max(to)
    expect(costMultiple).toBe(costMax);
  });
});

describe('pickElevator', () => {
  it('возвращает null на пустом списке', () => {
    const result = pickElevator([], makeRequest(5, [0]), config, 'nearest');
    expect(result).toBeNull();
  });

  it('выбирает единственный лифт', () => {
    const elevator = makeElevator({ id: 0 });
    const result = pickElevator([elevator], makeRequest(5, [0]), config, 'nearest');
    expect(result).toBe(elevator);
  });

  it('выбирает ближайший лифт (nearest)', () => {
    const e1 = makeElevator({ id: 0, currentFloor: 10 });
    const e2 = makeElevator({ id: 1, currentFloor: 3 });
    const e3 = makeElevator({ id: 2, currentFloor: 20 });

    const result = pickElevator([e1, e2, e3], makeRequest(5, [0]), config, 'nearest');

    // |10-5|=5, |3-5|=2, |20-5|=15 -> выбираем e2
    expect(result).toBe(e2);
  });

  it('при равенстве возвращает первый в списке', () => {
    const e1 = makeElevator({ id: 0, currentFloor: 5 });
    const e2 = makeElevator({ id: 1, currentFloor: 5 });

    const result = pickElevator([e1, e2], makeRequest(5, [0]), config, 'nearest');

    expect(result).toBe(e1);
  });

  it('totalTime может выбрать не ближайший, а менее загруженный лифт', () => {
    // e1 рядом, но с длинной очередью
    const e1 = makeElevator({
      id: 0,
      currentFloor: 4,
      direction: 'up',
      queue: [10, 15, 20],
    });
    // e2 дальше, но свободен
    const e2 = makeElevator({ id: 1, currentFloor: 0, direction: 'idle' });

    const result = pickElevator([e1, e2], makeRequest(5, [8]), config, 'totalTime');

    // e1: 4 -> 10 -> 15 -> 20 (16+5+5+5=31) -> 5 (15+5) -> 8 (3) = 54
    // e2: 0 -> 5 (5) -> 8 (3) = 8
    expect(result).toBe(e2);
  });
});