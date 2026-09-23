import { ref, shallowRef, onMounted, onUnmounted } from 'vue';
import type { Ref, ShallowRef } from 'vue';
import type {
  Elevator,
  Metrics,
  AlgorithmId,
  ElevatorConfig,
  TickEvent,
} from '@/domain/types';
import { ElevatorSystem } from '@/domain/elevatorSystem';
import { DEFAULT_CONFIG } from '@/domain/config';

/** Фиксированный шаг симуляции (мс). ~62.5 FPS. */
const FIXED_STEP_MS = 16;

export interface UseElevatorSystemReturn {
  elevators: Ref<readonly Elevator[]>;
  metrics: Ref<Metrics>;
  algorithm: Ref<AlgorithmId>;
  isIdle: Ref<boolean>;

  requestTrip: (from: number, to: number[]) => void;
  setAlgorithm: (id: AlgorithmId) => void;
  reset: () => void;
  startScenario: () => void;

  onArrival: (cb: (event: TickEvent) => void) => () => void;
  onAfterTick: (cb: (simTime: number) => void) => () => void;

  getSystem: () => ElevatorSystem;
  getSimTime: () => number;
}

export function useElevatorSystem(
  config: ElevatorConfig = DEFAULT_CONFIG,
): UseElevatorSystemReturn {
  const system = new ElevatorSystem(config);

  const elevators = shallowRef<readonly Elevator[]>(system.getElevators()) as ShallowRef<
    readonly Elevator[]
  >;
  const metrics = ref<Metrics>(system.getMetrics(0));
  const algorithm = ref<AlgorithmId>(system.getAlgorithm());
  const isIdle = ref<boolean>(system.isIdle());

  const arrivalListeners = new Set<(event: TickEvent) => void>();
  const afterTickListeners = new Set<(simTime: number) => void>();

  let rafId: number | null = null;
  let lastTs = 0;
  let accumulator = 0;
  let simTime = 0;

  const loop = (ts: number) => {
    const realDelta = ts - lastTs;
    lastTs = ts;

    // Ограничиваем максимальный шаг, чтобы после паузы вкладки
    // не «догонять» симуляцию рывком.
    accumulator += Math.min(realDelta, 250);

    let anyTick = false;

    while (accumulator >= FIXED_STEP_MS) {
      simTime += FIXED_STEP_MS;
      const result = system.tick(FIXED_STEP_MS, simTime);

      for (const event of result.arrivals) {
        for (const listener of arrivalListeners) listener(event);
      }
      for (const listener of afterTickListeners) listener(simTime);

      accumulator -= FIXED_STEP_MS;
      anyTick = true;
    }

    if (anyTick) {
      elevators.value = [...system.getElevators()];
      metrics.value = system.getMetrics(simTime);
      isIdle.value = system.isIdle();
    }

    rafId = requestAnimationFrame(loop);
  };

  onMounted(() => {
    lastTs = performance.now();
    accumulator = 0;
    simTime = 0;
    rafId = requestAnimationFrame(loop);
  });

  onUnmounted(() => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    arrivalListeners.clear();
    afterTickListeners.clear();
  });

  const requestTrip = (from: number, to: number[]): void => {
    system.requestTrip(from, to, simTime);
  };

  const setAlgorithm = (id: AlgorithmId): void => {
    system.setAlgorithm(id);
    algorithm.value = id;
  };

  const reset = (): void => {
    system.reset();
    simTime = 0;
    accumulator = 0;
    elevators.value = [...system.getElevators()];
    metrics.value = system.getMetrics(0);
    isIdle.value = system.isIdle();
  };

  const startScenario = (): void => {
    system.startScenario(simTime);
  };

  const onArrival = (cb: (event: TickEvent) => void): (() => void) => {
    arrivalListeners.add(cb);
    return () => arrivalListeners.delete(cb);
  };

  const onAfterTick = (cb: (simTime: number) => void): (() => void) => {
    afterTickListeners.add(cb);
    return () => afterTickListeners.delete(cb);
  };

  const getSystem = (): ElevatorSystem => system;
  const getSimTime = (): number => simTime;

  return {
    elevators,
    metrics,
    algorithm,
    isIdle,
    requestTrip,
    setAlgorithm,
    reset,
    startScenario,
    onArrival,
    onAfterTick,
    getSystem,
    getSimTime,
  };
}