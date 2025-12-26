<script setup>
import MainLayout from './layouts/MainLayout.vue'
import TheAiAssistant from './components/TheAiAssistant.vue'
</script>

<template>
  <MainLayout />
  <TheAiAssistant />
</template>

<style>
/* Global styles are imported in main.js */

/* Initially hide scroll animation elements to prevent flash */
.mil-up,
.mil-up-instant {
    opacity: 0;
    pointer-events: none;
}
</style>
