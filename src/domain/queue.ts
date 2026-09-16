import type { Elevator } from './types';

// Работа с очередью лифта. Чистые функции, мутируют elevator.queue.
//
// Очередь всегда состоит из двух сегментов:
//   direction = 'up':   [этажи >= currentFloor ↑] + [этажи < currentFloor ↓]
//   direction = 'down': [этажи <= currentFloor ↓] + [этажи > currentFloor ↑]
// Это классический SCAN-подход: лифт сначала доезжает до конца направления,
// потом разворачивается.

/** Добавляет этаж в очередь лифта с учётом направления. Игнорирует дубликаты. */
export function addTarget(elevator: Elevator, floor: number): void {
  if (elevator.queue.includes(floor)) return;

  if (elevator.direction === 'idle' || elevator.queue.length === 0) {
    elevator.queue.push(floor);
    return;
  }

  const insertIndex =
    elevator.direction === 'up'
      ? findInsertIndexGoingUp(elevator, floor)
      : findInsertIndexGoingDown(elevator, floor);

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

function findInsertIndexGoingUp(elevator: Elevator, floor: number): number {
  const { queue, currentFloor } = elevator;

  if (floor >= currentFloor) {
    // Верхний сегмент: [>= currentFloor] по возрастанию.
    // Ищем первый этаж строго больше floor.
    for (let i = 0; i < queue.length; i++) {
      if (queue[i] >= currentFloor && queue[i] > floor) return i;
    }
    // Больше нет — вставляем перед началом нижнего сегмента.
    for (let i = 0; i < queue.length; i++) {
      if (queue[i] < currentFloor) return i;
    }
    return -1;
  }

  // Нижний сегмент: [< currentFloor] по убыванию.
  // Ищем первый этаж строго меньше floor.
  for (let i = 0; i < queue.length; i++) {
    if (queue[i] < currentFloor && queue[i] < floor) return i;
  }
  return -1;
}

function findInsertIndexGoingDown(elevator: Elevator, floor: number): number {
  const { queue, currentFloor } = elevator;

  if (floor <= currentFloor) {
    // Нижний сегмент: [<= currentFloor] по убыванию.
    // Ищем первый этаж строго меньше floor.
    for (let i = 0; i < queue.length; i++) {
      if (queue[i] <= currentFloor && queue[i] < floor) return i;
    }
    // Меньше нет — вставляем перед началом верхнего сегмента.
    for (let i = 0; i < queue.length; i++) {
      if (queue[i] > currentFloor) return i;
    }
    return -1;
  }

  // Верхний сегмент: [> currentFloor] по возрастанию.
  // Ищем первый этаж строго больше floor.
  for (let i = 0; i < queue.length; i++) {
    if (queue[i] > currentFloor && queue[i] > floor) return i;
  }
  return -1;
}