<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  node: {
    type: Object,
    default: null
  },
  graphData: {
    type: Object,
    default: () => ({ nodes: [], links: [] })
  },
  visible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'locate']);

const isRelatedExpanded = ref(false);

const neighbors = computed(() => {
    if (!props.node || !props.graphData.links || !props.graphData.nodes) return [];
    
    // Create a quick lookup map for nodes
    const nodeMap = new Map(props.graphData.nodes.map(n => [n.id, n]));
    
    // Find all links connected to current node
    const relatedLinks = props.graphData.links.filter(link => 
        link.source === props.node.id || link.target === props.node.id ||
        (link.source.id === props.node.id) || (link.target.id === props.node.id)
    );
    
    // Get unique neighbor IDs
    const neighborIds = new Set();
    relatedLinks.forEach(link => {
        const sId = typeof link.source === 'object' ? link.source.id : link.source;
        const tId = typeof link.target === 'object' ? link.target.id : link.target;
        
        if (sId !== props.node.id) neighborIds.add(sId);
        if (tId !== props.node.id) neighborIds.add(tId);
    });
    
    // Map to full node objects using the lookup map
    return Array.from(neighborIds).map(id => nodeMap.get(id)).filter(n => n);
});

function getLink(node) {
    if (!node) return '#';
    const { type, slug } = node;
    if (type === 'profile') return '/contact';
    return `/${type}/${slug}`; 
}

const articleLink = computed(() => getLink(props.node));

function handleLocate(neighborId) {
    emit('locate', neighborId);
}

const sheetRef = ref(null);
defineExpose({ sheetRef });
</script>

<template>
  <div ref="sheetRef" class="bottom-sheet" :class="{ 'is-visible': visible }">
    <div class="sheet-content" v-if="node">
      <div class="sheet-header">
        <span class="category-tag">{{ node.category }}</span>
        <button class="close-btn" @click="$emit('close')">&times;</button>
      </div>
      <h3 class="title">{{ node.name }}</h3>
      <p class="description">{{ node.desc || 'No description available.' }}</p>
      
      <div class="primary-actions">
        <router-link :to="articleLink" class="read-btn">Read Article</router-link>
        <router-link v-if="node.pdf" :to="'/presentation/' + node.slug" class="read-btn ppt-btn" style="margin-top: 10px; background: transparent; border: 1px solid #DBA91C; color: #DBA91C;">Read PPT</router-link>
      </div>

      <!-- Related Nodes List -->
      <div class="related-section" v-if="neighbors.length > 0" :class="{ 'is-expanded': isRelatedExpanded }">
        <div class="related-header" @click="isRelatedExpanded = !isRelatedExpanded">
           <span>Related Entries ({{ neighbors.length }})</span>
           <i class="fal fa-chevron-down chevron-icon" :class="{ 'is-expanded': isRelatedExpanded }"></i>
        </div>
        <div class="expand-wrapper" :class="{ 'is-expanded': isRelatedExpanded }">
          <div class="related-list">
            <div v-for="neighbor in neighbors" :key="neighbor.id" class="related-item">
               <span class="related-title">{{ neighbor.name }}</span>
               <div class="related-actions">
                  <button class="action-btn locate" @click="handleLocate(neighbor.id)">Locate</button>
                  <router-link :to="getLink(neighbor)" class="action-btn read">Read</router-link>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom Scrollbar */
.sheet-content::-webkit-scrollbar,
.related-list::-webkit-scrollbar,
.description::-webkit-scrollbar {
    width: 4px;
    height: 0; /* Hide horizontal scrollbar */
}

.sheet-content::-webkit-scrollbar-track,
.related-list::-webkit-scrollbar-track,
.description::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
}

.sheet-content::-webkit-scrollbar-thumb,
.related-list::-webkit-scrollbar-thumb,
.description::-webkit-scrollbar-thumb {
    background: transparent; /* Invisible by default */
    border-radius: 10px;
}

.sheet-content:hover::-webkit-scrollbar-thumb,
.related-list:hover::-webkit-scrollbar-thumb,
.description:hover::-webkit-scrollbar-thumb {
    background: rgba(219, 169, 28, 0.3); /* Show on hover */
}

.sheet-content::-webkit-scrollbar-thumb:hover,
.related-list::-webkit-scrollbar-thumb:hover,
.description::-webkit-scrollbar-thumb:hover {
    background: rgba(219, 169, 28, 0.5); /* Highlight on thumb hover */
}

.expand-wrapper {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
    opacity: 0;
    overflow: hidden;
}

.expand-wrapper.is-expanded {
    grid-template-rows: 1fr;
    opacity: 1;
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
}

.chevron-icon {
    transition: transform 0.3s ease;
}

.chevron-icon.is-expanded {
    transform: rotate(180deg);
}

.bottom-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: rgba(20, 20, 25, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 20px 20px 0 0;
  transform: translateY(100%);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 2000;
  color: #fff;
  box-sizing: border-box;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

.sheet-content {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    width: 100%;
}

.bottom-sheet.is-visible {
  transform: translateY(0);
}

.sheet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

/* Related Section Styles */
.related-section {
    margin-top: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    padding-top: 15px;
}

.related-section.is-expanded {
    display: flex;
    flex-direction: column;
    min-height: 0;
    flex: 1;
}

.related-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
    font-weight: 600;
    color: #DBA91C;
    cursor: pointer;
    margin-bottom: 10px;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
}

.related-list {
    min-height: 0;
    flex: 1;
    overflow-y: hidden; /* Hide during potential parent transition */
    overflow-x: hidden;
}

.is-expanded .related-list {
    overflow-y: auto;
    /* Delay scrollability until expansion is complete to avoid scrollbar flicker */
    transition: overflow-y 0s 0.4s; 
}

@media (max-width: 1200px) {
    .bottom-sheet {
        max-height: 50vh;
    }
}

.related-item {
    padding: 10px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
    margin-bottom: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.related-title {
    font-size: 13px;
    line-height: 1.4;
}

.related-actions {
    display: flex;
    gap: 10px;
}

.action-btn {
    flex: 1;
    font-size: 11px;
    padding: 6px;
    border-radius: 4px;
    text-align: center;
    text-decoration: none;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
}

.action-btn.locate {
    background: rgba(219, 169, 28, 0.1);
    color: #DBA91C;
    border: 1px solid rgba(219, 169, 28, 0.3);
}

.action-btn.read {
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.action-btn:hover {
    background: rgba(255, 255, 255, 0.15);
}

@media (min-width: 1201px) {
    .bottom-sheet {
        bottom: auto;
        left: auto;
        top: 20px;
        right: 20px;
        width: 360px;
        height: auto;
        max-height: calc(100vh - 40px);
        background: rgba(20, 20, 25, 0.85);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        transform: translateX(120%);
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }

    .bottom-sheet.is-visible {
        transform: translateX(0);
    }
}

.category-tag {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #888;
  border: 1px solid #333;
  padding: 3px 6px;
  border-radius: 4px;
}

.close-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 24px;
  cursor: pointer;
  padding: 0 8px;
}

.title {
  font-size: 18px;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.description {
  font-size: 13px;
  color: #ccc;
  line-height: 1.5;
  margin-bottom: 20px;
  max-height: 80px;
  overflow-y: auto;
  overflow-x: hidden;
}

.read-btn {
  display: block;
  width: 100%;
  padding: 10px;
  background: #DBA91C;
  color: #000;
  text-align: center;
  text-decoration: none;
  font-weight: 600;
  border-radius: 6px;
  transition: background 0.2s;
  font-size: 14px;
}

.read-btn:hover {
  background: #f0b924;
}
</style>
