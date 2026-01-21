<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { RouterLink } from 'vue-router'
import { useMarkdown } from '@/composables/useMarkdown'
import { useScrollAnimations } from '@/composables/useScrollAnimations'
import ToastNotification from '@/components/ToastNotification.vue'
import { useAppStore } from '@/stores/app'

const { getPosts } = useMarkdown()
const { initAnimations } = useScrollAnimations()
const appStore = useAppStore()

// Get Data
const friendsData = getPosts('friend')
const mySitesData = getPosts('mysite')
const activeCategory = ref('All')

const allSites = computed(() => {
    const sites = []
    // Add My Sites (Filtered by language)
    if (mySitesData.value) {
         sites.push(...mySitesData.value
            .filter(s => s.lang === appStore.currentLang)
            .map(s => ({ ...s, type: 'mysite' }))
         )
    }
    // Add Friends
    if (friendsData.value) {
         sites.push(...friendsData.value.map(f => ({ ...f, category: 'FRIENDS', type: 'friend' })))
    }
    return sites
})

const categories = computed(() => {
    const cats = new Set()
    allSites.value.forEach(s => {
        if (s.category && s.category !== 'FRIENDS') cats.add(s.category)
    })
    return ['All', ...Array.from(cats), 'FRIENDS']
})

const filteredSites = computed(() => {
    if (activeCategory.value === 'All') return allSites.value
    return allSites.value.filter(s => s.category === activeCategory.value)
})

const toggledSlug = ref(null)

const toggleCard = (slug) => {
    if (window.innerWidth <= 768) {
        toggledSlug.value = toggledSlug.value === slug ? null : slug
    }
}

// Friend Application Logic
const friendUrl = ref('')
const isSubmitting = ref(false)
const showApplyForm = ref(false)
const toast = ref(null)

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
        activeCategory.value = cat
    }
}

const submitFriendUrl = async () => {
    // Basic URL validation (browser 'type="url"' handles most, but good to double check)
    if (!friendUrl.value || !friendUrl.value.startsWith('http')) {
        toast.value.show('Please enter a valid URL (starting with http:// or https://)', 'error')
        return
    }

    const apiUrl = import.meta.env.VITE_API_URL
    if (!apiUrl) {
        toast.value.show('System Config Error: API URL missing', 'error')
        return
    }

    isSubmitting.value = true

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Friend Applicant',
                email: 'link-submission@wasker.site', // Dummy email to satisfy worker validation
                subject: '🔗 New Friend Link Application',
                message: `User submitted a new friend link:\n\n${friendUrl.value}`
            })
        })

        if (response.ok) {
            toast.value.show('Link sent to my Telegram successfully! I will check it out.', 'success')
            friendUrl.value = ''
        } else {
            const errText = await response.text()
            console.error('API Error:', errText)
            toast.value.show('Failed to send link.', 'error')
        }
    } catch (e) {
        console.error(e)
        toast.value.show('Network error. Please try again.', 'error')
    } finally {
        isSubmitting.value = false
    }
}

// Re-init animations when list changes/loads
// Re-init animations when list changes/loads
watch(filteredSites, async () => {
    await nextTick()
    initAnimations()
}, { deep: true, immediate: true })
</script>

<template>


    <div class="mil-content-frame">
        <div class="mil-scroll mil-half-1 mil-bp-fix-2">
             <div class="mil-row-fix">
                <div class="row">
                    <!-- Dynamic Sites List -->
                    <div v-for="(site, index) in filteredSites" :key="site.slug" :class="(filteredSites.length % 2 !== 0 && index === 0) ? 'col-lg-12' : 'col-lg-6'">
                        <div 
                            class="mil-blog-card mil-mb-15 mil-up"
                            :class="{ 'mil-active': toggledSlug === site.slug }"
                            @click="toggleCard(site.slug)"
                        >
                            <img :src="site.image" :alt="site.shortname" v-if="site.image" class="mil-cover">
                            <div class="mil-descr">
                                <div class="mil-post-text">
                                    <div class="mil-left">
                                        <div class="mil-category-tag" v-if="site.category">{{ site.category }}</div>
                                        <h3 class="mil-line-height mil-mb-20">{{ site.shortname }}</h3>
                                        <a :href="site.url" target="_blank" class="mil-link mil-hover-link mil-accent">Visit Site</a>
                                    </div>
                                    <div class="mil-right">
                                        <p>{{ site.description }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                 </div>
             </div>
             
             <!-- Bottom Navigation & Application Form -->
             <div class="mil-bottom-nav-container">
                 <!-- Collapsible Application Form -->
                 <div class="mil-apply-form-panel" :class="{ 'mil-active': showApplyForm }">
                    <form class="mil-subscribe" @submit.prevent="submitFriendUrl">
                        <div class="mil-input-frame">
                            <input 
                                type="url" 
                                placeholder="Paste your link (https://...)" 
                                name="url"
                                v-model="friendUrl"
                                required
                            >
                        </div>
                        <button type="submit" class="mil-btn-sm" :disabled="isSubmitting">
                            <i class="far fa-paper-plane" v-if="!isSubmitting"></i>
                            <i class="fas fa-spinner fa-spin" v-else></i>
                        </button>
                    </form>
                 </div>

                 <!-- Bottom Navigation Bar -->
                 <div class="mil-bottom-nav">
                    <ul 
                        class="mil-bottom-menu"
                        ref="scrollContainer"
                        @mousedown="startDrag"
                        @mouseleave="stopDrag"
                        @mouseup="stopDrag"
                        @mousemove="doDrag"
                        @wheel.prevent="handleWheel"
                    >
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
                    <button class="mil-add-btn" @click="showApplyForm = !showApplyForm" :class="{ 'mil-active': showApplyForm }">
                        <i class="fal fa-plus" v-if="!showApplyForm"></i>
                        <i class="fal fa-times" v-else></i>
                    </button>
                 </div>
             </div>
        </div>
        <ToastNotification ref="toast" />
    </div>
</template>

<style scoped>
@media (max-width: 768px) {
    .mil-subscribe .mil-btn-sm {
        min-width: 60px; /* Ensure button doesn't shrink too much */
        width: auto; /* Allow it to take only necessary width */
        flex: 0 0 auto; /* Prevent growing */
    }
    /* Removed font-size override - using global 16px to prevent iOS Safari auto-zoom */
}

.mil-row-fix {
    min-height: 70vh; /* Prevent footer jump on load */
}

/* Bottom Navigation Styles */
.mil-bottom-nav-container {
    position: fixed;
    bottom: 10px; /* Floating gap */
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
    border: 1px solid rgba(255, 255, 255, 0.1); /* Full border */
    border-radius: 50px; /* Large rounded corners */
    padding: 10px 15px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    box-shadow: 0 10px 30px rgba(0,0,0,0.4); /* Stronger shadow */
}

.mil-bottom-menu {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    overflow-x: auto;
    scrollbar-width: none; /* Hide Scrollbar */
    -ms-overflow-style: none;
    flex-grow: 1;
    gap: 5px;
    cursor: grab;
    justify-content: center; /* Center items */
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

.mil-bottom-menu li:hover,
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

.mil-add-btn:hover,
.mil-add-btn.mil-active {
    background-color: #FFD700;
    color: #000;
    border-color: #FFD700;
    transform: rotate(90deg); /* Rotate for 'x' effect if using plus */
}

/* Collapsible Form Panel */
.mil-apply-form-panel {
    background: rgba(26, 26, 26, 0.95);
    backdrop-filter: blur(12px);
    padding: 20px;
    border-radius: 20px;
    width: 100%;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    
    /* Animation state */
    opacity: 0;
    transform: translateY(20px) scale(0.95);
    pointer-events: none;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    position: absolute; /* Stack over logic if needed, but here flex gap handles it better if not absolute. Let's try absolute bottom up */
    bottom: 80px; /* Position above navbar (approx height of footer) */
}

.mil-apply-form-panel.mil-active {
    opacity: 1;
    transform: translateY(0) scale(1);
    pointer-events: all;
}

.mil-subscribe {
    display: flex;
    width: 100%;
    gap: 10px;
}

.mil-subscribe .mil-input-frame {
    flex-grow: 1;
}

.mil-subscribe input {
    width: 100%;
    background: rgba(255,255,255,0.05);
    border: none;
    padding: 12px 15px;
    border-radius: 10px;
    color: #fff;
    outline: none;
}

@media (max-width: 768px) {
    .mil-subscribe .mil-btn-sm {
        min-width: 50px;
    }
    
    .mil-bottom-nav-container {
        width: 95%;
        bottom: 10px;
    }
}


.mil-category-tag {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--mil-accent);
    margin-bottom: 10px;
    opacity: 0.8;
}

/* Make image cover properly */
.mil-blog-card img.mil-cover {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
</style>
