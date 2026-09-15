import type { Elevator } from './types';

// Работа с очередью лифта. Чистые функции, мутируют elevator.queue.

/** Добавляет этаж в очередь лифта с учётом направления. Игнорирует дубликаты. */
export function addTarget(elevator: Elevator, floor: number): void {
  if (elevator.queue.includes(floor)) {
    return;
  }

  if (elevator.direction === 'idle' || elevator.queue.length === 0) {
    elevator.queue.push(floor);
    return;
  }

  const insertIndex = findInsertIndex(elevator, floor);

  if (insertIndex === -1) {
    elevator.queue.push(floor);
  } else {
    elevator.queue.splice(insertIndex, 0, floor);
  }
}

/** Удаляет этаж и все его дубликаты из очереди. */
export function removeTarget(elevator: Elevator, floor: number): void {
  elevator.queue = elevator.queue.filter((f) => f !== floor);
}

/** Проверяет, есть ли этаж в очереди. */
export function hasTarget(elevator: Elevator, floor: number): boolean {
  return elevator.queue.includes(floor);
}

// === Внутреннее ===

/**
 * Находит индекс для вставки этажа с учётом направления движения.
 * Возвращает -1, если этаж должен быть добавлен в конец.
 */
function findInsertIndex(elevator: Elevator, floor: number): number {
  const { queue, direction } = elevator;

  if (direction === 'up') {
    for (let i = 0; i < queue.length; i++) {
      if (queue[i] > floor) return i;
    }
    return -1;
  }

  if (direction === 'down') {
    for (let i = 0; i < queue.length; i++) {
      if (queue[i] < floor) return i;
    }
    return -1;
  }

  return -1;
}