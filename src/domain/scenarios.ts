import type { Scenario } from './types';

// Сценарии как данные. Никаких таймеров здесь нет.

export const DEFAULT_SCENARIO_ID = 'default';

export const SCENARIOS: Record<string, Scenario> = {
  default: {
    id: 'default',
    name: 'Смешанный поток',
    steps: [
      // Фаза B: с 1 этажа на разные этажи
      { from: 0, to: [3, 10, 17, 24], timeMs: 0 },
      // Фаза A: жители спускаются вниз
      { from: 20, to: [0], timeMs: 2000 },
      { from: 15, to: [0], timeMs: 3500 },
      { from: 8, to: [0], timeMs: 5000 },
      { from: 22, to: [0], timeMs: 7000 },
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