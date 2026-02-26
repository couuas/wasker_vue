<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { RouterLink } from 'vue-router'
import { useMarkdown } from '@/composables/useMarkdown'
import { useScrollAnimations } from '@/composables/useScrollAnimations'
import { useAppStore } from '@/stores/app'
import ToastNotification from '@/components/ToastNotification.vue'
import { storeToRefs } from 'pinia'

const { getPosts, getCategories } = useMarkdown()
const { initAnimations } = useScrollAnimations()
const appStore = useAppStore()
const { currentLang, isFullScreen } = storeToRefs(appStore)

const allWorks = getPosts('portfolio')
const categories = getCategories('portfolio', currentLang)

const activeCategory = ref('All')
const isExpanded = ref(false)
const toggledSlug = ref(null)

const filteredWorks = computed(() => {
    let works = allWorks.value.filter(p => p.lang === currentLang.value)
    if (activeCategory.value !== 'All') {
        works = works.filter(p => p.category === activeCategory.value)
    }
    return works
})

const toggleLang = () => {
    appStore.toggleLang()
}

const displayedWorks = computed(() => {
    if (isExpanded.value) {
        return filteredWorks.value
    }
    return filteredWorks.value.slice(0, 6)
})

const showViewMore = computed(() => {
    return !isExpanded.value && filteredWorks.value.length > 6
})

const switchCategory = (cat) => {
    activeCategory.value = cat
    isExpanded.value = false
}

const switchToFullWidth = () => {
    isExpanded.value = true
}

const toggleCard = (slug) => {
    if (window.innerWidth <= 768) {
        toggledSlug.value = toggledSlug.value === slug ? null : slug
    }
}

// Watch for changes in displayed works to trigger animations
watch(displayedWorks, async () => {
    await nextTick()
    initAnimations()
}, { deep: true })

// Overflow Detection
const filterContainer = ref(null)
const isOverflowing = ref(false)

const checkOverflow = () => {
    if (filterContainer.value) {
        const el = filterContainer.value
        isOverflowing.value = el.scrollWidth > el.clientWidth
    }
}

// Check on mount, resize, and data change
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
    checkOverflow()
    window.addEventListener('resize', checkOverflow)
})

onUnmounted(() => {
    window.removeEventListener('resize', checkOverflow)
})

watch([categories, currentLang], async () => {
   await nextTick()
   checkOverflow()
})

// Action Menu State
const isActionMenuOpen = ref(false)
// const isFullScreen = ref(false) // Removed local state
const isListView = ref(false)

const toggleActionMenu = () => {
    isActionMenuOpen.value = !isActionMenuOpen.value
}

const toggleFullScreen = () => {
    appStore.toggleFullScreen()
}

const toggleLayout = () => {
    isListView.value = !isListView.value
}

watch(isListView, async () => {
    await nextTick()
    initAnimations()
})

const formatDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

// Share Logic
const copied = ref(false)
const toastRef = ref(null)

const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    copied.value = true
    if (toastRef.value) {
        toastRef.value.show('Link copied to clipboard', 'success')
    }
    setTimeout(() => { copied.value = false }, 2000)
}
// Drag to Scroll Logic
const scrollContainer = ref(null)
const isDragging = ref(false)
const startX = ref(0)
const scrollLeft = ref(0)
const isDragClick = ref(false) // Distinguish drag from click

const startDrag = (e) => {
    isDragging.value = true
    isDragClick.value = false
    startX.value = e.pageX - scrollContainer.value.offsetLeft
    scrollLeft.value = scrollContainer.value.scrollLeft
}

const stopDrag = () => {
    isDragging.value = false
}

const doDrag = (e) => {
    if (!isDragging.value) return;
    e.preventDefault();
    isDragClick.value = true // If moved, it's a drag
    const x = e.pageX - scrollContainer.value.offsetLeft;
    const walk = (x - startX.value) * 2; // Scroll-fast
    scrollContainer.value.scrollLeft = scrollLeft.value - walk;
}

const handleWheel = (e) => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollLeft += e.deltaY;
  }
}

const selectCategory = (cat) => {
    if (!isDragClick.value) {
        switchCategory(cat)
    }
}
</script>

<template>
    <div class="mil-content-frame">
        <ToastNotification ref="toastRef" />
        <div class="mil-scroll mil-bp-fix mil-half-1">
            <div class="mil-row-fix">
                
                <!-- Grid View -->
                <div class="row" v-if="!isListView">
                    <div v-for="(work, index) in displayedWorks" :key="work.slug" :class="(displayedWorks.length % 2 !== 0 && index === 0) ? 'col-lg-12' : 'col-lg-6'">
                        <div 
                            class="mil-blog-card mil-mb-15 mil-up"
                            :class="{ 'mil-active': toggledSlug === work.slug }"
                            @click="toggleCard(work.slug)"
                        >
                            <img :src="work.image" :alt="work.title" v-if="work.image">
                            <div class="mil-descr">
                                <div class="mil-post-text">
                                    <div class="mil-left">
                                        <h3 class="mil-line-height mil-mb-20">{{ work.title }}</h3>
                                        <router-link :to="'/portfolio/' + work.slug" class="mil-link mil-hover-link mil-accent">read more</router-link>
                                        <router-link v-if="work.pdf" :to="'/presentation/' + work.slug" class="mil-link mil-hover-link mil-accent" style="margin-left: 30px;">Read PPT</router-link>
                                    </div>
                                    <div class="mil-right">
                                        <p>{{ work.description }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- List View (Table Style) -->
                <div class="mil-list-container" v-else>
                    <router-link 
                        v-for="work in displayedWorks" 
                        :key="work.slug" 
                        :to="'/portfolio/' + work.slug"
                        class="mil-list-row mil-up"
                    >
                        <div class="mil-list-col mil-list-date">{{ formatDate(work.date) }}</div>
                        <div class="mil-list-col mil-list-cat"><span class="mil-cat-pill">{{ work.category }}</span></div>
                        <div class="mil-list-col mil-list-title">
                            <h6>{{ work.title }}</h6>
                            <p class="mil-list-desc" v-if="work.description">{{ work.description }}</p>
                        </div>
                        <div class="mil-list-col mil-list-arrow"><i class="fas fa-arrow-right"></i></div>
                    </router-link>
                </div>

                <div v-if="filteredWorks.length === 0" class="col-12 mil-mb-15">
                    <p>No projects found in this category.</p>
                </div>

                <!-- Show All / Show Less Button -->
                <div v-if="filteredWorks.length > 6" class="col-12" style="display: flex; justify-content: center; margin-top: 20px; margin-bottom: 50px;">
                    <button @click="isExpanded = !isExpanded" class="mil-show-all-btn" :class="{ 'expanded': isExpanded }">
                        <span>{{ isExpanded ? (currentLang === 'zh' ? '收起' : 'Show Less') : (currentLang === 'zh' ? '显示全部' : 'Show All') }}</span>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                </div>
            </div>

            <!-- Floating Bottom Navigation -->
            <div class="mil-bottom-nav-container">
                 <!-- Action Menu Overlay (Moved Inside) -->
                 <div class="mil-action-menu-glass" :class="{ 'mil-active': isActionMenuOpen }">
                     <div class="mil-action-btn" @click="toggleLayout" :title="isListView ? 'Grid View' : 'List View'">
                        <i :class="['fas', isListView ? 'fa-th-large' : 'fa-list']"></i>
                     </div>
                     <div class="mil-action-btn" @click="toggleLang" title="Switch Language">
                        <i class="fas fa-globe"></i>
                     </div>
                     <div class="mil-action-btn" @click="toggleFullScreen" :title="isFullScreen ? 'Original View' : 'Full Screen View'">
                        <i :class="['fas', isFullScreen ? 'fa-compress-alt' : 'fa-expand-alt']"></i>
                     </div>
                 </div>

                 <div class="mil-bottom-nav">
                    
                    <!-- Left: Share Button -->
                    <button class="mil-add-btn" @click="copyLink" title="Copy Link" style="transform: none;">
                        <i :class="['fas', copied ? 'fa-check' : 'fa-share-alt']"></i>
                    </button>
                    
                    <div class="mil-nav-divider"></div>

                    <!-- Center: Categories -->
                    <ul 
                        class="mil-bottom-menu"
                        ref="scrollContainer"
                        @mousedown="startDrag"
                        @mouseleave="stopDrag"
                        @mouseup="stopDrag"
                        @mousemove="doDrag"
                        @wheel.prevent="handleWheel"
                    >
                        <!-- Added 'All' category explicitly if not present in list, or rely on logic -->
                         <li 
                            v-for="cat in categories" 
                            :key="cat" 
                            :class="{ 'mil-active': activeCategory === cat }"
                            @click="selectCategory(cat)"
                        >
                            {{ cat }}
                        </li>
                    </ul>

                    <div class="mil-nav-divider"></div>

                    <!-- Right: Action Menu Trigger -->
                    <button class="mil-add-btn" @click="toggleActionMenu" :class="{ 'mil-active': isActionMenuOpen }">
                        <i :class="['fas', isActionMenuOpen ? 'fa-times' : 'fa-ellipsis-v']"></i>
                    </button>
                 </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.cursor-pointer {
    cursor: pointer;
}

.mil-list-container {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-bottom: 30px;
}

.mil-list-row {
    display: flex;
    align-items: center;
    padding: 20px 25px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    transition: all 0.3s ease;
    text-decoration: none;
    color: inherit;
    gap: 20px;
}

.mil-list-row:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-3px);
    box-shadow: 0 5px 20px rgba(0,0,0,0.2);
}

.mil-list-date {
    font-size: 0.85rem;
    opacity: 0.6;
    white-space: nowrap;
    min-width: 100px;
}

.mil-list-cat {
    display: flex;
    align-items: center;
}

.mil-cat-pill {
    font-size: 0.75rem;
    padding: 3px 10px;
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 20px;
    text-transform: uppercase;
    letter-spacing: 1px;
    white-space: nowrap;
}

.mil-list-title {
    flex-grow: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.mil-list-title h6 {
    margin: 0;
    font-size: 1.1rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.mil-list-desc {
    margin: 5px 0 0 0;
    font-size: 0.85rem;
    opacity: 0.6;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: normal;
}

.mil-list-arrow {
    display: flex;
    align-items: center;
    opacity: 0.5;
    transition: transform 0.3s ease;
}

.mil-list-row:hover .mil-list-arrow {
    transform: translateX(5px);
    opacity: 1;
    color: var(--mil-accent);
}

/* Mobile Responsiveness for Table */
@media (max-width: 768px) {
    .mil-list-row {
        flex-wrap: wrap;
        gap: 10px;
    }
    .mil-list-date {
        order: 1;
        width: auto;
    }
    .mil-list-cat {
        order: 2;
        margin-left: auto;
    }
    .mil-list-title {
        order: 3;
        width: 100%;
        margin-top: 5px;
    }
    .mil-list-arrow {
        display: none; /* Hide arrow on mobile to save space */
    }
}

/* Bottom Navigation Styles (Unified) */
.mil-bottom-nav-container {
    position: fixed;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    width: 95%; /* Mobile width */
    max-width: 700px; /* Widened for desktop */
    z-index: 100;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px; 
}

.mil-bottom-nav {
    background: rgba(26, 26, 26, 0.95);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1); 
    border-radius: 50px; 
    padding: 10px 15px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: fit-content;
    max-width: 100%;
    box-shadow: 0 10px 30px rgba(0,0,0,0.4);
}

.mil-bottom-menu {
    list-style: none;
    padding: 0 10px; /* Added horizontal padding */
    margin: 0;
    display: flex;
    overflow-x: auto;
    scrollbar-width: none; /* Hide Scrollbar */
    -ms-overflow-style: none;
    flex-grow: 1;
    gap: 5px;
    cursor: grab;
    justify-content: flex-start; /* Changed from center to prevent obscuring first item on overflow */
}

.mil-bottom-menu:active {
    cursor: grabbing;
}

.mil-bottom-menu::-webkit-scrollbar {
    display: none;
}

.mil-bottom-menu li {
    padding: 10px 20px;
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    color: var(--mil-text-primary);
    cursor: pointer;
    border-radius: 30px;
    white-space: nowrap;
    transition: all 0.3s ease;
    flex-shrink: 0;
}

.mil-bottom-menu li.mil-active {
    background-color: #FFD700;
    color: #000;
}

.mil-nav-divider {
    width: 1px;
    height: 25px;
    background: rgba(255, 255, 255, 0.1);
    margin: 0 10px;
    flex-shrink: 0;
}

.mil-add-btn {
    background: var(--mil-dark-2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: var(--mil-text-primary);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s ease;
    flex-shrink: 0;
}

.mil-add-btn.mil-active {
    background-color: #FFD700;
    color: #000;
    border-color: #FFD700;
}

/* Action Menu Glass Overlay */
.mil-action-menu-glass {
    position: absolute;
    bottom: 70px; 
    right: 0; 
    transform: translateY(20px) scale(0.9);
    background: rgba(26, 26, 26, 0.95);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 50px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    opacity: 0;
    pointer-events: none;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    z-index: 90;
}

.mil-action-menu-glass.mil-active {
    opacity: 1;
    transform: translateY(0) scale(1);
    pointer-events: all;
}

.mil-action-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255,255,255,0.05);
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s ease;
}

.mil-action-btn:hover {
    background: #FFD700;
    color: #000;
}

@media (max-width: 768px) {
    .mil-bottom-nav-container {
        width: 95%;
        bottom: 10px;
    }
}

/* Beautiful Show All Button */
.mil-show-all-btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 10px 25px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 30px;
    color: var(--mil-text-primary);
    font-size: 14px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 1px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.mil-show-all-btn:hover {
    background: rgba(255, 255, 255, 0.08); /* Matches other hovers */
    transform: translateY(-3px); /* Matches list-row hover */
    box-shadow: 0 5px 20px rgba(0,0,0,0.2); /* Matches list-row */
    border-color: rgba(255, 255, 255, 0.2);
    color: var(--mil-accent);
}

.mil-show-all-btn i {
    font-size: 12px;
    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.mil-show-all-btn.expanded i {
    transform: rotate(180deg);
}
</style>

