<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { detectRegion, getBotId, getToken } from '../config/ai';
import { useAppStore } from '../stores/app';

const appStore = useAppStore();
const isVisible = ref(false);


watch(() => appStore.isLoading, (loading) => {
  if (!loading) {
     isVisible.value = true;
  }
});

// Watch for trigger from Sidebar
watch(() => appStore.triggerAssistant, () => {
    if (cozeClientInstance) {
        try {
            cozeClientInstance.showChatBot();
            // Force open state
            isChatOpen.value = true;
        } catch (err) {
            console.error('Failed to show chat bot via trigger', err);
        }
    }
});

const LOAD_TIMEOUT = 5000;
let isLoaded = false;
let cozeClientInstance = null; // Store client instance

// Draggable Logic
const isDragging = ref(false);

const isMobile = window.innerWidth < 768;
const position = ref({ 
  bottom: isMobile ? 100 : 80, 
  right: isMobile ? 20 : 80 
});

const dragStart = ref({ x: 0, y: 0 });
const startPos = ref({ bottom: 0, right: 0 });
// Track if it was a drag or a click
const hasMoved = ref(false);
const isChatOpen = ref(false);

function onMouseDown(e) {
  // Only drag if clicking the "icon" area (approx size of button)
  // or just drag the whole wrapper since it wraps the button?
  // Coze button is inside this wrapper.
  
  isDragging.value = true;
  hasMoved.value = false;
  dragStart.value = { x: e.clientX, y: e.clientY };
  startPos.value = { ...position.value };
  
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
}

function onMouseMove(e) {
  if (!isDragging.value) return;
  
  const dx = e.clientX - dragStart.value.x;
  const dy = e.clientY - dragStart.value.y;
  
  if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      hasMoved.value = true;
  }
  
  // Update position (inverted because we use bottom/right)
  position.value = {
    bottom: startPos.value.bottom - dy,
    right: startPos.value.right - dx
  };
}

function onMouseUp(e) {
  isDragging.value = false;
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);
  
  // If it was a click (not a drag), toggle the chat
  if (!hasMoved.value && cozeClientInstance) {
      try {
          cozeClientInstance.showChatBot();
          // Fallback: Force state to open for Desktop Drag logic
          // Use timeout to allow SDK to render
          setTimeout(() => {
              isChatOpen.value = true;
          }, 200);
      } catch (err) {
          console.error('Failed to show chat bot', err);
      }
  }
}

// Global click listener to detect "Close"
function onGlobalClick(e) {
    if (isChatOpen.value && !isDragging.value) {
        // Simple heuristic: If we click outside container, set false.
        const container = document.querySelector('.draggable-widget-container');
        if (container && !container.contains(e.target)) {
            isChatOpen.value = false;
        }
    }
}



// Touch support for mobile
function onTouchStart(e) {
  isDragging.value = true;
  hasMoved.value = false;
  dragStart.value = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  startPos.value = { ...position.value };
  
  document.addEventListener('touchmove', onTouchMove, { passive: false });
  document.addEventListener('touchend', onTouchEnd);
}

function onTouchMove(e) {
  if (!isDragging.value) return;
  // e.preventDefault(); // Stop scrolling while dragging?
  
  const dx = e.touches[0].clientX - dragStart.value.x;
  const dy = e.touches[0].clientY - dragStart.value.y;
  
  if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      hasMoved.value = true;
      if (e.cancelable) e.preventDefault();
  }
  
  position.value = {
    bottom: startPos.value.bottom - dy,
    right: startPos.value.right - dx
  };
}

function onTouchEnd() {
  isDragging.value = false;
  document.removeEventListener('touchmove', onTouchMove);
  document.removeEventListener('touchend', onTouchEnd);
  
  if (!hasMoved.value && cozeClientInstance) {
      try {
          cozeClientInstance.showChatBot();
      } catch (err) {}
  }
}

// URLs for Coze SDKs
const SDK_URL_CN = 'https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.1.0-beta.3/libs/cn/index.js';
const SDK_URL_GLOBAL = 'https://sf-coze-web-cdn.coze.com/obj/unpkg-va/flow-platform/chat-app-sdk/1.1.0-beta.3/libs/oversea/index.js';

function loadScript(url) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${url}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    
    const timeoutId = setTimeout(() => {
      script.onerror = null;
      script.onload = null;
      reject(new Error(`Timeout loading script: ${url}`));
    }, LOAD_TIMEOUT);

    script.onload = () => {
      clearTimeout(timeoutId);
      resolve();
    };

    script.onerror = (e) => {
      clearTimeout(timeoutId);
      reject(e);
    };

    document.body.appendChild(script);
  });
}

onMounted(() => {
    document.addEventListener('click', onGlobalClick);
    const region = detectRegion(); 

async function initCoze(region) {
  const botId = getBotId(region);
  if (!botId || botId.includes('xxxx')) {
    console.warn('Coze Bot ID not configured. AI Assistant will not load.');
    return;
  }

  // Determine URL based on region
  const url = region === 'CN' ? SDK_URL_CN : SDK_URL_GLOBAL;

  try {
    await loadScript(url);
    
    if (window.CozeWebSDK) {
      cozeClientInstance = new window.CozeWebSDK.WebChatClient({
        config: {
          bot_id: botId,
        },
        auth: {
            type: 'token',
            token: getToken(region),
            onRefreshToken: async () => getToken(region), // Simple PAT refresh (static)
        },
        componentProps: {
            title: 'Wasker AI',
            layout: window.innerWidth < 768 ? 'mobile' : 'pc', 
        },
        el: document.getElementById('coze-chat-container'),
      });
      isLoaded = true;

      // Dynamic Mobile Positioning & State Logic:
      const container = document.getElementById('coze-chat-container');
      const resizeObserver = new ResizeObserver((entries) => {
          for (const entry of entries) {
              const height = entry.contentRect.height;
              console.log('[ResizeObserver] Height:', height);
              const isOpen = height > 100;
              // Only update if true? to avoid jitter? No, faithful update.
              // Logic: specific fallback handles the 'True' case if this misses.
              // But if this reports < 100 consistently, it will overwrite our fallback True!
              // Fix: Only update isChatOpen from observer if it detects OPEN.
              // If it detects CLOSED (<100), only update if safe?
              
              if (isOpen) {
                 isChatOpen.value = true;
              } else {
                 // If we forced it open manually, but observer says small...
                 // It means container didn't grow.
                 // We should NOT overwrite to false if we believe it's open?
                 // But wait, if we minimize, we need it to go false.
                 // Let's assume Observer is valid for Mobile, but maybe not Desktop.
                 
                 if (window.innerWidth < 768) {
                     isChatOpen.value = false;
                 } else {
                     // Desktop: If height is small, it MIGHT be closed.
                     // But if Coze is fixed pos, it is ALWAYS small.
                     // So Observer is useless for Open state on Desktop?
                     // If so, we rely purely on Manual Toggle.
                 }
              }

              if (window.innerWidth < 768) {
                  if (isOpen) {
                      position.value.bottom = 0;
                      position.value.right = 0; 
                  } else {
                      position.value.bottom = 100;
                      position.value.right = 20;
                  }
              }
          }
      });
      resizeObserver.observe(container);
    }
  } catch (error) {
    console.error('Failed to load Coze SDK:', error);
    if (region === 'GLOBAL') {
        console.log('Attempting failover to CN SDK...');
    }
  }
}

    console.log(`Initializing AI Assistant for region: ${region}`);
    
    setTimeout(() => {
      initCoze(region);
    }, 1000);
});

onUnmounted(() => {
    document.removeEventListener('click', onGlobalClick);
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('touchend', onTouchEnd);
});
</script>

<template>
  <div 
    class="draggable-widget-container"
    :class="{ 
      'mobile-open': isMobile && isChatOpen,
      'desktop-open': !isMobile && isChatOpen,
      'widget-hidden': !isChatOpen
    }"
    v-show="isVisible"
    :style="!isChatOpen || !isMobile ? { bottom: position.bottom + 'px', right: position.right + 'px' } : {}"
    @mousedown="onMouseDown"
    @touchstart="onTouchStart"
  >
    <!-- Coze Container target -->
    <div id="coze-chat-container" class="coze-target"></div>

    <!-- Drag Shield:
         - Closed: Covers Icon (full)
         - Desktop Open: Covers Header (Top Strip) for dragging
         - Mobile Open: Hidden (via CSS)
    -->
    <div class="drag-shield"></div>
  </div>
</template>

<style scoped>
.draggable-widget-container {
  position: fixed;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: flex-end; /* Align right */
}

.widget-hidden {
    visibility: hidden;
    pointer-events: none;
    opacity: 0;
}

/* 
   The shield covers the button to allow dragging.
   But we need to pass clicks through or handle them manually.
   Since we handle custom click -> showChatBot(), this works.
   We need to size it to cover roughly the button size (60x60).
   The problem is centering it over the unknown internal button.
   Safest bet: make the shield the size of the container, but 
   pointer-events: none when chat is open?
*/

.drag-shield {
    /* Default: Cover Icon (Closed state) */
    position: absolute;
    inset: 0; 
    z-index: 10000; /* Above Coze iframe */
    cursor: move;
    background: transparent; 
}

/* Mobile Open: Hide shield */
.draggable-widget-container.mobile-open .drag-shield {
    display: none;
}

/* Desktop Open: Header Shield */
.draggable-widget-container.desktop-open .drag-shield {
    height: 60px; /* Approx header height */
    bottom: auto;
    top: 0;
    width: 85%; /* Leave right side open for buttons */
    left: 0;
    background: transparent;
    border-bottom: 1px solid rgba(255,255,255,0.12);
}

.coze-target {
  width: auto;
  height: auto;
}
</style>
