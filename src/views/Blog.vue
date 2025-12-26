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

const allPosts = getPosts('blog')
const categories = getCategories('blog')

const activeCategory = ref('All')
const isExpanded = ref(false)
const toggledSlug = ref(null)

const filteredPosts = computed(() => {
    let posts = allPosts.value.filter(p => p.lang === currentLang.value)
    if (activeCategory.value !== 'All') {
        posts = posts.filter(p => p.category === activeCategory.value)
    }
    return posts
})

const toggleLang = () => {
    appStore.toggleLang()
}

const displayedPosts = computed(() => {
    if (isExpanded.value) {
        return filteredPosts.value
    }
    return filteredPosts.value.slice(0, 6)
})

const showViewMore = computed(() => {
    return !isExpanded.value && filteredPosts.value.length > 6
})

const switchCategory = (cat) => {
    activeCategory.value = cat
    isExpanded.value = false // Reset expansion on category change
}

const switchToFullWidth = () => {
    isExpanded.value = true
    document.body.classList.remove('mil-half-page')
    document.body.classList.add('mil-fw-page')
}

const toggleCard = (slug) => {
    if (window.innerWidth <= 768) {
        toggledSlug.value = toggledSlug.value === slug ? null : slug
    }
}

// Watch for changes in displayed posts to trigger animations
watch(displayedPosts, async () => {
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
        <div class="mil-scroll mil-half-1 mil-bp-fix">
            <div class="mil-row-fix">
                <div class="row">
                    <!-- Posts Loop -->
                    <div v-for="(post, index) in displayedPosts" :key="post.slug" :class="(displayedPosts.length % 2 !== 0 && index === 0) ? 'col-lg-12' : 'col-lg-6'">
                        <div 
                            class="mil-blog-card mil-mb-15 mil-up"
                            :class="{ 'mil-active': toggledSlug === post.slug }"
                            @click="toggleCard(post.slug)"
                        >
                            <img :src="post.image" :alt="post.title" v-if="post.image">
                            <div class="mil-descr">
                                <div class="mil-post-text">
                                    <div class="mil-left">
                                        <h3 class="mil-line-height mil-mb-30">{{ post.title }}</h3>
                                        <router-link :to="'/blog/' + post.slug" class="mil-link mil-hover-link mil-accent">read more</router-link>
                                    </div>
                                    <div class="mil-right">
                                        <p>{{ post.description }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                   
                    <div v-if="filteredPosts.length === 0" class="col-12 mil-mb-15">
                        <p>No posts found in this category.</p>
                    </div>

                </div>
            </div>
            
            <a v-if="showViewMore" @click="switchToFullWidth" class="mil-btn mil-mb-15 cursor-pointer">View more posts</a>
            
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
                        <a href="#" @click.prevent="toggleLang"  title="Switch Language">
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
    justify-content: space-between; /* 3-column layout */
    width: 100%;
    padding: 0 10px; /* Small equal margins for left/right icons */
    gap: 10px;
}

/* Fixed Icons (Left & Right) */
.mil-fixed-icon {
    flex: 0 0 40px; /* Fixed width */
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
    flex: 1; /* Take remaining space */
    display: flex;
    justify-content: center; /* Default center align */
    overflow: hidden; /* Mask inner scroll */
    padding: 5px;
    border-radius: 40px; /* Add some radius for the border indication */
    border: 1px solid transparent; /* Hidden by default */
    transition: border-color 0.3s ease;
}

/* Active Overflow State */
.mil-filter-container.mil-has-overflow {
    justify-content: flex-start; /* Left align if overflowing */
    border-color: rgba(255, 255, 255, 0.1); /* Show border when scrollable */
    background: rgba(255, 255, 255, 0.02); /* Slight bg */
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
    padding: 5px; /* Inner padding */
    width: 100%; /* Ensure it fills container to measure overflow */
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