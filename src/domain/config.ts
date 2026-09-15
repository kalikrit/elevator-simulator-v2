import type { ElevatorConfig } from './types';

// Конфигурация мира по умолчанию. Все магические числа живут здесь.
export const DEFAULT_CONFIG: ElevatorConfig = {
  floors: 25,
  count: 4,
  speedFloorsPerSec: 1,
  waitTimeMs: 5000,
};