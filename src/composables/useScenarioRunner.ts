import type { Ref } from 'vue';
import type { Metrics, Scenario } from '@/domain/types';
import type { ElevatorSystem } from '@/domain/elevatorSystem';

// Запуск сценария по таймерам. Отдельная ответственность от симуляции.

export interface UseScenarioRunnerReturn {
  isRunning: Ref<boolean>;
  lastMetrics: Ref<Metrics | null>;
  run: (scenario: Scenario) => void;
  stop: () => void;
}

export function useScenarioRunner(
  system: ElevatorSystem,
): UseScenarioRunnerReturn {
  throw new Error('Not implemented: useScenarioRunner');
}