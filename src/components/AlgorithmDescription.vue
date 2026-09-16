<template>
  <div class="algo-desc">
    <button
      class="algo-desc__toggle"
      :aria-expanded="visible"
      :title="visible ? 'Скрыть описание' : 'Показать описание'"
      @click="emit('update:visible', !visible)"
    >
      <span class="algo-desc__chevron" :class="{ 'algo-desc__chevron--open': visible }">
        ▸
      </span>
      <span class="algo-desc__title">Как работает алгоритм</span>
    </button>

    <Transition name="expand">
      <div v-if="visible" class="algo-desc__body">
        <div class="algo-desc__name">{{ algorithm.name }}</div>
        <div class="algo-desc__text">{{ algorithm.description }}</div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { Algorithm } from '@/domain/types';

defineProps<{
  algorithm: Algorithm;
  visible: boolean;
}>();

const emit = defineEmits<{
  'update:visible': [visible: boolean];
}>();
</script>

<style scoped lang="scss">
.algo-desc {
  background: rgba(15, 20, 35, 0.6);
  border: 1px solid rgba(100, 200, 255, 0.12);
  border-radius: 8px;
  overflow: hidden;

  &__toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 8px 12px;
    background: transparent;
    border: none;
    color: #8892b0;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    cursor: pointer;
    text-align: left;
    transition: color 0.15s, background 0.15s;

    &:hover {
      color: #00d4ff;
      background: rgba(0, 212, 255, 0.04);
    }
  }

  &__chevron {
    display: inline-block;
    font-size: 10px;
    transition: transform 0.2s ease;
    color: #00d4ff;

    &--open {
      transform: rotate(90deg);
    }
  }

  &__title {
    font-family: 'Inter', system-ui, sans-serif;
  }

  &__body {
    padding: 0 14px 12px 32px;
    border-left: 2px solid rgba(0, 212, 255, 0.4);
    margin: 0 0 12px 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__name {
    color: #e6f1ff;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  &__text {
    color: #8892b0;
    font-size: 12px;
    line-height: 1.55;
  }
}

/* Плавное раскрытие */
.expand-enter-active,
.expand-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>