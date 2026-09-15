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

  getSystem: () => ElevatorSystem;
}

export function useElevatorSystem(
  config: ElevatorConfig = DEFAULT_CONFIG,
): UseElevatorSystemReturn {
  const system = new ElevatorSystem(config);

  // shallowRef + ручная замена массива — быстрее, чем глубокий reactive
  // для 60 FPS. Мы всё равно каждый кадр заменяем ссылку целиком.
  const elevators = shallowRef<readonly Elevator[]>(system.getElevators()) as ShallowRef<
    readonly Elevator[]
  >;
  const metrics = ref<Metrics>(system.getMetrics(0));
  const algorithm = ref<AlgorithmId>(system.getAlgorithm());
  const isIdle = ref<boolean>(system.isIdle());

  // Подписчики на события прибытия. Локальный массив — никаких модульных утечек.
  const arrivalListeners = new Set<(event: TickEvent) => void>();

  let rafId: number | null = null;
  let lastTs = 0;

  const loop = (ts: number) => {
    const deltaMs = ts - lastTs;
    lastTs = ts;

    const result = system.tick(deltaMs, ts);

    // Синхронизация реактивного состояния.
    // Мутируем лифты in-place (они reactive через shallowRef-массив),
    // а ссылку меняем, чтобы Vue заметил изменения для v-for.
    elevators.value = [...system.getElevators()];
    metrics.value = system.getMetrics(ts);
    isIdle.value = system.isIdle();

    // Публикуем события.
    for (const event of result.arrivals) {
      for (const listener of arrivalListeners) {
        listener(event);
      }
    }

    rafId = requestAnimationFrame(loop);
  };

  onMounted(() => {
    lastTs = performance.now();
    rafId = requestAnimationFrame(loop);
  });

  onUnmounted(() => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    arrivalListeners.clear();
  });

  // === Публичный API ===

  const requestTrip = (from: number, to: number[]): void => {
    system.requestTrip(from, to, performance.now());
  };

  const setAlgorithm = (id: AlgorithmId): void => {
    system.setAlgorithm(id);
    algorithm.value = id;
  };

  const reset = (): void => {
    system.reset();
    elevators.value = [...system.getElevators()];
    metrics.value = system.getMetrics(performance.now());
    isIdle.value = system.isIdle();
  };

  const startScenario = (): void => {
    system.startScenario(performance.now());
  };

  const onArrival = (cb: (event: TickEvent) => void): (() => void) => {
    arrivalListeners.add(cb);
    return () => {
      arrivalListeners.delete(cb);
    };
  };

  const getSystem = (): ElevatorSystem => system;

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
    getSystem,
  };
}