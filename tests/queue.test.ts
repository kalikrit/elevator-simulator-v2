import { describe, it, expect } from 'vitest';
import { addTarget, removeTarget, hasTarget } from '@/domain/queue';
import type { Elevator } from '@/domain/types';

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

describe('queue', () => {
  describe('addTarget', () => {
    it('добавляет этаж в пустую очередь', () => {
      const elevator = makeElevator();
      addTarget(elevator, 5);
      expect(elevator.queue).toEqual([5]);
    });

    it('не добавляет дубликат', () => {
      const elevator = makeElevator({ queue: [5] });
      addTarget(elevator, 5);
      expect(elevator.queue).toEqual([5]);
    });

    it('вставляет этаж по возрастанию при движении вверх', () => {
      const elevator = makeElevator({
        direction: 'up',
        currentFloor: 0,
        queue: [5, 10, 20],
      });
      addTarget(elevator, 15);
      expect(elevator.queue).toEqual([5, 10, 15, 20]);
    });

    it('вставляет этаж по убыванию при движении вниз', () => {
      const elevator = makeElevator({
        direction: 'down',
        currentFloor: 20,
        queue: [15, 10, 5],
      });
      addTarget(elevator, 12);
      expect(elevator.queue).toEqual([15, 12, 10, 5]);
    });

    it('добавляет в конец, если этаж дальше всех по направлению вверх', () => {
      const elevator = makeElevator({
        direction: 'up',
        currentFloor: 0,
        queue: [5, 10],
      });
      addTarget(elevator, 20);
      expect(elevator.queue).toEqual([5, 10, 20]);
    });

    it('добавляет в конец, если этаж ниже всех при движении вниз', () => {
      const elevator = makeElevator({
        direction: 'down',
        currentFloor: 20,
        queue: [15, 10],
      });
      addTarget(elevator, 5);
      expect(elevator.queue).toEqual([15, 10, 5]);
    });

    it('при движении вверх этаж ниже currentFloor попадает после верхних', () => {
      const elevator = makeElevator({
        direction: 'up',
        currentFloor: 7,
        queue: [17, 24],
      });

      addTarget(elevator, 0);

      expect(elevator.queue).toEqual([17, 24, 0]);
    });

    it('при движении вверх второй нижний этаж встаёт по убыванию', () => {
      const elevator = makeElevator({
        direction: 'up',
        currentFloor: 7,
        queue: [17, 24, 5],
      });

      addTarget(elevator, 3);

      expect(elevator.queue).toEqual([17, 24, 5, 3]);
    });

    it('при движении вниз этаж выше currentFloor попадает после нижних', () => {
      const elevator = makeElevator({
        direction: 'down',
        currentFloor: 20,
        queue: [15, 10],
      });

      addTarget(elevator, 25);

      expect(elevator.queue).toEqual([15, 10, 25]);
    });

    it('при движении вниз второй верхний этаж встаёт по возрастанию', () => {
      const elevator = makeElevator({
        direction: 'down',
        currentFloor: 20,
        queue: [15, 10, 25],
      });

      addTarget(elevator, 22);

      expect(elevator.queue).toEqual([15, 10, 22, 25]);
    });

    it('регресс: не разворачивает лифт вверх при добавлении нижнего этажа', () => {
      // Именно этот баг приводил к тому, что лифт на пути вверх
      // разворачивался вниз, получив вызов с этажа ниже.
      const elevator = makeElevator({
        direction: 'up',
        currentFloor: 5,
        queue: [17, 24],
      });

      addTarget(elevator, 0);

      // 0 должен идти ПОСЛЕ 17 и 24, а не в начало.
      expect(elevator.queue[0]).toBe(17);
      expect(elevator.queue).toEqual([17, 24, 0]);
    });    
  });

  describe('removeTarget', () => {
    it('удаляет этаж из очереди', () => {
      const elevator = makeElevator({ queue: [5, 10, 15] });
      removeTarget(elevator, 10);
      expect(elevator.queue).toEqual([5, 15]);
    });

    it('удаляет все дубликаты этажа', () => {
      const elevator = makeElevator({ queue: [5, 10, 10, 15, 10] });
      removeTarget(elevator, 10);
      expect(elevator.queue).toEqual([5, 15]);
    });

    it('ничего не делает, если этажа нет в очереди', () => {
      const elevator = makeElevator({ queue: [5, 15] });
      removeTarget(elevator, 10);
      expect(elevator.queue).toEqual([5, 15]);
    });
  });

  describe('hasTarget', () => {
    it('возвращает true, если этаж есть в очереди', () => {
      const elevator = makeElevator({ queue: [5, 10, 15] });
      expect(hasTarget(elevator, 10)).toBe(true);
    });

    it('возвращает false, если этажа нет', () => {
      const elevator = makeElevator({ queue: [5, 15] });
      expect(hasTarget(elevator, 10)).toBe(false);
    });
  });
});