<template>
  <ElevatorSimulator />
</template>

<script setup lang="ts">
import ElevatorSimulator from './components/ElevatorSimulator.vue';
</script>

<style>
* {
  box-sizing: border-box;
}

html,
body,
#app {
  margin: 0;
  padding: 0;
  height: 100%;
  background: #0a0e1a;
}

body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>