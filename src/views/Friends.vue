<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { RouterLink } from 'vue-router'
import { useMarkdown } from '@/composables/useMarkdown'
import { useScrollAnimations } from '@/composables/useScrollAnimations'
import ToastNotification from '@/components/ToastNotification.vue'

const { getPosts } = useMarkdown()
const { initAnimations } = useScrollAnimations()

// Get Friend Links
const friends = getPosts('friend')
const toggledSlug = ref(null)

const toggleCard = (slug) => {
    if (window.innerWidth <= 768) {
        toggledSlug.value = toggledSlug.value === slug ? null : slug
    }
}

// Friend Application Logic
const friendUrl = ref('')
const isSubmitting = ref(false)
const toast = ref(null)

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
watch(friends, () => {
    nextTick(() => {
        initAnimations()
    })
}, { immediate: true })
</script>

<template>
    <div class="mil-content-frame mil-up">
        <div class="mil-scroll mil-half-1 mil-bp-fix">
             <div class="mil-row-fix">
                 <div class="row">
                    <!-- Dynamic Friends List -->
                    <div v-for="(friend, index) in friends" :key="friend.slug" :class="(friends.length % 2 !== 0 && index === 0) ? 'col-lg-12' : 'col-lg-6'">
                        <div 
                            class="mil-blog-card mil-mb-15 mil-up"
                            :class="{ 'mil-active': toggledSlug === friend.slug }"
                            @click="toggleCard(friend.slug)"
                        >
                            <img :src="friend.image" :alt="friend.shortname" v-if="friend.image">
                            <div class="mil-descr">
                                <div class="mil-post-text">
                                    <div class="mil-left">
                                        <h3 class="mil-line-height mil-mb-20">{{ friend.shortname }}</h3>
                                        <a :href="friend.url" target="_blank" class="mil-link mil-hover-link mil-accent">Visit Site</a>
                                    </div>
                                    <div class="mil-right">
                                        <p>{{ friend.description }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                 </div>
             </div>
             
             <!-- Apply Interface (Placeholder) -->
            <!-- Apply Interface -->
            <div class="mil-bottom-panel">
                <div class="mil-jcc mil-space-15 mil-w-100">
                    <form class="mil-subscribe" @submit.prevent="submitFriendUrl">
                        <div class="mil-input-frame">
                            <input 
                                type="url" 
                                placeholder="Want to be friends? Paste your link here (https://...)" 
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
    .mil-input-frame input {
        font-size: 10px; /* Slightly smaller for mobile mobility */
    }
}
</style>
