<template>
  <div style="padding: 20px; font-family: monospace;">
    <h1>Elevator Simulator — smoke test</h1>

    <div style="margin-bottom: 20px;">
      <button @click="handleRun" :disabled="isRunning">
        {{ isRunning ? 'Идёт...' : 'Запустить сценарий' }}
      </button>
      <button @click="handleReset" :disabled="isRunning">Сбросить</button>
    </div>

    <h2>Лифты</h2>
    <div v-for="e in elevators" :key="e.id">
      #{{ e.id }}: этаж {{ e.currentFloor.toFixed(2) }},
      цель {{ e.targetFloor ?? '—' }},
      {{ e.direction }},
      {{ e.isMoving ? 'едет' : e.isWaiting ? 'ждёт' : 'стоит' }},
      очередь [{{ e.queue.join(', ') }}]
    </div>

    <h2>Метрики</h2>
    <div v-if="lastMetrics">
      <div>Время: {{ lastMetrics.totalTime.toFixed(2) }} с</div>
      <div>Среднее ожидание: {{ lastMetrics.averageWaitTime.toFixed(2) }} с</div>
      <div>Макс. ожидание: {{ lastMetrics.maxWaitTime.toFixed(2) }} с</div>
      <div>Пробег: {{ lastMetrics.totalDistance.toFixed(1) }} эт.</div>
      <div>Остановок: {{ lastMetrics.totalStops }}</div>
      <div>Вызовов: {{ lastMetrics.callsCount }}</div>
    </div>
    <div v-else>—</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useElevatorSystem } from '@/composables/useElevatorSystem';
import { useScenarioRunner } from '@/composables/useScenarioRunner';
import { getScenario, DEFAULT_SCENARIO_ID } from '@/domain/scenarios';

const { elevators, getSystem } = useElevatorSystem();
const { isRunning, lastMetrics, run, stop } = useScenarioRunner(getSystem());

const scenario = computed(() => getScenario(DEFAULT_SCENARIO_ID));

const handleRun = () => {
  run(scenario.value);
};

const handleReset = () => {
  stop();
  getSystem().reset();
};
</script>