<script setup>
import { RouterLink, useRoute } from 'vue-router'
import { useAppStore } from '../stores/app'
import CompactMusicPlayer from './CompactMusicPlayer.vue'

const appStore = useAppStore()
const route = useRoute()
</script>

<template>
  <div class="mil-menu-part mil-sidebar-flex">
    <router-link to="/" class="mil-logo">
      <!-- text logo -->
      <span>wa</span>
    </router-link>
    <div class="mil-menu-panel mil-relative-panel">

      <nav class="mil-main-menu" :class="{ 'mil-active': appStore.isMenuOpen }">
        
        <ul id="swupMenu">
          <!-- Home -->
          <router-link to="/" custom v-slot="{ href, navigate, isExactActive }">
            <li :class="{ 'mil-current': isExactActive }" @click="appStore.closeMenu">
              <a :href="href" @click="navigate" :class="{ 'mil-active': isExactActive }">
                <i class="fal fa-home"></i>
                <span>
                    Home
                </span>
              </a>
            </li>
          </router-link>
          
          <!-- Portfolio -->
          <router-link to="/portfolio" custom v-slot="{ href, navigate, isExactActive }">
            <li :class="{ 'mil-current': isExactActive || route.name === 'portfolio-detail' }" @click="appStore.closeMenu">
              <a :href="href" @click="navigate" :class="{ 'mil-active': isExactActive || route.name === 'portfolio-detail' }">
                <i class="fal fa-palette"></i>
                <span>
                    {{ route.name === 'portfolio-detail' ? 'Back to Portfolio' : 'Portfolio' }}
                </span>
              </a>
            </li>
          </router-link>

          <!-- Blog -->
          <router-link to="/blog" custom v-slot="{ href, navigate, isExactActive }">
            <li :class="{ 'mil-current': isExactActive || route.name === 'blog-detail' }" @click="appStore.closeMenu">
              <a :href="href" @click="navigate" :class="{ 'mil-active': isExactActive || route.name === 'blog-detail' }">
                <i class="fal fa-book"></i>
                <span>
                    {{ route.name === 'blog-detail' ? 'Back to Blog' : 'Blog' }}
                </span>
              </a>
            </li>
          </router-link>

          <!-- Journal -->
          <router-link to="/journal" custom v-slot="{ href, navigate, isExactActive }">
            <li :class="{ 'mil-current': isExactActive || route.name === 'journal-detail' }" @click="appStore.closeMenu">
              <a :href="href" @click="navigate" :class="{ 'mil-active': isExactActive || route.name === 'journal-detail' }">
                <i class="fal fa-pen-nib"></i>
                <span>
                    {{ route.name === 'journal-detail' ? 'Back to Journal' : 'Journal' }}
                </span>
              </a>
            </li>
          </router-link>

          <!-- Contact -->
          <router-link to="/contact" custom v-slot="{ href, navigate, isExactActive }">
            <li :class="{ 'mil-current': isExactActive }" @click="appStore.closeMenu">
              <a :href="href" @click="navigate" :class="{ 'mil-active': isExactActive }">
                <i class="fal fa-envelope"></i>
                <span>
                    Contact
                </span>
              </a>
            </li>
          </router-link>
          
          <!-- Separator between Contact and Galaxy -->
          <li class="mil-sidebar-separator"></li>
          
          <!-- Galaxy -->
          <router-link to="/galaxy" custom v-slot="{ href, navigate, isExactActive }">
            <li :class="{ 'mil-current': isExactActive }" @click="appStore.closeMenu" class="mil-lab-item">
              <a :href="href" @click="navigate" :class="{ 'mil-active': isExactActive }">
                <i class="fal fa-atom"></i>
                <span>
                    Galaxy
                </span>
              </a>
            </li>
          </router-link>
          
          <li class="mil-lab-item" @click="appStore.openAssistant">
              <a href="javascript:void(0);">
                 <i class="fal fa-robot"></i><span>Assistant</span>
              </a>
          </li>

        </ul>
      </nav>


      <div class="mil-sidebar-player">
        <CompactMusicPlayer />
      </div>

      <div class="mil-menu-btn" :class="{ 'mil-active': appStore.isMenuOpen }" @click="appStore.toggleMenu"><span></span></div>
    </div>

  </div>
</template>

<style scoped>
.mil-sidebar-player {
  padding: 0;
  width: auto;
  margin: 0 2rem 0 0; /* Right margin to separate from menu button */
  display: flex;
  justify-content: center;
  align-items: center;
}

@media (min-width: 1200px) {
  .mil-sidebar-player {
    width: 100%;
    margin-top: 3rem; /* Add space between menu and player */
  }
}

/* Scoped styles if needed, otherwise global CSS handles it */
.mil-main-menu li a.mil-active {
    /* Ensure active state style matches .mil-current */
    color: #DBA91C;
    font-weight: 700;
}

.mil-current-tag {
    font-size: 8px;
    font-weight: 400;
    opacity: 0.5;
    margin-left: 6px;
    letter-spacing: 0.5px;
    vertical-align: top;
}

/* Lab Badge Styles */
.mil-lab-item a {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center; /* Center icons */
}

.mil-lab-badge {
    background: #DBA91C;
    color: #121212;
    font-size: 8px;
    font-weight: 900;
    padding: 1px 4px;
    border-radius: 4px;
    margin-left: 6px;
    line-height: 1;
    vertical-align: middle;
    letter-spacing: 0.5px;
    box-shadow: 0 2px 5px rgba(219, 169, 28, 0.3);
}

.mil-current .mil-lab-badge {
    background: #fff;
    color: #121212;
}

/* Separator */
.mil-sidebar-separator {
    border-top: dotted 2px #2C2C2C;
    margin: 0 0 3rem 0; /* Top margin 0 to avoid double-counting with previous item's margin-bottom */
    list-style: none;
    width: 60%;
    margin-left: auto;
    margin-right: auto;
}

/* Ensure icons have fixed width for accurate centering on wide screens only */
@media (min-width: 1201px) {
    .mil-main-menu ul li a i {
        width: 3rem;
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center; /* Ensure vertical center too */
    }
}

/* Explicitly hide icons on narrow screens to prevent custom scoped styles from overriding global media queries */
@media (max-width: 1200px) {
    .mil-main-menu ul li a i {
        display: none !important;
    }
}
</style>
