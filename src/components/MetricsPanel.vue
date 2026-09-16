<template>
  <div class="metrics">
    <div v-if="!metrics" class="metrics__empty">
      <span class="metrics__empty-icon">∅</span>
      <span>Нет данных</span>
    </div>

    <template v-else>
      <div class="metrics__grid">
        <div
          v-for="item in items"
          :key="item.label"
          class="metric"
        >
          <div class="metric__label">{{ item.label }}</div>
          <div class="metric__value">
            {{ item.value }}
            <span v-if="item.unit" class="metric__unit">{{ item.unit }}</span>
          </div>
        </div>
      </div>

      <div v-if="metrics.waitTimes.length" class="metrics__waits">
        <div class="metrics__waits-label">Ожидания, с</div>
        <div class="metrics__waits-values">
          <span
            v-for="(t, i) in metrics.waitTimes"
            :key="i"
            class="wait-chip"
          >
            {{ t.toFixed(1) }}
          </span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Metrics } from '@/domain/types';

const props = defineProps<{
  metrics: Metrics | null;
}>();

interface MetricItem {
  label: string;
  value: string;
  unit?: string;
}

const items = computed<MetricItem[]>(() => {
  if (!props.metrics) return [];
  const m = props.metrics;
  return [
    { label: 'Время', value: m.totalTime.toFixed(1), unit: 'с' },
    { label: 'Ср. ожид.', value: m.averageWaitTime.toFixed(1), unit: 'с' },
    { label: 'Макс. ожид.', value: m.maxWaitTime.toFixed(1), unit: 'с' },
    { label: 'Пробег', value: m.totalDistance.toFixed(0), unit: 'эт.' },
    { label: 'Остановки', value: String(m.totalStops) },
    { label: 'Вызовов', value: String(m.callsCount) },
  ];
});
</script>

<style scoped lang="scss">
.metrics {
  display: flex;
  flex-direction: column;
  gap: 10px;

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px 12px;
    color: #4a5568;
    font-size: 12px;
    letter-spacing: 0.05em;
    gap: 4px;
  }

  &__empty-icon {
    font-size: 20px;
    color: rgba(100, 200, 255, 0.25);
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
  }

  &__waits {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding-top: 8px;
    border-top: 1px solid rgba(100, 200, 255, 0.08);
  }

  &__waits-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #8892b0;
  }

  &__waits-values {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
}

.metric {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px 8px;
  background: rgba(10, 14, 26, 0.5);
  border: 1px solid rgba(100, 200, 255, 0.08);
  border-radius: 4px;

  &__label {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #8892b0;
    font-weight: 500;
  }

  &__value {
    font-family: 'JetBrains Mono', 'Roboto Mono', ui-monospace, monospace;
    font-size: 15px;
    font-weight: 600;
    color: #00d4ff;
    line-height: 1.1;
  }

  &__unit {
    font-size: 10px;
    color: #4a90b8;
    margin-left: 2px;
    font-weight: 500;
  }
}

.wait-chip {
  font-family: 'JetBrains Mono', 'Roboto Mono', ui-monospace, monospace;
  font-size: 10px;
  padding: 2px 6px;
  background: rgba(0, 212, 255, 0.08);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 3px;
  color: #8892b0;
  line-height: 1.2;
}
</style>