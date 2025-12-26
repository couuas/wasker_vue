<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { RouterLink } from 'vue-router'
import { useMarkdown } from '@/composables/useMarkdown'
import { useScrollAnimations } from '@/composables/useScrollAnimations'
import { useAppStore } from '@/stores/app'
import { storeToRefs } from 'pinia'

const { getPosts, getCategories } = useMarkdown()
const { initAnimations } = useScrollAnimations()
const appStore = useAppStore()
const { currentLang } = storeToRefs(appStore)

const allWorks = getPosts('portfolio')
const categories = getCategories('portfolio')

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
</script>

<template>
    <div class="mil-content-frame">
        <div class="mil-scroll mil-bp-fix mil-half-1">
            <div class="mil-row-fix">
                <div class="row">
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

                    <div v-if="filteredWorks.length === 0" class="col-12 mil-mb-15">
                        <p>No projects found in this category.</p>
                    </div>
                </div>
            </div>

            <a v-if="showViewMore" @click="switchToFullWidth" class="mil-btn mil-mb-15 cursor-pointer">View more projects</a>
            
            <div class="mil-bottom-panel mil-up-instant">
                <div class="mil-w-100 mil-list-footer">
                    
                    <!-- Left: Fixed Filter Icon -->
                    <div class="mil-fixed-icon mil-left-icon">
                        <i class="fal fa-tags"></i>
                    </div>

                    <!-- Center: Filter Categories -->
                    <div class="mil-filter-container" :class="{ 'mil-has-overflow': isOverflowing }">
                        <div class="mil-filter" ref="filterContainer">
                            <a v-for="cat in categories" :key="cat" 
                                @click.prevent="switchCategory(cat)"
                                href="#" 
                                :class="['mil-link', 'mil-pill', { 'mil-current': activeCategory === cat }]" 
                                data-no-swup>
                                {{ cat }}
                            </a>
                        </div>
                    </div>
                    
                    <!-- Right: Fixed Language Switch -->
                    <div class="mil-fixed-icon mil-right-icon">
                         <a href="#" @click.prevent="toggleLang" title="Switch Language">
                            <i class="fas fa-language"></i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.cursor-pointer {
    cursor: pointer;
}

.mil-list-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0 10px;
    gap: 10px;
}

/* Fixed Icons (Left & Right) */
.mil-fixed-icon {
    flex: 0 0 40px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    font-size: 18px;
    opacity: 0.7;
}

.mil-fixed-icon a {
    color: inherit;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
}

.mil-left-icon i {
    color: #DBA91C;
}

/* Center Container */
.mil-filter-container {
    flex: 1; 
    display: flex;
    justify-content: center; 
    overflow: hidden; 
    padding: 5px;
    border-radius: 40px; 
    border: 1px solid transparent; 
    transition: border-color 0.3s ease;
}

/* Active Overflow State */
.mil-filter-container.mil-has-overflow {
    justify-content: flex-start; 
    border-color: rgba(255, 255, 255, 0.1); 
    background: rgba(255, 255, 255, 0.02); 
}

.mil-filter {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    overflow-x: auto;
    white-space: nowrap;
    gap: 15px;
    -ms-overflow-style: none;
    scrollbar-width: none;
    padding: 5px; 
    width: 100%; 
}

/* If not overflowing, let content be natural width to center properly */
.mil-filter-container:not(.mil-has-overflow) .mil-filter {
    width: auto;
    justify-content: center;
}

.mil-filter::-webkit-scrollbar {
    display: none;
}

/* Pill Styling */
.mil-link.mil-pill {
    padding: 8px 16px;
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 30px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    font-size: 12px;
    letter-spacing: 1px;
    font-weight: 500;
    transition: all 0.3s ease;
    text-transform: uppercase;
    color: #A5A5A5;
    text-decoration: none;
    white-space: nowrap;
}

.mil-link.mil-pill:hover {
    background-color: rgba(255, 255, 255, 0.15);
    color: #fff;
    transform: translateY(-2px);
    border-color: rgba(255, 255, 255, 0.3);
}

.mil-link.mil-pill.mil-current {
    background-color: #DBA91C;
    color: #121212;
    border-color: #DBA91C;
    box-shadow: 0 4px 10px rgba(219, 169, 28, 0.2);
    font-weight: 700;
}
</style>
