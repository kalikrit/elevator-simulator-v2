import { describe, it, expect, beforeEach } from 'vitest';
import { ElevatorSystem } from '@/domain/elevatorSystem';
import { DEFAULT_CONFIG } from '@/domain/config';

const config = DEFAULT_CONFIG;

describe('ElevatorSystem', () => {
  let system: ElevatorSystem;

  beforeEach(() => {
    system = new ElevatorSystem(config);
  });

  describe('начальное состояние', () => {
    it('создаёт 4 лифта на 0 этаже', () => {
      const elevators = system.getElevators();
      expect(elevators).toHaveLength(4);
      for (const e of elevators) {
        expect(e.currentFloor).toBe(0);
        expect(e.isMoving).toBe(false);
        expect(e.isWaiting).toBe(false);
        expect(e.direction).toBe('idle');
        expect(e.queue).toEqual([]);
      }
    });

    it('isIdle = true', () => {
      expect(system.isIdle()).toBe(true);
    });

    it('алгоритм по умолчанию — nearest', () => {
      expect(system.getAlgorithm()).toBe('nearest');
    });
  });

  describe('requestTrip', () => {
    it('выбирает ближайший лифт и добавляет from и to в очередь', () => {
      system.requestTrip(5, [10], 0);

      const e0 = system.getElevators()[0];
      expect(e0.queue).toEqual([5, 10]);
      expect(e0.targetFloor).toBe(5);
      expect(e0.direction).toBe('up');
      expect(e0.isMoving).toBe(true);
    });

    it('не добавляет from, если лифт уже на этом этаже', () => {
      system.requestTrip(0, [10], 0);

      const e0 = system.getElevators()[0];
      expect(e0.queue).toEqual([10]);
      expect(e0.targetFloor).toBe(10);
    });

    it('добавляет несколько целей (фаза B)', () => {
      system.requestTrip(0, [3, 10, 17, 24], 0);

      const e0 = system.getElevators()[0];
      expect(e0.queue).toEqual([3, 10, 17, 24]);
      expect(e0.targetFloor).toBe(3);
    });

    it('isIdle = false после вызова', () => {
      system.requestTrip(5, [10], 0);
      expect(system.isIdle()).toBe(false);
    });
  });

  describe('tick — движение', () => {
    it('двигает лифт к цели со скоростью 1 этаж/сек', () => {
      system.requestTrip(5, [10], 0);
      system.tick(3000, 3000);

      expect(system.getElevators()[0].currentFloor).toBe(3);
    });

    it('возвращает событие при прибытии на from', () => {
      system.requestTrip(5, [10], 0);
      const result = system.tick(5000, 5000);

      expect(result.arrivals).toEqual([{ elevatorId: 0, floor: 5 }]);
      expect(system.getElevators()[0].currentFloor).toBe(5);
    });
  });

  describe('tick — ожидание', () => {
    it('после прибытия лифт ждёт 5 секунд', () => {
      system.requestTrip(5, [10], 0);
      system.tick(5000, 5000);

      const e0 = system.getElevators()[0];
      expect(e0.isWaiting).toBe(true);
      expect(e0.isMoving).toBe(false);
      expect(e0.targetFloor).toBe(10);
      expect(e0.waitTimeRemaining).toBe(config.waitTimeMs);
    });

    it('после ожидания лифт едет к следующей цели', () => {
      system.requestTrip(5, [10], 0);
      system.tick(5000, 5000); // прибыл на 5, ждёт
      system.tick(5000, 10000); // отждал

      const e0 = system.getElevators()[0];
      expect(e0.isWaiting).toBe(false);
      expect(e0.isMoving).toBe(true);
    });
  });

  describe('tick — завершение поездки', () => {
    it('достигает конечной цели и очищает очередь', () => {
      system.requestTrip(5, [10], 0);
      system.tick(5000, 5000); // прибыл на 5
      system.tick(5000, 10000); // отждал
      const result = system.tick(5000, 15000); // прибыл на 10

      expect(result.arrivals).toEqual([{ elevatorId: 0, floor: 10 }]);
      const e0 = system.getElevators()[0];
      expect(e0.queue).toEqual([]);
      expect(e0.currentFloor).toBe(10);
    });
  });

  describe('setAlgorithm', () => {
    it('меняет алгоритм', () => {
      system.setAlgorithm('totalTime');
      expect(system.getAlgorithm()).toBe('totalTime');
    });

    it('влияет на выбор лифта', () => {
      // Загружаем лифт 0 длинной очередью
      const e0 = system.getElevators()[0];
      e0.queue.push(10, 15, 20);
      e0.targetFloor = 10;
      e0.direction = 'up';
      e0.isMoving = true;

      // Все остальные свободны и на 0
      system.setAlgorithm('totalTime');
      system.requestTrip(5, [8], 0);

      // totalTime должен выбрать свободный лифт, а не загруженный
      const e1 = system.getElevators()[1];
      expect(e1.isMoving).toBe(true);
    });
  });

  describe('reset', () => {
    it('возвращает всё в исходное состояние', () => {
      system.requestTrip(5, [10], 0);
      system.tick(3000, 3000);

      system.reset();

      const e0 = system.getElevators()[0];
      expect(e0.currentFloor).toBe(0);
      expect(e0.queue).toEqual([]);
      expect(e0.isMoving).toBe(false);
      expect(e0.isWaiting).toBe(false);
      expect(e0.direction).toBe('idle');
      expect(system.isIdle()).toBe(true);
    });
  });

  describe('getMetrics', () => {
    it('после startScenario и вызова возвращает callsCount', () => {
      system.startScenario(0);
      system.requestTrip(5, [10], 100);
      system.tick(5000, 5100);

      const metrics = system.getMetrics(5100);

      expect(metrics.callsCount).toBe(1);
      expect(metrics.totalStops).toBe(1);
    });
  });
});