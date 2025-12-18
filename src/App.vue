<script setup>
import MainLayout from './layouts/MainLayout.vue'
</script>

<template>
  <MainLayout />
</template>

<style>
/* Global styles are imported in main.js */

/* Initially hide scroll animation elements to prevent flash */
.mil-up {
    opacity: 0;
    pointer-events: none;
}
</style>
