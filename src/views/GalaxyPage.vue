<script setup>
import { ref, onMounted, onUnmounted, shallowRef, nextTick, computed } from 'vue';
import Galaxy3D from '../components/Galaxy3D.vue';
import GalaxyBottomSheet from '../components/GalaxyBottomSheet.vue';

const selectedNode = shallowRef(null);
const graphData = shallowRef({ nodes: [], links: [] });
const currentLang = ref('en');

const filteredGraphData = computed(() => {
  const nodes = graphData.value.nodes.filter(n => n.lang === currentLang.value);
  const nodeIds = new Set(nodes.map(n => n.id));
  const links = graphData.value.links.filter(l => nodeIds.has(l.source) && nodeIds.has(l.target));
  return { nodes, links };
});

const galaxy3dRef = ref(null);
const bottomSheetRef = ref(null);
const currentSheetHeight = ref(0);
const windowWidth = ref(window.innerWidth);

let sheetObserver = null;

const handleResize = () => {
  windowWidth.value = window.innerWidth;
};

onMounted(async () => {
  const response = await fetch('/galaxy-data.json');
  graphData.value = await response.json();

  window.addEventListener('resize', handleResize);

  // Measure bottom sheet height
  sheetObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      currentSheetHeight.value = entry.target.offsetHeight;
    }
  });

  await nextTick();
  if (bottomSheetRef.value?.sheetRef) {
    sheetObserver.observe(bottomSheetRef.value.sheetRef);
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  if (sheetObserver) sheetObserver.disconnect();
});

function handleNodeClick(node) {
  if (node) {
      // Sanitize the node object to avoid circular references (Three.js objects) causing Vue reactivity crashes
      selectedNode.value = {
          id: node.id,
          name: node.name,
          desc: node.desc,
          slug: node.slug,
          type: node.type,
          category: node.category,
          val: node.val,
          filePath: node.filePath
      };
  } else {
      selectedNode.value = null;
      currentSheetHeight.value = 0;
  }
}

function handleLocate(nodeId) {
  const node = filteredGraphData.value.nodes.find(n => n.id === nodeId);
  if (node && galaxy3dRef.value) {
    galaxy3dRef.value.focusNode(node);
    selectedNode.value = node;
  }
}

function handleReset() {
    if (galaxy3dRef.value) {
        galaxy3dRef.value.resetView();
        selectedNode.value = null;
        currentSheetHeight.value = 0;
    }
}
</script>

<template>
  <div class="galaxy-page">
    <div class="ui-overlay">
        <!-- Back Link (optional or removed if we use main nav, but keeping placeholder) -->
    </div>

    <!-- Language Switcher -->
    <div class="galaxy-lang-switch">
        <span 
            class="lang-btn" 
            :class="{ 'active': currentLang === 'zh' }" 
            @click="currentLang = 'zh'">ZH</span>
        <span class="divider">/</span>
        <span 
            class="lang-btn" 
            :class="{ 'active': currentLang === 'en' }" 
            @click="currentLang = 'en'">EN</span>
    </div>

    <div 
      class="galaxy-viewport" 
      :class="{ 'detail-open': !!selectedNode }"
      :style="selectedNode && windowWidth <= 1200 ? { height: `calc(100% - ${currentSheetHeight}px)` } : {}"
    >
        <Galaxy3D 
          ref="galaxy3dRef"
          :graphData="filteredGraphData"
          :onNodeClick="handleNodeClick" 
        />
    </div>
    
    <button class="reset-view-btn" @click="handleReset" title="Reset View" :class="{ 'detail-open': !!selectedNode }">
        <i class="fal fa-dot-circle"></i>
    </button>

    <GalaxyBottomSheet 
      ref="bottomSheetRef"
      :node="selectedNode" 
      :graphData="filteredGraphData"
      :visible="!!selectedNode" 
      @close="selectedNode = null" 
      @locate="handleLocate"
    />
  </div>
</template>

<style scoped>
.reset-view-btn {
    position: absolute;
    bottom: 30px;
    right: 30px;
    z-index: 2200; /* Higher than BottomSheet (2000) just in case, but we will shift it */
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: rgba(20, 20, 25, 0.6);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.reset-view-btn:hover {
    background: rgba(219, 169, 28, 0.2);
    border-color: rgba(219, 169, 28, 0.5);
    color: #DBA91C;
    transform: scale(1.1);
}

@media (max-width: 1200px) {
    /* Relocate button to top-left when BottomSheet is open on mobile/tablet */
    .reset-view-btn.detail-open {
        bottom: auto;
        right: auto;
        top: 110px; /* Below the mobile header/logo area */
        left: 20px;
        transform: scale(0.9);
        background: rgba(219, 169, 28, 0.15);
        border-color: rgba(219, 169, 28, 0.4);
    }
}

@media (min-width: 1201px) {
    .reset-view-btn {
        bottom: 40px;
        right: 40px;
    }
    
    /* Relocate button to top-left when Side Panel is open on desktop */
    .reset-view-btn.detail-open {
        bottom: auto;
        right: auto;
        top: 40px;
        left: 40px;
    }
}

.galaxy-page {
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
  overflow: hidden;
}

@media (max-width: 1200px) {
  .galaxy-page {
    height: 100vh;
    height: calc(var(--vh, 1vh) * 100);
  }
}

.ui-overlay {
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 20;
}

.back-link {
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.galaxy-viewport {
    width: 100%;
    height: 100%;
    transition: height 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
    z-index: 10;
}

@media (max-width: 1200px) {
    /* No hardcoded height here, managed by JS for precision */
}

.galaxy-lang-switch {
    position: absolute;
    z-index: 2200;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.5);
    background: rgba(20, 20, 25, 0.6);
    backdrop-filter: blur(10px);
    padding: 8px 16px;
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

@media (min-width: 1201px) {
    .galaxy-lang-switch {
        bottom: 40px;
        left: 40px;
        top: auto;
        right: auto;
    }
}

.galaxy-lang-switch .lang-btn {
    cursor: pointer;
    transition: 0.3s;
}

.galaxy-lang-switch .lang-btn.active {
    color: #DBA91C;
    text-shadow: 0 0 10px rgba(219, 169, 28, 0.5);
    opacity: 1;
}

.galaxy-lang-switch .lang-btn:hover:not(.active) {
    color: #fff;
}

@media (max-width: 1200px) {
    .galaxy-lang-switch {
        top: 10.5rem;
        right: 20px;
        bottom: auto;
        left: auto;
    }
}
</style>
