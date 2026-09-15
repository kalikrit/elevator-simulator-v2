import type { Ref } from 'vue';
import type {
  Elevator,
  Metrics,
  AlgorithmId,
  ElevatorConfig,
  TickEvent,
} from '@/domain/types';
import type { ElevatorSystem } from '@/domain/elevatorSystem';

// Мост между доменом и Vue. Единственное место, где они встречаются.

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
  config?: ElevatorConfig,
): UseElevatorSystemReturn {
  throw new Error('Not implemented: useElevatorSystem');
}