import type { Elevator } from './types';

// Работа с очередью лифта. Чистые функции, мутируют elevator.queue.

/** Добавляет этаж в очередь лифта с учётом направления. Игнорирует дубликаты. */
export function addTarget(elevator: Elevator, floor: number): void {
  throw new Error('Not implemented: addTarget');
}

/** Удаляет этаж и все его дубликаты из очереди. */
export function removeTarget(elevator: Elevator, floor: number): void {
  throw new Error('Not implemented: removeTarget');
}

/** Проверяет, есть ли этаж в очереди. */
export function hasTarget(elevator: Elevator, floor: number): boolean {
  throw new Error('Not implemented: hasTarget');
}