<script setup>
import { ref, onMounted, onUnmounted, shallowRef, nextTick, computed, watch } from 'vue';
import { useAppStore } from '@/stores/app'
import { storeToRefs } from 'pinia'
import Galaxy3D from '../components/Galaxy3D.vue';
import GalaxyBottomSheet from '../components/GalaxyBottomSheet.vue';

const appStore = useAppStore()
const { currentLang } = storeToRefs(appStore)

const selectedNode = shallowRef(null);
const graphData = shallowRef({ nodes: [], links: [] });

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

watch(currentLang, (newLang) => {
  if (selectedNode.value) {
    const { slug, type } = selectedNode.value;
    // Find equivalent node in the new language
    const newNode = graphData.value.nodes.find(n => n.lang === newLang && n.slug === slug && n.type === type);
    
    if (newNode) {
       // Update selected node with the new language version
       handleNodeClick(newNode);
    } else {
       // If no corresponding node found (e.g. translation missing), close the sheet
       selectedNode.value = null;
    }
  }
});
</script>

<template>
  <div class="galaxy-page">
    <div class="ui-overlay">
        <!-- Back Link (optional or removed if we use main nav, but keeping placeholder) -->
    </div>

    <!-- Language Switcher & Reset -->
    <div class="galaxy-lang-switch">
        <span 
            class="lang-btn" 
            :class="{ 'active': currentLang === 'zh' }" 
            @click="appStore.setLang('zh')">ZH</span>
        <span class="divider">/</span>
        <span 
            class="lang-btn" 
            :class="{ 'active': currentLang === 'en' }" 
            @click="appStore.setLang('en')">EN</span>
        <span class="divider">/</span>
        <span 
            class="lang-btn" 
            @click="handleReset"
            title="Reset View">
            <i class="fal fa-dot-circle"></i>
        </span>
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
/* Removed reset-view-btn styles as it is now integrated */



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
