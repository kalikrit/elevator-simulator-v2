import type { Scenario } from './types';

// Сценарии как данные. Никаких таймеров здесь нет.

export const DEFAULT_SCENARIO_ID = 'rushHour';

export const SCENARIOS: Record<string, Scenario> = {
  rushHour: {
    id: 'rushHour',
    name: 'Час-пик',
    steps: [
      // 1 пассажир с 1 этажа наверх с несколькими остановками.
      { from: 0, to: [8, 16, 24], timeMs: 0 },

      // Дальше 14 вызовов «сверху вниз» — плотным потоком.
      { from: 22, to: [0], timeMs: 1500 },
      { from: 12, to: [0], timeMs: 2500 },
      { from: 18, to: [0], timeMs: 3500 },
      { from: 5,  to: [0], timeMs: 4000 },
      { from: 20, to: [0], timeMs: 5500 },
      { from: 15, to: [0], timeMs: 6500 },
      { from: 9,  to: [0], timeMs: 7000 },
      { from: 24, to: [0], timeMs: 8500 },
      { from: 14, to: [0], timeMs: 9500 },
      { from: 7,  to: [0], timeMs: 11000 },
      { from: 21, to: [0], timeMs: 12500 },
      { from: 11, to: [0], timeMs: 13500 },
      { from: 17, to: [0], timeMs: 15000 },
      { from: 4,  to: [0], timeMs: 16000 },
    ],
  },
};

export function getScenario(id: string): Scenario {
  const scenario = SCENARIOS[id];
  if (!scenario) {
    throw new Error(`Scenario not found: ${id}`);
  }
  return scenario;
}