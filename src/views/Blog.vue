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

// Action Menu State
const isActionMenuOpen = ref(false)
const isFullScreen = ref(false)
const isListView = ref(false)

const toggleActionMenu = () => {
    isActionMenuOpen.value = !isActionMenuOpen.value
}

const toggleFullScreen = () => {
    isFullScreen.value = !isFullScreen.value
    if (isFullScreen.value) {
        document.body.classList.remove('mil-half-page')
        document.body.classList.add('mil-fw-page')
    } else {
        document.body.classList.remove('mil-fw-page')
        document.body.classList.add('mil-half-page')
    }
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
</script>

<template>
    <div class="mil-content-frame">
        <ToastNotification ref="toastRef" />
        <div class="mil-scroll mil-half-1 mil-bp-fix">
            <div class="mil-row-fix">
                
                <!-- Grid View -->
                <div class="row" v-if="!isListView">
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
                </div>

                <!-- List View (Table Style) -->
                <div class="mil-list-container" v-else>
                    <router-link 
                        v-for="post in displayedPosts" 
                        :key="post.slug" 
                        :to="'/blog/' + post.slug"
                        class="mil-list-row mil-up"
                    >
                        <div class="mil-list-col mil-list-date">{{ formatDate(post.date) }}</div>
                        <div class="mil-list-col mil-list-cat"><span class="mil-cat-pill">{{ post.category }}</span></div>
                        <div class="mil-list-col mil-list-title">
                            <h6>{{ post.title }}</h6>
                            <p class="mil-list-desc" v-if="post.description">{{ post.description }}</p>
                        </div>
                        <div class="mil-list-col mil-list-arrow"><i class="fas fa-arrow-right"></i></div>
                    </router-link>
                </div>

                <div v-if="filteredPosts.length === 0" class="col-12 mil-mb-15">
                    <p>No posts found in this category.</p>
                </div>

            </div>
            
            <div class="mil-bottom-panel mil-up-instant">
                <div class="mil-w-100 mil-list-footer">
                    
                    <!-- Left: Share Button -->
                    <div class="mil-fixed-icon mil-left-icon" @click="copyLink" style="cursor: pointer;" title="Copy Link">
                        <i :class="['fas', copied ? 'fa-check' : 'fa-share-alt']"></i>
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
                    
                    <!-- Right: Action Menu (Replaces standalone Language Switch) -->
                    <div class="mil-action-menu-wrapper" :class="{ 'mil-active': isActionMenuOpen }">
                        <div class="mil-action-list">
                            <!-- Layout Toggle -->
                            <div class="mil-action-btn" @click="toggleLayout" :title="isListView ? 'Grid View' : 'List View'">
                                <i :class="['fas', isListView ? 'fa-th-large' : 'fa-list']"></i>
                            </div>
                            <!-- Language Toggle -->
                            <div class="mil-action-btn" @click="toggleLang" title="Switch Language">
                                <i class="fas fa-globe"></i>
                            </div>
                            <!-- Full Screen Toggle -->
                            <div class="mil-action-btn" @click="toggleFullScreen" :title="isFullScreen ? 'Original View' : 'Full Screen View'">
                                <i :class="['fas', isFullScreen ? 'fa-compress-alt' : 'fa-expand-alt']"></i>
                            </div>
                        </div>
                        <div class="mil-action-trigger mil-icon-btn" @click="toggleActionMenu" :class="{ 'mil-active': isActionMenuOpen }">
                            <i :class="['fas', isActionMenuOpen ? 'fa-times' : 'fa-ellipsis-v']"></i>
                        </div>
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
    background: rgba(255, 255, 255, 0.03); /* Subtle card bg */
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

.mil-action-list {
    position: absolute;
    bottom: 75px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 25px;
    opacity: 0;
    visibility: hidden;
    transform: translateY(20px);
    transition: all 0.4s cubic-bezier(0, 0, 0.3642, 1);
    z-index: 10;
}

.mil-action-trigger {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
    border: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(15px);
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
}

.mil-action-trigger::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(219, 169, 28, 0.3), transparent);
    transform: translate(-50%, -50%);
    transition: width 0.5s ease, height 0.5s ease;
}

.mil-action-trigger:hover::before {
    width: 200%;
    height: 200%;
}

.mil-action-trigger:hover {
    transform: translateY(-3px) scale(1.05);
    border-color: rgba(219, 169, 28, 0.4);
    box-shadow: 0 8px 24px rgba(219, 169, 28, 0.2);
}

.mil-action-trigger i {
    font-size: 20px;
    color: #fff;
    transition: all 0.4s ease;
}

.mil-action-trigger.mil-active {
    background: linear-gradient(135deg, #DBA91C, #C89D1A);
    border-color: transparent;
    box-shadow: 0 8px 24px rgba(219, 169, 28, 0.5), 0 0 30px rgba(219, 169, 28, 0.3);
    transform: scale(1.1);
}

.mil-action-trigger.mil-active i {
    color: #000;
    transform: rotate(90deg);
}

.mil-action-btn {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(18, 18, 18, 0.95), rgba(18, 18, 18, 0.85));
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
}

.mil-action-btn::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(219, 169, 28, 0.3), transparent);
    transform: translate(-50%, -50%);
    transition: width 0.5s ease, height 0.5s ease;
}

.mil-action-btn:hover::before {
    width: 200%;
    height: 200%;
}

.mil-action-btn:hover {
    background: linear-gradient(135deg, #DBA91C, #C89D1A);
    border-color: transparent;
    transform: translateY(-3px) scale(1.1);
    box-shadow: 0 8px 24px rgba(219, 169, 28, 0.5), 0 0 30px rgba(219, 169, 28, 0.3);
}

.mil-action-btn i {
    font-size: 17px;
    color: rgba(255, 255, 255, 0.7);
    transition: all 0.3s ease;
}

.mil-action-btn:hover i {
    color: #121212;
    transform: scale(1.1);
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

.mil-list-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0 15px;
    gap: 15px;
}

/* Fixed Icons (Left & Right) */
.mil-fixed-icon {
    flex: 0 0 48px;
    height: 48px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    font-size: 20px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    backdrop-filter: blur(15px);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
}

.mil-fixed-icon::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at center, rgba(219, 169, 28, 0.3), transparent);
    opacity: 0;
    transition: opacity 0.4s ease;
}

.mil-fixed-icon:hover::before {
    opacity: 1;
}

.mil-fixed-icon:hover {
    transform: translateY(-3px) scale(1.05);
    border-color: rgba(219, 169, 28, 0.4);
    box-shadow: 0 8px 24px rgba(219, 169, 28, 0.2);
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
    color: #fff; /* Changed from gold to white to match detail page share button */
    transition: all 0.4s ease;
}

/* Center Container */
.mil-filter-container {
    flex: 1;
    display: flex;
    justify-content: center;
    overflow: hidden;
    padding: 8px;
    border-radius: 50px;
    border: 1px solid transparent;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01));
    backdrop-filter: blur(20px);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
}

.mil-filter-container::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50px;
    padding: 1px;
    background: linear-gradient(135deg, rgba(219, 169, 28, 0.3), rgba(255, 255, 255, 0.1));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: exclude;
    opacity: 0;
    transition: opacity 0.4s ease;
}

.mil-filter-container:hover::before {
    opacity: 1;
}

/* Active Overflow State */
.mil-filter-container.mil-has-overflow {
    justify-content: flex-start;
    border-color: rgba(219, 169, 28, 0.2);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
    box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.3);
}

.mil-filter {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    overflow-x: auto;
    white-space: nowrap;
    gap: 12px;
    -ms-overflow-style: none;
    scrollbar-width: none;
    padding: 6px;
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
    padding: 10px 20px;
    background: transparent;
    border-radius: 30px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    font-size: 11px;
    letter-spacing: 1.5px;
    font-weight: 600;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.6);
    text-decoration: none;
    white-space: nowrap;
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(10px);
}

.mil-link.mil-pill::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.2), transparent);
    transform: translate(-50%, -50%);
    transition: width 0.6s ease, height 0.6s ease;
}

.mil-link.mil-pill:hover::before {
    width: 200%;
    height: 200%;
}

.mil-link.mil-pill:hover {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));
    color: #fff;
    transform: translateY(-3px);
    border-color: rgba(255, 255, 255, 0.4);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 255, 255, 0.1);
}

.mil-link.mil-pill.mil-current {
    background: linear-gradient(135deg, #DBA91C, #C89D1A);
    color: #121212;
    border-color: transparent;
    box-shadow: 0 4px 12px rgba(219, 169, 28, 0.25), 0 2px 6px rgba(219, 169, 28, 0.15);
    font-weight: 700;
    transform: translateY(-2px);
}

.mil-link.mil-pill.mil-current::before {
    display: none;
}
</style>