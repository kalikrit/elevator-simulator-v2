<template>
  <div class="floor" :class="{ 'floor--ground': floor === 0 }">
    <div class="floor__number">{{ floor + 1 }}</div>

    <div class="floor__shafts">
      <div
        v-for="(elevator, index) in elevators"
        :key="index"
        class="shaft"
      >
        <div
          v-if="isElevatorHere(elevator)"
          class="elevator"
          :class="elevatorClass(elevator)"
        >
          <span class="elevator__arrow">{{ elevatorArrow(elevator) }}</span>
        </div>
      </div>
    </div>

    <div class="floor__call">
      <button
        v-if="floor !== 0"
        class="call-btn"
        :class="{ 'call-btn--active': isCallActive }"
        :disabled="isCallActive"
        :aria-label="`Вызвать лифт на ${floor + 1} этаж`"
        @click="emit('call', floor)"
      >
        ▼
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Elevator } from '@/domain/types';

const props = defineProps<{
  floor: number;
  elevators: readonly Elevator[];
  isCallActive: boolean;
}>();

const emit = defineEmits<{
  call: [floor: number];
}>();

const isElevatorHere = (elevator: Elevator): boolean =>
  Math.round(elevator.currentFloor) === props.floor;

const elevatorClass = (elevator: Elevator) => ({
  'elevator--idle': !elevator.isMoving && !elevator.isWaiting,
  'elevator--up': elevator.isMoving && elevator.direction === 'up',
  'elevator--down': elevator.isMoving && elevator.direction === 'down',
  'elevator--waiting': elevator.isWaiting,
});

const elevatorArrow = (elevator: Elevator): string => {
  if (elevator.isWaiting) return '⏸';
  if (!elevator.isMoving) return '·';
  return elevator.direction === 'up' ? '▲' : '▼';
};
</script>

<style scoped lang="scss">
.floor {
  display: grid;
  grid-template-columns: 36px 1fr 32px;
  align-items: center;
  gap: 8px;
  padding: 0 8px;
  min-height: 26px;
  background: rgba(15, 20, 35, 0.35);
  border-bottom: 1px solid rgba(100, 200, 255, 0.05);
  transition: background 0.15s;

  &:hover {
    background: rgba(20, 27, 45, 0.55);
  }

  &--ground {
    border-bottom-color: rgba(0, 212, 255, 0.25);
    background: rgba(0, 212, 255, 0.04);
  }

  &__number {
    font-family: 'JetBrains Mono', 'Roboto Mono', ui-monospace, monospace;
    font-size: 11px;
    font-weight: 500;
    color: #8892b0;
    text-align: right;
    letter-spacing: 0.05em;
    user-select: none;
  }

  &__shafts {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 4px;
    padding: 3px 0;
  }

  &__call {
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.shaft {
  position: relative;
  height: 18px;
  border-radius: 3px;
  background: rgba(10, 14, 26, 0.5);
  border: 1px solid rgba(100, 200, 255, 0.06);
}

.elevator {
  position: absolute;
  inset: 0;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'JetBrains Mono', 'Roboto Mono', ui-monospace, monospace;
  font-size: 10px;
  font-weight: 600;
  color: #0a0e1a;
  transition:
    background 0.25s ease,
    box-shadow 0.25s ease;

  &__arrow {
    line-height: 1;
    user-select: none;
  }

  &--idle {
    background: linear-gradient(180deg, #00d4ff 0%, #0090b0 100%);
    box-shadow: 0 0 10px rgba(0, 212, 255, 0.4);
  }

  &--up {
    background: linear-gradient(180deg, #a3ff12 0%, #6bb800 100%);
    box-shadow: 0 0 12px rgba(163, 255, 18, 0.5);
  }

  &--down {
    background: linear-gradient(180deg, #ff8c42 0%, #cc6622 100%);
    box-shadow: 0 0 12px rgba(255, 140, 66, 0.5);
  }

  &--waiting {
    background: linear-gradient(180deg, #ffd60a 0%, #ccac08 100%);
    box-shadow: 0 0 14px rgba(255, 214, 10, 0.55);
    animation: pulse 1.2s ease-in-out infinite;
  }
}

.call-btn {
  width: 26px;
  height: 22px;
  padding: 0;
  border: 1px solid rgba(100, 200, 255, 0.25);
  background: transparent;
  color: #8892b0;
  border-radius: 3px;
  font-size: 9px;
  line-height: 1;
  cursor: pointer;
  transition:
    border-color 0.15s,
    color 0.15s,
    box-shadow 0.15s;

  &:hover:not(:disabled) {
    border-color: #00d4ff;
    color: #00d4ff;
    box-shadow: 0 0 10px rgba(0, 212, 255, 0.4);
  }

  &:active:not(:disabled) {
    transform: scale(0.94);
  }

  &--active {
    border-color: #ffd60a;
    color: #ffd60a;
    box-shadow: 0 0 10px rgba(255, 214, 10, 0.5);
    animation: pulse 1.2s ease-in-out infinite;
    cursor: not-allowed;
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.55;
  }
}
</style>