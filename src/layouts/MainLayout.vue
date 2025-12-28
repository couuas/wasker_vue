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
const previousBodyClass = ref(route.meta.bodyClass) // Track previous layout for transition logic

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
        appStore.setLoading(false)
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
  // 1. Add entering class for initial state
  el.classList.add('mil-page-entering')
  el.style.zIndex = '1'
  
  // 2. Determine if right sidebar needs to enter
  const isEnteringHalfPage = currentBodyClass.value === 'mil-half-page'
  const wasFullWidth = previousBodyClass.value === 'mil-fw-page'
  const rightPart = document.querySelector('.mil-right-part')
  
  // 3. Setup right sidebar for entrance ONLY if transitioning from Full → Half
  // If Half → Half, sidebar stays visible without animation
  const shouldAnimateSidebar = isEnteringHalfPage && wasFullWidth
  
  if (shouldAnimateSidebar && rightPart) {
    // Scenario: Full → Half (sidebar needs to enter)
    rightPart.classList.add('mil-entering')
    rightPart.classList.remove('mil-leaving', 'mil-ready')
  }
  
  // 4. Small delay then trigger entrance animation by removing entering class
  setTimeout(() => {
    // Remove entering class to trigger CSS transition to normal state
    el.classList.remove('mil-page-entering')
    
    // Animate right sidebar to ready state if entering (only for Full → Half)
    if (shouldAnimateSidebar && rightPart) {
      rightPart.classList.remove('mil-entering')
      rightPart.classList.add('mil-ready')
    }
    
    // 5. Wait for animation to complete (0.8s), then cleanup
    setTimeout(() => {
      // Cleanup
      document.documentElement.classList.remove('is-animating')
      el.classList.remove('mil-page-leaving')
      
      if (rightPart) {
        rightPart.classList.remove('mil-leaving', 'mil-entering')
        // Keep mil-ready if sidebar is visible
      }
      
      // Re-init scroll trigger animations
      initAnimations()
      done()
    }, 800)
  }, 100)
}

const onLeave = (el, done) => {
  // Kill old animations to prevent interference
  killAnimations()
  
  // 0. Save current body class as previous for next transition
  previousBodyClass.value = currentBodyClass.value
  
  // 1. Add is-animating class to trigger CSS animations
  document.documentElement.classList.add('is-animating')
  
  // 2. Determine transition type
  const isLeavingHalfPage = currentBodyClass.value === 'mil-half-page'
  const isGoingToFullWidth = route.meta.bodyClass === 'mil-fw-page'
  const isGoingToHalfPage = route.meta.bodyClass === 'mil-half-page'
  const rightPart = document.querySelector('.mil-right-part')
  
  // 3. Handle right sidebar based on transition type
  if (rightPart) {
    // Scenario: Half → Full (sidebar needs to leave)
    if (isLeavingHalfPage && isGoingToFullWidth) {
      rightPart.classList.add('mil-leaving')
      rightPart.classList.remove('mil-ready', 'mil-entering')
    }
    // Scenario: Keep sidebar visible (Half → Half)
    // No action needed, sidebar stays
  }
  
  // 4. Update body class EARLY for synchronized layout transitions
  if (route.meta.bodyClass !== currentBodyClass.value) {
    currentBodyClass.value = route.meta.bodyClass
    applyBodyClass()
  }
  
  // 5. Setup leaving element positioning
  gsap.set(el, { 
    position: 'absolute', 
    width: '100%',
    top: 0,
    left: 0,
    zIndex: 0 
  })
  
  // 6. Add CSS class to trigger leave animation
  el.classList.add('mil-page-leaving')
  
  // 7. Wait for CSS animation to complete (0.8s for drawer effect), then callback
  setTimeout(() => {
    done()
  }, 800)
}

const onAfterLeave = () => {
  // Body class update is now handled in onLeave for synchronized transitions
  // This hook can be used for any cleanup if needed in the future
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
