<template>
  <div class="sim">
    <header class="sim__header">
      <div class="sim__title">
        <span class="sim__title-mark">▣</span>
        <span class="sim__title-text">ELEVATOR SYSTEM</span>
        <span class="sim__title-version">v2</span>
      </div>

      <div class="sim__meta">
        <div class="sim__meta-item">
          <span class="sim__meta-label">Этажей</span>
          <span class="sim__meta-value">{{ floorsCount }}</span>
        </div>
        <div class="sim__meta-item">
          <span class="sim__meta-label">Лифтов</span>
          <span class="sim__meta-value">{{ elevators.length }}</span>
        </div>
        <div class="sim__meta-item">
          <span class="sim__meta-label">Активны</span>
          <span class="sim__meta-value">{{ activeCount }}</span>
        </div>
      </div>
    </header>

    <section class="sim__controls">
      <ControlsPanel
        :algorithms="algorithms"
        :selected-algorithm="algorithm"
        :is-running="isRunning"
        @update:selected-algorithm="handleAlgorithmChange"
        @run="handleRun"
        @reset="handleReset"
      />

      <AlgorithmDescription
        v-model:visible="descriptionVisible"
        :algorithm="currentAlgorithmInfo"
      />
    </section>

    <section class="sim__body">
      <div class="sim__floors">
        <Floors
          :floors="floors"
          :elevators="elevators"
          :active-calls="activeCalls"
          @call="handleCall"
        />
      </div>

      <div class="sim__metrics">
        <MetricsComparison :by-algorithm="byAlgorithm" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { useElevatorSystem } from '@/composables/useElevatorSystem';
import { useScenarioRunner } from '@/composables/useScenarioRunner';
import { getAllAlgorithms, getAlgorithm } from '@/domain/algorithms';
import { getScenario, DEFAULT_SCENARIO_ID } from '@/domain/scenarios';
import { DEFAULT_CONFIG } from '@/domain/config';
import type { AlgorithmId, Metrics } from '@/domain/types';
import ControlsPanel from './ControlsPanel.vue';
import AlgorithmDescription from './AlgorithmDescription.vue';
import Floors from './Floors.vue';
import MetricsComparison from './MetricsComparison.vue';

// === Система ===

const {
  elevators,
  algorithm,
  setAlgorithm,
  reset,
  requestTrip,
  onArrival,
  getSystem,
} = useElevatorSystem();

const { isRunning, lastMetrics, run, stop } = useScenarioRunner(getSystem());

// === Локальное состояние UI ===

const descriptionVisible = ref(true);
const activeCalls = reactive(new Set<number>());
const byAlgorithm = ref<Partial<Record<AlgorithmId, Metrics>>>({});

// === Производные данные ===

const floorsCount = DEFAULT_CONFIG.floors;

const floors = computed<number[]>(() =>
  Array.from({ length: floorsCount }, (_, i) => floorsCount - 1 - i),
);

const algorithms = getAllAlgorithms();

const currentAlgorithmInfo = computed(() => getAlgorithm(algorithm.value));

const activeCount = computed(
  () => elevators.value.filter((e) => e.isMoving).length,
);

// === Реакция на завершение сценария ===

watch(lastMetrics, (m) => {
  if (!m) return;
  byAlgorithm.value = { ...byAlgorithm.value, [m.algorithmId]: m };
});

// === Обработчики ===

const handleAlgorithmChange = (id: AlgorithmId): void => {
  setAlgorithm(id);
};

const handleRun = (): void => {
  run(getScenario(DEFAULT_SCENARIO_ID));
};

const handleReset = (): void => {
  stop();
  reset();
  activeCalls.clear();
  byAlgorithm.value = {};
};

const handleCall = (floor: number): void => {
  activeCalls.add(floor);
  requestTrip(floor, [0]);
};

// Отписка от событий прибытия не нужна — composable чистит listeners при unmount.
onArrival((event) => {
  activeCalls.delete(event.floor);
});
</script>

<style scoped lang="scss">
.sim {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100vh;
  padding: 14px;
  overflow: hidden;
  color: #e6f1ff;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background-color: #0a0e1a;
  background-image:
    linear-gradient(rgba(100, 200, 255, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(100, 200, 255, 0.025) 1px, transparent 1px);
  background-size: 40px 40px;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    padding: 10px 16px;
    background: rgba(15, 20, 35, 0.7);
    border: 1px solid rgba(100, 200, 255, 0.15);
    border-radius: 8px;
    flex-shrink: 0;
  }

  &__title {
    display: flex;
    align-items: baseline;
    gap: 10px;
    font-family: 'JetBrains Mono', 'Roboto Mono', ui-monospace, monospace;
  }

  &__title-mark {
    font-size: 16px;
    color: #00d4ff;
    text-shadow: 0 0 12px rgba(0, 212, 255, 0.6);
    animation: glow 2.4s ease-in-out infinite;
  }

  &__title-text {
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.18em;
    color: #00d4ff;
    text-shadow: 0 0 20px rgba(0, 212, 255, 0.35);
  }

  &__title-version {
    font-size: 10px;
    color: #4a5568;
    letter-spacing: 0.1em;
  }

  &__meta {
    display: flex;
    gap: 22px;
  }

  &__meta-item {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 1px;
  }

  &__meta-label {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #4a5568;
    font-weight: 500;
  }

  &__meta-value {
    font-family: 'JetBrains Mono', 'Roboto Mono', ui-monospace, monospace;
    font-size: 14px;
    font-weight: 600;
    color: #e6f1ff;
    line-height: 1.1;
  }

  &__controls {
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex-shrink: 0;
  }

  &__body {
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: 12px;
    flex: 1;
    min-height: 0;
  }

  &__floors {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  &__metrics {
    overflow-y: auto;
    min-height: 0;
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 212, 255, 0.25) transparent;

    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(0, 212, 255, 0.25);
      border-radius: 3px;
    }
  }
}

@media (max-width: 1000px) {
  .sim__body {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr auto;
  }
}

@keyframes glow {
  0%,
  100% {
    opacity: 1;
    text-shadow: 0 0 12px rgba(0, 212, 255, 0.6);
  }
  50% {
    opacity: 0.7;
    text-shadow: 0 0 6px rgba(0, 212, 255, 0.3);
  }
}
</style>