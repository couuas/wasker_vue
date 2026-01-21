<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useMarkdown } from '@/composables/useMarkdown' // Ensure this path is correct
import { useScrollAnimations } from '@/composables/useScrollAnimations'
import { useAppStore } from '@/stores/app'
import { storeToRefs } from 'pinia'
import JournalCalendar from '@/components/JournalCalendar.vue' // Will create in Phase 3

const { getPosts } = useMarkdown()
const { initAnimations } = useScrollAnimations()
const appStore = useAppStore()
const { currentLang, isFullScreen } = storeToRefs(appStore)

const isActionMenuOpen = ref(false)
// const isFullScreen = ref(false) // Removed local ref

const toggleActionMenu = () => {
    isActionMenuOpen.value = !isActionMenuOpen.value
}

const toggleLang = () => {
    appStore.toggleLang()
}

const toggleFullScreen = () => {
    appStore.toggleFullScreen()
}

const allJournalPosts = getPosts('journal')
const activeDates = computed(() => {
    // Return set of date strings 'YYYY-MM-DD'
    // Ensure we handle both Date objects and strings cleanly
    return new Set(allJournalPosts.value
        .filter(p => p.lang === currentLang.value)
        .map(p => {
            // Frontmatter might parse date as Date object or string
            const d = new Date(p.date)
            // robust YYYY-MM-DD generation
            const year = d.getFullYear()
            const month = (d.getMonth() + 1).toString().padStart(2, '0')
            const day = d.getDate().toString().padStart(2, '0')
            return `${year}-${month}-${day}`
        })
    )
})

// Group posts by Month
const groupedPosts = computed(() => {
    const groups = {}
    const posts = allJournalPosts.value.filter(p => p.lang === currentLang.value)
    
    posts.forEach(post => {
        const date = new Date(post.date)
        const yearBase = date.getFullYear()
        // Month is 0-indexed in JS
        const monthBase = date.getMonth() + 1 
        const monthKey = `${yearBase}-${monthBase.toString().padStart(2, '0')}`
        
        if (!groups[monthKey]) {
            groups[monthKey] = []
        }
        groups[monthKey].push(post)
    })
    
    // Sort keys descending (newest months first)
    const sortedKeys = Object.keys(groups).sort((a, b) => b.localeCompare(a))
    
    let globalIndex = 0
    
    return sortedKeys.map(key => {
        const [year, month] = key.split('-')
        const monthName = new Date(year, month - 1).toLocaleString('en-US', { month: 'long' })
        
        // Map posts to include layout info
        const enhancedPosts = groups[key].map(post => {
            const side = globalIndex % 2 === 0 ? 'left' : 'right'
            globalIndex++
            return {
                ...post,
                layoutSide: side
            }
        })
        
        return {
            key, // YYYY-MM
            label: `${monthName} ${year}`,
            posts: enhancedPosts
        }
    })
})

const currentVisibleMonth = ref('')
const isCalendarOpen = ref(false)

// Observer logic
const observer = ref(null)
const monthRefs = ref([])

const setMonthRef = (el, key) => {
    if (el) {
        el.dataset.monthKey = key
        monthRefs.value.push(el)
    }
}

onMounted(() => {
    initAnimations()
    
    // Set initial visible month
    if (groupedPosts.value.length > 0) {
        currentVisibleMonth.value = groupedPosts.value[0].label
    }

    // Intersection Observer for Scroll Spy
    observer.value = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                 const key = entry.target.dataset.monthKey
                 const group = groupedPosts.value.find(g => g.key === key)
                 if (group) {
                     currentVisibleMonth.value = group.label
                 }
            }
        })
    }, {
        rootMargin: '-40% 0px -40% 0px', // Activate when element is in center 20%
        threshold: 0
    })

    nextTick(() => {
        monthRefs.value.forEach(el => observer.value.observe(el))
    })
})

const toggleCalendar = () => {
    isCalendarOpen.value = !isCalendarOpen.value
}

const formatDateDay = (date) => {
    return new Date(date).getDate()
}

const formatDateWeekday = (date) => {
    return new Date(date).toLocaleDateString('en-US', { weekday: 'short' })
}

const handleDateSelect = (dateKey) => {
    // Scroll to element
    const el = document.getElementById('date-' + dateKey)
    if (el) {
        // Toggle calendar closed
        isCalendarOpen.value = false
        // Smooth scroll
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
}

// Watch for data changes to re-init animations
watch(groupedPosts, async () => {
    await nextTick()
    initAnimations()
    // Re-observe month refs for scroll spy
    monthRefs.value = [] // Reset refs logic handled by template ref, but need to ensure observer picks them up
    // Actually the template ref function setMonthRef pushes to array.
    // When v-for updates, refs are updated. We just need to ensure observer observes them.
    // Ideally we disconnect and reconnect, or just observe new ones.
    // For simplicity in this setup, we can re-run the observer logic if needed, 
    // but initAnimations handles the visual 'mil-up' parts.
    
    // Re-attach observer for scroll spy
    if (observer.value) {
        observer.value.disconnect()
        nextTick(() => {
             monthRefs.value.forEach(el => observer.value.observe(el))
        })
    }
})

</script>

<template>
    <div class="mil-content-frame">

            <div class="mil-scroll mil-half-1 mil-bp-fix">
            
            <div class="mil-journal-container">
                 <!-- Main Timeline Spine -->
                 <div class="mil-timeline-spine"></div>

                 <!-- Group Loop -->
                 <div 
                    v-for="group in groupedPosts" 
                    :key="group.key" 
                    class="mil-month-group"
                    :ref="(el) => setMonthRef(el, group.key)"
                >
                    <!-- Month Divider/Label in Flow -->
                    <div class="mil-month-marker mil-up">
                        <span>{{ group.label }}</span>
                    </div>

                    <div class="mil-entries-wrapper">
                        <router-link 
                            v-for="(post, index) in group.posts" 
                            :key="post.slug"
                            :to="'/journal/' + post.slug"
                            :id="'date-' + post.date"
                            class="mil-journal-entry mil-up"
                            :class="post.layoutSide === 'left' ? 'mil-left-entry' : 'mil-right-entry'"
                        >
                            <div class="mil-entry-content">
                                <div class="mil-entry-date">
                                    <span class="mil-day">{{ formatDateDay(post.date) }}</span>
                                    <span class="mil-weekday">{{ formatDateWeekday(post.date) }}</span>
                                </div>
                                <div class="mil-entry-info">
                                    <h4>{{ post.title }}</h4>
                                    <div class="mil-entry-meta" v-if="post.weather || post.mood">
                                        <span v-if="post.weather"><i class="fas fa-cloud"></i> {{ post.weather }}</span>
                                        <span v-if="post.mood"><i class="fas fa-smile"></i> {{ post.mood }}</span>
                                    </div>
                                    <p v-if="post.description">{{ post.description }}</p>
                                </div>
                            </div>
                            <!-- Dot on spine -->
                            <div class="mil-timeline-dot"></div>
                        </router-link>
                    </div>
                 </div>
                 
                 <!-- Empty State -->
                 <div v-if="groupedPosts.length === 0" class="mil-p-90-75">
                     <p>No journal entries found.</p>
                 </div>
            </div>

            <!-- Floating Bottom Navigation -->
            <div class="mil-bottom-nav-container">
                 <!-- Action Menu Overlay (Moved Inside) -->
                 <div class="mil-action-menu-glass" :class="{ 'mil-active': isActionMenuOpen }">
                     <div class="mil-action-btn" @click="toggleLang" title="Switch Language">
                        <i class="fas fa-globe"></i>
                     </div>
                     <div class="mil-action-btn" @click="toggleFullScreen" :title="isFullScreen ? 'Original View' : 'Full Screen View'">
                        <i :class="['fas', isFullScreen ? 'fa-compress-alt' : 'fa-expand-alt']"></i>
                     </div>
                 </div>

                 <div class="mil-bottom-nav">
                    
                    <!-- Left: Calendar Toggle -->
                    <button class="mil-add-btn" @click="toggleCalendar" title="Open Calendar" style="transform: none;">
                        <i class="fas fa-calendar-alt"></i>
                    </button>
                    
                    <div class="mil-nav-divider"></div>

                    <!-- Center: Current Month Display -->
                    <div class="mil-current-month-display">
                        {{ currentVisibleMonth }}
                    </div>

                    <div class="mil-nav-divider"></div>

                    <!-- Right: Action Menu Trigger -->
                    <button class="mil-add-btn" @click="toggleActionMenu" :class="{ 'mil-active': isActionMenuOpen }">
                        <i :class="['fas', isActionMenuOpen ? 'fa-times' : 'fa-ellipsis-v']"></i>
                    </button>
                 </div>
            </div>
            </div> <!-- Close .mil-scroll -->
            
            <!-- Calendar Overlay -->
            <div class="mil-calendar-overlay" :class="{ 'mil-active': isCalendarOpen }">
                     <div class="mil-calendar-modal">
                         <div class="mil-modal-header">
                             <h5>Journal Calendar</h5>
                             <span class="mil-close-btn" @click="toggleCalendar"><i class="fas fa-times"></i></span>
                         </div>
                         <div class="mil-modal-body">
                             <JournalCalendar :activeDates="activeDates" @select="handleDateSelect" />
                         </div>
                     </div>
                     <div class="mil-calendar-backdrop" @click="toggleCalendar"></div>
            </div>


    </div>
</template>

<style scoped>
.mil-journal-container {
    padding: 60px 0 120px;
    position: relative;
    max-width: 1000px;
    margin: 0 auto;
    width: 100%;
}

.mil-timeline-spine {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    width: 2px;
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(-50%);
}

.mil-month-group {
    margin-bottom: 60px;
    position: relative;
}

.mil-month-marker {
    text-align: center;
    margin-bottom: 40px;
    position: relative;
    z-index: 2;
}

.mil-month-marker span {
    background: #121212; /* Match bg */
    padding: 5px 15px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    font-size: 12px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.6);
}

.mil-entries-wrapper {
    position: relative;
    width: 100%;
}

.mil-journal-entry {
    display: flex;
    justify-content: flex-end; /* Default for left side entries */
    position: relative;
    margin-bottom: 40px;
    width: 50%;
    padding-right: 40px;
    text-decoration: none;
    color: inherit;
    transition: transform 0.3s ease;
}

.mil-journal-entry.mil-right-entry {
    margin-left: 50%;
    justify-content: flex-start;
    padding-right: 0;
    padding-left: 40px;
}

.mil-journal-entry:hover {
    transform: translateY(-5px);
}

.mil-entry-content {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 25px;
    width: 100%;
    max-width: 400px;
    position: relative;
    display: flex;
    gap: 20px;
    transition: all 0.3s ease;
}

.mil-journal-entry:hover .mil-entry-content {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: 0 5px 20px rgba(0,0,0,0.2);
}

/* Timeline Dot */
.mil-timeline-dot {
    position: absolute;
    top: 30px; /* Align with top of card */
    width: 10px;
    height: 10px;
    background: #DBA91C;
    border-radius: 50%;
    box-shadow: 0 0 0 5px #121212; /* Spacing from spine */
    z-index: 2;
}

.mil-left-entry .mil-timeline-dot {
    right: -5px; /* Half of width to center on spine */
}

.mil-right-entry .mil-timeline-dot {
    left: -5px;
}

/* Connector Line (visible only on hover maybe, or always) */
.mil-entry-content::after {
    content: '';
    position: absolute;
    top: 34px;
    width: 35px; /* Matches padding-right/left minus gap */
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
}

.mil-left-entry .mil-entry-content::after {
    right: -40px; /* Connect to spine */
}

.mil-right-entry .mil-entry-content::after {
    left: -40px;
}

/* Content Styling */
.mil-entry-date {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 50px;
    padding-right: 15px;
    border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.mil-day {
    font-size: 24px;
    font-weight: 700;
    color: #DBA91C;
    line-height: 1;
}

.mil-weekday {
    font-size: 11px;
    text-transform: uppercase;
    opacity: 0.6;
    margin-top: 5px;
}

.mil-entry-info {
    flex-grow: 1;
}

.mil-entry-info h4 {
    margin: 0 0 10px;
    font-size: 18px;
}

.mil-entry-meta {
    display: flex;
    gap: 15px;
    font-size: 12px;
    opacity: 0.6;
    margin-bottom: 10px;
}

.mil-entry-meta i {
    width: 14px;
    color: #DBA91C;
}

.mil-entry-info p {
    margin: 0;
    font-size: 14px;
    opacity: 0.8;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
    .mil-timeline-spine {
        left: 20px; /* Shift spine to left */
    }

    .mil-journal-entry,
    .mil-journal-entry.mil-right-entry,
    .mil-journal-entry.mil-left-entry {
        width: 100%;
        margin-left: 0;
        justify-content: flex-start;
        padding-left: 50px; /* Spacing from left spine */
        padding-right: 20px;
    }

    .mil-left-entry .mil-timeline-dot,
    .mil-right-entry .mil-timeline-dot {
        right: auto;
        left: 15px; /* Center on spine at 20px */
    }

    .mil-left-entry .mil-entry-content::after,
    .mil-right-entry .mil-entry-content::after {
        left: -30px;
        width: 30px;
        right: auto;
    }
    
    .mil-entry-content {
        max-width: 100%;
    }
}

/* Bottom Navigation Styles (Unified) */
.mil-bottom-nav-container {
    position: fixed;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    width: 95%; /* Mobile width */
    max-width: 500px; /* Constrain on desktop - smaller than portfolio for text */
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
    width: 100%;
    box-shadow: 0 10px 30px rgba(0,0,0,0.4);
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

.mil-add-btn:hover,
.mil-add-btn.mil-active {
    background-color: #FFD700;
    color: #000;
    border-color: #FFD700;
}

.mil-current-month-display {
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0 10px;
    color: #fff;
    flex-grow: 1;
    text-align: center;
}

/* Action Menu Glass Overlay */
.mil-action-menu-glass {
    position: absolute;
    bottom: 70px; /* Above nav bar */
    right: 0; /* Align to right edge of container */
    transform: translateY(20px) scale(0.9); /* Vertical pop only */
    background: rgba(26, 26, 26, 0.95);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 50px; /* Capsule shape for vertical */
    padding: 10px;
    display: flex;
    flex-direction: column; /* Vertical alignment */
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

/* Calendar Modal (Restored & Fixed for Half-Page) */
.mil-calendar-overlay {
    position: absolute; /* Changed from fixed to absolute to stay within mil-content-frame */
    top: 0;
    left: 0;
    width: 100%;       /* Fill container, not viewport */
    height: 100%;      /* Fill container */
    z-index: 2000;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    visibility: hidden;
    transition: all 0.4s ease;
    backdrop-filter: blur(10px); /* Move backdrop filter here from override */
}

.mil-calendar-overlay.mil-active {
    opacity: 1;
    visibility: visible;
}

.mil-calendar-backdrop {
    position: absolute;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
    backdrop-filter: blur(5px);
}

.mil-calendar-modal {
    position: relative;
    background: #181818; 
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 24px; 
    width: 90%;
    max-width: 420px; 
    padding: 30px; 
    z-index: 2;
    transform: translateY(30px) scale(0.95); 
    transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1); 
    box-shadow: 0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05);
}

.mil-calendar-overlay.mil-active .mil-calendar-modal {
    transform: translateY(0) scale(1);
}

.mil-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(255,255,255,0.1);
}

.mil-close-btn {
    cursor: pointer;
    width: 30px;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    background: rgba(255,255,255,0.05);
}

.mil-close-btn:hover {
    background: rgba(255,255,255,0.1);
    color: #DBA91C;
}
</style>
