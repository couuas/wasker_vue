<script setup>
import { onMounted, nextTick, onUnmounted, ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import TheSidebar from '../components/TheSidebar.vue'
import TheRightBar from '../components/TheRightBar.vue'
import { useAppStore } from '../stores/app'
import { useScrollAnimations } from '../composables/useScrollAnimations'
import { Fancybox } from "@fancyapps/ui"
import "@fancyapps/ui/dist/fancybox/fancybox.css"
import gsap from 'gsap'

const appStore = useAppStore()
const route = useRoute()
const { initAnimations, killAnimations } = useScrollAnimations()

// State for layout management
// We use a separate ref for body class to delay updates until AFTER the leave animation
const currentBodyClass = ref(route.meta.bodyClass)

// Determine if RightBar should be visible based on DELAYED route state (currentBodyClass)
// This prevents the sidebar from snapping before the page fades out
const shouldShowRightBar = computed(() => currentBodyClass.value !== 'mil-fw-page')

// Preloader state
const isLoading = ref(true)
const percent = ref(0)
const preloaderClass = ref('mil-preloader')

const setHeight = () => {
    const vh = window.innerHeight * 0.01
    document.documentElement.style.setProperty('--vh', `${vh}px`)
}

// Update the physical body class based on our reactive state
const applyBodyClass = () => {
  if (currentBodyClass.value) {
    document.body.className = currentBodyClass.value
  } else {
    document.body.className = ''
  }
}

onMounted(() => {
   setHeight()
   window.addEventListener('resize', setHeight)
   // Initial body class set
   currentBodyClass.value = route.meta.bodyClass
   applyBodyClass()

   Fancybox.bind("[data-fancybox]", {
      // Your custom options
   });
   
   // Preloader Animation
   const interval = setInterval(() => {
    if (percent.value < 100) {
      percent.value += 5 
    } else {
      clearInterval(interval)
      preloaderClass.value += ' mil-complete'
      
      // Init animations when preloader is done
      initAnimations()
      
      setTimeout(() => {
        isLoading.value = false
      }, 800) 
    }
   }, 100) 
})

onUnmounted(() => {
    window.removeEventListener('resize', setHeight)
    Fancybox.destroy();
})

// --- Transition Hooks with GSAP ---

const onEnter = (el, done) => {
  // Set initial state
  gsap.set(el, {
    opacity: 0,
    y: 30, // Slight slide up effect
    filter: 'blur(10px)',
  })

  // Animate in
  gsap.to(el, {
    duration: 0.6,
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    ease: 'power3.out',
    onComplete: () => {
      // Re-init scroll trigger animations after the element is settled
      initAnimations()
      done()
    }
  })
}

const onLeave = (el, done) => {
  // Kill old animations to prevent interference
  killAnimations()

  // Make leaving element absolute so it doesn't take up layout space
  // This allows the new element to occupy the correct position immediately (overlap)
  gsap.set(el, { 
    position: 'absolute', 
    width: '100%',
    top: 0,
    left: 0,
    zIndex: 0 
  })

  // Animate out
  gsap.to(el, {
    duration: 0.4,
    opacity: 0,
    y: -30, // Slide up while fading out
    filter: 'blur(10px)',
    ease: 'power3.in',
    onComplete: done
  })
}

const onAfterLeave = () => {
  // CRITICAL: Update the body class (and thus the layout) ONLY after the old page has left.
  // This happens in the "blank" state between pages.
  if (route.meta.bodyClass !== currentBodyClass.value) {
      currentBodyClass.value = route.meta.bodyClass
      applyBodyClass()
  }
  
  // Also ensuring scroll is reset if needed, though Vue Router usually handles this.
  // window.scrollTo(0, 0) 
}

</script>

<template>
  <div class="mil-frame-wrapper">
      <div :class="preloaderClass" v-if="isLoading">
          <div class="mil-preloader-content">
              <h1 class="mil-mb-30"><span class="mil-h3">Loading:</span> <span class="mil-accent mil-percent">{{ percent }}</span> <span class="mil-h3">%</span></h1>
              <div class="mil-preload-track">
                  <div class="mil-preload-line" :style="{ width: percent + '%' }"></div>
              </div>
          </div>
      </div>
    
    <div class="mil-frame">
      <TheSidebar />
      
      <div class="mil-content">
        <div class="mil-overlay" :class="{ 'mil-active': appStore.isMenuOpen }" @click="appStore.closeMenu"></div>
        
        <div class="mil-left-part">
          <router-view v-slot="{ Component }">
            <transition 
              mode="default" 
              :css="false" 
              @enter="onEnter" 
              @leave="onLeave" 
              @after-leave="onAfterLeave"
            >
              <component :is="Component" :key="route.path" />
            </transition>
          </router-view>
          
          <!-- Mobile RightBar (Visible only on mobile via CSS) -->
          <div class="mil-mobile-right-bar" :class="{ 'mil-hidden-trigger': !shouldShowRightBar }">
             <TheRightBar />
          </div>
        </div>
        
        <!-- Desktop RightBar -->
        <div class="mil-right-part" :class="{ 'mil-hidden-trigger': !shouldShowRightBar }">
           <TheRightBar />
        </div>
        
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Mobile RightBar logic */
.mil-mobile-right-bar {
  display: block;
  margin-top: 30px;
  transition: all 0.8s ease; 
}


/* Trigger class to fade out sidebar when navigating to full-width page */
/* This now reacts to currentBodyClass, so it stays visible until afterLeave */
.mil-hidden-trigger {
    opacity: 0;
    transform: translateY(20px);
    filter: blur(5px);
    pointer-events: none;
    transition: all 0.4s ease; /* Faster exit for sidebar */
}

@media (min-width: 1200px) {
  .mil-mobile-right-bar {
    display: none;
  }
}

</style>
