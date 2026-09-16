<template>
  <div class="floors">
    <Floor
      v-for="floor in floors"
      :key="floor"
      :floor="floor"
      :elevators="elevators"
      :is-call-active="activeCalls.has(floor)"
      @call="emit('call', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import type { Elevator } from '@/domain/types';
import Floor from './Floor.vue';

defineProps<{
  floors: readonly number[];
  elevators: readonly Elevator[];
  activeCalls: ReadonlySet<number>;
}>();

const emit = defineEmits<{
  call: [floor: number];
}>();
</script>

<style scoped lang="scss">
.floors {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  border-radius: 8px;
  border: 1px solid rgba(100, 200, 255, 0.12);
  background: rgba(10, 14, 26, 0.4);
  box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.3);
  flex: 1;
  min-height: 0;

  /* Тонкий скроллбар в техно-стиле */
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 212, 255, 0.25) transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 212, 255, 0.25);
    border-radius: 3px;
    &:hover {
      background: rgba(0, 212, 255, 0.45);
    }
  }
}
</style>