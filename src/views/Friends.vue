<script setup>
import { computed, watch, nextTick } from 'vue'
import { RouterLink } from 'vue-router'
import { useMarkdown } from '@/composables/useMarkdown'
import { useScrollAnimations } from '@/composables/useScrollAnimations'

const { getPosts } = useMarkdown()
const { initAnimations } = useScrollAnimations()

// Get Friend Links
const friends = getPosts('friend')

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
                    <div class="col-lg-6" v-for="friend in friends" :key="friend.slug">
                        <div class="mil-blog-card mil-sm mil-mb-15 mil-up">
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
            <div class="mil-bottom-panel">
                <div class="mil-jcc mil-space-15 mil-w-100">
                    <form class="mil-subscribe">
                        <div class="mil-input-frame">
                            <input type="text" placeholder="Want to be friends? Apply simply." name="url">
                        </div>
                        <button type="submit" class="mil-btn-sm"><i class="far fa-envelope"></i></button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>
