<template>
  <div class="controls">
    <div class="controls__field">
      <label class="controls__label" for="algorithm-select">Алгоритм</label>
      <select
        id="algorithm-select"
        class="controls__select"
        :value="selectedAlgorithm"
        :disabled="isRunning"
        @change="onSelectChange"
      >
        <option
          v-for="algo in algorithms"
          :key="algo.id"
          :value="algo.id"
        >
          {{ algo.name }}
        </option>
      </select>
    </div>

    <div class="controls__buttons">
      <button
        class="btn btn--primary"
        :disabled="isRunning"
        @click="emit('run')"
      >
        <span class="btn__icon">▶</span>
        <span>{{ isRunning ? 'Идёт симуляция…' : 'Запустить сценарий' }}</span>
      </button>

      <button
        class="btn btn--ghost"
        :disabled="isRunning"
        @click="emit('reset')"
      >
        <span class="btn__icon">↺</span>
        <span>Сбросить</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Algorithm, AlgorithmId } from '@/domain/types';

defineProps<{
  algorithms: readonly Algorithm[];
  selectedAlgorithm: AlgorithmId;
  isRunning: boolean;
}>();

const emit = defineEmits<{
  'update:selectedAlgorithm': [id: AlgorithmId];
  run: [];
  reset: [];
}>();

const onSelectChange = (event: Event): void => {
  const target = event.target as HTMLSelectElement;
  emit('update:selectedAlgorithm', target.value as AlgorithmId);
};
</script>

<style scoped lang="scss">
.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
  padding: 12px 14px;
  background: rgba(15, 20, 35, 0.6);
  border: 1px solid rgba(100, 200, 255, 0.12);
  border-radius: 8px;

  &__field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;
    min-width: 220px;
  }

  &__label {
    font-size: 10px;
    color: #8892b0;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 500;
  }

  &__select {
    appearance: none;
    width: 100%;
    padding: 8px 32px 8px 12px;
    background-color: rgba(10, 14, 26, 0.9);
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path d='M0 0l5 6 5-6z' fill='%2300d4ff'/></svg>");
    background-repeat: no-repeat;
    background-position: right 10px center;
    border: 1px solid rgba(100, 200, 255, 0.25);
    border-radius: 4px;
    color: #e6f1ff;
    font-family: inherit;
    font-size: 13px;
    cursor: pointer;
    transition: border-color 0.15s, box-shadow 0.15s;

    &:hover:not(:disabled) {
      border-color: rgba(0, 212, 255, 0.55);
    }

    &:focus {
      outline: none;
      border-color: #00d4ff;
      box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.2);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    option {
      background: #0a0e1a;
      color: #e6f1ff;
    }
  }

  &__buttons {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 18px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.03em;
  cursor: pointer;
  border: 1px solid transparent;
  transition:
    border-color 0.15s,
    background 0.15s,
    color 0.15s,
    box-shadow 0.15s;

  &__icon {
    font-size: 10px;
    line-height: 1;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &--primary {
    background: linear-gradient(180deg, rgba(0, 212, 255, 0.18) 0%, rgba(0, 212, 255, 0.08) 100%);
    border-color: rgba(0, 212, 255, 0.55);
    color: #00d4ff;

    &:hover:not(:disabled) {
      background: linear-gradient(180deg, rgba(0, 212, 255, 0.28) 0%, rgba(0, 212, 255, 0.14) 100%);
      box-shadow: 0 0 14px rgba(0, 212, 255, 0.35);
    }
  }

  &--ghost {
    background: transparent;
    border-color: rgba(100, 200, 255, 0.2);
    color: #8892b0;

    &:hover:not(:disabled) {
      border-color: rgba(255, 140, 66, 0.5);
      color: #ff8c42;
      box-shadow: 0 0 10px rgba(255, 140, 66, 0.25);
    }
  }
}
</style>