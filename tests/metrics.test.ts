import { describe, it, expect, beforeEach } from 'vitest';
import { MetricsCollector } from '@/domain/metrics';
import { ALGORITHMS } from '@/domain/algorithms';
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

function makeRequest(from: number, to: number[], requestedAt: number): TripRequest {
  return { from, to, requestedAt };
}

const algorithm = ALGORITHMS.nearest;

describe('MetricsCollector', () => {
  let collector: MetricsCollector;

  beforeEach(() => {
    collector = new MetricsCollector({ elevatorCount: 4 });
  });

  describe('начальное состояние', () => {
    it('снапшот без данных возвращает нули', () => {
      const snapshot = collector.snapshot(algorithm, 0);

      expect(snapshot.totalTime).toBe(0);
      expect(snapshot.averageWaitTime).toBe(0);
      expect(snapshot.maxWaitTime).toBe(0);
      expect(snapshot.totalDistance).toBe(0);
      expect(snapshot.totalStops).toBe(0);
      expect(snapshot.callsCount).toBe(0);
      expect(snapshot.waitTimes).toEqual([]);
      expect(snapshot.algorithmId).toBe('nearest');
      expect(snapshot.algorithmName).toBe(algorithm.name);
    });
  });

  describe('totalTime', () => {
    it('считает время от onScenarioStart до snapshot (в секундах)', () => {
      collector.onScenarioStart(0);

      const snapshot = collector.snapshot(algorithm, 12500);

      expect(snapshot.totalTime).toBe(12.5);
    });
  });

  describe('wait time', () => {
    it('считает ожидание как разницу между вызовом и прибытием', () => {
      collector.onScenarioStart(0);
      collector.onCallMade(makeRequest(5, [0], 1000));
      collector.onElevatorArrived(makeElevator(), 5, 4500);

      const snapshot = collector.snapshot(algorithm, 5000);

      expect(snapshot.waitTimes).toEqual([3.5]);
      expect(snapshot.callsCount).toBe(1);
    });

    it('игнорирует повторный вызов на тот же этаж', () => {
      collector.onScenarioStart(0);
      collector.onCallMade(makeRequest(5, [0], 1000));
      collector.onCallMade(makeRequest(5, [0], 2000)); // второй раз
      collector.onElevatorArrived(makeElevator(), 5, 4000);

      const snapshot = collector.snapshot(algorithm, 5000);

      // Ожидание = 4000 - 1000 = 3000ms = 3s, не 2000ms
      expect(snapshot.waitTimes).toEqual([3]);
    });

    it('игнорирует прибытие без предшествующего вызова', () => {
      collector.onScenarioStart(0);
      collector.onElevatorArrived(makeElevator(), 5, 4000);

      const snapshot = collector.snapshot(algorithm, 5000);

      expect(snapshot.waitTimes).toEqual([]);
      expect(snapshot.callsCount).toBe(0);
    });

    it('обрабатывает несколько вызовов на разных этажах', () => {
      collector.onScenarioStart(0);
      collector.onCallMade(makeRequest(5, [0], 0));
      collector.onCallMade(makeRequest(10, [0], 0));
      collector.onElevatorArrived(makeElevator(), 5, 2000);
      collector.onElevatorArrived(makeElevator(), 10, 4000);

      const snapshot = collector.snapshot(algorithm, 5000);

      expect(snapshot.waitTimes).toEqual([2, 4]);
      expect(snapshot.averageWaitTime).toBe(3);
      expect(snapshot.maxWaitTime).toBe(4);
      expect(snapshot.callsCount).toBe(2);
    });
  });

  describe('totalDistance', () => {
    it('накапливает пройденное расстояние по тикам', () => {
      collector.onScenarioStart(0);
      const e1 = makeElevator({ id: 0, currentFloor: 0 });
      const e2 = makeElevator({ id: 1, currentFloor: 0 });

      collector.onTick([e1, e2]);
      e1.currentFloor = 3;
      e2.currentFloor = 5;
      collector.onTick([e1, e2]);
      e1.currentFloor = 7;
      collector.onTick([e1, e2]);

      const snapshot = collector.snapshot(algorithm, 0);

      // e1: 0 -> 3 -> 7 = 3 + 4 = 7
      // e2: 0 -> 5 -> 5 = 5 + 0 = 5
      expect(snapshot.totalDistance).toBe(12);
    });
  });

  describe('totalStops', () => {
    it('увеличивается на каждом прибытии', () => {
      collector.onScenarioStart(0);
      collector.onElevatorArrived(makeElevator(), 5, 1000);
      collector.onElevatorArrived(makeElevator(), 10, 2000);
      collector.onElevatorArrived(makeElevator(), 15, 3000);

      const snapshot = collector.snapshot(algorithm, 0);

      expect(snapshot.totalStops).toBe(3);
    });
  });

  describe('reset', () => {
    it('сбрасывает всё состояние', () => {
      collector.onScenarioStart(0);
      collector.onCallMade(makeRequest(5, [0], 0));
      collector.onElevatorArrived(makeElevator(), 5, 1000);
      collector.onTick([makeElevator({ currentFloor: 5 })]);

      collector.reset();

      const snapshot = collector.snapshot(algorithm, 0);

      expect(snapshot.totalTime).toBe(0);
      expect(snapshot.waitTimes).toEqual([]);
      expect(snapshot.totalDistance).toBe(0);
      expect(snapshot.totalStops).toBe(0);
      expect(snapshot.callsCount).toBe(0);
    });
  });

  describe('snapshot — чистый', () => {
    it('повторный вызов даёт тот же результат', () => {
      collector.onScenarioStart(0);
      collector.onCallMade(makeRequest(5, [0], 0));
      collector.onElevatorArrived(makeElevator(), 5, 3000);

      const s1 = collector.snapshot(algorithm, 5000);
      const s2 = collector.snapshot(algorithm, 5000);

      expect(s1).toEqual(s2);
    });
  });
});