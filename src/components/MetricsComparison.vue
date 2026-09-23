<template>
  <div class="comparison">
    <div class="comparison__head">
      <div class="comparison__title">Сравнение</div>
      <div v-if="hasAnyData" class="comparison__hint">
        <span class="comparison__hint-dot"></span>
        Лучший результат подсвечен
      </div>
    </div>

    <div v-if="!hasAnyData" class="comparison__empty">
      <span class="comparison__empty-icon">∅</span>
      <span>Запустите сценарий, чтобы увидеть метрики</span>
    </div>

    <table v-else class="comparison__table">
      <thead>
        <tr>
          <th class="comparison__th comparison__th--metric"></th>
          <th
            v-for="col in columns"
            :key="col.id"
            class="comparison__th"
            :class="{ 'comparison__th--missing': !col.metrics }"
          >
            <div class="algorithm-name">{{ col.name }}</div>
            <div v-if="!col.metrics" class="algorithm-empty">—</div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in rows"
          :key="row.key"
          class="comparison__row"
        >
          <td class="comparison__label">
            <span class="comparison__label-text">{{ row.label }}</span>
            <span v-if="row.unit" class="comparison__label-unit">{{ row.unit }}</span>
          </td>
          <td
            v-for="col in columns"
            :key="col.id"
            class="comparison__cell"
            :class="{
              'comparison__cell--best': col.metrics && isBest(row, col),
              'comparison__cell--missing': !col.metrics,
            }"
          >
            <template v-if="col.metrics">
              <span class="comparison__value">
                {{ row.format(col.metrics) }}
              </span>
              <span
                v-if="col.metrics && isBest(row, col) && hasMultipleData"
                class="comparison__best-mark"
                aria-label="Лучший результат"
              >▲</span>
            </template>
            <span v-else class="comparison__dash">—</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Metrics, AlgorithmId, Algorithm } from '@/domain/types';
import { getAllAlgorithms } from '@/domain/algorithms';

const props = defineProps<{
  byAlgorithm: Partial<Record<AlgorithmId, Metrics>>;
}>();

interface Column {
  id: AlgorithmId;
  name: string;
  metrics: Metrics | null;
}

interface Row {
  key: string;
  label: string;
  unit: string;
  getValue: (m: Metrics) => number;
  format: (m: Metrics) => string;
  lowerIsBetter: boolean;
}

const columns = computed<Column[]>(() => {
  const algos: Algorithm[] = getAllAlgorithms();
  return algos.map((a) => ({
    id: a.id,
    name: a.name,
    metrics: props.byAlgorithm[a.id] ?? null,
  }));
});

const rows: Row[] = [
  {
    key: 'totalTime',
    label: 'Общее время',
    unit: 'с',
    getValue: (m) => m.totalTime,
    format: (m) => m.totalTime.toFixed(2),
    lowerIsBetter: true,
  },
  {
    key: 'averageWaitTime',
    label: 'Среднее ожидание',
    unit: 'с',
    getValue: (m) => m.averageWaitTime,
    format: (m) => m.averageWaitTime.toFixed(2),
    lowerIsBetter: true,
  },
  {
    key: 'maxWaitTime',
    label: 'Макс. ожидание',
    unit: 'с',
    getValue: (m) => m.maxWaitTime,
    format: (m) => m.maxWaitTime.toFixed(2),
    lowerIsBetter: true,
  },
  {
    key: 'totalDistance',
    label: 'Пробег',
    unit: 'эт.',
    getValue: (m) => m.totalDistance,
    format: (m) => m.totalDistance.toFixed(0),
    lowerIsBetter: true,
  },
  {
    key: 'totalStops',
    label: 'Остановки',
    unit: '',
    getValue: (m) => m.totalStops,
    format: (m) => String(m.totalStops),
    lowerIsBetter: true,
  },
  {
    key: 'callsCount',
    label: 'Вызовов',
    unit: '',
    getValue: (m) => m.callsCount,
    format: (m) => String(m.callsCount),
    lowerIsBetter: false,
  },
];

const hasAnyData = computed(() =>
  columns.value.some((c) => c.metrics !== null),
);

const hasMultipleData = computed(
  () => columns.value.filter((c) => c.metrics !== null).length > 1,
);

function isBest(row: Row, col: Column): boolean {
  if (!col.metrics || !hasMultipleData.value) return false;

  const value = row.getValue(col.metrics);
  const others = columns.value
    .filter((c) => c.metrics !== null && c.id !== col.id)
    .map((c) => row.getValue(c.metrics!));

  if (others.length === 0) return false;

  return row.lowerIsBetter
    ? value < Math.min(...others)
    : value > Math.max(...others);
}
</script>

<style scoped lang="scss">
.comparison {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 14px;
  background: rgba(15, 20, 35, 0.6);
  border: 1px solid rgba(100, 200, 255, 0.12);
  border-radius: 8px;

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  &__title {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #8892b0;
    font-weight: 500;
  }

  &__hint {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 10px;
    color: #4a5568;
    letter-spacing: 0.03em;
  }

  &__hint-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #a3ff12;
    box-shadow: 0 0 6px rgba(163, 255, 18, 0.6);
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 24px 12px;
    color: #4a5568;
    font-size: 12px;
    letter-spacing: 0.05em;
  }

  &__empty-icon {
    font-size: 22px;
    color: rgba(100, 200, 255, 0.25);
  }

  &__table {
    width: 100%;
    border-collapse: collapse;
  }

  &__th {
    text-align: right;
    padding: 6px 10px;
    border-bottom: 1px solid rgba(100, 200, 255, 0.15);
    font-weight: 500;
    vertical-align: bottom;

    &--metric {
      text-align: left;
      width: 40%;
    }

    &--missing {
      opacity: 0.5;
    }
  }

  &__row {
    &:not(:last-child) .comparison__label,
    &:not(:last-child) .comparison__cell {
      border-bottom: 1px solid rgba(100, 200, 255, 0.06);
    }
  }

  &__label {
    padding: 7px 10px 7px 0;
    font-size: 12px;
    color: #8892b0;
    letter-spacing: 0.02em;
    text-align: left;
  }

  &__label-unit {
    color: #4a5568;
    font-size: 10px;
    margin-left: 4px;
  }

  &__cell {
    padding: 7px 10px;
    text-align: right;
    font-family: 'JetBrains Mono', 'Roboto Mono', ui-monospace, monospace;
    font-size: 13px;
    font-weight: 600;
    color: #e6f1ff;
    transition: background 0.15s;

    &--best {
      color: #a3ff12;
      background: rgba(163, 255, 18, 0.06);
    }

    &--missing {
      color: #2d3748;
    }
  }

  &__value {
    display: inline-block;
  }

  &__best-mark {
    font-size: 8px;
    color: #a3ff12;
    margin-left: 4px;
    vertical-align: middle;
  }

  &__dash {
    color: #2d3748;
  }
}

.algorithm-name {
  font-size: 11px;
  color: #00d4ff;
  letter-spacing: 0.02em;
  text-transform: none;
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 600;
}

.algorithm-empty {
  font-size: 10px;
  color: #4a5568;
  font-weight: 400;
  margin-top: 2px;
}
</style>