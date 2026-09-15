import { ref } from 'vue';
import type { Ref } from 'vue';
import type { Metrics, Scenario } from '@/domain/types';
import type { ElevatorSystem } from '@/domain/elevatorSystem';
import { getAlgorithm } from '@/domain/algorithms';

export interface UseScenarioRunnerReturn {
  isRunning: Ref<boolean>;
  lastMetrics: Ref<Metrics | null>;
  run: (scenario: Scenario) => void;
  stop: () => void;
}

export function useScenarioRunner(
  system: ElevatorSystem,
): UseScenarioRunnerReturn {
  const isRunning = ref(false);
  const lastMetrics = ref<Metrics | null>(null);

  let timeouts: number[] = [];
  let checkInterval: number | null = null;

  const clearTimers = () => {
    for (const id of timeouts) clearTimeout(id);
    timeouts = [];
    if (checkInterval !== null) {
      clearInterval(checkInterval);
      checkInterval = null;
    }
  };

  const stop = (): void => {
    clearTimers();
    isRunning.value = false;
  };

  const publishMetrics = (): void => {
    const now = performance.now();
    lastMetrics.value = system.getMetrics(now);
    isRunning.value = false;
    clearTimers();
  };

  const run = (scenario: Scenario): void => {
    stop();
    system.reset();
    system.startScenario(performance.now());

    isRunning.value = true;
    const startTs = performance.now();

    for (const step of scenario.steps) {
      const id = window.setTimeout(() => {
        system.requestTrip(step.from, step.to, performance.now());
      }, step.timeMs);
      timeouts.push(id);
    }

    // Проверяем завершение каждые 500 мс.
    checkInterval = window.setInterval(() => {
      if (!isRunning.value) return;
      if (system.isIdle()) {
        publishMetrics();
      }
      // Защита от бесконечного зависания: если прошло > 5 минут — стоп.
      if (performance.now() - startTs > 5 * 60 * 1000) {
        publishMetrics();
      }
    }, 500);
  };

  return {
    isRunning,
    lastMetrics,
    run,
    stop,
  };
}