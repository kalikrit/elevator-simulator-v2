import { ref } from 'vue';
import type { Ref } from 'vue';
import type { Metrics, Scenario } from '@/domain/types';
import type { UseElevatorSystemReturn } from './useElevatorSystem';

export interface UseScenarioRunnerReturn {
  isRunning: Ref<boolean>;
  lastMetrics: Ref<Metrics | null>;
  run: (scenario: Scenario) => void;
  stop: () => void;
}

/** Максимальная длительность сценария в виртуальных мс (5 минут). */
const MAX_SCENARIO_MS = 5 * 60 * 1000;

export function useScenarioRunner(
  api: UseElevatorSystemReturn,
): UseScenarioRunnerReturn {
  const isRunning = ref(false);
  const lastMetrics = ref<Metrics | null>(null);

  let currentStepIndex = 0;
  let scenario: Scenario | null = null;
  let unsubscribeTick: (() => void) | null = null;
  let startSimTime = 0;

  const stop = (): void => {
    if (unsubscribeTick) {
      unsubscribeTick();
      unsubscribeTick = null;
    }
    scenario = null;
    currentStepIndex = 0;
    isRunning.value = false;
  };

  const publishMetrics = (): void => {
    lastMetrics.value = api.getSystem().getMetrics(api.getSimTime());
    stop();
  };

  const onTick = (simTime: number): void => {
    if (!scenario || !isRunning.value) return;

    // Запускаем все шаги, время которых уже наступило.
    while (
      currentStepIndex < scenario.steps.length &&
      simTime >= scenario.steps[currentStepIndex].timeMs
    ) {
      const step = scenario.steps[currentStepIndex];
      api.requestTrip(step.from, step.to);
      currentStepIndex++;
    }

    const allStepsFired = currentStepIndex >= scenario.steps.length;
    const idle = api.getSystem().isIdle();

    if (allStepsFired && idle) {
      publishMetrics();
      return;
    }

    // Защита от зависания по виртуальному времени.
    if (simTime - startSimTime > MAX_SCENARIO_MS) {
      publishMetrics();
    }
  };

  const run = (s: Scenario): void => {
    stop();
    api.reset();
    api.startScenario();

    scenario = s;
    currentStepIndex = 0;
    startSimTime = api.getSimTime();
    isRunning.value = true;

    unsubscribeTick = api.onAfterTick(onTick);
  };

  return {
    isRunning,
    lastMetrics,
    run,
    stop,
  };
}