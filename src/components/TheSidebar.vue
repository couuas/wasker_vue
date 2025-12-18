<script setup>
import { RouterLink } from 'vue-router'
import { useAppStore } from '../stores/app'

const appStore = useAppStore()
</script>

<template>
  <div class="mil-menu-part">
    <router-link to="/" class="mil-logo">
      <!-- text logo -->
      <span>wa</span>
    </router-link>
    <div class="mil-menu-panel">
      <nav class="mil-main-menu" :class="{ 'mil-active': appStore.isMenuOpen }">
        <ul id="swupMenu">
          <router-link to="/" custom v-slot="{ href, navigate, isExactActive }">
            <li :class="{ 'mil-current': isExactActive }" @click="appStore.closeMenu">
              <a :href="href" @click="navigate" :class="{ 'mil-active': isExactActive }">
                <i class="fal fa-home"></i><span>Home</span>
              </a>
            </li>
          </router-link>
          
          <router-link to="/portfolio" custom v-slot="{ href, navigate, isActive }">
            <li :class="{ 'mil-current': isActive }" @click="appStore.closeMenu">
              <a :href="href" @click="navigate" :class="{ 'mil-active': isActive }">
                <i class="fal fa-palette"></i><span>Portfolio</span>
              </a>
            </li>
          </router-link>

          <router-link to="/blog" custom v-slot="{ href, navigate, isActive }">
            <li :class="{ 'mil-current': isActive }" @click="appStore.closeMenu">
              <a :href="href" @click="navigate" :class="{ 'mil-active': isActive }">
                <i class="fal fa-book"></i><span>Blog</span>
              </a>
            </li>
          </router-link>

          <router-link to="/friends" custom v-slot="{ href, navigate, isActive }">
            <li :class="{ 'mil-current': isActive }" @click="appStore.closeMenu">
              <a :href="href" @click="navigate" :class="{ 'mil-active': isActive }">
                <i class="fal fa-link"></i><span>Friends</span>
              </a>
            </li>
          </router-link>

          <router-link to="/contact" custom v-slot="{ href, navigate, isActive }">
            <li :class="{ 'mil-current': isActive }" @click="appStore.closeMenu">
              <a :href="href" @click="navigate" :class="{ 'mil-active': isActive }">
                <i class="fal fa-envelope"></i><span>Contact</span>
              </a>
            </li>
          </router-link>

        </ul>
      </nav>
      <div class="mil-menu-btn" :class="{ 'mil-active': appStore.isMenuOpen }" @click="appStore.toggleMenu"><span></span></div>
    </div>
  </div>
</template>

<style scoped>
/* Scoped styles if needed, otherwise global CSS handles it */
.mil-main-menu li a.mil-active {
    /* Ensure active state style matches .mil-current */
    color: #DBA91C; /* Example from style.css likely */
}
/* Just relies on global .mil-current style mostly, but we use .mil-active */
</style>
